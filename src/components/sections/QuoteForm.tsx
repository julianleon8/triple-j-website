"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type HCaptcha from "@hcaptcha/react-hcaptcha";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { projectService, type ProjectReference, type ReferenceService } from "@/lib/project-reference";
import { summarizeBuild } from "@/lib/quote-summary";
import { captureAttribution } from "@/lib/marketing-attribution";

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
   FormState shape matches the /api/leads payload exactly. The 3-step lock
   from 2026-04-15 was revised in 2026-04-23 to a 2-step structure that
   opens with a visual service-chip selector — see Decisions.md. */

type ServiceType = "carport" | "garage" | "barn" | "rv_cover" | "lean_to" | "other";
type StructureType = "welded" | "bolted" | "unsure";
type NeedsConcrete = "yes" | "already_have" | "unsure";
type Surface = "dirt" | "gravel" | "asphalt" | "concrete";
type Timeline = "asap" | "this_week" | "this_month" | "planning";
type BudgetBand = "under_5k" | "5_10k" | "10_20k" | "20_40k" | "over_40k";
type BestTime = "morning" | "afternoon" | "evening";

const BUDGET_BANDS: Array<{ v: BudgetBand; label: string; min: number; max: number | null }> = [
  { v: "under_5k", label: "Under $5K",   min: 0,     max: 5000 },
  { v: "5_10k",    label: "$5K – $10K",  min: 5000,  max: 10000 },
  { v: "10_20k",   label: "$10K – $20K", min: 10000, max: 20000 },
  { v: "20_40k",   label: "$20K – $40K", min: 20000, max: 40000 },
  { v: "over_40k", label: "$40K+",       min: 40000, max: null },
];

type FormState = {
  // Step 1 — project
  service_type: ServiceType | "";
  structure_type: StructureType;
  width: string;
  length: string;
  height: string;
  zip: string;
  // Step 2 — contact + details
  name: string;
  phone: string;
  email: string;
  needs_concrete: NeedsConcrete | "";
  current_surface: Surface | "";
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
  needs_concrete: "", current_surface: "", timeline: "",
  best_time_to_call: "",
  budget: "",
  is_military: false, message: "",
};

/* ─── Magazine label primitive ──────────────────────────────────────────────
   Small Barlow uppercase label with bullets bracketing the text. Used for
   every field group on the form. */

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <p className="font-display font-extrabold uppercase tracking-[0.18em] text-[11px] text-white/60 mb-2.5">
      <span aria-hidden="true" className="text-[color:var(--color-brand-400)]">·&nbsp;</span>
      {children}
      {optional ? <span className="ml-1.5 text-white/35 font-medium">(optional)</span> : null}
      <span aria-hidden="true" className="text-[color:var(--color-brand-400)]">&nbsp;·</span>
    </p>
  );
}

/* ─── Shared input + button styles ──────────────────────────────────────────
   Outlined-dark inputs: subtle white/10 border on white/5 fill, white text
   inside, brand-blue ring on focus. Matches the glass card. */

const inputCls =
  "w-full rounded-lg border border-white/15 " +
  "bg-white/5 px-4 h-12 text-[15px] text-white " +
  "placeholder:text-white/35 " +
  "focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand-400)] " +
  "focus:border-transparent transition-colors";

/* ─── Service chip (step 1 opener) ──────────────────────────────────────────
   Visual chip with photo thumbnail, used for service-type selection. */

type ServiceChip = { value: ServiceType; label: string; sublabel: string; image: string };

const SERVICE_CHIPS: readonly ServiceChip[] = [
  { value: "lean_to", label: "Lean-To / Patio", sublabel: "Attached or freestanding", image: "/images/porch-cover-lean-to.jpg" },
  { value: "other", label: "Other / Custom", sublabel: "Tell us what you need", image: "/images/red-iron-frame-hero.jpg" },
  { value: "carport",  label: "Carport",     sublabel: "Welded or bolted",  image: "/images/carport-gable-residential.jpg" },
  { value: "garage",   label: "Metal Garage", sublabel: "Fully enclosed",   image: "/images/metal-garage-green.jpg" },
  // Real Triple J ranch build (Temple) and RV cover (Copperas Cove) from /hq/gallery —
  // matches the Services grid swap so the lead-form chip imagery is consistent.
  { value: "barn",     label: "Metal Barn",  sublabel: "Ranch & ag",        image: "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/items/e83d6a82-6138-40e1-a60b-c4fe4b7d8a30/1777195267509.jpg" },
  { value: "rv_cover", label: "RV / Boat",   sublabel: "Tall clearance",    image: "https://idrbgxlvvnqduvbqtaei.supabase.co/storage/v1/object/public/gallery/1777251893180.jpg" },
];

