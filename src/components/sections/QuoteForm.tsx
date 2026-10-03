"use client";

import { fencingNotes } from "@/lib/fencing-inquiry";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type HCaptcha from "@hcaptcha/react-hcaptcha";

import { Eyebrow } from "@/components/forge/Eyebrow";
import { CheckboxRow, FieldHelper, FieldLabel, PillGroup, StepProgress, TextArea, TextInput } from "@/components/forge/form";
import { QUOTE_EVENT, scrollToId, type QuoteRequest } from "@/lib/forge-quote";
import { cityFromZip } from "@/lib/locations";
import { projectService, type ProjectReference } from "@/lib/project-reference";
import { summarizeBuild } from "@/lib/quote-summary";
import { captureAttribution } from "@/lib/marketing-attribution";
import { capture, identifyLead, posthogIds, type AnalyticsEvent } from "@/lib/analytics";

// Lazy-load hCaptcha — its 20 KB chunk only fetches when step 2 first
// renders. Most homepage visitors never advance past step 1, so this
// keeps hCaptcha entirely off their first-load JS.
//
// next/dynamic erases the ref-forwarding from the wrapped component's
// type (props are inferred without the ref slot). Cast back to the
// original class type so consumers can still pass `ref={captchaRef}` and
// call captchaRef.current?.resetCaptcha() — runtime ref forwarding is
// preserved by next/dynamic; only the TS type needs reconnecting.
const HCaptchaWidget = dynamic(
  () => import("@hcaptcha/react-hcaptcha").then((m) => m.default),
  { ssr: false, loading: () => null },
) as unknown as typeof import("@hcaptcha/react-hcaptcha").default;

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

/* ─── Types ─────────────────────────────────────────────────────────────────
   FormState shape matches the /api/leads payload exactly. Two steps, opening
   with a visual service-chip selector (Decisions 2026-04-23). The Forge
   restyle (2026-10-02) changed the presentation, three option lists and
   added the permits question; the submit pipeline is unchanged. */

type ServiceType = "fencing" | "carport" | "garage" | "barn" | "rv_cover" | "lean_to" | "other";
type StructureType = "welded" | "bolted" | "unsure";
type NeedsConcrete = "yes" | "already_have" | "unsure";
type Surface = "dirt" | "gravel" | "asphalt" | "concrete";
// `this_week` stays a valid API value but is no longer offered (D7).
type Timeline = "asap" | "this_month" | "planning";
type BudgetBand = "under_5k" | "5_10k" | "10_20k" | "over_20k" | "not_sure";
type BestTime = "morning" | "afternoon" | "evening";
type Permits = "yes" | "no" | "not_sure";

export const BUDGET_BANDS: Array<{ v: BudgetBand; label: string; min?: number; max?: number | null }> = [
  { v: "under_5k", label: "Under $5k", min: 0, max: 5000 },
  { v: "5_10k", label: "$5k–$10k", min: 5000, max: 10000 },
  { v: "10_20k", label: "$10k–$20k", min: 10000, max: 20000 },
  { v: "over_20k", label: "$20k+", min: 20000, max: null },
  { v: "not_sure", label: "Not sure yet" },
];

const PERMIT_LABELS: Record<Permits, string> = { yes: "Yes", no: "No", not_sure: "Not sure" };

type FormState = {
  // Step 1 — project
  service_type: ServiceType | "";
  structure_type: StructureType;
  width: string;
  length: string;
  height: string;
  zip: string;
  fence_style: string;
  fence_length: string;
  fence_height: string;
  fence_gates: string;
  fence_removal: string;
  // Step 2 — contact + details
  name: string;
  phone: string;
  email: string;
  needs_concrete: NeedsConcrete | "";
  current_surface: Surface | "";
  permits: Permits | "";
  timeline: Timeline | "";
  best_time_to_call: BestTime | "";
  budget: BudgetBand | "";
  is_military: boolean;
  message: string;
};

