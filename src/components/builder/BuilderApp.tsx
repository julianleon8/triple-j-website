"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { flushSync } from "react-dom";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Phone, Redo2, Undo2 } from "lucide-react";

import { SITE } from "@/lib/site";
import type { Design } from "@/lib/builder/design";
import { encodeDesign, designHash, hashChange, parseDraftAhead, restoreDesign, type DraftAhead } from "@/lib/builder/share";
import { describeDesign } from "@/lib/builder/summary";
import { capture } from "@/lib/analytics";

import { DraggablePlan } from "./DraggablePlan";
import { PriceLine } from "./PriceLine";
import { ShareButton } from "./ShareButton";
import { BuilderToast } from "./Toast";
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
/** This tab's note that its draft ran ahead of its address (share.ts DraftAhead). Per tab, so another tab's draft never counts. */
const AHEAD_KEY = "tj-builder-draft-ahead";
const PANEL_ID = "builder-panel";

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

/**
 * Phones, upright or sideways: the layouts where the panel can be put away so
 * the building has the whole screen. Tablets and desktops keep theirs. The
 * same two queries are written out as Tailwind variants below.
 */
export const PHONE_LAYOUT =
  "(max-width: 767px) and (orientation: portrait), (orientation: landscape) and (max-height: 540px) and (max-width: 1023px)";
function subscribePhone(onChange: () => void) {
  const mq = window.matchMedia(PHONE_LAYOUT);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const usePhoneLayout = () => useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE_LAYOUT).matches, () => false);

function saveDraft(encoded: string) {
  try {
    localStorage.setItem(DRAFT_KEY, encoded);
  } catch {
    // Storage blocked: the design still lives in the page and its address.
  }
}

/** Read and forget this tab's DraftAhead note: it speaks for the next open of the builder only. */
function takeDraftAhead(): DraftAhead | null {
  try {
    const raw = sessionStorage.getItem(AHEAD_KEY);
    sessionStorage.removeItem(AHEAD_KEY);
    return parseDraftAhead(raw);
  } catch {
    return null;
  }
}

function noteDraftAhead(ahead: DraftAhead) {
  try {
    sessionStorage.setItem(AHEAD_KEY, JSON.stringify(ahead));
  } catch {
    // Storage blocked: a reload this soon may open the address's design on Review.
  }
}

/**
 * Put a design's fragment in the address bar ("" for none), so a copied or
 * bookmarked address reopens it. Replaces the entry, never adds one, so Back
 * still leaves the builder. Records what it wrote in `shown`.
 */
function showInAddress(shown: { current: string }, hash: string) {
  shown.current = hash;
  if (window.location.hash === hash) return;
  try {
    window.history.replaceState(null, "", window.location.pathname + window.location.search + hash);
  } catch {
    // Safari caps how often the address can change; the next edit writes it again.
  }
}

