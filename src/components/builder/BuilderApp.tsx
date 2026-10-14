"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Phone, Redo2, Undo2 } from "lucide-react";

import { SITE } from "@/lib/site";
import { encodeDesign, decodeDesign, designFromHash } from "@/lib/builder/share";
import { describeDesign } from "@/lib/builder/summary";
import { capture } from "@/lib/analytics";

import { PlanView } from "./PlanView";
import { PriceLine } from "./PriceLine";
import { ShareButton } from "./ShareButton";
import { useBuilder, type SectionId, type ViewName } from "./store";
import { SECTIONS } from "./panel/sections";
import { StartSection } from "./panel/StartSection";
import { SizeSection } from "./panel/SizeSection";
import { WallsSection } from "./panel/WallsSection";
import { OpeningsSection } from "./panel/OpeningsSection";
import { LeanSection } from "./panel/LeanSection";
import { ColorsSection } from "./panel/ColorsSection";
import { SiteSection } from "./panel/SiteSection";
import { ReviewSection } from "./panel/ReviewSection";

const Scene = dynamic(() => import("./scene/Scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-forge-slate">
      Loading the 3D view…
    </div>
  ),
});

const DRAFT_KEY = "tj-builder-draft";

const PANELS: Record<SectionId, () => React.JSX.Element> = {
  start: StartSection,
  size: SizeSection,
  walls: WallsSection,
  openings: OpeningsSection,
  leans: LeanSection,
  colors: ColorsSection,
  site: SiteSection,
  review: ReviewSection,
};

// ── WebGL support, read once on the client ──
let glCache: boolean | null = null;
function hasWebGL(): boolean {
  if (glCache === null) {
    try {
      const c = document.createElement("canvas");
      glCache = Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
    } catch {
      glCache = false;
    }
  }
  return glCache;
}
const noop = () => () => {};
const useWebGL = () => useSyncExternalStore(noop, hasWebGL, () => null);

export function BuilderApp() {
  const section = useBuilder((s) => s.section);
  const design = useBuilder((s) => s.design);
  const gl = useWebGL();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore: a shared link wins, then this browser's last draft, else the
  // default. A link that can't be read says so rather than quietly showing
  // something else.
  useEffect(() => {
    const hash = window.location.hash;
    const hasLink = /(?:^#|&)d=/.test(hash);
    const fromLink = hasLink ? designFromHash(hash) : null;
    let fromDraft = null;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) fromDraft = decodeDesign(raw);
    } catch {
      // Storage blocked: start fresh.
    }
    const initial = fromLink ?? fromDraft;
    if (fromLink) {
      // The link is stripped from the address bar below, so keep the design
      // as this browser's draft or a reload would lose it.
      try {
        localStorage.setItem(DRAFT_KEY, encodeDesign(fromLink));
      } catch {
        // Storage blocked: it lives in the page until the tab closes.
      }
    }
    useBuilder.setState({
      ...(initial ? { design: initial, camera: { view: "fit" as const, seq: 1 } } : {}),
      section: fromLink ? "review" : initial ? "size" : "start",
      badLink: hasLink && !fromLink,
    });
    if (hasLink) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    capture("builder_opened", { from_link: Boolean(fromLink), bad_link: hasLink && !fromLink, restored_draft: Boolean(!fromLink && fromDraft) });
  }, []);

  useEffect(() => {
    if (gl === false) capture("builder_3d_unavailable");
  }, [gl]);

  // Keep a draft in this browser, and note the first real edit.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let firstEditSent = false;
    return useBuilder.subscribe((s, prev) => {
      if (s.design === prev.design) return;
      if (!firstEditSent && s.edits > 0) {
        firstEditSent = true;
        capture("builder_first_edit");
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_KEY, encodeDesign(s.design));
        } catch {
          // Private mode: the design still lives in the page and in share links.
        }
      }, 400);
    });
  }, []);

  // A new step starts at its top, with focus on its heading (not on <body>,
  // where it would fall once the button that was pressed unmounts).
  const firstSection = useRef(true);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    capture("builder_section_viewed", { section });
    if (firstSection.current) {
      firstSection.current = false;
      return;
    }
    scrollRef.current?.querySelector<HTMLElement>("[data-section-heading]")?.focus({ preventScroll: true });
  }, [section]);

  // ⌘Z / ⇧⌘Z (Ctrl on Windows), except while typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      // Text fields keep their own undo; sliders, checkboxes and buttons have none.
      const t = e.target as HTMLElement | null;
      const typing =
        t instanceof HTMLTextAreaElement ||
        Boolean(t?.isContentEditable) ||
        (t instanceof HTMLInputElement && !["range", "checkbox", "radio", "button"].includes(t.type));
      if (typing) return;
      e.preventDefault();
      const s = useBuilder.getState();
      if (e.shiftKey) s.redo();
      else s.undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const Panel = PANELS[section];

  return (
    <div data-forge="" data-tone="light" className="fixed inset-0 flex flex-col bg-white text-forge-navy" style={{ colorScheme: "light" }}>
      <BuilderHeader />
      {/* Phones held sideways get the desktop's side-by-side layout: stacked,
          the panel would be a few pixels tall. */}
      {/* paddingBottom: globals.css pads every public <main> on phones for the
          site's sticky Call bar, which this page does not have. */}
      <main
        className="flex min-h-0 flex-1 flex-col lg:flex-row [@media(orientation:landscape)_and_(max-height:540px)]:flex-row"
        style={{ paddingBottom: 0 }}
      >
        <section
          aria-label="Your building"
          className="relative h-[44svh] flex-none overflow-hidden bg-[#dfe7ec] lg:h-auto lg:flex-1 [@media(orientation:landscape)_and_(max-height:540px)]:h-auto [@media(orientation:landscape)_and_(max-height:540px)]:flex-1"
        >
          {gl === true ? (
            <div role="img" aria-label={describeDesign(design)} className="absolute inset-0">
              <Scene />
            </div>
          ) : gl === false ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white p-6">
              <PlanView design={design} className="h-full max-h-[70%] w-full" />
              <p className="max-w-[360px] text-center text-[13px] leading-[1.5] text-forge-slate">
                3D isn&apos;t available on this device, so here is your plan. It updates as you build.
              </p>
            </div>
          ) : null}
          {gl === true ? <ViewportControls /> : gl === false ? <UndoRedo className="absolute left-3 top-3" /> : null}
        </section>

        <aside className="flex min-h-0 flex-1 flex-col border-t border-forge-silver lg:w-[440px] lg:flex-none lg:border-l lg:border-t-0 [@media(orientation:landscape)_and_(max-height:540px)]:w-[52%] [@media(orientation:landscape)_and_(max-height:540px)]:flex-none [@media(orientation:landscape)_and_(max-height:540px)]:border-l [@media(orientation:landscape)_and_(max-height:540px)]:border-t-0">
          <SectionTabs />
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <BadLinkNotice />
            <Panel />
          </div>
          <PriceBar />
        </aside>
      </main>
      <LiveRegion />
    </div>
  );
}

