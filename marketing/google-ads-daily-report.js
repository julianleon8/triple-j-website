/* global AdsApp, MailApp, Utilities */
/**
 * Triple J Metal — Google Ads daily report (Google Ads Script).
 *
 * READ-ONLY: it reads the account and sends one email. It never pauses,
 * edits or bids anything.
 *
 * Install (once, about 5 minutes):
 *   1. Google Ads → Tools → Bulk actions → Scripts → the blue + → New script.
 *   2. Delete the sample code, paste this whole file, name it
 *      "Triple J daily report".
 *   3. Click Authorize (it asks to read the account and send email as you).
 *   4. Click Preview once and check the log for errors.
 *   5. Save, then set Frequency → Daily → 6 AM.
 *
 * The email goes to RECIPIENTS below. The morning lead brief comes separately
 * from the website at 7 AM Central on weekdays.
 */

const CONFIG = {
  RECIPIENTS: ['julianleon@triplejmetaltx.com', 'julianleon0724@yahoo.com'],
  MONTHLY_BUDGET: 400, // dollars; the Google share of the $500/month plan
  NO_LEAD_SPEND_ALERT: 40, // dollars spent over the last 3 days with zero conversions
  SEARCH_TERMS_SHOWN: 15,
};

// Google Ads runs main() itself; nothing in this repo calls it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function main() {
  const account = AdsApp.currentAccount();
  const tz = account.getTimeZone();
  const now = new Date();

  const yesterday = totals('YESTERDAY');
  const week = totals('LAST_7_DAYS');
  const month = totals('THIS_MONTH');
  const last3 = totals(`BETWEEN '${ymd(daysAgo(now, 3), tz)}' AND '${ymd(daysAgo(now, 1), tz)}'`);

  const campaigns = rows(
    'SELECT campaign.name, campaign.status, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions ' +
      'FROM campaign WHERE segments.date DURING YESTERDAY AND campaign.status != REMOVED ' +
      'ORDER BY metrics.cost_micros DESC',
  ).map((r) => ({
    name: r.campaign.name,
    status: r.campaign.status,
    ...metrics(r.metrics),
  }));

  const terms = rows(
    'SELECT search_term_view.search_term, metrics.cost_micros, metrics.clicks, metrics.conversions ' +
      'FROM search_term_view WHERE segments.date DURING YESTERDAY AND metrics.clicks > 0 ' +
      `ORDER BY metrics.cost_micros DESC LIMIT ${CONFIG.SEARCH_TERMS_SHOWN}`,
  ).map((r) => ({ term: r.searchTermView.searchTerm, ...metrics(r.metrics) }));

  const alerts = buildAlerts({ yesterday, month, last3, now, tz });

  const subject =
    `Google Ads: $${money(yesterday.cost)} yesterday · ${num(yesterday.conversions)} leads` +
    (alerts.length ? ` · ${alerts.length} ${alerts.length === 1 ? 'warning' : 'warnings'}` : '');

  MailApp.sendEmail({
    to: CONFIG.RECIPIENTS.join(','),
    subject,
    htmlBody: html({ account: account.getName(), yesterday, week, month, campaigns, terms, alerts }),
  });
  console.log(`Sent: ${subject}`);
}

// ── Checks ─────────────────────────────────────────────────────────────────

function buildAlerts({ yesterday, month, last3, now, tz }) {
  const alerts = [];
  const dayOfMonth = Number(Utilities.formatDate(now, tz, 'd'));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  // Whole days spent so far this month: through yesterday.
  const daysSoFar = Math.max(1, dayOfMonth - 1);
  const projected = (month.cost / daysSoFar) * daysInMonth;

  if (month.cost > CONFIG.MONTHLY_BUDGET) {
    alerts.push(`Over the monthly budget: $${money(month.cost)} spent against $${CONFIG.MONTHLY_BUDGET}. Lower the daily budget.`);
  } else if (dayOfMonth > 3 && projected > CONFIG.MONTHLY_BUDGET * 1.1) {
    alerts.push(`On pace for about $${money(projected)} this month, above the $${CONFIG.MONTHLY_BUDGET} plan. Lower the daily budget.`);
  }
  if (last3.cost >= CONFIG.NO_LEAD_SPEND_ALERT && last3.conversions === 0) {
    alerts.push(`$${money(last3.cost)} spent over the last 3 days with no leads. Check the search terms below, then whether calls are being answered.`);
  }
  if (yesterday.impressions === 0) {
    alerts.push('No impressions yesterday. The ads may be paused, out of budget or disapproved. Check the Campaigns page.');
  }
  return alerts;
}

// ── Reading the account ────────────────────────────────────────────────────

