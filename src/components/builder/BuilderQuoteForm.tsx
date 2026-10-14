"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type HCaptcha from "@hcaptcha/react-hcaptcha";

import { CheckboxRow, FieldLabel, PillGroup, TextArea, TextInput } from "@/components/forge/form";
import type { Design } from "@/lib/builder/design";
import { designIssues } from "@/lib/builder/rules";
import { captureAttribution } from "@/lib/marketing-attribution";
import { capture, identifyLead, posthogIds } from "@/lib/analytics";

// Same lazy captcha as the site's quote form: its script loads only here.
const HCaptchaWidget = dynamic(() => import("@hcaptcha/react-hcaptcha").then((m) => m.default), {
  ssr: false,
}) as unknown as typeof import("@hcaptcha/react-hcaptcha").default;

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

type Timeline = "asap" | "this_month" | "planning";
type BestTime = "morning" | "afternoon" | "evening";

/**
 * Contact step for a finished design. The design itself supplies the size,
 * frame, concrete and build type, so this asks only who and how to reach them.
 * Posts to the public /api/leads with source 'builder'; the server rebuilds
 * the summary and link from the design rather than trusting any text here.
 */
export function BuilderQuoteForm({ design }: { design: Design }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [timeline, setTimeline] = useState<Timeline | "">("");
  const [bestTime, setBestTime] = useState<BestTime | "">("");
  const [military, setMilitary] = useState(false);
  const [notes, setNotes] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "err">("idle");
  const [errMsg, setErrMsg] = useState("");
  const started = useRef(false);

  const ready = name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 10 && zip.trim().length >= 5;
  const issues = designIssues(design);

  function touch() {
    if (started.current) return;
    started.current = true;
    capture("builder_quote_started");
  }

  async function submit() {
    if (!ready || issues.length) return;
    if (HCAPTCHA_SITE_KEY && !captchaToken) {
      capture("builder_quote_failed", { reason: "captcha_missing" });
      setStatus("err");
      setErrMsg("Please complete the captcha check below.");
      return;
    }
    setStatus("submitting");
    setErrMsg("");
    let httpFailed = false;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          zip: zip.trim(),
          service_type: design.use,
          structure_type: design.frame,
          width: String(design.width),
          length: String(design.length),
          height: String(design.height),
          needs_concrete: design.concrete,
          timeline: timeline || undefined,
          best_time_to_call: bestTime || undefined,
          is_military: military,
          message: notes.trim() || undefined,
          source: "builder",
          design,
          captcha_token: captchaToken ?? undefined,
          ...captureAttribution(),
          ...posthogIds(),
        }),
      });
      if (!res.ok) {
        httpFailed = true;
        capture("builder_quote_failed", { reason: `http_${res.status}` });
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body?.error === "string" ? body.error : "Something went wrong. Please call us directly.");
      }
      const created = await res.json().catch(() => ({}));
      if (typeof created?.id === "string") {
        identifyLead(created.id, { lead_service_type: design.use, lead_form_source: "builder", lead_zip: zip.trim(), is_military: military });
      }
      capture("builder_quote_submitted", {
        use: design.use,
        width: design.width,
        length: design.length,
        height: design.height,
        roof: design.roof,
        frame: design.frame,
        openings: design.openings.length,
        lean_tos: design.leanTos.length,
      });
      // Enhanced-conversion data for /thank-you, exactly as the site's quote form does.
      try {
        sessionStorage.setItem("tj_ec_user_data", JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim(), zip: zip.trim() }));
      } catch {
        // Private mode: the conversion still fires without match data.
      }
      router.push("/thank-you");
    } catch (err) {
      if (!httpFailed) capture("builder_quote_failed", { reason: "network" });
      setStatus("err");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong. Please call us directly.");
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      onFocusCapture={touch}
      className="flex flex-col gap-4 rounded-[12px] border border-forge-silver bg-white p-5 shadow-[var(--shadow-lifted)]"
    >
      <div>
        <h3 className="font-forge-display text-[21px] font-black leading-[1.15] text-forge-navy">Send it to Triple J</h3>
        <p className="mt-1 text-[13px] leading-[1.5] text-forge-slate">
          Julian reviews your design and calls or texts you with a quote. Free · no obligation · reply within 24 hours.
        </p>
      </div>
      <div className="grid gap-3">
        <div>
          <FieldLabel htmlFor="b-name">Name</FieldLabel>
          <TextInput id="b-name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <FieldLabel htmlFor="b-phone">Phone</FieldLabel>
          <TextInput id="b-phone" type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="We text first" />
        </div>
        <div>
          <FieldLabel htmlFor="b-email" optional>
            Email
          </FieldLabel>
          <TextInput id="b-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="b-zip">Project ZIP code</FieldLabel>
          <TextInput
            id="b-zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={10}
            required
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
        </div>
      </div>
      <PillGroup<Timeline>
        label="Timeline"
        optional
        allowDeselect
        value={timeline}
        onChange={setTimeline}
        options={[
          { v: "asap", label: "ASAP" },
          { v: "this_month", label: "This month" },
          { v: "planning", label: "Just planning" },
        ]}
      />
      <PillGroup<BestTime>
        label="Best time to call"
        optional
        allowDeselect
        value={bestTime}
        onChange={setBestTime}
        options={[
          { v: "morning", label: "Morning" },
          { v: "afternoon", label: "Afternoon" },
          { v: "evening", label: "Evening" },
        ]}
      />
      <CheckboxRow
        checked={military}
        onChange={setMilitary}
        label="Military, veteran or first responder"
        sub="7% off your install. ID checked at the estimate."
      />
      <div>
        <FieldLabel htmlFor="b-notes" optional>
          Anything else
        </FieldLabel>
        <TextArea id="b-notes" maxLength={900} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gate access, slope, what it's for…" />
      </div>
      {HCAPTCHA_SITE_KEY ? (
        <div className="flex justify-center">
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
        <div role="alert" className="rounded-[8px] border border-forge-navy bg-forge-fog px-4 py-3 text-[14px] font-semibold text-forge-navy">
          {errMsg}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={!ready || status === "submitting" || issues.length > 0}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-forge-navy px-[26px] py-[15px] text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-forge-navy-raised disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send My Design"} <span aria-hidden="true">→</span>
      </button>
      <p className="text-center text-[11px] text-forge-slate">By submitting you consent to be contacted by phone, text, or email.</p>
    </form>
  );
}
