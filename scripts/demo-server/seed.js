// Triple J Metal demo seed — the ONLY app-specific file. `build()` returns a
// fresh { users, tables } on every call so /__reset restores pristine state.
// Covers the public site (gallery) and the HQ CRM (leads, customers, quotes,
// jobs). Edit freely to tune the demo story.
const { rel } = require("./engine");

const OWNER_ID = "00000000-0000-4000-8000-000000000001";
const id = (prefix, n) => `${prefix}0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString();
const dateOff = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

function build() {
  const users = {
    "owner@triplejmetal.test": {
      id: OWNER_ID, email: "owner@triplejmetal.test", role: "authenticated", aud: "authenticated",
      user_metadata: {}, app_metadata: { provider: "email" },
    },
  };

  // ---- public gallery ---------------------------------------------------------
  const IMG = "/images/";
  const GI = [
    ["Residential Welded Carport", "Temple", "Carport", "Welded", "carport-residential-completed.jpg", true],
    ["Enclosed Metal Garage", "Killeen", "Garage", "Bolted", "metal-garage-green.jpg", true],
    ["Carport + Concrete Pad", "Belton", "Carport", "Turnkey", "carport-concrete-rural.jpg", true],
    ["Double-Width Carport", "Harker Heights", "Carport", "Welded", "double-carport-install.jpg", false],
    ["Gable-Roof Residential Carport", "Salado", "Carport", "Welded", "carport-gable-residential.jpg", true],
    ["Porch Cover / Lean-To", "Waco", "Lean-To", "Bolted", "porch-cover-lean-to.jpg", false],
    ["Truck Carport on Fresh Slab", "Copperas Cove", "Carport", "Turnkey", "carport-truck-concrete-hero.jpg", false],
  ];
  const gallery_items = GI.map(([title, city, type, tag, , featured], i) => ({
    id: id("a", i + 1), created_at: daysAgo(60 - i * 5), title, city, type, tag,
    alt_text: `${title} in ${city}, Texas by Triple J Metal`, sort_order: i + 1,
    is_active: true, is_featured: featured, job_id: null,
  }));
  const gallery_photos = GI.map(([title, , , , file], i) => ({
    id: id("b", i + 1), created_at: daysAgo(60 - i * 5), gallery_item_id: id("a", i + 1),
    image_url: IMG + file, alt_text: title, sort_order: 1, is_cover: true,
  }));

  // ---- CRM ----------------------------------------------------------------------
  const C = (n, name, phone, email, city, extra = {}) => ({
    id: id("c", n), created_at: daysAgo(40 - n * 4), updated_at: daysAgo(2), lead_id: null,
    name, phone, email, address: `${100 + n * 17} Ranch Rd`, city, state: "TX", zip: "765" + String(10 + n),
    notes: null, review_asked_at: null, review_followup_due_at: null, review_left_at: null,
    review_url: null, feature_permission: null, repeat_contact_permission: null, ...extra,
  });
  const customers = [
    C(1, "Mike Hernandez", "254-555-0141", "mike.h@example.com", "Temple"),
    C(2, "Sarah & Tom Whitfield", "254-555-0188", "whitfields@example.com", "Belton", { review_followup_due_at: daysAgo(-3) }),
    C(3, "Rosa Delgado", "254-555-0102", null, "Killeen"),
    C(4, "Greer Ranch LLC", "254-555-0166", "office@greerranch.example", "Salado"),
    C(5, "Danny Pruitt", "254-555-0133", "dpruitt@example.com", "Waco"),
  ];

  const L = (n, name, city, status, service, message, extra = {}) => ({
    id: id("d", n), created_at: daysAgo(14 - n), updated_at: daysAgo(Math.max(0, 12 - n)),
    name, phone: `254-555-02${String(10 + n)}`, email: null, city, service_type: service,
    structure_type: null, message, status, source: "website_form", owner_notes: null, zip: null,
    needs_concrete: null, current_surface: null, timeline: null, is_military: false,
    first_response_at: null, intent_stage: null, won_at: null, lost_at: null, lost_reason: null,
    best_time_to_call: null, dup_ack: false, is_draft: false, ...extra,
  });
  const leads = [
    L(1, "Carlos Medina", "Killeen", "new", "carport", "Looking for a 24x24 carport for two trucks. Have a slab already.", { timeline: "Within a month", needs_concrete: "No", is_military: true, best_time_to_call: "Evenings" }),
    L(2, "Jenny Ostrander", "Temple", "new", "garage", "Quote for a 30x40 metal garage with a roll-up door.", { timeline: "1-3 months", needs_concrete: "Yes" }),
    L(3, "Walt Brennan", "Belton", "contacted", "carport", "Called back Tuesday — wants site visit Thursday.", { first_response_at: daysAgo(3) }),
    L(4, "Priya Shah", "Georgetown", "quoted", "lean-to", "Porch cover on the back of the house, about 12x20.", { first_response_at: daysAgo(6) }),
    L(5, "Eddie Ruiz", "Harker Heights", "quoted", "carport", "RV cover, needs 14ft clearance.", { first_response_at: daysAgo(8) }),
    L(6, "Linda Fairchild", "Salado", "won", "barn", "Small horse barn with tack room.", { won_at: daysAgo(5), first_response_at: daysAgo(11) }),
    L(7, "Marcus Webb", "Waco", "lost", "carport", "Went with a cheaper out-of-state install.", { lost_at: daysAgo(4), lost_reason: "price" }),
    L(8, null, "Killeen", "new", "carport", null, { phone: "254-555-0299", is_draft: true }),
  ];

  const Q = (n, cust, status, total, extra = {}) => ({
    id: id("e", n), created_at: daysAgo(20 - n * 2), updated_at: daysAgo(1), customer_id: id("c", cust),
    lead_id: null, quote_number: `Q-${1000 + n}`, status, valid_until: dateOff(20 - n * 3),
    subtotal: +(total / 1.0825).toFixed(2), tax_rate: 0.0825, tax_amount: +(total - total / 1.0825).toFixed(2),
    total, notes: "Price includes materials, delivery and installation.", internal_notes: null,
    accept_token: `f0000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    accepted_at: null, declined_at: null, sent_at: null, ...extra,
  });
  const quotes = [
    Q(1, 1, "sent", 8450, { sent_at: daysAgo(6) }),
    Q(2, 2, "accepted", 14200, { sent_at: daysAgo(14), accepted_at: daysAgo(11) }),
    Q(3, 4, "sent", 22800, { sent_at: daysAgo(3) }),
    Q(4, 5, "draft", 5900),
    Q(5, 3, "declined", 6750, { sent_at: daysAgo(18), declined_at: daysAgo(15) }),
  ];
  const quote_line_items = quotes.flatMap((q, qi) => [
    ["Red iron frame, painted & welded", 1, q.subtotal * 0.55],
    ["Roofing — 29ga ribbed panel", 1, q.subtotal * 0.25],
    ["Delivery & installation", 1, q.subtotal * 0.2],
  ].map(([description, quantity, price], i) => ({
    id: id("1", qi * 10 + i + 1), quote_id: q.id, sort_order: i + 1, description, quantity,
    unit: "each", unit_price: +price.toFixed(2), total_price: +price.toFixed(2),
  })));

  const J = (n, cust, quote, number, status, type, city, total, paid, extra = {}) => ({
    id: id("2", n), created_at: daysAgo(30 - n * 3), updated_at: daysAgo(1), customer_id: id("c", cust),
    quote_id: quote ? id("e", quote) : null, job_number: number, status, job_type: type, structure_type: null,
    address: `${200 + n * 31} County Rd`, city, scheduled_date: dateOff(4 - n * 3), completed_date: null,
    total_contract: total, amount_paid: paid, balance_due: +(total - paid).toFixed(2),
    crew_notes: null, internal_notes: null, contract_signed_date: daysAgo(10), end_date: null, ...extra,
  });
  const jobs = [
    J(1, 2, 2, "J-2001", "scheduled", "carport", "Belton", 14200, 7100),
    J(2, 4, null, "J-2002", "in_progress", "barn", "Salado", 31500, 15750),
    J(3, 1, null, "J-2003", "completed", "garage", "Temple", 12800, 12800, { completed_date: dateOff(-9) }),
  ];

  return {
    users,
    tables: {
      gallery_items, gallery_photos, customers, leads, quotes, quote_line_items, jobs,
      lead_appointments: [], permit_leads: [], job_receipts: [], job_costs: [], time_entries: [],
      email_events: [], partner_inquiries: [], push_subscriptions: [], cron_runs: [], qbo_tokens: [],
      permit_reports: [], quote_templates: [], lead_drafts: [],
    },
  };
}