/** One persistent polite live region: refusals and notices are read from here. */
function LiveRegion() {
  const { text, seq } = useBuilder((s) => s.announcement);
  return (
    <div aria-live="polite" className="sr-only">
      <span key={seq}>{text}</span>
    </div>
  );
}

function BadLinkNotice() {
  const badLink = useBuilder((s) => s.badLink);
  const dismiss = useBuilder((s) => s.dismissBadLink);
  if (!badLink) return null;
  return (
    <div role="alert" className="mx-5 mt-5 flex items-start justify-between gap-3 rounded-[8px] border border-forge-navy bg-forge-fog px-3.5 py-3 text-[13px] leading-[1.5] text-forge-navy sm:mx-6">
      <p className="m-0">That design link couldn&apos;t be opened. It may have been cut off when it was copied. Ask for it again, or start here.</p>
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="-my-2 -mr-2 inline-flex size-11 flex-none cursor-pointer items-center justify-center text-[18px] text-forge-slate hover:text-forge-navy">
        ×
      </button>
    </div>
  );
}

function BuilderHeader() {
  const setSection = useBuilder((s) => s.setSection);
  return (
    <header className="flex h-14 flex-none items-center justify-between gap-3 border-b border-white/15 bg-forge-navy px-4 text-white sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/" className="flex flex-none items-center gap-2.5" aria-label="Triple J Metal home">
          <Image src="/images/logo-lion.png" alt="" width={32} height={32} className="size-8" />
          <span className="hidden font-forge-display text-[18px] font-black tracking-[.01em] sm:inline">Triple J Metal</span>
        </Link>
        <span aria-hidden="true" className="hidden h-5 w-px bg-white/25 sm:block" />
        <h1 className="m-0 truncate text-[11px] font-bold uppercase tracking-[.2em] text-forge-silver">
          <span className="sr-only">Triple J Metal </span>3D Builder
        </h1>
      </div>
      <div className="flex flex-none items-center gap-2">
        <a
          href={SITE.phoneHref}
          className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-white/40 px-3 text-[13px] font-semibold text-white transition-colors hover:border-white hover:bg-white/[.08]"
          aria-label={`Call ${SITE.phone}`}
        >
          <Phone aria-hidden="true" className="size-4" strokeWidth={2} />
          <span className="hidden tabular-nums md:inline">{SITE.phone}</span>
        </a>
        <ShareButton tone="dark" compact />
        <button
          type="button"
          onClick={() => setSection("review")}
          className="hidden h-9 cursor-pointer items-center gap-2 rounded-[6px] bg-white px-3.5 text-[13px] font-semibold text-forge-navy transition-colors hover:bg-forge-silver sm:inline-flex"
        >
          Get My Quote <span aria-hidden="true" className="text-forge-slate">→</span>
        </button>
      </div>
    </header>
  );
}