function totals(during) {
  const where = during.startsWith('BETWEEN') ? `segments.date ${during}` : `segments.date DURING ${during}`;
  const found = rows(
    `SELECT metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions FROM customer WHERE ${where}`,
  );
  return found.length ? metrics(found[0].metrics) : metrics({});
}

function rows(query) {
  const out = [];
  const it = AdsApp.search(query);
  while (it.hasNext()) out.push(it.next());
  return out;
}

/** int64 fields arrive as strings and zero fields may be missing entirely. */
function metrics(m) {
  const cost = Number(m.costMicros || 0) / 1e6;
  const clicks = Number(m.clicks || 0);
  const conversions = Number(m.conversions || 0);
  return {
    cost,
    clicks,
    impressions: Number(m.impressions || 0),
    conversions,
    cpl: conversions > 0 ? cost / conversions : null,
  };
}

// ── Formatting ─────────────────────────────────────────────────────────────

function daysAgo(d, n) {
  return new Date(d.getTime() - n * 24 * 3600 * 1000);
}
function ymd(d, tz) {
  return Utilities.formatDate(d, tz, 'yyyy-MM-dd');
}
function money(x) {
  return (Math.round(x * 100) / 100).toFixed(2);
}
function num(x) {
  return Number.isInteger(x) ? String(x) : x.toFixed(1);
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function html({ account, yesterday, week, month, campaigns, terms, alerts }) {
  const cell = 'padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:13px;';
  const head = 'padding:6px 10px;border-bottom:2px solid #111827;font-size:12px;text-align:left;text-transform:uppercase;';
  const table = (cols, body) =>
    `<table style="border-collapse:collapse;width:100%;margin:6px 0 18px;">` +
    `<tr>${cols.map((c) => `<th style="${head}">${c}</th>`).join('')}</tr>${body}</table>`;
  const cpl = (t) => (t.cpl === null ? '—' : `$${money(t.cpl)}`);
  const period = (label, t) =>
    `<tr><td style="${cell}"><b>${label}</b></td><td style="${cell}">$${money(t.cost)}</td>` +
    `<td style="${cell}">${t.clicks}</td><td style="${cell}">${num(t.conversions)}</td><td style="${cell}">${cpl(t)}</td></tr>`;

  const parts = [`<div style="font-family:Arial,sans-serif;color:#111827;max-width:640px;">`];
  parts.push(`<h2 style="margin:0 0 4px;">Google Ads — ${esc(account)}</h2>`);
  parts.push(`<p style="margin:0 0 16px;color:#6b7280;font-size:13px;">Monthly plan: $${CONFIG.MONTHLY_BUDGET}. "Leads" = conversions: form submissions plus phone-call clicks.</p>`);

  if (alerts.length) {
    parts.push(
      `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:10px 14px;margin:0 0 18px;">` +
        alerts.map((a) => `<p style="margin:4px 0;font-size:13px;"><b>⚠</b> ${esc(a)}</p>`).join('') +
        `</div>`,
    );
  }

  parts.push(table(['Period', 'Spent', 'Clicks', 'Leads', 'Cost / lead'],
    period('Yesterday', yesterday) + period('Last 7 days', week) + period('This month', month)));

  if (campaigns.length) {
    parts.push(`<h3 style="margin:0;font-size:14px;">Campaigns yesterday</h3>`);
    parts.push(table(['Campaign', 'Spent', 'Clicks', 'Leads'], campaigns.map((c) =>
      `<tr><td style="${cell}">${esc(c.name)}${c.status === 'ENABLED' ? '' : ` <span style="color:#b45309;">(${esc(c.status.toLowerCase())})</span>`}</td>` +
      `<td style="${cell}">$${money(c.cost)}</td><td style="${cell}">${c.clicks}</td><td style="${cell}">${num(c.conversions)}</td></tr>`).join('')));
  }

  parts.push(`<h3 style="margin:0;font-size:14px;">What people searched yesterday</h3>`);
  if (terms.length) {
    parts.push(`<p style="margin:2px 0 0;color:#6b7280;font-size:12px;">Anything that isn't a buyer (kits, jobs, DIY, rentals) → add it as a negative keyword.</p>`);
    parts.push(table(['Search term', 'Spent', 'Clicks', 'Leads'], terms.map((t) =>
      `<tr><td style="${cell}">${esc(t.term)}</td><td style="${cell}">$${money(t.cost)}</td>` +
      `<td style="${cell}">${t.clicks}</td><td style="${cell}">${num(t.conversions)}</td></tr>`).join('')));
  } else {
    parts.push(`<p style="font-size:13px;color:#6b7280;">No clicks yesterday.</p>`);
  }

  parts.push(`<p style="font-size:12px;color:#6b7280;">This report only reads the account. It never changes a campaign.</p></div>`);
  return parts.join('');
}