const INITIAL: FormState = {
  service_type: "", structure_type: "unsure",
  width: "", length: "", height: "", zip: "",
  name: "", phone: "", email: "",
  needs_concrete: "", current_surface: "", permits: "", timeline: "",
  best_time_to_call: "",
  budget: "",
  fence_style: "Not sure yet", fence_length: "", fence_height: "", fence_gates: "", fence_removal: "Not sure",
  is_military: false, message: "",
};

/* ─── Service chips (step 1 opener) ─────────────────────────────────────── */

type ServiceChip = { value: ServiceType; label: string; sublabel: string; image: string; also?: ServiceType[] };

// One "Carport / RV Cover" chip: an `rv_cover` prefill (?service=rv) still
// lights it and still submits as rv_cover.
const SERVICE_CHIPS: readonly ServiceChip[] = [
  { value: "carport", label: "Carport / RV Cover", sublabel: "Welded or bolted", image: "/images/carport-gable-residential.jpg", also: ["rv_cover"] },
  { value: "fencing", label: "Fencing & Gates", sublabel: "Privacy, ranch, ornamental", image: "/images/metal-fence-ranch-wire.webp" },
  { value: "garage", label: "Metal Garage", sublabel: "Fully enclosed", image: "/images/metal-garage-green.jpg" },
  { value: "barn", label: "Metal Barn", sublabel: "Ranch & ag", image: "/images/carport-concrete-rural.jpg" },
  { value: "lean_to", label: "Lean-To / Patio", sublabel: "Attached or freestanding", image: "/images/porch-cover-lean-to.jpg" },
  { value: "other", label: "Other / Custom", sublabel: "Tell us what you need", image: "/images/red-iron-frame-hero.jpg" },
];

const KNOWN_SERVICES: readonly string[] = ["fencing", "carport", "garage", "barn", "rv_cover", "lean_to", "other"];

function chipSelected(chip: ServiceChip, value: string): boolean {
  return chip.value === value || Boolean(chip.also?.includes(value as ServiceType));
}

