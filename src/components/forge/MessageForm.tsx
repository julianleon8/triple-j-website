"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type HCaptcha from "@hcaptcha/react-hcaptcha";

import { captureAttribution } from "@/lib/marketing-attribution";

import { FieldLabel, PillGroup, SuccessPanel, TextArea, TextInput } from "./form";

const HCaptchaWidget = dynamic(
  () => import("@hcaptcha/react-hcaptcha").then((m) => m.default),
  { ssr: false, loading: () => null },
) as unknown as typeof import("@hcaptcha/react-hcaptcha").default;

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

const TOPICS = ["New build", "A question", "Existing project", "Partnership"] as const;
const REACH = ["Call", "Text", "Email"] as const;
const LANGS = ["English", "Español"] as const;

type Topic = (typeof TOPICS)[number];
type Reach = (typeof REACH)[number];
type Lang = (typeof LANGS)[number];

export type MessageInput = {
  topic: Topic;
  name: string;
  phone: string;
  email: string;
  reach: Reach;
  lang: Lang;
  text: string;
};

const digits = (s: string) => s.replace(/\D/g, "").length;

export function canSendMessage(m: MessageInput): boolean {
  if (m.name.trim().length < 2 || digits(m.phone) < 10) return false;
  return m.reach !== "Email" || m.email.includes("@");
}

/**
 * The /api/leads body for a contact message. The public endpoint takes it as
 * it is: no ZIP, `service_type: "other"`, and the topic, preferred channel and
 * language composed into the notes the owner alert shows.
 */
export function buildMessagePayload(m: MessageInput, captchaToken: string | null) {
  const head = `Topic: ${m.topic} · Reach by: ${m.reach} · Language: ${m.lang}`;
  const text = m.text.trim();
  return {
    name: m.name.trim(),
    phone: m.phone.trim(),
    email: m.email.trim() || undefined,
    service_type: "other" as const,
    source: "website_form" as const,
    message: `Contact page message — ${head}${text ? ` — ${text}` : ""}`.slice(0, 1000),
    captcha_token: captchaToken ?? undefined,
  };
}

const EMPTY: MessageInput = { topic: "New build", name: "", phone: "", email: "", reach: "Call", lang: "English", text: "" };

/** "Send a message" card on /contact (#message). */
export function MessageForm() {
  const [m, setM] = useState<MessageInput>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "err">("idle");
  const [err, setErr] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha | null>(null);

  useEffect(() => {
    captureAttribution();
  }, []);

  const set = <K extends keyof MessageInput>(k: K, v: MessageInput[K]) => setM((cur) => ({ ...cur, [k]: v }));

  async function send() {
    if (!canSendMessage(m)) return;
    if (HCAPTCHA_SITE_KEY && !captchaToken) {
      setStatus("err");
      setErr("Please complete the captcha check below.");
      return;
    }
    setStatus("sending");
    setErr("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildMessagePayload(m, captchaToken), ...captureAttribution() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body?.error === "string" ? body.error : "Something went wrong. Please call us directly.");
      }
      setStatus("sent");
    } catch (e) {
      setStatus("err");
      setErr(e instanceof Error ? e.message : "Something went wrong. Please call us directly.");
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    }
  }

  const card =
    "scroll-mt-4 rounded-[12px] border border-forge-silver bg-white p-[clamp(20px,2vw,32px)] text-forge-navy shadow-[var(--shadow-lifted)]";

  if (status === "sent") {
    const first = m.name.trim().split(/\s+/)[0] || "neighbor";
    const who = m.lang === "Español" ? "Juan or Freddy will reach you in Spanish" : "Julian or Juan will reach you";
    const via = m.reach === "Call" ? "by phone" : m.reach === "Text" ? "by text" : "by email";
    const at = m.reach === "Email" ? m.email.trim() : m.phone.trim();
    return (
      <div id="message" className={card}>
        <SuccessPanel
          title={`Got it, ${first}.`}
          resetLabel="Send another message"
          onReset={() => {
            setM(EMPTY);
            setStatus("idle");
            setCaptchaToken(null);
          }}
        >
          {who} {via} at <b className="text-forge-navy tabular-nums">{at}</b> — same day during business hours.
        </SuccessPanel>
      </div>
    );
  }

  return (
    <div id="message" className={card}>
      <h2 className="font-forge-display text-[clamp(24px,1vw_+_16px,30px)] font-black leading-[1.15]">Send a message</h2>
      <p className="mt-2 text-[14px] text-forge-slate">Goes straight to Julian’s phone. No black hole.</p>
      <div className="mt-6 flex flex-col gap-[22px]">
        <PillGroup
          label="What’s this about?"
          options={TOPICS.map((v) => ({ v, label: v }))}
          value={m.topic}
          onChange={(v) => v && set("topic", v)}
        />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-2.5">
          <TextInput type="text" autoComplete="name" placeholder="Full name" aria-label="Full name" value={m.name} onChange={(e) => set("name", e.target.value)} />
          <TextInput type="tel" autoComplete="tel" placeholder="Phone" aria-label="Phone" value={m.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-[22px]">
          <PillGroup label="Best way to reach you" options={REACH.map((v) => ({ v, label: v }))} value={m.reach} onChange={(v) => v && set("reach", v)} />
          <PillGroup label="Language" options={LANGS.map((v) => ({ v, label: v }))} value={m.lang} onChange={(v) => v && set("lang", v)} />
        </div>
        {/* The design offers Email as a channel; without an address it could never be used. */}
        {m.reach === "Email" ? (
          <div>
            <FieldLabel htmlFor="message-email">Email</FieldLabel>
            <TextInput id="message-email" type="email" autoComplete="email" placeholder="you@example.com" value={m.email} onChange={(e) => set("email", e.target.value)} />
          </div>
        ) : null}
        <div>
          <FieldLabel htmlFor="message-text" optional>
            Message
          </FieldLabel>
          <TextArea
            id="message-text"
            rows={4}
            maxLength={800}
            className="min-h-[110px]"
            placeholder="What are you thinking about building?"
            value={m.text}
            onChange={(e) => set("text", e.target.value)}
          />
        </div>
        {HCAPTCHA_SITE_KEY ? (
          <div className="flex justify-center">
            <HCaptchaWidget
              ref={captchaRef}
              sitekey={HCAPTCHA_SITE_KEY}
              theme="light"
              onVerify={(t) => setCaptchaToken(t)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />
          </div>
        ) : null}
        {status === "err" ? (
          <div role="alert" className="rounded-[8px] border border-forge-navy bg-forge-fog px-4 py-3 text-[14px] font-semibold">
            {err}
          </div>
        ) : null}
        <button
          type="button"
          onClick={send}
          disabled={status === "sending" || !canSendMessage(m)}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-forge-navy px-[26px] py-[15px] text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-forge-navy-raised disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send to Triple J"} <span aria-hidden="true">→</span>
        </button>
        <p className="-mt-2 text-center text-[12px] text-forge-slate">
          Prefer a full quote?{" "}
          <Link href="/quote" className="border-b border-forge-silver font-semibold text-forge-navy hover:border-forge-navy">
            Use the 2-step quote form
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
