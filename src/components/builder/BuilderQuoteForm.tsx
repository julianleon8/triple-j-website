"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type HCaptcha from "@hcaptcha/react-hcaptcha";
import { create } from "zustand";

import { CheckboxRow, FieldLabel, PillGroup, TextArea, TextInput } from "@/components/forge/form";
import { stashThanksName } from "@/components/site/ThanksGreeting";
import type { Design } from "@/lib/builder/design";
import { designIssues } from "@/lib/builder/rules";
import { captureAttribution } from "@/lib/marketing-attribution";
import { capture, identifyLead, posthogIds } from "@/lib/analytics";

import { WARN } from "./Toast";

// Same lazy captcha as the site's quote form: its script loads only here.
const HCaptchaWidget = dynamic(() => import("@hcaptcha/react-hcaptcha").then((m) => m.default), {
  ssr: false,
}) as unknown as typeof import("@hcaptcha/react-hcaptcha").default;

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

type Timeline = "asap" | "this_month" | "planning";
type BestTime = "morning" | "afternoon" | "evening";

export type Contact = {
  name: string;
  phone: string;
  email: string;
  zip: string;
  timeline: Timeline | "";
  bestTime: BestTime | "";
  military: boolean;
  notes: string;
};

export const EMPTY_CONTACT: Contact = {
  name: "",
  phone: "",
  email: "",
  zip: "",
  timeline: "",
  bestTime: "",
  military: false,
  notes: "",
};

/**
 * What the customer has typed, kept outside the form so leaving the Review
 * step and coming back doesn't wipe it. Memory only: it lasts the visit.
 * `sent` marks a draft that went through; the form clears it on the way out.
 */
export const useContactDraft = create<{
  c: Contact;
  sent: boolean;
  set: (patch: Partial<Contact>) => void;
  markSent: () => void;
  clear: () => void;
}>()((set) => ({
  c: EMPTY_CONTACT,
  sent: false,
  set: (patch) => set((s) => ({ c: { ...s.c, ...patch } })),
  markSent: () => set({ sent: true }),
  clear: () => set({ c: EMPTY_CONTACT, sent: false }),
}));

export type ContactField = "name" | "phone" | "email" | "zip";

const FIELD_ID: Record<ContactField, string> = { name: "bq-name", phone: "bq-phone", email: "bq-email", zip: "bq-zip" };
const HINT_ID = "bq-hint";
const AND = new Intl.ListFormat("en", { type: "conjunction" });

/**
 * What stops a send, in form order, and one line saying how to fix it, e.g.
 * "Add your phone and ZIP to send." Same limits the lead API holds the form to.
 */
export function contactProblems(c: Pick<Contact, "name" | "phone" | "email" | "zip">): {
  fields: ContactField[];
  message: string;
} {
  const fields: ContactField[] = [];
  const add: string[] = [];
  const name = c.name.trim();
  if (name.length < 2) {
    fields.push("name");
    add.push(name ? "full name" : "name");
  }
  const digits = c.phone.replace(/\D/g, "").length;
  if (digits < 10) {
    fields.push("phone");
    add.push(digits ? "full phone number" : "phone");
  }
  const email = c.email.trim();
  const badEmail = email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (badEmail) fields.push("email");
  const zip = c.zip.trim();
  if (zip.length < 5) {
    fields.push("zip");
    add.push(zip ? "5-digit ZIP" : "ZIP");
  }
  const parts = [];
  if (add.length) parts.push(`Add your ${AND.format(add)} to send.`);
  if (badEmail) parts.push("Check your email, or leave it blank.");
  return { fields, message: parts.join(" ") };
}

/** The one line under the form that says what stops a send, or "" when nothing does. */
export function sendHint(contactMessage: string, designBlocked: boolean): string {
  return [contactMessage, designBlocked ? "Fix the design first: see the note above." : ""].filter(Boolean).join(" ");
}

const INVALID_STYLE = { borderColor: WARN, boxShadow: `inset 0 0 0 1px ${WARN}` };
/** iPhone Safari zooms into any field under 16px when it gets focus. */
const FIELD_TEXT = "text-[16px]!";
const NOTES_MAX_PX = 320;