// RLS-ish: anon sees only active gallery rows (+ photos of those); the signed-in
// owner and the service role see everything; anything else is empty.
function scope(table, rows, user, tables) {
  if (user && (user.role === "service_role" || user.role === "authenticated")) return rows;
  if (table === "gallery_items") return rows.filter((r) => r.is_active);
  if (table === "gallery_photos") {
    const active = new Set(tables.gallery_items.filter((g) => g.is_active).map((g) => g.id));
    return rows.filter((r) => active.has(r.gallery_item_id));
  }
  return [];
}

const relations = {
  gallery_items: { gallery_photos: rel.many("gallery_photos", "gallery_item_id") },
  quotes: {
    customers: rel.one("customers", "customer_id"),
    quote_line_items: rel.many("quote_line_items", "quote_id"),
    leads: rel.one("leads", "lead_id"),
  },
  jobs: { customers: rel.one("customers", "customer_id"), quotes: rel.one("quotes", "quote_id") },
  leads: { customers: rel.one("customers", "referring_customer_id") },
  customers: { leads: rel.one("leads", "lead_id"), jobs: rel.many("jobs", "customer_id"), quotes: rel.many("quotes", "customer_id") },
  lead_appointments: { leads: rel.one("leads", "lead_id") },
};

module.exports = { build, scope, relations };
