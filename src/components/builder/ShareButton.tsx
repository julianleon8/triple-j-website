"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { shareUrl } from "@/lib/builder/share";
import { capture } from "@/lib/analytics";

import { useBuilder } from "./store";

/**
 * Copies (or, on a phone, shares) a link that reopens this exact design. The
 * design rides in the link itself, so nothing is saved anywhere.
 */
export function ShareButton({ tone = "light", compact = false }: { tone?: "light" | "dark"; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = shareUrl(window.location.origin, useBuilder.getState().design);
    const touch = window.matchMedia?.("(pointer: coarse)").matches;
    if (touch && navigator.share) {
      try {
        await navigator.share({ title: "My Triple J Metal build", url });
        capture("builder_shared", { method: "share" });
        return;
      } catch (err) {
        // Dismissing the share sheet is not a failure; anything else falls back to copying.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      capture("builder_shared", { method: "copy" });
      setCopied(true);
      useBuilder.getState().announce("Link copied");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Some in-app browsers block the clipboard: hand the link over to copy by hand.
      capture("builder_shared", { method: "manual" });
      window.prompt("Copy this link to your design:", url);
    }
  }

  const cls =
    tone === "dark"
      ? "border-white/40 text-white hover:border-white hover:bg-white/[.08]"
      : "border-forge-silver bg-white text-forge-navy hover:border-forge-navy";
  const Icon = copied ? Check : Share2;
  return (
    <button
      type="button"
      onClick={share}
      aria-label={compact ? (copied ? "Link copied" : "Share this design") : undefined}
      className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center gap-2 rounded-[6px] border px-3 text-[13px] font-semibold transition-colors ${cls}`}
    >
      <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
      {compact ? null : copied ? "Link copied" : "Share"}
    </button>
  );
}
