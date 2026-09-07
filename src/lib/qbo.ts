/**
 * QuickBooks Online API integration.
 * Handles OAuth 2.0 token lifecycle and invoice creation.
 *
 * Required env vars:
 *   QBO_CLIENT_ID
 *   QBO_CLIENT_SECRET
 *   QBO_REDIRECT_URI   (e.g. https://triplejmetaltx.com/api/qbo/callback)
 *   QBO_ENVIRONMENT    ("sandbox" or "production")
 */

import { getAdminClient } from '@/lib/supabase/admin'

// ── Config ────────────────────────────────────────────────────────────────────

const QBO_ENV = process.env.QBO_ENVIRONMENT ?? 'sandbox'
const IS_SANDBOX = QBO_ENV === 'sandbox'

export const QBO_BASE_URL = IS_SANDBOX
  ? 'https://sandbox-quickbooks.api.intuit.com'
  : 'https://quickbooks.api.intuit.com'

export const QBO_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2'
export const QBO_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'

export const QBO_SCOPES = 'com.intuit.quickbooks.accounting'

type QboRequiredEnv =
  | 'QBO_CLIENT_ID'
  | 'QBO_CLIENT_SECRET'
  | 'QBO_REDIRECT_URI'
  | 'QBO_ENVIRONMENT'

export function getMissingQboEnv(): QboRequiredEnv[] {
  const required: QboRequiredEnv[] = [
    'QBO_CLIENT_ID',
    'QBO_CLIENT_SECRET',
    'QBO_REDIRECT_URI',
    'QBO_ENVIRONMENT',
  ]
  return required.filter((key) => {
    const value = process.env[key]
    return !value || !value.trim()
  })
}

// ── Token management ──────────────────────────────────────────────────────────

export type QboTokenRow = {
  id: string
  realm_id: string
  access_token: string
  refresh_token: string
  access_token_expires_at: string
  refresh_token_expires_at: string
  updated_at: string
  // Phase 4.2 receipt-OCR target account. NULL until configured via
  // /hq/settings/quickbooks. expense_account_name is cached for display.
  expense_account_id: string | null
  expense_account_name: string | null
}

/** Fetch the stored QBO tokens (returns null if not connected). */
export async function getStoredTokens(): Promise<QboTokenRow | null> {
  const { data } = await getAdminClient()
    .from('qbo_tokens')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  return data ?? null
}

/** Save (upsert) QBO tokens after OAuth exchange or refresh. */
export async function saveTokens(params: {
  realm_id: string
  access_token: string
  refresh_token: string
  expires_in: number       // seconds until access_token expires
  x_refresh_token_expires_in: number // seconds until refresh_token expires
}) {
  const now = Date.now()
  await getAdminClient()
    .from('qbo_tokens')
    .upsert(
      {
        realm_id: params.realm_id,
        access_token: params.access_token,
        refresh_token: params.refresh_token,
        access_token_expires_at: new Date(now + params.expires_in * 1000).toISOString(),
        refresh_token_expires_at: new Date(now + params.x_refresh_token_expires_in * 1000).toISOString(),
        updated_at: new Date(now).toISOString(),
      },
      { onConflict: 'realm_id' }
    )
}

/** Return a valid access token, refreshing if expired. Throws if not connected. */
export async function getValidAccessToken(): Promise<{ access_token: string; realm_id: string }> {
  const stored = await getStoredTokens()
  if (!stored) throw new Error('QuickBooks not connected. Visit /hq/settings/quickbooks to connect.')

  const expiresAt = new Date(stored.access_token_expires_at).getTime()
  // Refresh if within 5 minutes of expiry
  if (Date.now() < expiresAt - 5 * 60 * 1000) {
    return { access_token: stored.access_token, realm_id: stored.realm_id }
  }

  // Access token expired — refresh it
  const refreshed = await refreshAccessToken(stored.refresh_token)
  await saveTokens({
    realm_id: stored.realm_id,
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token ?? stored.refresh_token,
    expires_in: refreshed.expires_in,
    x_refresh_token_expires_in: refreshed.x_refresh_token_expires_in ?? 8726400, // 101 days default
  })
  return { access_token: refreshed.access_token, realm_id: stored.realm_id }
}

