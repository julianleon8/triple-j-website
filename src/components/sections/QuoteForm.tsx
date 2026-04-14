"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, PhoneIcon } from "@/components/ui/icons";
import { SERVICE_CITIES, SITE } from "@/lib/site";

/**
 * QuoteForm — the main lead-capture section.
 *
 * Submits to the existing POST /api/leads route (already built in Phase 1 of
 * the backend). The API schema accepts name, phone, email, city,
 * service_type, structure_type, message. Dimensions and project details are
 * concatenated into `message` as a structured block so the owner sees them in
 * the lead email without requiring a database migration.
 *
 * UX: inline success state, inline validation, disabled-while-submitting.
 * Fields kept light but structured per Julian's spec — W/L/H as 3 numeric
 * fields plus a free-text details box.
 */

type FormState = {
  name: string;
  phone: string;
  email: string;
  city: string;
  cityCustom: string;
  service_type: "carport" | "garage" | "barn" | "other";
  structure_type: "welded" | "bolted" | "unsure";
  width: string;
  length: string;
  height: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  phone: "",
  email: "",
  city: "",
  cityCustom: "",
  service_type: "carport",
  structure_type: "welded",
  width: "",
  length: "",
  height: "",
  message: "",
};

export function QuoteForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "err">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string>("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrMsg("");

    // Build the combined message so dimensions survive even without a DB
    // migration. Owner will see it formatted in the lead-alert email.
    const sizeLine =
      form.width && form.length
        ? `Size: ${form.width}W × ${form.length}L${form.height ? ` × ${form.height}H` : ""} ft`
        : "";
    const combinedMessage = [sizeLine, form.message.trim()]
      .filter(Boolean)
      .join("\n\n");

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      city: form.city === "__other" ? form.cityCustom.trim() : form.city,
      service_type: form.service_type,
      structure_type: form.structure_type,
      message: combinedMessage || undefined,
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
    } catch (err) {
      setStatus("err");
      setErrMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }

  // Shared input styles — kept here rather than a primitive so we can iterate
  // without touching other forms (dashboard / quote builder).
  const inputCls =
    "w-full rounded-md border border-[color:var(--color-ink-200)] " +
    "bg-white px-3.5 h-11 text-[15px] text-[color:var(--color-ink-900)] " +
    "placeholder:text-[color:var(--color-ink-400)] " +
    "focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand-600)] " +
    "focus:border-transparent transition-colors";

  const labelCls =
    "text-[13px] font-semibold text-[color:var(--color-ink-700)] mb-1.5 block";

  return (
    <section
      id="quote"
      aria-labelledby="quote-heading"
      className="relative bg-[color:var(--color-ink-900)] text-white py-20 md:py-28 overflow-hidden"
    >
      {/* Subtle brand-blue glow in the background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 60% at 20% 30%, rgba(30,107,214,0.35), transparent 60%)," +
            "radial-gradient(50% 50% at 85% 70%, rgba(30,107,214,0.25), transparent 70%)",
        }}
      />
      <Container size="wide" className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left — pitch */}
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
              <div className="flex gap-3">
                <span className="mt-0.5 text-[color:var(--color-brand-400)]">
                  ✓
                </span>
                <span className="text-white/80">
                  No obligation, no high-pressure sales call
                </span>
              </div>
              <div className="flex gap-3">
                <span className="mt-0.5 text-[color:var(--color-brand-400)]">
                  ✓
                </span>
                <span className="text-white/80">
                  Quote includes concrete, site prep, and permit handling
                </span>
              </div>
              <div className="flex gap-3">
                <span className="mt-0.5 text-[color:var(--color-brand-400)]">
                  ✓
                </span>
                <span className="text-white/80">
                  Most jobs scheduled within 2 weeks of quote acceptance
                </span>
              </div>
            </div>
            <div className="mt-10 flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-4">
              <PhoneIcon className="h-5 w-5 text-[color:var(--color-brand-300)]" />
              <div>
                <div className="text-xs uppercase tracking-wider text-white/50">
                  Prefer to call?
                </div>
                <a
                  href={SITE.phoneHref}
                  className="text-lg font-bold text-white hover:text-[color:var(--color-brand-300)]"
                >
                  {SITE.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Right — form card */}
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-2xl text-[color:var(--color-ink-900)]">
            {status === "ok" ? (
              <div className="flex flex-col items-center text-center py-12">
                <div className="h-16 w-16 rounded-full bg-[color:var(--color-brand-50)] flex items-center justify-center text-3xl text-[color:var(--color-brand-600)]">
                  ✓
                </div>
                <h3 className="mt-5 text-[color:var(--color-ink-900)]">
                  Thanks — request received.
                </h3>
                <p className="mt-3 text-[color:var(--color-ink-500)] max-w-sm">
                  We&rsquo;ll call you back within 24 hours. If it&rsquo;s
                  urgent, call us directly at{" "}
                  <a
                    href={SITE.phoneHref}
                    className="font-semibold text-[color:var(--color-brand-700)]"
                  >
                    {SITE.phone}
                  </a>
                  .
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-6"
                  onClick={() => setStatus("idle")}
                >
                  Submit another request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-1">
                    <label htmlFor="name" className={labelCls}>
                      Name<span className="text-[color:var(--color-danger)]">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      className={inputCls}
                      placeholder="Full name"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="phone" className={labelCls}>
                      Phone<span className="text-[color:var(--color-danger)]">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className={inputCls}
                      placeholder="254-555-0101"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className={labelCls}>
                      Email <span className="text-[color:var(--color-ink-400)] font-normal">(optional)</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={inputCls}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="city" className={labelCls}>
                      City
                    </label>
                    <select
                      id="city"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select…</option>
                      {SERVICE_CITIES.map((c) => (
                        <option key={c.slug} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      <option value="__other">Other Central TX city…</option>
                    </select>
                  </div>

                  {form.city === "__other" ? (
                    <div className="sm:col-span-1">
                      <label htmlFor="cityCustom" className={labelCls}>
                        Your city
                      </label>
                      <input
                        id="cityCustom"
                        type="text"
                        value={form.cityCustom}
                        onChange={(e) => update("cityCustom", e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Waco, TX"
                      />
                    </div>
                  ) : (
                    <div className="sm:col-span-1">
                      <label htmlFor="service_type" className={labelCls}>
                        What are you building?
                      </label>
                      <select
                        id="service_type"
                        value={form.service_type}
                        onChange={(e) =>
                          update(
                            "service_type",
                            e.target.value as FormState["service_type"],
                          )
                        }
                        className={inputCls}
                      >
                        <option value="carport">Carport</option>
                        <option value="garage">Garage</option>
                        <option value="barn">Barn</option>
                        <option value="other">RV cover / Other</option>
                      </select>
                    </div>
                  )}

                  {/* Service type field shown in second row if city === __other */}
                  {form.city === "__other" && (
                    <div className="sm:col-span-2">
                      <label htmlFor="service_type_2" className={labelCls}>
                        What are you building?
                      </label>
                      <select
                        id="service_type_2"
                        value={form.service_type}
                        onChange={(e) =>
                          update(
                            "service_type",
                            e.target.value as FormState["service_type"],
                          )
                        }
                        className={inputCls}
                      >
                        <option value="carport">Carport</option>
                        <option value="garage">Garage</option>
                        <option value="barn">Barn</option>
                        <option value="other">RV cover / Other</option>
                      </select>
                    </div>
                  )}

                  {/* Size */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>
                      Approximate size{" "}
                      <span className="text-[color:var(--color-ink-400)] font-normal">
                        (feet — rough is fine)
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={form.width}
                        onChange={(e) => update("width", e.target.value)}
                        className={inputCls}
                        placeholder="Width"
                        aria-label="Width in feet"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={form.length}
                        onChange={(e) => update("length", e.target.value)}
                        className={inputCls}
                        placeholder="Length"
                        aria-label="Length in feet"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={form.height}
                        onChange={(e) => update("height", e.target.value)}
                        className={inputCls}
                        placeholder="Height"
                        aria-label="Height in feet"
                      />
                    </div>
                  </div>

                  {/* Structure type */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Construction preference</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { v: "welded", label: "Welded" },
                          { v: "bolted", label: "Bolted" },
                          { v: "unsure", label: "Not sure" },
                        ] as const
                      ).map((opt) => (
                        <label
                          key={opt.v}
                          className={`flex items-center justify-center h-11 rounded-md border-2 text-sm font-semibold cursor-pointer transition-colors ${
                            form.structure_type === opt.v
                              ? "border-[color:var(--color-brand-600)] bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)]"
                              : "border-[color:var(--color-ink-200)] text-[color:var(--color-ink-600)] hover:border-[color:var(--color-ink-400)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="structure_type"
                            value={opt.v}
                            checked={form.structure_type === opt.v}
                            onChange={() => update("structure_type", opt.v)}
                            className="sr-only"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className={labelCls}>
                      Project details{" "}
                      <span className="text-[color:var(--color-ink-400)] font-normal">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      className={`${inputCls} h-auto py-3 resize-y min-h-24`}
                      placeholder="Anything we should know — timeline, HOA requirements, site access, budget range..."
                    />
                  </div>
                </div>

                {status === "err" ? (
                  <div className="mt-4 rounded-md bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
                    {errMsg}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={status === "submitting"}
                  icon={<ArrowRightIcon className="h-5 w-5" />}
                  iconPosition="right"
                  className="mt-6 w-full"
                >
                  {status === "submitting"
                    ? "Sending…"
                    : "Request My Free Quote"}
                </Button>

                <p className="mt-4 text-xs text-[color:var(--color-ink-400)] text-center">
                  By submitting you consent to be contacted by phone, text, or
                  email about your project.
                </p>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
