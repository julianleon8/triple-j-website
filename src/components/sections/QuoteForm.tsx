"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type HCaptcha from "@hcaptcha/react-hcaptcha";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";

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

type ServiceType = "carport" | "garage" | "barn" | "rv_cover";
type StructureType = "welded" | "bolted" | "unsure";
type NeedsConcrete = "yes" | "already_have" | "unsure";
type Surface = "dirt" | "gravel" | "asphalt" | "concrete";
type Timeline = "asap" | "this_week" | "this_month" | "planning";
type BudgetBand = "under_5k" | "5_10k" | "10_20k" | "20_40k" | "over_40k";

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
  budget: BudgetBand | "";
  is_military: boolean;
  message: string;
};

const INITIAL: FormState = {
  service_type: "", structure_type: "unsure",
  width: "", length: "", height: "", zip: "",
  name: "", phone: "", email: "",
  needs_concrete: "", current_surface: "", timeline: "",
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

type QuoteFormProps = {
  /** Pre-check the "Active military or first responder" box on step 2.
   *  Used by /military so PCS visitors don't have to remember the discount toggle. */
  initialMilitary?: boolean;
};

type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  landing_url?: string;
  referrer_url?: string;
};

export function QuoteForm({ initialMilitary = false }: QuoteFormProps = {}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>({ ...INITIAL, is_military: initialMilitary });
  const [status, setStatus] = useState<"idle" | "submitting" | "err">("idle");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha | null>(null);
  const [errMsg, setErrMsg] = useState("");

  // Capture attribution from URL params + landing/referrer once on mount.
  // Stored in a ref so it doesn't trigger re-renders. Posted with the
  // form on submit. Powers the leads.utm_* / gclid / fbclid columns
  // (migration 014). Only fields with values are sent — server treats
  // missing keys as null.
  const attrRef = useRef<Attribution>({});
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const sp = url.searchParams;
    const get = (k: string) => sp.get(k) || undefined;
    attrRef.current = {
      utm_source: get("utm_source"),
      utm_medium: get("utm_medium"),
      utm_campaign: get("utm_campaign"),
      utm_term: get("utm_term"),
      utm_content: get("utm_content"),
      gclid: get("gclid"),
      fbclid: get("fbclid"),
      landing_url: window.location.href.slice(0, 2000),
      referrer_url: document.referrer ? document.referrer.slice(0, 2000) : undefined,
    };
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
      service_type:    form.service_type || undefined,
      structure_type:  form.structure_type,
      width:           form.width || undefined,
      length:          form.length || undefined,
      height:          form.height || undefined,
      needs_concrete:  form.needs_concrete || undefined,
      current_surface: form.current_surface || undefined,
      timeline:        form.timeline || undefined,
      estimated_budget_min: budgetBand?.min,
      estimated_budget_max: budgetBand?.max ?? undefined,
      is_military:     form.is_military,
      message:         form.message.trim() || undefined,
      captcha_token:   captchaToken ?? undefined,
      ...attrRef.current,
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
      // Success — redirect to /thank-you for clean conversion analytics
      // (per 2026-04-23 design decision). The router push preserves
      // history so back-button still works for the user.
      router.push("/thank-you");
    } catch (err) {
      setStatus("err");
      setErrMsg(err instanceof Error ? err.message : "Unknown error");
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    }
  }

  const progressPct = step === 1 ? 50 : 100;

  return (
    <section
      id="quote"
      aria-labelledby="quote-heading"
      className="relative overflow-hidden bg-black text-white py-20 md:py-28"
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

      <Container size="wide" className="relative">
        <div className="mx-auto max-w-xl">
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
                Free quote — no spam, no obligation. Most replies within 24 hours.
              </p>

              {/* Consent micro-text */}
              <p className="mt-2 text-center text-[11px] text-white/35">
                By submitting you consent to be contacted by phone, text, or email.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