async function refreshAccessToken(refresh_token: string) {
  const credentials = Buffer.from(
    `${process.env.QBO_CLIENT_ID}:${process.env.QBO_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(QBO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`QBO token refresh failed: ${res.status} ${text}`)
  }

  return res.json()
}

// ── OAuth URL builder ─────────────────────────────────────────────────────────

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.QBO_CLIENT_ID!,
    response_type: 'code',
    scope: QBO_SCOPES,
    redirect_uri: process.env.QBO_REDIRECT_URI!,
    state,
  })
  return `${QBO_AUTH_URL}?${params.toString()}`
}

// ── Invoice creation ──────────────────────────────────────────────────────────

type QboLineItem = {
  description: string
  quantity: number
  unit_price: number
}

type InvoiceInput = {
  quote_number: string
  customer_name: string
  customer_email: string | null
  line_items: QboLineItem[]
  notes: string | null
  accepted_at: string | null
}

/** Find or create a QBO customer by display name. Returns the QBO Customer.Id. */
async function findOrCreateCustomer(
  access_token: string,
  realm_id: string,
  name: string,
  email: string | null
): Promise<string> {
  // Search by display name
  const query = encodeURIComponent(`SELECT * FROM Customer WHERE DisplayName = '${name.replace(/'/g, "\\'")}'`)
  const searchRes = await fetch(
    `${QBO_BASE_URL}/v3/company/${realm_id}/query?query=${query}`,
    { headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' } }
  )
  const searchData = await searchRes.json()
  const existing = searchData?.QueryResponse?.Customer?.[0]
  if (existing) return existing.Id

  // Create new customer
  const body: Record<string, unknown> = { DisplayName: name }
  if (email) body.PrimaryEmailAddr = { Address: email }

  const createRes = await fetch(`${QBO_BASE_URL}/v3/company/${realm_id}/customer`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  const createData = await createRes.json()
  return createData.Customer.Id
}

/**
 * Push a quote to QBO as a Draft invoice.
 * Returns the created invoice's QBO Id and DocNumber.
 */
export async function createQboInvoice(input: InvoiceInput): Promise<{ id: string; docNumber: string }> {
  const { access_token, realm_id } = await getValidAccessToken()

  const customerId = await findOrCreateCustomer(
    access_token,
    realm_id,
    input.customer_name,
    input.customer_email
  )

  const lines = input.line_items.map((item) => ({
    DetailType: 'SalesItemLineDetail',
    Amount: item.quantity * item.unit_price,
    Description: item.description,
    SalesItemLineDetail: {
      Qty: item.quantity,
      UnitPrice: item.unit_price,
    },
  }))

  const invoiceBody: Record<string, unknown> = {
    DocNumber: input.quote_number,
    CustomerRef: { value: customerId },
    Line: lines,
    ...(input.notes ? { CustomerMemo: { value: input.notes } } : {}),
    ...(input.accepted_at ? { TxnDate: input.accepted_at.slice(0, 10) } : {}),
  }

  const res = await fetch(`${QBO_BASE_URL}/v3/company/${realm_id}/invoice`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(invoiceBody),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`QBO invoice creation failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  return { id: data.Invoice.Id, docNumber: data.Invoice.DocNumber }
}

// ── Expense (Purchase) creation — Phase 4.2 receipt OCR flow ─────────────────

export type QboAccount = {
  id: string
  name: string
  accountType: string  // QBO AccountType — 'Expense', 'Cost of Goods Sold', etc.
}

/**
 * List the connected company's expense-style chart-of-accounts entries.
 * Used by /hq/settings/quickbooks to let Julian pick a single posting
 * account for receipt-OCR pushes.
 *
 * Returns rows where AccountType in ('Expense', 'Cost of Goods Sold',
 * 'Other Expense') — the only families that make sense for a receipt
 * push from a metal-buildings contractor.
 */
export async function listExpenseAccounts(): Promise<QboAccount[]> {
  const { access_token, realm_id } = await getValidAccessToken()
  const query = encodeURIComponent(
    "SELECT Id, Name, AccountType FROM Account WHERE AccountType IN ('Expense','Cost of Goods Sold','Other Expense') ORDER BY Name",
  )
  const res = await fetch(
    `${QBO_BASE_URL}/v3/company/${realm_id}/query?query=${query}`,
    { headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' } },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`QBO account list failed: ${res.status} ${text}`)
  }
  const data = await res.json() as {
    QueryResponse?: { Account?: Array<{ Id: string; Name: string; AccountType: string }> }
  }
  const accounts = data?.QueryResponse?.Account ?? []
  return accounts.map((a) => ({
    id: a.Id,
    name: a.Name,
    accountType: a.AccountType,
  }))
}

export type ExpenseInput = {
  /** QBO Account.Id every line will book to. From qbo_tokens.expense_account_id. */
  accountId: string
  /** Vendor display name from the receipt; we'll find-or-create. Optional. */
  vendor: string | null
  /** ISO YYYY-MM-DD. Defaults to today if null. */
  date: string | null
  /** USD amount; ignored when `lines` is provided (we'll sum). */
  total: number
  /**
   * Optional itemized lines. When omitted we post a single-line expense
   * for `total` against `accountId`. Each line still books to `accountId`
   * — receipt OCR doesn't have per-line account info, just descriptions.
   */
  lines?: Array<{ description: string; amount: number }>
  /** Free-form note attached to the Purchase. */
  memo?: string | null
}

/**
 * Create a QuickBooks Online Purchase (cash expense). Returns the
 * created Purchase Id.
 */
export async function createExpense(input: ExpenseInput): Promise<{ id: string }> {
  const { access_token, realm_id } = await getValidAccessToken()

  // Vendor is optional — gas-station / hardware-store receipts often
  // don't need a tracked vendor in QBO. When provided, find-or-create
  // by display name (mirrors findOrCreateCustomer pattern).
  let entityRef: { value: string; type: 'Vendor' } | undefined
  if (input.vendor && input.vendor.trim()) {
    const vendorId = await findOrCreateVendor(access_token, realm_id, input.vendor.trim())
    if (vendorId) entityRef = { value: vendorId, type: 'Vendor' }
  }

  // Build the line array. If lines were not supplied, post a single
  // line for `total`; otherwise expand each line. Every line books to
  // the same account.
  const lines = input.lines && input.lines.length > 0
    ? input.lines.map((l) => ({
        Amount: Number(l.amount),
        DetailType: 'AccountBasedExpenseLineDetail',
        Description: l.description,
        AccountBasedExpenseLineDetail: {
          AccountRef: { value: input.accountId },
        },
      }))
    : [{
        Amount: Number(input.total),
        DetailType: 'AccountBasedExpenseLineDetail',
        AccountBasedExpenseLineDetail: {
          AccountRef: { value: input.accountId },
        },
      }]

  const body: Record<string, unknown> = {
    PaymentType: 'Cash',
    AccountRef: { value: input.accountId },
    Line: lines,
    ...(input.date ? { TxnDate: input.date.slice(0, 10) } : {}),
    ...(entityRef ? { EntityRef: entityRef } : {}),
    ...(input.memo ? { PrivateNote: input.memo } : {}),
  }

  const res = await fetch(`${QBO_BASE_URL}/v3/company/${realm_id}/purchase`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`QBO Purchase creation failed: ${res.status} ${text}`)
  }
  const data = await res.json() as { Purchase?: { Id: string } }
  if (!data?.Purchase?.Id) {
    throw new Error('QBO Purchase response missing Id')
  }
  return { id: data.Purchase.Id }
}

async function findOrCreateVendor(
  access_token: string,
  realm_id: string,
  name: string,
): Promise<string | null> {
  // Search by display name
  const query = encodeURIComponent(
    `SELECT * FROM Vendor WHERE DisplayName = '${name.replace(/'/g, "\\'")}'`,
  )
  const searchRes = await fetch(
    `${QBO_BASE_URL}/v3/company/${realm_id}/query?query=${query}`,
    { headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' } },
  )
  if (!searchRes.ok) return null
  const searchData = await searchRes.json()
  const existing = searchData?.QueryResponse?.Vendor?.[0]
  if (existing) return existing.Id

  // Create
  const createRes = await fetch(`${QBO_BASE_URL}/v3/company/${realm_id}/vendor`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ DisplayName: name }),
  })
  if (!createRes.ok) return null
  const createData = await createRes.json()
  return createData?.Vendor?.Id ?? null
}