export function BuilderApp() {
  const section = useBuilder((s) => s.section);
  const design = useBuilder((s) => s.design);
  const gl = useWebGL();
  const phone = usePhoneLayout();
  const scrollRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  /** The fragment this page last put in the address bar. */
  const shownHash = useRef("");
  const restored = useRef(false);

  // On a phone the panel can be put away, leaving the building on the whole
  // screen. It stays mounted, so its step, scroll and half-typed fields wait.
  const [panelAway, setPanelAway] = useState(false);
  const hidden = panelAway && phone;
  const hideRef = useRef<HTMLButtonElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);
  /** Where the panel was when it went away. */
  const awayAt = useRef<{ section: SectionId; top: number } | null>(null);
  const focusOnToggle = useRef(false);
  const hidePanel = () => {
    awayAt.current = { section: useBuilder.getState().section, top: scrollRef.current?.scrollTop ?? 0 };
    focusOnToggle.current = true;
    setPanelAway(true);
  };
  /** `focus`: hand focus back to the panel's Hide button, as when the visitor pressed Edit design. */
  const showPanel = (focus: boolean) => {
    focusOnToggle.current = focus;
    setPanelAway(false);
  };

  // Restore: a shared link wins, then this browser's last draft, else the
  // default. A link that can't be read says so rather than quietly showing
  // something else.
  useEffect(() => {
    // Once per visit. React runs this twice in development, and the second
    // run would read back the address the first one wrote as this browser's own.
    if (!restored.current) {
      restored.current = true;
      let draft: string | null = null;
      try {
        draft = localStorage.getItem(DRAFT_KEY);
      } catch {
        // Storage blocked: start fresh.
      }
      const { design: initial, shared, badLink } = restoreDesign(window.location.hash, draft, takeDraftAhead());
      // Keep a shared design as this browser's draft too, so plain /build reopens it.
      if (shared && initial) saveDraft(encodeDesign(initial));
      useBuilder.setState({
        ...(initial ? { design: initial, camera: { view: "fit" as const, seq: 1 } } : {}),
        section: shared ? "review" : initial ? "size" : "start",
        badLink,
      });
      // The address shows the design on screen. A fresh start has nothing to
      // keep, so it stays plain /build until the first edit.
      if (initial) showInAddress(shownHash, designHash(initial));
      else if (badLink) showInAddress(shownHash, "");
      capture("builder_opened", { from_link: shared, bad_link: badLink, restored_draft: Boolean(initial) && !shared });
    }

    // A link pasted into this tab, or clicked on this page, changes only the
    // fragment: no reload, so read it here. Loading it is undoable. Our own
    // writes replace the entry and fire no hashchange; returning to an
    // address we wrote is the design already showing.
    const onHash = () => {
      const change = hashChange(window.location.hash, shownHash.current);
      if (change.kind === "none") return;
      const s = useBuilder.getState();
      if (change.kind === "open") {
        s.load(change.design);
        s.setSection("review");
        useBuilder.setState({ badLink: false });
        saveDraft(encodeDesign(change.design));
        showInAddress(shownHash, designHash(useBuilder.getState().design));
      } else {
        useBuilder.setState({ badLink: true });
        // Put back the address of the design still showing.
        showInAddress(shownHash, shownHash.current);
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (gl === false) capture("builder_3d_unavailable");
  }, [gl]);

  // Keep the design in this browser and in the address bar, and note the first real edit.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: Design | null = null;
    let firstEditSent = false;
    const unsubscribe = useBuilder.subscribe((s, prev) => {
      if (s.design === prev.design) return;
      if (!firstEditSent && s.edits > 0) {
        firstEditSent = true;
        capture("builder_first_edit");
      }
      clearTimeout(timer);
      pending = s.design;
      timer = setTimeout(() => {
        if (!pending) return;
        saveDraft(encodeDesign(pending));
        showInAddress(shownHash, designHash(pending));
        pending = null;
      }, 400);
    });
    // Leaving mid-edit still keeps the draft. The address may not take the new
    // design any more, so note that it lags: this tab coming back to it (a
    // reload, Back, a reopened tab) restores the newer draft as its own.
    const keepPending = () => {
      if (!pending) return;
      const encoded = encodeDesign(pending);
      saveDraft(encoded);
      noteDraftAhead({ from: shownHash.current, to: encoded });
    };
    // A page kept for Back resumes with the timer still set, which catches the address up.
    const onPageHide = () => {
      keepPending();
      if (pending) showInAddress(shownHash, designHash(pending));
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      unsubscribe();
      window.removeEventListener("pagehide", onPageHide);
      clearTimeout(timer);
      // Unmounted for another page: the address is that page's now, so leave it alone.
      keepPending();
    };
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

  // The panel went away or came back: focus follows the button pressed, the
  // panel opens where it was left, and once the 3D view stops changing size
  // the camera frames the building for its new shape.
  const wasHidden = useRef(hidden);
  useEffect(() => {
    // The 3D view reads it: a door tapped there must not switch a step no one can see.
    useBuilder.setState({ panelHidden: hidden });
    if (wasHidden.current === hidden) return;
    wasHidden.current = hidden;
    if (focusOnToggle.current) {
      focusOnToggle.current = false;
      (hidden ? editRef : hideRef).current?.focus({ preventScroll: true });
    }
    const at = awayAt.current;
    const panel = scrollRef.current;
    if (!hidden && at && panel && at.section === useBuilder.getState().section) panel.scrollTop = at.top;
    const stage = stageRef.current;
    if (!stage) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        ro.disconnect();
        useBuilder.getState().look("fit");
      }, 120);
    });
    ro.observe(stage);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [hidden]);

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

  // The header's Get My Quote: Review from any other step; on Review, the form.
  const getQuote = () => {
    const s = useBuilder.getState();
    if (s.section !== "review") {
      showPanel(false);
      s.setSection("review");
      return;
    }
    // The form can take focus only once the panel is back.
    if (hidden) flushSync(() => showPanel(false));
    focusQuoteForm();
  };

  const Panel = PANELS[section];

  return (
    <div data-forge="" data-tone="light" className="fixed inset-0 flex flex-col bg-white text-forge-navy" style={{ colorScheme: "light" }}>
      <BuilderHeader onQuote={getQuote} />
      {/* Phones held sideways get the desktop's side-by-side layout: stacked,
          the panel would be a few pixels tall. */}
      {/* paddingBottom: globals.css pads every public <main> on phones for the
          site's sticky Call bar, which this page does not have. */}
      {/* overflow-clip: the panel slides out past the edge when put away, and
          nothing may scroll it back into view. */}
      <main
        className="flex min-h-0 flex-1 flex-col overflow-clip lg:flex-row [@media(orientation:landscape)_and_(max-height:540px)]:flex-row"
        style={{ paddingBottom: 0 }}
      >
        <section
          ref={stageRef}
          aria-label="Your building"
          className={`relative ${hidden ? "h-full" : "h-[44svh]"} flex-none overflow-hidden bg-[#dfe7ec] transition-[height] duration-300 ease-forge motion-reduce:transition-none lg:h-auto lg:flex-1 [@media(orientation:landscape)_and_(max-height:540px)]:h-auto [@media(orientation:landscape)_and_(max-height:540px)]:flex-1`}
        >
          {gl === true ? (
            // isolate: labels drawn over the 3D view stay under the buttons and messages.
            <div role="img" aria-label={describeDesign(design)} className="absolute inset-0 isolate">
              <Scene />
            </div>
          ) : gl === false ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white p-6">
              <DraggablePlan className="h-full max-h-[70%] w-full" />
              <p className="max-w-[360px] text-center text-[13px] leading-[1.5] text-forge-slate">
                3D isn&apos;t available on this device, so here is your plan. It updates as you build.
              </p>
            </div>
          ) : null}
          {gl === true ? <ViewportControls stage={stageRef} full={hidden} /> : gl === false ? <UndoRedo className="absolute left-3 top-3" /> : null}
          <BuilderToast full={hidden} />
          {hidden ? (
            // Where the size badge sits, clear of the notch and home bar, and
            // over any message, so nothing ever covers the way back. Under
            // 360px wide the full label would run into the Person chip.
            <button
              ref={editRef}
              type="button"
              data-scene-overlay
              aria-label="Edit design"
              aria-expanded={false}
              aria-controls={PANEL_ID}
              onClick={() => showPanel(true)}
              className="absolute bottom-[max(12px,env(safe-area-inset-bottom))] right-[max(12px,env(safe-area-inset-right))] z-30 inline-flex h-11 cursor-pointer items-center gap-2 rounded-[6px] bg-forge-navy px-4 text-[14px] font-semibold text-white shadow-[0_6px_20px_rgba(0,24,42,.28)] transition-[opacity,background-color] duration-300 ease-forge hover:bg-forge-navy-raised starting:opacity-0 motion-reduce:transition-none"
            >
              <ChevronUp aria-hidden="true" className="size-4 [@media(orientation:landscape)_and_(max-height:540px)]:hidden" strokeWidth={2.2} />
              <ChevronLeft aria-hidden="true" className="hidden size-4 [@media(orientation:landscape)_and_(max-height:540px)]:block" strokeWidth={2.2} />
              <span>
                Edit<span className="max-[360px]:hidden"> design</span>
              </span>
            </button>
          ) : null}
        </section>

        {/* Put away, the panel keeps its size and slides off the edge (down
            when upright, right when sideways) while the 3D view grows over its
            place; inert, it takes no taps or focus. Visibility waits out the
            slide only on the way out: coming back it is visible at once, so
            its Hide panel button can take focus. */}
        <aside
          id={PANEL_ID}
          inert={hidden}
          className={`flex min-h-0 flex-1 flex-col border-t border-forge-silver duration-300 ease-forge motion-reduce:transition-none ${hidden ? "invisible transition-[margin,visibility] [@media(orientation:landscape)_and_(max-height:540px)]:-mr-[52%]" : "transition-[margin]"} lg:w-[440px] lg:flex-none lg:border-l lg:border-t-0 [@media(max-width:767px)_and_(orientation:portrait)]:h-[calc(100%-44svh)] [@media(max-width:767px)_and_(orientation:portrait)]:flex-none [@media(orientation:landscape)_and_(max-height:540px)]:w-[52%] [@media(orientation:landscape)_and_(max-height:540px)]:flex-none [@media(orientation:landscape)_and_(max-height:540px)]:border-l [@media(orientation:landscape)_and_(max-height:540px)]:border-t-0`}
        >
          {/* Phones only: see just the building. */}
          <button
            ref={hideRef}
            type="button"
            aria-expanded={!hidden}
            aria-controls={PANEL_ID}
            onClick={hidePanel}
            className="hidden h-8 w-full flex-none cursor-pointer items-center justify-center gap-1.5 border-b border-forge-mist text-[12px] font-semibold text-forge-slate transition-colors hover:text-forge-navy [@media(max-width:767px)_and_(orientation:portrait)]:flex [@media(orientation:landscape)_and_(max-height:540px)_and_(max-width:1023px)]:flex"
          >
            <ChevronDown aria-hidden="true" className="size-4 [@media(orientation:landscape)_and_(max-height:540px)]:hidden" strokeWidth={2.2} />
            <ChevronRight aria-hidden="true" className="hidden size-4 [@media(orientation:landscape)_and_(max-height:540px)]:block" strokeWidth={2.2} />
            Hide panel
          </button>
          <SectionTabs />
          {/* Review shows its own price card, so the price bar steps aside there
              and the panel keeps clear of the phone's home bar itself. */}
          <div
            ref={scrollRef}
            className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${section === "review" ? "pb-[env(safe-area-inset-bottom)]" : ""}`}
          >
            <BadLinkNotice />
            <Panel />
          </div>
          {section === "review" ? null : <PriceBar />}
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

const prefersReducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/** Bring the quote form on Review into view and put the cursor in its Name field. */
function focusQuoteForm() {
  const name = document.getElementById("bq-name");
  if (!name) return;
  (name.closest("form") ?? name).scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  name.focus({ preventScroll: true });
}

function BuilderHeader({ onQuote }: { onQuote: () => void }) {
  return (
    // data-tone="dark": a light focus ring, as on the site header; the navy one would vanish here.
    <header
      data-tone="dark"
      className="flex h-14 flex-none items-center justify-between gap-3 border-b border-white/15 bg-forge-navy px-4 text-white sm:px-5"
    >
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
          onClick={onQuote}
          className="hidden h-9 cursor-pointer items-center gap-2 rounded-[6px] bg-white px-3.5 text-[13px] font-semibold text-forge-navy transition-colors hover:bg-forge-silver sm:inline-flex"
        >
          Get My Quote <span aria-hidden="true" className="text-forge-slate">→</span>
        </button>
      </div>
    </header>
  );
}

/** Room kept between a step and the edge of the strip: clear of the edge fade (w-8), plus a little air. */
const STEP_EDGE = 40;

/**
 * How far to scroll the step strip so a step sits fully inside it, `edge` px
 * clear of each side: negative to the left, 0 when it already does. Boxes are
 * screen rects (left and right edges).
 */
export function stepScroll(strip: { left: number; right: number }, step: { left: number; right: number }, edge = STEP_EDGE): number {
  const before = step.left - (strip.left + edge);
  const after = step.right - (strip.right - edge);
  return before < 0 ? before : after > 0 ? after : 0;
}

/** Scroll the step strip just enough that `step` sits fully inside it, clear of the fades. */
function revealStep(strip: HTMLElement, step: HTMLElement, smooth: boolean) {
  const by = stepScroll(strip.getBoundingClientRect(), step.getBoundingClientRect());
  if (by) strip.scrollBy({ left: by, behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto" });
}

function SectionTabs() {
  const section = useBuilder((s) => s.section);
  const setSection = useBuilder((s) => s.setSection);
  const listRef = useRef<HTMLDivElement>(null);
  const [moreBefore, setMoreBefore] = useState(false);
  const [moreAfter, setMoreAfter] = useState(false);
  const firstReveal = useRef(true);

  // The current step is always in full view; it glides there after the first time.
  useEffect(() => {
    const strip = listRef.current;
    const step = strip?.querySelector<HTMLElement>(`[data-section="${section}"]`);
    if (strip && step) revealStep(strip, step, !firstReveal.current);
    firstReveal.current = false;
  }, [section]);

  // An edge fades only while more steps sit beyond it.
  useEffect(() => {
    const strip = listRef.current;
    if (!strip) return;
    const update = () => {
      setMoreBefore(strip.scrollLeft > 1);
      setMoreAfter(strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1);
    };
    strip.addEventListener("scroll", update, { passive: true });
    // The strip and every step: a step widens when its font arrives.
    const ro = new ResizeObserver(update);
    ro.observe(strip);
    for (const step of strip.children) ro.observe(step);
    return () => {
      strip.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const fade = "pointer-events-none absolute inset-y-0 w-8 from-white to-transparent transition-opacity";
  return (
    <nav aria-label="Builder steps" className="relative flex-none border-b border-forge-mist">
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
              onFocus={(e) => listRef.current && revealStep(listRef.current, e.currentTarget, true)}
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
      <span aria-hidden="true" className={`${fade} left-0 bg-linear-to-r ${moreBefore ? "opacity-100" : "opacity-0"}`} />
      <span aria-hidden="true" className={`${fade} right-0 bg-linear-to-l ${moreAfter ? "opacity-100" : "opacity-0"}`} />
    </nav>
  );
}

/** Every step but Review, which shows its own price card. */
function PriceBar() {
  const design = useBuilder((s) => s.design);
  const setSection = useBuilder((s) => s.setSection);
  return (
    <div className="flex flex-none items-center justify-between gap-3 border-t border-forge-silver bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-5">
      <PriceLine design={design} />
      <button
        type="button"
        onClick={() => setSection("review")}
        className="inline-flex h-11 flex-none cursor-pointer items-center gap-2 rounded-[6px] bg-forge-navy px-4 text-[14px] font-semibold text-white transition-colors hover:bg-forge-navy-raised"
      >
        Get My Quote <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

const VIEW_BUTTONS: { v: ViewName; label: string }[] = [
  { v: "iso", label: "3D" },
  { v: "front", label: "Front" },
  { v: "right", label: "Side" },
  { v: "back", label: "Rear" },
  { v: "top", label: "Top" },
];

const chip =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border border-forge-silver bg-white/90 px-2.5 text-[12px] font-semibold text-forge-navy transition-colors hover:border-forge-navy aria-disabled:cursor-not-allowed aria-disabled:opacity-40";
/** A camera view button: navy while the camera is on that view. */
const viewChip = `${chip} aria-pressed:border-forge-navy aria-pressed:bg-forge-navy aria-pressed:text-white`;

/**
 * Undo and redo stay focusable when there is nothing to undo, so focus never
 * falls to <body>. `overlay`: laid over the 3D view, which frames clear of it.
 */
function UndoRedo({ className = "", overlay = false }: { className?: string; overlay?: boolean }) {
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const canUndo = useBuilder((s) => s.past.length > 0);
  const canRedo = useBuilder((s) => s.future.length > 0);
  return (
    <div data-scene-overlay={overlay || undefined} className={`flex gap-1.5 ${className}`}>
      <button type="button" className={chip} onClick={undo} aria-disabled={!canUndo || undefined} aria-label="Undo">
        <Undo2 aria-hidden="true" className="size-4" strokeWidth={2} />
      </button>
      <button type="button" className={chip} onClick={redo} aria-disabled={!canRedo || undefined} aria-label="Redo">
        <Redo2 aria-hidden="true" className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

/**
 * The camera view a button can say is on, after the camera is asked for
 * `asked`: that view, or for a re-frame (which keeps the angle) the one
 * already on. Null once the visitor has turned the camera by hand.
 */
export function viewAfter(current: ViewName | null, asked: ViewName | "fit"): ViewName | null {
  return asked === "fit" ? current : asked;
}

/** Movement, in px, past which a press on the 3D view is a drag that turns the camera. */
const ORBIT_SLOP = 6;

/** Which named view the camera is on, if any. */
function useActiveView(stage: RefObject<HTMLElement | null>): ViewName | null {
  // The camera opens on the 3D angle.
  const [active, setActive] = useState<ViewName | null>(() => viewAfter("iso", useBuilder.getState().camera.view));

  useEffect(
    () =>
      useBuilder.subscribe((s, prev) => {
        if (s.camera !== prev.camera) setActive((v) => viewAfter(v, s.camera.view));
      }),
    [],
  );

  // One finger, or the main mouse button, dragged across the 3D view turns the
  // camera off any named view. Two fingers zoom and pan, which keep the angle,
  // and dragging a door or window moves only the door.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const pressed = new Map<number, { x: number; y: number }>();
    const onDown = (e: PointerEvent) => {
      if (e.target instanceof HTMLCanvasElement) pressed.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };
    const onMove = (e: PointerEvent) => {
      const from = pressed.get(e.pointerId);
      if (!from || pressed.size !== 1 || (e.pointerType === "mouse" && e.buttons !== 1)) return;
      if (Math.hypot(e.clientX - from.x, e.clientY - from.y) < ORBIT_SLOP) return;
      pressed.delete(e.pointerId);
      if (!useBuilder.getState().dragging) setActive(null);
    };
    const onUp = (e: PointerEvent) => pressed.delete(e.pointerId);
    // A press starts on the 3D view; like the camera, its drag is followed anywhere on the page.
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [stage]);

  return active;
}

/** `full`: the panel is away and the 3D view runs to the screen's edges, so the edge buttons keep clear of the notch and home bar. */
export function ViewportControls({ stage, full = false }: { stage: RefObject<HTMLElement | null>; full?: boolean }) {
  const look = useBuilder((s) => s.look);
  const frameOnly = useBuilder((s) => s.frameOnly);
  const setFrameOnly = useBuilder((s) => s.setFrameOnly);
  const showPerson = useBuilder((s) => s.showPerson);
  const setShowPerson = useBuilder((s) => s.setShowPerson);
  const d = useBuilder((s) => s.design);
  const active = useActiveView(stage);
  // data-scene-overlay: the camera frames the building clear of each of these
  // (scene/Scene.tsx measures them), so a row that wraps on a narrow phone is
  // cleared too, and one tucked in a corner only if the building reaches it.
  return (
    <>
      <UndoRedo overlay className="absolute left-3 top-3" />
      {/* Bounded on the left so it wraps instead of sliding over Undo/Redo on a narrow pane. */}
      <div
        role="group"
        aria-label="Camera views"
        data-scene-overlay
        className={`absolute left-[100px] top-3 flex flex-wrap justify-end gap-1 ${full ? "right-[max(12px,env(safe-area-inset-right))]" : "right-3"}`}
      >
        {VIEW_BUTTONS.map((b) => (
          <button key={b.v} type="button" className={viewChip} aria-pressed={active === b.v} onClick={() => look(b.v)}>
            {b.label}
          </button>
        ))}
      </div>
      {/* The ✓ always takes its room, so a toggle never changes width. */}
      <div data-scene-overlay className={`absolute left-3 flex gap-1.5 ${full ? "bottom-[max(12px,env(safe-area-inset-bottom))]" : "bottom-3"}`}>
        <button type="button" className={chip} aria-pressed={frameOnly} onClick={() => setFrameOnly(!frameOnly)}>
          <span aria-hidden="true" className={frameOnly ? undefined : "invisible"}>
            ✓
          </span>
          Frame only
        </button>
        <button type="button" className={chip} aria-pressed={showPerson} onClick={() => setShowPerson(!showPerson)}>
          <span aria-hidden="true" className={showPerson ? undefined : "invisible"}>
            ✓
          </span>
          Person
        </button>
      </div>
      {/* With the panel away, Edit design takes this corner and the size sits just above it. */}
      <p
        data-scene-overlay
        className={`pointer-events-none absolute rounded-[6px] bg-forge-navy/80 px-2.5 py-1.5 text-[12px] font-semibold tabular-nums text-white ${
          full ? "bottom-[calc(max(12px,env(safe-area-inset-bottom))+52px)] right-[max(12px,env(safe-area-inset-right))]" : "bottom-3 right-3"
        }`}
      >
        {d.width} × {d.length} × {d.height} ft
      </p>
    </>
  );
}