function SectionTabs() {
  const section = useBuilder((s) => s.section);
  const setSection = useBuilder((s) => s.setSection);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-section="${section}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [section]);
  return (
    <nav aria-label="Builder steps" className="flex-none border-b border-forge-mist">
      <div ref={listRef} className="forge-no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2.5">
        {SECTIONS.map((s, i) => {
          const on = s.id === section;
          return (
            <button
              key={s.id}
              type="button"
              data-section={s.id}
              aria-current={on ? "step" : undefined}
              onClick={() => setSection(s.id)}
              className={`inline-flex h-10 flex-none cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-colors ${
                on ? "border-forge-navy bg-forge-navy text-white" : "border-forge-silver bg-white text-forge-navy hover:border-forge-steel"
              }`}
            >
              <span className={`font-forge-display text-[12px] ${on ? "text-forge-silver" : "text-forge-steel"}`}>{i + 1}</span>
              {s.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function PriceBar() {
  const design = useBuilder((s) => s.design);
  const section = useBuilder((s) => s.section);
  const setSection = useBuilder((s) => s.setSection);
  return (
    <div className="flex flex-none items-center justify-between gap-3 border-t border-forge-silver bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-5">
      <PriceLine design={design} />
      {section === "review" ? null : (
        <button
          type="button"
          onClick={() => setSection("review")}
          className="inline-flex h-11 flex-none cursor-pointer items-center gap-2 rounded-[6px] bg-forge-navy px-4 text-[14px] font-semibold text-white transition-colors hover:bg-forge-navy-raised"
        >
          Get My Quote <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  );
}

const VIEW_BUTTONS: { v: ViewName; label: string }[] = [
  { v: "iso", label: "3D" },
  { v: "front", label: "Front" },
  { v: "right", label: "Side" },
  { v: "back", label: "Back" },
  { v: "top", label: "Top" },
];

const chip =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border border-forge-silver bg-white/90 px-2.5 text-[12px] font-semibold text-forge-navy transition-colors hover:border-forge-navy aria-disabled:cursor-not-allowed aria-disabled:opacity-40";

/** Undo and redo stay focusable when there is nothing to undo, so focus never falls to <body>. */
function UndoRedo({ className = "" }: { className?: string }) {
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const canUndo = useBuilder((s) => s.past.length > 0);
  const canRedo = useBuilder((s) => s.future.length > 0);
  return (
    <div className={`flex gap-1.5 ${className}`}>
      <button type="button" className={chip} onClick={undo} aria-disabled={!canUndo || undefined} aria-label="Undo">
        <Undo2 aria-hidden="true" className="size-4" strokeWidth={2} />
      </button>
      <button type="button" className={chip} onClick={redo} aria-disabled={!canRedo || undefined} aria-label="Redo">
        <Redo2 aria-hidden="true" className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

function ViewportControls() {
  const look = useBuilder((s) => s.look);
  const frameOnly = useBuilder((s) => s.frameOnly);
  const setFrameOnly = useBuilder((s) => s.setFrameOnly);
  const showPerson = useBuilder((s) => s.showPerson);
  const setShowPerson = useBuilder((s) => s.setShowPerson);
  const d = useBuilder((s) => s.design);
  return (
    <>
      <UndoRedo className="absolute left-3 top-3" />
      <div role="group" aria-label="Camera views" className="absolute right-3 top-3 flex gap-1">
        {VIEW_BUTTONS.map((b) => (
          <button key={b.v} type="button" className={chip} onClick={() => look(b.v)}>
            {b.label}
          </button>
        ))}
      </div>
      <div className="absolute bottom-3 left-3 flex gap-1.5">
        <button type="button" className={chip} aria-pressed={frameOnly} onClick={() => setFrameOnly(!frameOnly)}>
          {frameOnly ? <span aria-hidden="true">✓</span> : null}Frame only
        </button>
        <button type="button" className={chip} aria-pressed={showPerson} onClick={() => setShowPerson(!showPerson)}>
          {showPerson ? <span aria-hidden="true">✓</span> : null}Person
        </button>
      </div>
      <p className="pointer-events-none absolute bottom-3 right-3 rounded-[6px] bg-forge-navy/80 px-2.5 py-1.5 text-[12px] font-semibold tabular-nums text-white">
        {d.width} × {d.length} × {d.height} ft
      </p>
    </>
  );
}
