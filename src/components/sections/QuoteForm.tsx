"use client";

import { useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, PhoneIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceType = "carport" | "garage" | "barn" | "rv_cover";
type StructureType = "welded" | "bolted" | "unsure";
type NeedsConcrete = "yes" | "already_have" | "unsure";
type Surface = "dirt" | "gravel" | "asphalt" | "concrete";
type Timeline = "asap" | "this_week" | "this_month" | "planning";

type FormState = {
  // Step 1 — who
  name: string;
  phone: string;
  email: string;
  zip: string;
  // Step 2 — project
  service_type: ServiceType;
  structure_type: StructureType;
  width: string;
  length: string;
  height: string;
  // Step 3 — qualification
  needs_concrete: NeedsConcrete | "";
  current_surface: Surface | "";
  timeline: Timeline | "";
  is_military: boolean;
  message: string;
};

const INITIAL: FormState = {
  name: "", phone: "", email: "", zip: "",
  service_type: "carport", structure_type: "unsure",
  width: "", length: "", height: "",
  needs_concrete: "", current_surface: "", timeline: "",
  is_military: false, message: "",
};

// ─── Step-progress indicator ──────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Contact" },
    { n: 2, label: "Project" },
    { n: 3, label: "Details" },
  ] as const;
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                current === s.n
                  ? "bg-[color:var(--color-brand-600)] text-white"
                  : current > s.n
                  ? "bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)]"
                  : "bg-[color:var(--color-ink-200)] text-[color:var(--color-ink-500)]"
              }`}
            >
              {current > s.n ? "✓" : s.n}
            </div>
            <span
              className={`text-[11px] font-medium whitespace-nowrap ${
                current === s.n
                  ? "text-[color:var(--color-brand-600)]"
                  : current > s.n
                  ? "text-[color:var(--color-brand-500)]"
                  : "text-[color:var(--color-ink-400)]"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-1 mb-5 transition-colors ${
                current > s.n
                  ? "bg-[color:var(--color-brand-300)]"
                  : "bg-[color:var(--color-ink-200)]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Reusable pill / option-card primitives ───────────────────────────────────

function OptionPill({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 px-4 rounded-lg border-2 text-sm font-semibold transition-all cursor-pointer ${
        selected
          ? "border-[color:var(--color-brand-600)] bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)]"
          : "border-[color:var(--color-ink-200)] text-[color:var(--color-ink-600)] hover:border-[color:var(--color-ink-400)] bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function OptionCard({
  selected, onClick, icon, label, sublabel,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  sublabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-4 text-center transition-all cursor-pointer ${
        selected
          ? "border-[color:var(--color-brand-600)] bg-[color:var(--color-brand-50)]"
          : "border-[color:var(--color-ink-200)] bg-white hover:border-[color:var(--color-ink-400)]"
      }`}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span
        className={`text-sm font-semibold leading-tight ${
          selected ? "text-[color:var(--color-brand-700)]" : "text-[color:var(--color-ink-800)]"
        }`}
      >
        {label}
      </span>
      {sublabel && (
        <span className="text-[11px] text-[color:var(--color-ink-400)] leading-tight">
          {sublabel}
        </span>
      )}
    </button>
  );
}

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-[color:var(--color-ink-200)] " +
  "bg-white px-3.5 h-11 text-[15px] text-[color:var(--color-ink-900)] " +
  "placeholder:text-[color:var(--color-ink-400)] " +
  "focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand-600)] " +
  "focus:border-transparent transition-colors";

const labelCls =
  "text-[13px] font-semibold text-[color:var(--color-ink-700)] mb-1.5 block";

// ─── Step 1: Who should we call back? ────────────────────────────────────────

function Step1({
  form, update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelCls}>
            Name <span className="text-[color:var(--color-danger)]">*</span>
          </label>
          <input
            id="name" type="text" required autoComplete="name"
            value={form.name} onChange={(e) => update("name", e.target.value)}
            className={inputCls} placeholder="Full name"
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>
            Phone <span className="text-[color:var(--color-danger)]">*</span>
          </label>
          <input
            id="phone" type="tel" required autoComplete="tel"
            value={form.phone} onChange={(e) => update("phone", e.target.value)}
            className={inputCls} placeholder="254-555-0101"
          />
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>
            Email{" "}
            <span className="text-[color:var(--color-ink-400)] font-normal">(optional)</span>
          </label>
          <input
            id="email" type="email" autoComplete="email"
            value={form.email} onChange={(e) => update("email", e.target.value)}
            className={inputCls} placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="zip" className={labelCls}>
            ZIP Code <span className="text-[color:var(--color-danger)]">*</span>
          </label>
          <input
            id="zip" type="text" inputMode="numeric" maxLength={10} required
            value={form.zip} onChange={(e) => update("zip", e.target.value)}
            className={inputCls} placeholder="76502"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: What are you building? ──────────────────────────────────────────

const SERVICE_CARDS: { value: ServiceType; icon: string; label: string; sublabel: string }[] = [
  { value: "carport",  icon: "🏠", label: "Carport",       sublabel: "Welded or bolted" },
  { value: "garage",   icon: "🚗", label: "Metal Garage",  sublabel: "Fully enclosed" },
  { value: "barn",     icon: "🌾", label: "Metal Barn",    sublabel: "Ranch & ag" },
  { value: "rv_cover", icon: "🚐", label: "RV / Boat",     sublabel: "Tall clearance" },
];

function Step2({
  form, update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Service type */}
      <div>
        <p className={labelCls}>What are you building?</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SERVICE_CARDS.map((s) => (
            <OptionCard
              key={s.value}
              selected={form.service_type === s.value}
              onClick={() => update("service_type", s.value)}
              icon={s.icon} label={s.label} sublabel={s.sublabel}
            />
          ))}
        </div>
      </div>

      {/* Construction preference */}
      <div>
        <p className={labelCls}>Construction preference</p>
        <div className="flex flex-wrap gap-2">
          {([
            { v: "welded" as StructureType,  label: "Welded steel — permanent" },
            { v: "bolted" as StructureType,  label: "Bolted steel" },
            { v: "unsure" as StructureType,  label: "Not sure yet" },
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
        <p className={labelCls}>
          Approximate size{" "}
          <span className="text-[color:var(--color-ink-400)] font-normal">
            (feet — rough is fine)
          </span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "width",  placeholder: "Width" },
            { key: "length", placeholder: "Length" },
            { key: "height", placeholder: "Height" },
          ].map(({ key, placeholder }) => (
            <div key={key}>
              <input
                type="number" inputMode="numeric" min={0} step={1}
                value={form[key as "width" | "length" | "height"]}
                onChange={(e) => update(key as "width" | "length" | "height", e.target.value)}
                className={inputCls} placeholder={placeholder}
                aria-label={`${placeholder} in feet`}
              />
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-[color:var(--color-ink-400)]">W × L × H in feet</p>
      </div>
    </div>
  );
}

// ─── Step 3: Last few details ─────────────────────────────────────────────────

const CONCRETE_OPTIONS: { value: NeedsConcrete; icon: string; label: string; sublabel: string }[] = [
  { value: "yes",         icon: "✅", label: "Yes",         sublabel: "Include pad in quote" },
  { value: "already_have",icon: "🏗️", label: "Have a slab", sublabel: "Already poured" },
  { value: "unsure",      icon: "❓", label: "Not sure",    sublabel: "Advise me" },
];

const TIMELINE_OPTIONS: { value: Timeline; icon: string; label: string }[] = [
  { value: "asap",       icon: "⚡", label: "ASAP / 48 hrs" },
  { value: "this_week",  icon: "📅", label: "This Week" },
  { value: "this_month", icon: "📆", label: "This Month" },
  { value: "planning",   icon: "🗓️", label: "Just Planning" },
];

const SURFACE_OPTIONS: { value: Surface; label: string }[] = [
  { value: "dirt",     label: "Dirt / bare ground" },
  { value: "gravel",   label: "Gravel" },
  { value: "asphalt",  label: "Asphalt" },
  { value: "concrete", label: "Existing concrete" },
];

function Step3({
  form, update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Concrete */}
      <div>
        <p className={labelCls}>Do you need a concrete pad poured?</p>
        <div className="grid grid-cols-3 gap-3">
          {CONCRETE_OPTIONS.map((o) => (
            <OptionCard
              key={o.value}
              selected={form.needs_concrete === o.value}
              onClick={() => update("needs_concrete", o.value)}
              icon={o.icon} label={o.label} sublabel={o.sublabel}
            />
          ))}
        </div>
      </div>

      {/* Surface — shown if they have an existing surface */}
      {form.needs_concrete === "already_have" && (
        <div>
          <p className={labelCls}>What is the current surface?</p>
          <div className="flex flex-wrap gap-2">
            {SURFACE_OPTIONS.map((o) => (
              <OptionPill
                key={o.value}
                selected={form.current_surface === o.value}
                onClick={() => update("current_surface", o.value)}
              >
                {o.label}
              </OptionPill>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div>
        <p className={labelCls}>When do you want this built?</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TIMELINE_OPTIONS.map((o) => (
            <OptionCard
              key={o.value}
              selected={form.timeline === o.value}
              onClick={() => update("timeline", o.value)}
              icon={o.icon} label={o.label}
            />
          ))}
        </div>
      </div>

      {/* Military */}
      <div>
        <button
          type="button"
          onClick={() => update("is_military", !form.is_military)}
          className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
            form.is_military
              ? "border-[color:var(--color-brand-600)] bg-[color:var(--color-brand-50)]"
              : "border-[color:var(--color-ink-200)] bg-white hover:border-[color:var(--color-ink-400)]"
          }`}
        >
          <span className="text-2xl">⭐</span>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${form.is_military ? "text-[color:var(--color-brand-700)]" : "text-[color:var(--color-ink-800)]"}`}>
              Military / First Responder Discount
            </p>
            <p className="text-xs text-[color:var(--color-ink-400)] mt-0.5">
              Active duty, veterans, law enforcement, and firefighters
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              form.is_military
                ? "border-[color:var(--color-brand-600)] bg-[color:var(--color-brand-600)]"
                : "border-[color:var(--color-ink-300)]"
            }`}
          >
            {form.is_military && (
              <svg viewBox="0 0 12 10" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="1,5 4.5,9 11,1" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="message" className={labelCls}>
          Anything else we should know?{" "}
          <span className="text-[color:var(--color-ink-400)] font-normal">(optional)</span>
        </label>
        <textarea
          id="message" rows={3}
          value={form.message} onChange={(e) => update("message", e.target.value)}
          className={`${inputCls} h-auto py-3 resize-y min-h-20`}
          placeholder="HOA requirements, site access, existing anchors, budget range…"
        />
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function QuoteForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "err">("idle");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha | null>(null);
  const [errMsg, setErrMsg] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function canAdvance(): boolean {
    if (step === 1) return form.name.trim().length >= 2 && form.phone.trim().length >= 10 && form.zip.trim().length >= 5;
    if (step === 2) return true; // all optional except service_type which has a default
    return true;
  }

  function next() {
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  }
  function back() {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  }

  async function handleSubmit() {
    // Guard: only submit from the final step.
    if (step !== 3) return;
    // Captcha required if the site key is configured (prod). In dev without
    // a site key, we let submission through.
    if (HCAPTCHA_SITE_KEY && !captchaToken) {
      setStatus("err");
      setErrMsg("Please complete the captcha check below.");
      return;
    }
    setStatus("submitting");
    setErrMsg("");

    const payload = {
      name:            form.name.trim(),
      phone:           form.phone.trim(),
      email:           form.email.trim() || undefined,
      zip:             form.zip.trim() || undefined,
      service_type:    form.service_type,
      structure_type:  form.structure_type,
      width:           form.width || undefined,
      length:          form.length || undefined,
      height:          form.height || undefined,
      needs_concrete:  form.needs_concrete || undefined,
      current_surface: form.current_surface || undefined,
      timeline:        form.timeline || undefined,
      is_military:     form.is_military,
      message:         form.message.trim() || undefined,
      captcha_token:   captchaToken ?? undefined,
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
      setStatus("ok");
      setForm(INITIAL);
      setStep(1);
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    } catch (err) {
      setStatus("err");
      setErrMsg(err instanceof Error ? err.message : "Unknown error");
      // Reset captcha so the user gets a fresh challenge on retry.
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    }
  }

  return (
    <section
      id="quote"
      aria-labelledby="quote-heading"
      className="relative bg-[color:var(--color-ink-900)] text-white py-20 md:py-28 overflow-hidden"
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="quote-glow absolute inset-0 opacity-30 pointer-events-none"
      />

      <Container size="wide" className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── Left pitch ── */}
          <div className="max-w-lg">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brand-400)]">
              Free Quote
            </span>
            <h2 id="quote-heading" className="mt-3 text-white">
              Tell us what you&rsquo;re building.
              <br />
              We&rsquo;ll call you today.
            </h2>
            <p className="mt-4 text-lg text-white/70">
              No forms into a black hole. A real person — usually Julian or Juan
              — calls you back within 24 hours with an honest price.
            </p>

            <div className="mt-8 space-y-4 text-sm">
              {[
                "No obligation, no high-pressure sales call",
                "Quote includes concrete, site prep, and permit advisory",
                "Materials arrive within 48 hrs — most builds start same week",
              ].map((line) => (
                <div key={line} className="flex gap-3">
                  <span className="mt-0.5 text-[color:var(--color-brand-400)]">✓</span>
                  <span className="text-white/80">{line}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-4">
              <PhoneIcon className="h-5 w-5 text-[color:var(--color-brand-300)]" />
              <div>
                <div className="text-xs uppercase tracking-wider text-white/50">Prefer to call?</div>
                <a
                  href={SITE.phoneHref}
                  className="text-lg font-bold text-white hover:text-[color:var(--color-brand-300)]"
                >
                  {SITE.phone}
                </a>
              </div>
            </div>
          </div>

          {/* ── Right form card ── */}
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-2xl text-[color:var(--color-ink-900)]">
            {status === "ok" ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center text-center py-12">
                <div className="h-16 w-16 rounded-full bg-[color:var(--color-brand-50)] flex items-center justify-center text-3xl text-[color:var(--color-brand-600)]">
                  ✓
                </div>
                <h3 className="mt-5 text-[color:var(--color-ink-900)]">Request received.</h3>
                <p className="mt-3 text-[color:var(--color-ink-500)] max-w-sm">
                  We&rsquo;ll call you back within 24 hours. Urgent?{" "}
                  <a
                    href={SITE.phoneHref}
                    className="font-semibold text-[color:var(--color-brand-700)]"
                  >
                    Call {SITE.phone}
                  </a>
                </p>
                <Button variant="ghost" size="sm" className="mt-6" onClick={() => setStatus("idle")}>
                  Submit another request
                </Button>
              </div>
            ) : (
              <div
                onKeyDown={(e) => {
                  // Enter on Steps 1 & 2 → advance. Textareas keep newline behavior.
                  if (
                    e.key === "Enter" &&
                    step < 3 &&
                    (e.target as HTMLElement).tagName !== "TEXTAREA"
                  ) {
                    e.preventDefault();
                    if (canAdvance()) next();
                  }
                }}
              >
                <StepIndicator current={step} />

                {/* Step heading */}
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-ink-400)] mb-4">
                  {step === 1 && "Step 1 — Who should we call back?"}
                  {step === 2 && "Step 2 — What are you building?"}
                  {step === 3 && "Step 3 — A few more details"}
                </p>

                {/* Step content */}
                {step === 1 && <Step1 form={form} update={update} />}
                {step === 2 && <Step2 form={form} update={update} />}
                {step === 3 && <Step3 form={form} update={update} />}

                {/* Captcha — only on step 3. Skipped in dev when site key
                    isn't set so local dev doesn't block form testing. */}
                {step === 3 && HCAPTCHA_SITE_KEY && (
                  <div className="mt-5 flex justify-center">
                    <HCaptcha
                      ref={captchaRef}
                      sitekey={HCAPTCHA_SITE_KEY}
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                      onError={() => setCaptchaToken(null)}
                    />
                  </div>
                )}

                {/* Error */}
                {status === "err" && (
                  <div className="mt-4 rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
                    {errMsg}
                  </div>
                )}

                {/* Navigation */}
                <div className={`mt-6 flex gap-3 ${step > 1 ? "justify-between" : "justify-end"}`}>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={back}
                      className="h-11 px-5 rounded-lg border-2 border-[color:var(--color-ink-200)] text-sm font-semibold text-[color:var(--color-ink-600)] hover:border-[color:var(--color-ink-400)] transition-colors"
                    >
                      ← Back
                    </button>
                  )}

                  {step < 3 ? (
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
                      disabled={status === "submitting"}
                      icon={<ArrowRightIcon className="h-5 w-5" />}
                      iconPosition="right"
                      onClick={handleSubmit}
                      className="flex-1"
                    >
                      {status === "submitting" ? "Sending…" : "Request My Free Quote"}
                    </Button>
                  )}
                </div>

                <p className="mt-4 text-xs text-[color:var(--color-ink-400)] text-center">
                  By submitting you consent to be contacted by phone, text, or email.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