function ServiceChipCard({
  chip, selected, onClick,
}: {
  chip: ServiceChip;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
        selected
          ? "border-[color:var(--color-brand-400)] bg-[color:var(--color-brand-600)]/15 shadow-lg"
          : "border-white/15 bg-white/5 hover:border-white/30"
      }`}
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        <Image
          src={chip.image}
          alt={`${chip.label} — ${chip.sublabel}`}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className={`object-cover transition-all duration-500 ${
            selected ? "scale-105" : "group-hover:scale-105"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        {selected && (
          <span
            aria-hidden="true"
            className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-full bg-[color:var(--color-brand-600)] text-white text-sm font-bold shadow-lg"
          >
            ✓
          </span>
        )}
      </div>
      <div className="p-3">
        <div className={`font-display font-extrabold uppercase tracking-tight text-base leading-none ${
          selected ? "text-white" : "text-white/90"
        }`}>
          {chip.label}
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-wider text-white/45 leading-tight">
          {chip.sublabel}
        </div>
      </div>
    </button>
  );
}

/* ─── Outlined-dark pill (option chip) ──────────────────────────────────── */

function OptionPill({
  selected, onClick, children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`h-11 px-4 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
        selected
          ? "border-[color:var(--color-brand-400)] bg-[color:var(--color-brand-600)]/20 text-white"
          : "border-white/15 bg-white/5 text-white/75 hover:border-white/30 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Step 1 — Project ─────────────────────────────────────────────────── */

function StepProject({
  form, update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="space-y-7">
      {/* Service type — visual chips, opens the form */}
      <div>
        <FieldLabel>The Build</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          {SERVICE_CHIPS.map((c) => (
            <ServiceChipCard
              key={c.value}
              chip={c}
              selected={form.service_type === c.value}
              onClick={() => update("service_type", c.value)}
            />
          ))}
        </div>
      </div>

      {/* Construction preference */}
      <div>
        <FieldLabel>Construction</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {([
            { v: "welded" as StructureType, label: "Welded — permanent" },
            { v: "bolted" as StructureType, label: "Bolted" },
            { v: "unsure" as StructureType, label: "Not sure yet" },
          ]).map((opt) => (
            <OptionPill
              key={opt.v}
              selected={form.structure_type === opt.v}
              onClick={() => update("structure_type", opt.v)}
            >
              {opt.label}
            </OptionPill>
          ))}
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <FieldLabel optional>Approximate Size</FieldLabel>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "width" as const,  placeholder: "Width" },
            { key: "length" as const, placeholder: "Length" },
            { key: "height" as const, placeholder: "Height" },
          ].map(({ key, placeholder }) => (
            <input
              key={key}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
              className={inputCls}
              placeholder={placeholder}
              aria-label={`${placeholder} in feet`}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-white/40 uppercase tracking-wider">
          W × L × H in feet — rough is fine
        </p>
      </div>

      {/* Location */}
      <div>
        <FieldLabel>Location</FieldLabel>
        <input
          id="zip"
          type="text"
          inputMode="numeric"
          maxLength={10}
          required
          value={form.zip}
          onChange={(e) => update("zip", e.target.value)}
          className={inputCls}
          placeholder="ZIP code (we'll match the city)"
        />
      </div>
    </div>
  );
}

/* ─── Step 2 — Contact + Details ───────────────────────────────────────── */

function StepContact({
  form, update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="space-y-7">
      {/* Contact */}
      <div>
        <FieldLabel>Who To Call Back</FieldLabel>
        <div className="space-y-3">
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputCls}
            placeholder="Full name"
            aria-label="Your name"
          />
          <input
            id="phone"
            type="tel"
            required
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputCls}
            placeholder="Phone (we'll text first)"
            aria-label="Your phone number"
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputCls}
            placeholder="Email (optional)"
            aria-label="Your email"
          />
        </div>
      </div>

      {/* Concrete */}
      <div>
        <FieldLabel>Concrete Pad</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {([
            { v: "yes" as NeedsConcrete, label: "Yes — include in quote" },
            { v: "already_have" as NeedsConcrete, label: "Have a slab" },
            { v: "unsure" as NeedsConcrete, label: "Not sure" },
          ]).map((opt) => (
            <OptionPill
              key={opt.v}
              selected={form.needs_concrete === opt.v}
              onClick={() => update("needs_concrete", opt.v)}
            >
              {opt.label}
            </OptionPill>
          ))}
        </div>
      </div>

      {/* Surface — only when "already_have" */}
      {form.needs_concrete === "already_have" && (
        <div>
          <FieldLabel>Current Surface</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {([
              { v: "dirt" as Surface, label: "Dirt / bare ground" },
              { v: "gravel" as Surface, label: "Gravel" },
              { v: "asphalt" as Surface, label: "Asphalt" },
              { v: "concrete" as Surface, label: "Existing concrete" },
            ]).map((opt) => (
              <OptionPill
                key={opt.v}
                selected={form.current_surface === opt.v}
                onClick={() => update("current_surface", opt.v)}
              >
                {opt.label}
              </OptionPill>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div>
        <FieldLabel>Timeline</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {([
            { v: "asap" as Timeline, label: "ASAP — this week if possible" },
            { v: "this_week" as Timeline, label: "This week" },
            { v: "this_month" as Timeline, label: "This month" },
            { v: "planning" as Timeline, label: "Just planning" },
          ]).map((opt) => (
            <OptionPill
              key={opt.v}
              selected={form.timeline === opt.v}
              onClick={() => update("timeline", opt.v)}
            >
              {opt.label}
            </OptionPill>
          ))}
        </div>
      </div>

      {/* Best time to call — pairs with Timeline but answers a different
          question: when the job needs doing vs. when they can pick up. */}
      <div>
        <FieldLabel optional>Best Time To Call</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {([
            { v: "morning" as BestTime, label: "Morning (before noon)" },
            { v: "afternoon" as BestTime, label: "Afternoon (12–5)" },
            { v: "evening" as BestTime, label: "Evening (after 5)" },
          ]).map((opt) => (
            <OptionPill
              key={opt.v}
              selected={form.best_time_to_call === opt.v}
              onClick={() => update("best_time_to_call", opt.v)}
            >
              {opt.label}
            </OptionPill>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <FieldLabel optional>Budget Range</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {BUDGET_BANDS.map((opt) => (
            <OptionPill
              key={opt.v}
              selected={form.budget === opt.v}
              onClick={() => update("budget", opt.v)}
            >
              {opt.label}
            </OptionPill>
          ))}
        </div>
      </div>

      {/* Military / first responder discount.
          /military, /services/[slug] and the PCS copy all tell visitors to
          "check the box on the quote form" — until now there was no box, and
          is_military could only ever be set by the initialMilitary prop. */}
      <div>
        <FieldLabel optional>Discount</FieldLabel>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 transition hover:border-white/30">
          <input
            type="checkbox"
            checked={form.is_military}
            onChange={(e) => update("is_military", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--color-brand-600)]"
          />
          <span className="text-sm text-white/80">
            Active military, veteran, or first responder
            <span className="block text-xs text-white/50">
              We&apos;ll apply the discount to your quote. ID checked at the estimate.
            </span>
          </span>
        </label>
      </div>

      {/* Notes */}
      <div>
        <FieldLabel optional>Anything Else</FieldLabel>
        <textarea
          id="message"
          rows={3}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className={`${inputCls} h-auto py-3 resize-y min-h-20`}
          placeholder="HOA requirements, site access, existing anchors, budget range…"
        />
      </div>
    </div>
  );
}

/* ─── Main form ────────────────────────────────────────────────────────── */

export type QuoteFormProps = {
  /** Pre-check the "Active military or first responder" box on step 2.
   *  Used by /military so PCS visitors don't have to remember the discount toggle. */
  initialMilitary?: boolean;
  projectReference?: ProjectReference;
  /**
   * Render the surrounding section — dark photo backdrop, Container, eyebrow
   * trio, discount line and heading — or just the form card on its own.
   *
   * Defaults to `true`, and must stay that way: fourteen marketing pages render
   * this as a page-closing section and four of them pass no props at all.
   *
   * `false` is for /quote, which supplies its own headline. The card is styled
   * for a dark ground unconditionally (white text on white/5 fill), so a host
   * page passing `chrome={false}` MUST provide that ground itself or the form
   * renders white-on-white.
   */
  chrome?: boolean;
  /** Preselected service chip, from ?service= on /quote. */
  initialService?: ReferenceService;
  /** Prefilled ZIP, from ?city= or ?zip= on /quote. */
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

  // Also capture here for isolated form renders; marketing layout captures
  // on pages without a form, such as the blog and partner page.
  useEffect(() => {
    captureAttribution();
    function selectService(event: Event) {
      const service = (event as CustomEvent).detail;
      if (!SERVICE_CHIPS.some((chip) => chip.value === service)) return;
      setForm((current) => ({ ...current, service_type: service }));
      setStep(1);
    }
    window.addEventListener('triplej:quote-service', selectService);
    return () => window.removeEventListener('triplej:quote-service', selectService);
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
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
    if (step < 2 && canAdvance()) setStep(2);
  }
  function back() {
    if (step > 1) setStep(1);
  }

  async function handleSubmit() {
    if (step !== 2) return;
    if (HCAPTCHA_SITE_KEY && !captchaToken) {
      setStatus("err");
      setErrMsg("Please complete the captcha check below.");
      return;
    }
    setStatus("submitting");
    setErrMsg("");

    const budgetBand = BUDGET_BANDS.find((b) => b.v === form.budget);
    const payload = {
      name:            form.name.trim(),
      phone:           form.phone.trim(),
      email:           form.email.trim() || undefined,
      zip:             form.zip.trim() || undefined,
      service_type:    form.service_type === "lean_to" ? "other" : form.service_type || undefined,
      structure_type:  form.structure_type,
      width:           form.width || undefined,
      length:          form.length || undefined,
      height:          form.height || undefined,
      needs_concrete:  form.needs_concrete || undefined,
      current_surface: form.current_surface || undefined,
      timeline:        form.timeline || undefined,
      best_time_to_call: form.best_time_to_call || undefined,
      source,
      estimated_budget_min: budgetBand?.min,
      estimated_budget_max: budgetBand?.max ?? undefined,
      is_military:     form.is_military,
      message:         [form.service_type === "lean_to" ? "Requested build: Lean-To / Patio" : "", form.message.trim()].filter(Boolean).join("\n\n") || undefined,
      captcha_token:   captchaToken ?? undefined,
      reference_project_id: reference?.id,
      ...captureAttribution(),
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body?.error === "string"
            ? body.error
            : "Something went wrong. Please call us directly.",
        );
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
      setStatus("err");
      setErrMsg(err instanceof Error ? err.message : "Unknown error");
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    }
  }

  const progressPct = step === 1 ? 50 : 100;

  const buildSummary = step === 2 ? summarizeBuild(form) : null;

  // The reference card and the form card render in both modes; everything
  // between them is chrome. Kept as one expression so bare mode is provably
  // the same markup minus the wrapper, rather than a second copy of it.
  const body = (
    <div className="mx-auto max-w-xl">
      {reference && (
        <div className="mb-7 flex items-start gap-4 rounded-lg border border-white/20 bg-black/50 p-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
            <Image src={reference.image} alt="" fill sizes="80px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wider text-brand-300">Inspired by this project</p>
            <p className="mt-1 text-base font-semibold">{reference.title}</p>
            <p className="text-sm text-white/70">{reference.city}</p>
            <button type="button" onClick={() => setReference(undefined)} className="mt-1 min-h-11 text-sm text-white/80 underline underline-offset-4">Remove reference</button>
          </div>
        </div>
      )}
      {chrome ? (
        <>
          {/* Discount + trust eyebrow trio above the form */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white/65">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="text-[color:var(--color-brand-400)]">·</span>
              Free Quote
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="text-[color:var(--color-brand-400)]">·</span>
              Reply within 24h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="text-[color:var(--color-brand-400)]">·</span>
              150+ Central Texas Builds
            </span>
          </div>

          {/* Discount eyebrow line */}
          <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brand-300)]">
            Military, first-responder &amp; trade discounts honored
          </p>

          {/* Quieter section header — small eyebrow + smaller headline */}
          <div className="mb-8 text-center">
            <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
              Get A Quote
            </span>
            <h2
              id="quote-heading"
              className="mt-5 font-display font-extrabold uppercase tracking-tight leading-[0.95] text-white text-3xl sm:text-4xl"
            >
              Tell us about
              <br />
              <span className="text-[color:var(--color-brand-400)]">your build.</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/65 max-w-md mx-auto leading-relaxed">
              Two quick steps. A real Texas crew on the other end —
              not a form into a black hole.
            </p>
          </div>
        </>
      ) : null}

      {/* Glass form card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-2xl p-6 sm:p-8">
        {/* Slim progress bar */}
        <div className="mb-7">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-white/55 mb-2">
            <span>
              <span className="text-[color:var(--color-brand-400)]">Step {step}</span> of 2
            </span>
            <span>{step === 1 ? "Project" : "Contact + Details"}</span>
          </div>
          <div
            className="relative h-1 rounded-full bg-white/8 overflow-hidden"
            role="progressbar"
            aria-label="Quote form progress"
            aria-valuenow={progressPct as number}
            aria-valuemin={0 as number}
            aria-valuemax={100 as number}
          >
            <div
              className="absolute inset-y-0 left-0 bg-[color:var(--color-brand-400)] transition-[width] duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Step content with onKeyDown=Enter advances (per locked
            anti-implicit-submit pattern: NOT a <form> element). */}
        <div
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              step < 2 &&
              (e.target as HTMLElement).tagName !== "TEXTAREA"
            ) {
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
              <StepContact form={form} update={update} />
            )}
          </div>

          {/* Build echo — a confirmation, never an estimate. summarizeBuild
              returns null until there is something worth repeating back. */}
          {buildSummary ? (
            <div className="mt-6 rounded-lg border border-white/20 bg-black/40 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-brand-300)]">
                Your build
              </p>
              <p className="mt-1 text-sm text-white/85">{buildSummary}</p>
            </div>
          ) : null}

          {/* Captcha — lazy-loaded on step 2 first render */}
          {step === 2 && HCAPTCHA_SITE_KEY ? (
            <div className="mt-6 flex justify-center">
              <HCaptchaWidget
                ref={captchaRef}
                sitekey={HCAPTCHA_SITE_KEY}
                theme="dark"
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
                onError={() => setCaptchaToken(null)}
              />
            </div>
          ) : null}

          {/* Error */}
          {status === "err" ? (
            <div className="mt-5 rounded-lg border border-red-400/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
              {errMsg}
            </div>
          ) : null}

          {/* Navigation */}
          <div className={`mt-7 flex gap-3 ${step > 1 ? "justify-between" : "justify-end"}`}>
            {step > 1 ? (
              <button
                type="button"
                onClick={back}
                className="h-12 px-5 rounded-lg border border-white/15 bg-white/5 text-sm font-semibold text-white/75 hover:border-white/30 hover:text-white transition-colors"
              >
                ← Back
              </button>
            ) : null}

            {step < 2 ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={!canAdvance()}
                icon={<ArrowRightIcon className="h-5 w-5" />}
                iconPosition="right"
                onClick={next}
                className="flex-1"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={status === "submitting" || !canAdvance()}
                icon={<ArrowRightIcon className="h-5 w-5" />}
                iconPosition="right"
                onClick={handleSubmit}
                className="flex-1"
              >
                {status === "submitting" ? "Sending…" : "Send to Triple J"}
              </Button>
            )}
          </div>

          {/* Below-submit reassurance line */}
          <p className="mt-5 text-center text-[12px] text-white/55 leading-relaxed">
            Free quote — no spam, no obligation.{" "}
            {isQuotePage ? "Same day, guaranteed within 24 hours." : "Most replies within 24 hours."}
          </p>

          {/* Consent micro-text */}
          <p className="mt-2 text-center text-[11px] text-white/35">
            By submitting you consent to be contacted by phone, text, or email.
          </p>
        </div>
      </div>
    </div>
  );

  // Bare mode: the host page owns the heading and, critically, the dark ground
  // the card is styled against. `id="quote"` lives on the wrapper there.
  if (!chrome) return body;

  return (
    <section
      id="quote"
      // Pairs with the <h2 id="quote-heading"> above, which is chrome-only —
      // the two must stay in the same branch or this points at nothing.
      aria-labelledby="quote-heading"
      className="scroll-mt-24 relative overflow-hidden bg-black text-white py-20 md:py-28"
    >
      {/* Full-bleed photo backdrop with heavy dark gradient */}
      <div className="absolute inset-0">
        <Image
          src="/images/red-iron-frame-hero.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-50"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-tr from-black/95 via-black/80 to-[color:var(--color-brand-700)]/40"
      />

      <Container size="wide" className="relative">{body}</Container>
    </section>
  );
}