function ServiceChipCard({ chip, selected, onClick }: { chip: ServiceChip; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex cursor-pointer flex-col overflow-hidden rounded-[10px] border-2 p-0 text-left text-forge-navy transition-colors duration-200 ${
        selected ? "border-forge-navy bg-forge-fog" : "border-forge-silver bg-white hover:border-forge-steel"
      }`}
    >
      <span className="relative block aspect-[5/4] w-full overflow-hidden bg-forge-slate">
        {/* Decorative: the label + sublabel below already name the button. */}
        <Image src={chip.image} alt="" fill sizes="(max-width: 640px) 45vw, 360px" className="object-cover" />
        <span aria-hidden="true" className="absolute inset-0" style={{ background: "var(--scrim-chip-photo)" }} />
        {selected ? (
          <span
            aria-hidden="true"
            className="absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-full bg-forge-navy text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(0,24,42,.35)]"
          >
            ✓
          </span>
        ) : null}
      </span>
      <span className="block px-3 pt-2.5 pb-3">
        <span className="block font-forge-display text-[15px] font-bold leading-[1.15] tracking-[.01em]">{chip.label}</span>
        <span className="mt-[3px] block text-[11px] uppercase leading-[1.25] tracking-[.04em] text-forge-steel">{chip.sublabel}</span>
      </span>
    </button>
  );
}

type Update = <K extends keyof FormState>(k: K, v: FormState[K]) => void;

/* ─── Step 1 — Project ─────────────────────────────────────────────────── */

function FenceFields({ form, update }: { form: FormState; update: Update }) {
  return (
    <>
      <PillGroup
        label="Fence Style"
        options={["Metal privacy", "Pipe / ranch", "Ornamental metal", "Gates only", "Not sure yet"].map((v) => ({ v, label: v }))}
        value={form.fence_style}
        onChange={(v) => update("fence_style", v || "Not sure yet")}
      />
      <div>
        <FieldLabel as="p" optional>
          Approximate Fence Size
        </FieldLabel>
        <div className="grid grid-cols-2 gap-2.5">
          <TextInput type="number" min={0} step="any" aria-label="Total fence length in linear feet" placeholder="Length (linear ft)" value={form.fence_length} onChange={(e) => update("fence_length", e.target.value)} />
          <TextInput type="number" min={0} step="any" aria-label="Fence height in feet" placeholder="Height (ft)" value={form.fence_height} onChange={(e) => update("fence_height", e.target.value)} />
        </div>
        <FieldHelper>Rough measurements are fine. Leave blank if you’re not sure.</FieldHelper>
      </div>
      <div>
        <FieldLabel htmlFor="fence-gates" optional>
          Gates
        </FieldLabel>
        <TextInput id="fence-gates" maxLength={300} placeholder="e.g. 1 walk gate + 12 ft driveway gate" value={form.fence_gates} onChange={(e) => update("fence_gates", e.target.value)} />
      </div>
      <PillGroup
        label="Old Fence Removal Needed?"
        options={["Yes", "No", "Not sure"].map((v) => ({ v, label: v }))}
        value={form.fence_removal}
        onChange={(v) => update("fence_removal", v || "Not sure")}
      />
    </>
  );
}

function StepProject({ form, update }: { form: FormState; update: Update }) {
  const zipCity = form.zip.trim().length >= 5 ? cityFromZip(form.zip) : null;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <FieldLabel as="p">The build</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          {SERVICE_CHIPS.map((c) => (
            <ServiceChipCard
              key={c.value}
              chip={c}
              selected={chipSelected(c, form.service_type)}
              onClick={() => update("service_type", c.value)}
            />
          ))}
        </div>
      </div>

      {form.service_type === "fencing" ? (
        <FenceFields form={form} update={update} />
      ) : (
        <>
          <div>
            <PillGroup
              label="Construction"
              options={[
                { v: "welded" as StructureType, label: "Welded" },
                { v: "bolted" as StructureType, label: "Bolted" },
                { v: "unsure" as StructureType, label: "Not sure" },
              ]}
              value={form.structure_type}
              onChange={(v) => update("structure_type", v || "unsure")}
            />
            <FieldHelper>Welded is permanent; bolted can be moved later.</FieldHelper>
          </div>
          <div>
            <FieldLabel as="p" optional>
              Approximate size
            </FieldLabel>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { key: "width" as const, placeholder: "Width" },
                { key: "length" as const, placeholder: "Length" },
                { key: "height" as const, placeholder: "Height" },
              ].map(({ key, placeholder }) => (
                <TextInput
                  key={key}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  aria-label={`${placeholder} in feet`}
                />
              ))}
            </div>
            <FieldHelper>W × L × H in feet. Rough is fine — we measure on-site.</FieldHelper>
          </div>
        </>
      )}

      <div>
        <FieldLabel htmlFor="zip">ZIP code</FieldLabel>
        <div className="relative">
          <TextInput
            id="zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={10}
            required
            value={form.zip}
            onChange={(e) => update("zip", e.target.value)}
            placeholder="ZIP code"
            className="pr-[130px]"
          />
          {zipCity ? (
            <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 whitespace-nowrap text-[13px] font-semibold text-forge-navy">
              {zipCity} ✓
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2 — Contact + Details ───────────────────────────────────────── */

function StepContact({ form, update, militarySub }: { form: FormState; update: Update; militarySub: string }) {
  const fencing = form.service_type === "fencing";
  return (
    <div className="flex flex-col gap-6">
      <div>
        <FieldLabel as="p">Who to call back</FieldLabel>
        <div className="flex flex-col gap-2.5">
          <TextInput id="name" type="text" required autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" aria-label="Your name" />
          <TextInput id="phone" type="tel" required autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone — we text first" aria-label="Your phone number" />
          <TextInput id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Email (optional)" aria-label="Your email" />
        </div>
      </div>

      {!fencing ? (
        <PillGroup
          label="Concrete pad"
          options={[
            { v: "yes" as NeedsConcrete, label: "Include it" },
            { v: "already_have" as NeedsConcrete, label: "Have a slab" },
            { v: "unsure" as NeedsConcrete, label: "Not sure" },
          ]}
          value={form.needs_concrete}
          onChange={(v) => update("needs_concrete", v)}
        />
      ) : null}

      {!fencing && form.needs_concrete === "already_have" ? (
        <PillGroup
          label="Current surface"
          options={[
            { v: "dirt" as Surface, label: "Dirt / bare ground" },
            { v: "gravel" as Surface, label: "Gravel" },
            { v: "asphalt" as Surface, label: "Asphalt" },
            { v: "concrete" as Surface, label: "Existing concrete" },
          ]}
          value={form.current_surface}
          onChange={(v) => update("current_surface", v)}
        />
      ) : null}

      <div>
        <PillGroup
          label="Do you need permits?"
          options={(Object.keys(PERMIT_LABELS) as Permits[]).map((v) => ({ v, label: PERMIT_LABELS[v] }))}
          value={form.permits}
          onChange={(v) => update("permits", v)}
        />
        <FieldHelper>We talk through city, county and HOA requirements before anything gets scheduled.</FieldHelper>
      </div>

      <PillGroup
        label="Timeline"
        options={[
          { v: "asap" as Timeline, label: "ASAP" },
          { v: "this_month" as Timeline, label: "This month" },
          { v: "planning" as Timeline, label: "Just planning" },
        ]}
        value={form.timeline}
        onChange={(v) => update("timeline", v)}
      />

      {/* Best time to call pairs with Timeline but answers a different
          question: when the job needs doing vs. when they can pick up. */}
      <PillGroup
        label="Best time to call"
        optional
        allowDeselect
        options={[
          { v: "morning" as BestTime, label: "Morning (before noon)" },
          { v: "afternoon" as BestTime, label: "Afternoon (12–5)" },
          { v: "evening" as BestTime, label: "Evening (after 5)" },
        ]}
        value={form.best_time_to_call}
        onChange={(v) => update("best_time_to_call", v)}
      />

      <div>
        <PillGroup
          label="Budget range"
          optional
          allowDeselect
          tabular
          options={BUDGET_BANDS.map((b) => ({ v: b.v, label: b.label }))}
          value={form.budget}
          onChange={(v) => update("budget", v)}
        />
        <FieldHelper>Honest pricing, no surprises. We scope the build to what you want to spend — not the other way around.</FieldHelper>
      </div>

      {/* Military / first responder discount. /military, the service pages and
          the PCS copy all tell visitors to check this box. */}
      <div>
        <FieldLabel as="p" optional>
          Discount
        </FieldLabel>
        <CheckboxRow
          checked={form.is_military}
          onChange={(c) => update("is_military", c)}
          label="Military, veteran or first responder"
          sub={militarySub}
        />
      </div>

      <div>
        <FieldLabel htmlFor="message" optional>
          Anything else
        </FieldLabel>
        <TextArea
          id="message"
          rows={3}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="HOA requirements, site access, existing anchors…"
        />
      </div>
    </div>
  );
}

/* ─── Section chrome ───────────────────────────────────────────────────── */

export const QUOTE_LEDE_DEFAULT = "Two quick steps. A real Texas crew on the other end — not a form into a black hole.";

function QuoteIntro({ lede }: { lede: string }) {
  return (
    <div className="flex max-w-[720px] flex-col items-center text-center">
      <Eyebrow align="center">Get a quote</Eyebrow>
      <h2
        id="quote-heading"
        className="mt-4 font-forge-display text-[clamp(30px,3vw_+_12px,56px)] font-black leading-[1.05] tracking-[.01em] text-forge-navy"
      >
        Tell us about
        <br />
        <span className="text-forge-slate">your build.</span>
      </h2>
      <p className="mt-4 max-w-[520px] text-[clamp(16px,.3vw_+_14px,18px)] leading-[1.55] text-forge-slate [text-wrap:pretty]">
        {lede}
      </p>
      <ul className="m-0 mt-6 flex list-none flex-wrap justify-center gap-x-6 gap-y-2.5 p-0 text-[15px] text-forge-navy">
        {["Free quote, no obligation", "Reply within 24 hours", "Military, first-responder & trade discounts honored"].map((t) => (
          <li key={t} className="flex items-center gap-3">
            <span aria-hidden="true" className="h-[2px] w-7 flex-none bg-forge-steel" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Main form ────────────────────────────────────────────────────────── */

export type QuoteFormProps = {
  /** Pre-check the military / first-responder box on step 2.
   *  Used by /military so PCS visitors don't have to remember the discount toggle. */
  initialMilitary?: boolean;
  projectReference?: ProjectReference;
  /**
   * Render the surrounding Forge quote section (fog band, centred intro,
   * assurances) around the card, or just the card on its own.
   *
   * Defaults to `true`, and must stay that way: the marketing pages render
   * this as a page-closing section and several pass no props at all.
   * `false` is for /quote, which supplies its own headline. The card is a
   * self-contained white surface, so it reads on any ground.
   */
  chrome?: boolean;
  /** Intro lede in chrome mode; QuoteSection picks it per page type. */
  lede?: string;
  /** Preselected service chip, from ?service= on /quote or the service page. */
  initialService?: ServiceType;
  /** Prefilled ZIP, from ?city= or ?zip= on /quote, or the location page. */
  initialZip?: string;
  /**
   * Which funnel this submission belongs to. Constrained to the two values the
   * public API accepts from a client; every other `leads.source` value is set
   * server-side by an ingest path.
   */
  source?: "website_form" | "quote_page";
};

export function QuoteForm({
  initialMilitary = false,
  projectReference,
  chrome = true,
  lede = QUOTE_LEDE_DEFAULT,
  initialService,
  initialZip,
  source = "website_form",
}: QuoteFormProps = {}) {
  const router = useRouter();
  const [reference, setReference] = useState(projectReference);
  const [step, setStep] = useState<1 | 2>(1);
  // A project reference outranks ?service= — it is the more specific signal,
  // and it is what the customer was looking at when they clicked.
  const [form, setForm] = useState<FormState>({
    ...INITIAL,
    is_military: initialMilitary,
    service_type: projectReference ? projectService(projectReference.type) : initialService ?? "",
    zip: initialZip ?? "",
  });
  // The /quote hero promises "Same day, guaranteed within 24 hours". The
  // below-submit line has to agree with it, or the page contradicts itself
  // between its headline and its button.
  const isQuotePage = source === "quote_page";
  const [status, setStatus] = useState<"idle" | "submitting" | "err">("idle");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha | null>(null);
  const [errMsg, setErrMsg] = useState("");

  // Funnel analytics. Every event carries which form this is, so the homepage
  // section and the /quote ad landing page can be compared side by side.
  const cardRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);
  function track(event: AnalyticsEvent, props: Record<string, string | number | boolean | null | undefined> = {}) {
    capture(event, { form_source: source, ...props });
  }
  function markStarted(field: string) {
    if (startedRef.current) return;
    startedRef.current = true;
    track("quote_form_started", { first_field: field });
  }

  // quote_form_viewed: the card scrolled into view, once per mount. The gap
  // between a page view and this is the "never scrolled to the form" drop.
  // Any visible pixel above the bottom quarter of the screen counts: a ratio
  // threshold would never fire on a phone where the card is taller than the
  // screen.
  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        capture("quote_form_viewed", {
          form_source: source,
          prefilled_service: Boolean(initialService || projectReference),
          has_reference_project: Boolean(projectReference),
        });
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [source, initialService, projectReference]);

  // Also capture here for isolated form renders; marketing layout captures
  // on pages without a form, such as the blog and partner page.
  useEffect(() => {
    captureAttribution();
    // Legacy shortcut buttons (QuoteShortcut) send just a service.
    function selectService(event: Event) {
      const service = (event as CustomEvent).detail;
      if (typeof service !== "string" || !KNOWN_SERVICES.includes(service)) return;
      setForm((current) => ({ ...current, service_type: service as ServiceType }));
      setStep(1);
    }
    // Forge cards (option card, lightbox, military calculator) send a request.
    function applyRequest(event: Event) {
      const req = (event as CustomEvent<QuoteRequest>).detail ?? {};
      setForm((current) => ({
        ...current,
        ...(req.service && KNOWN_SERVICES.includes(req.service) ? { service_type: req.service } : {}),
        ...(req.structure ? { structure_type: req.structure } : {}),
        ...(req.concrete ? { needs_concrete: req.concrete } : {}),
        ...(req.military ? { is_military: true } : {}),
      }));
      setStep(1);
    }
    window.addEventListener("triplej:quote-service", selectService);
    window.addEventListener(QUOTE_EVENT, applyRequest);
    return () => {
      window.removeEventListener("triplej:quote-service", selectService);
      window.removeEventListener(QUOTE_EVENT, applyRequest);
    };
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    markStarted(key);
    setForm((f) => ({ ...f, [key]: value }));
  }

  function canAdvance(): boolean {
    if (step === 1) {
      // Project step: require service type + ZIP. Construction defaults to
      // 'unsure' so it's always valid; dimensions are optional.
      return form.service_type !== "" && form.zip.trim().length >= 5;
    }
    // Step 2 (final): require name + phone (10+ digits)
    return form.name.trim().length >= 2 && form.phone.trim().length >= 10;
  }

  function next() {
    if (step < 2 && canAdvance()) {
      track("quote_step_completed", {
        step: 1,
        service_type: form.service_type,
        structure_type: form.service_type === "fencing" ? undefined : form.structure_type,
        needs_concrete: form.needs_concrete || undefined,
        has_dimensions: Boolean(form.width && form.length),
        zip: form.zip.trim(),
      });
      setStep(2);
      requestAnimationFrame(() => scrollToId("quote-card"));
    }
  }
  function back() {
    if (step > 1) {
      track("quote_step_back", { from_step: step });
      setStep(1);
    }
  }

  async function handleSubmit() {
    if (step !== 2) return;
    if (HCAPTCHA_SITE_KEY && !captchaToken) {
      track("quote_form_failed", { reason: "captcha_missing" });
      setStatus("err");
      setErrMsg("Please complete the captcha check below.");
      return;
    }
    track("quote_form_submitted", {
      service_type: form.service_type,
      timeline: form.timeline || undefined,
      budget: form.budget || undefined,
      is_military: form.is_military,
      has_email: Boolean(form.email.trim()),
    });
    setStatus("submitting");
    setErrMsg("");

    const payload = buildLeadPayload(form, { source, captchaToken, referenceId: reference?.id });

    let httpFailed = false;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, ...captureAttribution(), ...posthogIds() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        httpFailed = true;
        track("quote_form_failed", { reason: `http_${res.status}` });
        throw new Error(
          typeof body?.error === "string"
            ? body.error
            : "Something went wrong. Please call us directly.",
        );
      }
      const created = await res.json().catch(() => ({}));
      if (typeof created?.id === "string") {
        identifyLead(created.id, {
          lead_service_type: form.service_type,
          lead_form_source: source,
          lead_zip: form.zip.trim(),
          is_military: form.is_military,
        });
      }
      // Stash the lead's contact data for the /thank-you page to pass
      // to Google Ads enhanced conversions via gtag('set','user_data').
      // gtag.js SHA-256-hashes these client-side before sending — we
      // just provide trimmed plain strings; GoogleAdsConversion does
      // the normalization (lowercase email, E.164 phone, name split)
      // and clears this key after firing. sessionStorage so the data
      // dies with the tab — never persisted.
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            "tj_ec_user_data",
            JSON.stringify({
              name:  form.name.trim(),
              phone: form.phone.trim(),
              email: form.email.trim(),
              zip:   form.zip.trim(),
            }),
          );
        } catch {
          // Private mode / quota — non-fatal; conversion still fires
          // without enhanced match data.
        }
      }
      // Success — redirect to /thank-you for clean conversion analytics
      // (per 2026-04-23 design decision). The router push preserves
      // history so back-button still works for the user.
      // ?from=quote lets /thank-you acknowledge the ad funnel. Deliberately
      // carries no PII — name, phone and ZIP never go in a URL.
      router.push(isQuotePage ? "/thank-you?from=quote" : "/thank-you");
    } catch (err) {
      // An HTTP error was already tracked above, with its status.
      if (!httpFailed) track("quote_form_failed", { reason: "network" });
      setStatus("err");
      setErrMsg(err instanceof Error ? err.message : "Unknown error");
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    }
  }

  const buildSummary =
    step === 2 ? (form.service_type === "fencing" ? fencingNotes(form).replaceAll("\n", " · ") : summarizeBuild(form)) : null;

  const card: ReactNode = (
    <div
      ref={cardRef}
      id="quote-card"
      className="w-full max-w-[760px] scroll-mt-4 rounded-[12px] border border-forge-silver bg-white p-[clamp(20px,2vw,32px)] text-forge-navy shadow-[var(--shadow-lifted)]"
    >
      {reference ? (
        <div className="mb-6 flex items-start gap-4 rounded-[10px] border border-forge-silver bg-forge-fog p-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-[6px]">
            <Image src={reference.image} alt="" fill sizes="80px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-forge-slate">Inspired by this project</p>
            <p className="mt-1 font-forge-display text-[17px] font-bold">{reference.title}</p>
            <p className="text-[14px] text-forge-slate">{reference.city}</p>
            <button type="button" onClick={() => setReference(undefined)} className="mt-1 min-h-11 cursor-pointer text-[14px] font-semibold text-forge-navy underline underline-offset-4">
              Remove reference
            </button>
          </div>
        </div>
      ) : null}

      <StepProgress step={step} label={step === 1 ? "Your build" : "Who to call back"} />

      {/* Not a <form>: Enter advances step 1 (locked anti-implicit-submit pattern). */}
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter" && step < 2 && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
            if (canAdvance()) next();
          }
        }}
      >
        {/* Re-key the wrapper so React re-mounts → animation re-fires */}
        <div key={step} className="step-slide-in">
          {step === 1 ? (
            <StepProject form={form} update={update} />
          ) : (
            <StepContact
              form={form}
              update={update}
              militarySub="7% off your install. ID checked at the estimate."
            />
          )}
        </div>

        {step === 1 ? (
          <div className="sticky bottom-[72px] z-[2] -mx-[clamp(20px,2vw,32px)] mt-6 -mb-[clamp(20px,2vw,32px)] rounded-b-[12px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0),#fff_16px)] px-[clamp(20px,2vw,32px)] pt-3.5 pb-[clamp(20px,2vw,32px)] min-[900px]:bottom-0">
            <button
              type="button"
              onClick={next}
              disabled={!canAdvance()}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-forge-navy px-[26px] py-[15px] text-[16px] font-semibold text-white shadow-[var(--shadow-cta)] transition-colors duration-200 hover:bg-forge-navy-raised disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <>
            {/* Build echo — a confirmation, never an estimate. */}
            {buildSummary ? (
              <div className="mt-6 rounded-[10px] border border-forge-silver bg-forge-fog px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-forge-slate">Your build</p>
                <p className="mt-1 text-[14px] text-forge-navy">{buildSummary}</p>
              </div>
            ) : null}

            {HCAPTCHA_SITE_KEY ? (
              <div className="mt-6 flex justify-center">
                <HCaptchaWidget
                  ref={captchaRef}
                  sitekey={HCAPTCHA_SITE_KEY}
                  theme="light"
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                />
              </div>
            ) : null}

            {status === "err" ? (
              <div role="alert" className="mt-5 rounded-[8px] border border-forge-navy bg-forge-fog px-4 py-3 text-[14px] font-semibold text-forge-navy">
                {errMsg}
              </div>
            ) : null}

            <div className="mt-6 flex justify-between gap-3">
              <button
                type="button"
                onClick={back}
                className="h-[50px] cursor-pointer rounded-[6px] border border-forge-silver bg-white px-[18px] text-[14px] font-semibold text-forge-slate transition-colors hover:border-forge-navy"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === "submitting" || !canAdvance()}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-forge-navy px-[26px] py-[15px] text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-forge-navy-raised disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "submitting" ? "Sending…" : "Send to Triple J"} <span aria-hidden="true">→</span>
              </button>
            </div>

            <p className="mt-[18px] text-center text-[12px] leading-[1.5] text-forge-slate">
              Free · no obligation · {isQuotePage ? "same day, guaranteed within 24 hours." : "reply within 24 hours."}
            </p>
            <p className="mt-1.5 text-center text-[11px] text-forge-steel">
              By submitting you consent to be contacted by phone, text, or email.
            </p>
          </>
        )}
      </div>
    </div>
  );

  // Bare mode: the host page owns the heading. `id="quote"` lives there.
  if (!chrome) return card;

  return (
    <section
      id="quote"
      // Pairs with the <h2 id="quote-heading"> in QuoteIntro; both are chrome-only.
      aria-labelledby="quote-heading"
      data-forge=""
      data-tone="light"
      className="scroll-mt-24 border-t border-forge-mist bg-forge-fog py-[clamp(64px,7vw,104px)] text-forge-navy"
    >
      <div className="mx-auto flex w-full max-w-[1360px] flex-col items-center gap-[clamp(32px,3vw,48px)] px-[clamp(20px,3vw,40px)]">
        <QuoteIntro lede={lede} />
        {card}
      </div>
    </section>
  );
}

/**
 * The /api/leads body for a filled form, without attribution (added at send
 * time). Pure, so the payload contract is testable: the Forge restyle may not
 * change any key or value except adding the permits line to the notes.
 */
export function buildLeadPayload(
  form: FormState,
  { source, captchaToken, referenceId }: { source: "website_form" | "quote_page"; captchaToken: string | null; referenceId?: string },
) {
  const budgetBand = BUDGET_BANDS.find((b) => b.v === form.budget);
  const fencing = form.service_type === "fencing";
  return {
    name:            form.name.trim(),
    phone:           form.phone.trim(),
    email:           form.email.trim() || undefined,
    zip:             form.zip.trim() || undefined,
    service_type:    ["lean_to", "fencing"].includes(form.service_type) ? "other" : form.service_type || undefined,
    structure_type:  fencing ? undefined : form.structure_type,
    width:           fencing ? undefined : form.width || undefined,
    length:          fencing ? undefined : form.length || undefined,
    height:          fencing ? undefined : form.height || undefined,
    needs_concrete:  fencing ? undefined : form.needs_concrete || undefined,
    current_surface: fencing ? undefined : form.current_surface || undefined,
    timeline:        form.timeline || undefined,
    best_time_to_call: form.best_time_to_call || undefined,
    source,
    estimated_budget_min: budgetBand?.min,
    estimated_budget_max: budgetBand?.max ?? undefined,
    is_military:     form.is_military,
    message:         [
      form.service_type === "lean_to" ? "Requested build: Lean-To / Patio" : "",
      fencing ? fencingNotes(form) : "",
      form.message.trim(),
      // Permits have no column; they ride in the notes (D7, no migration).
      form.permits ? `Permits: ${PERMIT_LABELS[form.permits]}` : "",
    ].filter(Boolean).join("\n\n") || undefined,
    captcha_token:   captchaToken ?? undefined,
    reference_project_id: referenceId,
  };
}

export type { FormState as QuoteFormState };
export { INITIAL as QUOTE_FORM_INITIAL };