/**
 * Upload an Attachable (image) and link it to an existing QBO entity
 * (e.g. a Purchase created via `createExpense`). Returns the
 * Attachable.Id.
 */
export async function uploadAttachable(params: {
  entityType: 'Purchase' | 'Invoice' | 'Estimate' | 'Bill'
  entityId: string
  blob: Blob
  filename: string
  contentType: string  // image/jpeg | image/png | application/pdf | ...
}): Promise<{ id: string }> {
  const { access_token, realm_id } = await getValidAccessToken()

  // QBO's upload endpoint takes multipart/form-data with two parts per
  // attachment: file_metadata_0 (JSON) and file_content_0 (binary).
  const metadata = {
    AttachableRef: [{
      EntityRef: { type: params.entityType, value: params.entityId },
      IncludeOnSend: false,
    }],
    FileName: params.filename,
    ContentType: params.contentType,
  }

  const form = new FormData()
  form.append('file_metadata_0', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file_content_0', params.blob, params.filename)

  const res = await fetch(`${QBO_BASE_URL}/v3/company/${realm_id}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/json',
      // No Content-Type — let fetch set the multipart boundary.
    },
    body: form,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`QBO attachable upload failed: ${res.status} ${text}`)
  }
  const data = await res.json() as {
    AttachableResponse?: Array<{ Attachable?: { Id?: string } }>
  }
  const id = data?.AttachableResponse?.[0]?.Attachable?.Id
  if (!id) throw new Error('QBO attachable response missing Id')
  return { id }
}

/**
 * Convenience function: fetch a quote from Supabase and push to QBO.
 * Intended for use in the accept route and dashboard push button.
 * Does NOT throw — logs error and returns success: false if QBO push fails,
 * so the caller's primary action (e.g. quote acceptance) is not disrupted.
 */
export async function pushQuoteToQBO(quoteId: string): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
  try {
    const db = getAdminClient()
    const { data: quote } = await db
      .from('quotes')
      .select('*, customers(name, email), quote_line_items(*)')
      .eq('id', quoteId)
      .single()

    if (!quote) return { success: false, error: 'Quote not found' }

    const { id, docNumber } = await createQboInvoice({
      quote_number: quote.quote_number,
      customer_name: quote.customers?.name ?? 'Unknown Customer',
      customer_email: quote.customers?.email ?? null,
      line_items: (quote.quote_line_items ?? []).map((li: { description: string; quantity: number; unit_price: number }) => ({
        description: li.description,
        quantity: li.quantity,
        unit_price: li.unit_price,
      })),
      notes: quote.notes,
      accepted_at: quote.accepted_at,
    })

    // Store the QBO invoice ID on the quote for reference
    await db
      .from('quotes')
      .update({ qbo_invoice_id: id } as Record<string, unknown>)
      .eq('id', quoteId)

    return { success: true, invoiceId: docNumber }
  } catch (err) {
    console.error('[QBO] pushQuoteToQBO failed:', err)
    return { success: false, error: String(err) }
  }
}