/** Grows the notes box with its text where the browser can't do it in CSS (no `field-sizing` yet). */
function fitNotes(el: HTMLTextAreaElement | null) {
  if (!el || CSS.supports("field-sizing", "content")) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight + 2, NOTES_MAX_PX)}px`;
}

/**
 * Contact step for a finished design. The design itself supplies the size,
 * frame, concrete and build type, so this asks only who and how to reach them.
 * Posts to the public /api/leads with source 'builder'; the server rebuilds
 * the summary and link from the design rather than trusting any text here.
 */
export function BuilderQuoteForm({ design }: { design: Design }) {
  const router = useRouter();
  const c = useContactDraft((s) => s.c);
  const set = useContactDraft((s) => s.set);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha | null>(null);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "err">("idle");
  const [errMsg, setErrMsg] = useState("");
  // Set by the first press of Send: from then on the fields that stop a send say so.
  const [tried, setTried] = useState(false);
  // What stopped the last press of Send, read out once per press. The hint on
  // screen keeps up with the typing but is not live, so it never talks over it.
  const [stopped, setStopped] = useState({ text: "", seq: 0 });
  const started = useRef(false);

  const problems = contactProblems(c);
  const issues = designIssues(design);
  const hint = tried ? sendHint(problems.message, issues.length > 0) : "";
  const bad = (f: ContactField) => tried && problems.fields.includes(f);
  const field = (f: ContactField) => ({
    id: FIELD_ID[f],
    className: FIELD_TEXT,
    "aria-invalid": bad(f) || undefined,
    "aria-describedby": bad(f) ? HINT_ID : undefined,
    style: bad(f) ? INVALID_STYLE : undefined,
  });

  // Notes kept from an earlier visit to this step need the box sized to them.
  useEffect(() => fitNotes(notesRef.current), []);
  // Sent: the next design starts with an empty form. Cleared on the way out
  // so the fields don't blank while the thank-you page loads.
  useEffect(
    () => () => {
      if (useContactDraft.getState().sent) useContactDraft.getState().clear();
    },
    [],
  );

  function touch() {
    if (started.current) return;
    started.current = true;
    capture("builder_quote_started");
  }

  async function submit() {
    if (status === "submitting") return;
    setTried(true);
    const blocked = sendHint(problems.message, issues.length > 0);
    if (blocked) setStopped((s) => ({ text: blocked, seq: s.seq + 1 }));
    if (problems.fields.length) {
      document.getElementById(FIELD_ID[problems.fields[0]])?.focus();
      return;
    }
    if (issues.length) return;
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
          name: c.name.trim(),
          phone: c.phone.trim(),
          email: c.email.trim() || undefined,
          zip: c.zip.trim(),
          service_type: design.use,
          structure_type: design.frame,
          width: String(design.width),
          length: String(design.length),
          height: String(design.height),
          needs_concrete: design.concrete,
          timeline: c.timeline || undefined,
          best_time_to_call: c.bestTime || undefined,
          is_military: c.military,
          message: c.notes.trim() || undefined,
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
        identifyLead(created.id, { lead_service_type: design.use, lead_form_source: "builder", lead_zip: c.zip.trim(), is_military: c.military });
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
        sessionStorage.setItem(
          "tj_ec_user_data",
          JSON.stringify({ name: c.name.trim(), phone: c.phone.trim(), email: c.email.trim(), zip: c.zip.trim() }),
        );
      } catch {
        // Private mode: the conversion still fires without match data.
      }
      // "Got it, Ray." on /thank-you: the first name only, under its own key.
      stashThanksName(c.name);
      useContactDraft.getState().markSent();
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
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      onFocusCapture={touch}
      // Typing retires the last press's message (quietly: a removal isn't read).
      onChange={() => setStopped((s) => (s.text ? { ...s, text: "" } : s))}
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
          <FieldLabel htmlFor="bq-name">Name</FieldLabel>
          <TextInput {...field("name")} type="text" required autoComplete="name" value={c.name} onChange={(e) => set({ name: e.target.value })} placeholder="Full name" />
        </div>
        <div>
          <FieldLabel htmlFor="bq-phone">Phone</FieldLabel>
          <TextInput {...field("phone")} type="tel" required autoComplete="tel" value={c.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="We text first" />
        </div>
        <div>
          <FieldLabel htmlFor="bq-email" optional>
            Email
          </FieldLabel>
          <TextInput {...field("email")} type="email" autoComplete="email" value={c.email} onChange={(e) => set({ email: e.target.value })} />
        </div>
        <div>
          <FieldLabel htmlFor="bq-zip">Project ZIP code</FieldLabel>
          <TextInput
            {...field("zip")}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={10}
            required
            value={c.zip}
            onChange={(e) => set({ zip: e.target.value })}
          />
        </div>
      </div>
      <PillGroup<Timeline>
        label="Timeline"
        optional
        allowDeselect
        value={c.timeline}
        onChange={(v) => set({ timeline: v })}
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
        value={c.bestTime}
        onChange={(v) => set({ bestTime: v })}
        options={[
          { v: "morning", label: "Morning" },
          { v: "afternoon", label: "Afternoon" },
          { v: "evening", label: "Evening" },
        ]}
      />
      <div>
        <CheckboxRow
          checked={c.military}
          onChange={(military) => set({ military })}
          label="Military, veteran or first responder"
          sub="7% off your install. ID checked at the estimate."
        />
        <p role="status" className={c.military ? "mt-2 text-[13px] font-semibold leading-[1.45] text-forge-navy" : ""}>
          {c.military ? (
            <>
              <span aria-hidden="true">✓ </span>Military discount noted: 7% off your install.
            </>
          ) : null}
        </p>
      </div>
      <div>
        <FieldLabel htmlFor="bq-notes" optional>
          Anything else
        </FieldLabel>
        <TextArea
          ref={notesRef}
          id="bq-notes"
          maxLength={900}
          value={c.notes}
          onChange={(e) => {
            set({ notes: e.target.value });
            fitNotes(e.currentTarget);
          }}
          placeholder="Gate access, slope, what it's for…"
          className={`${FIELD_TEXT} field-sizing-content max-h-[320px]`}
        />
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
      {hint ? (
        <p
          id={HINT_ID}
          className="m-0 rounded-[8px] border border-l-[5px] px-3.5 py-2.5 text-[14px] font-semibold leading-[1.45] text-forge-navy"
          style={{ borderColor: WARN, background: "#fffaf2" }}
        >
          {hint}
        </p>
      ) : null}
      {/* Always in the page, so each press's message is read as it arrives, once. */}
      <div role="alert" className="sr-only">
        {stopped.text ? <span key={stopped.seq}>{stopped.text}</span> : null}
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        aria-describedby={hint ? HINT_ID : undefined}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-forge-navy px-[26px] py-[15px] text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-forge-navy-raised disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send My Design"} <span aria-hidden="true">→</span>
      </button>
      <p className="text-center text-[11px] text-forge-slate">By submitting you consent to be contacted by phone, text, or email.</p>
    </form>
  );
}
