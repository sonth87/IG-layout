"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// The slide between IG Layout and the booth when the hanging tag is pulled (D-151), so the
// switch is one motion instead of "pull… blink… new page": while pulling, the other app's
// sheet peeks in from the right as far as the pull; on release it slides over the whole
// screen, the route changes underneath it (prefetched when the tag is touched), and the new page
// opens with the same sheet on top that carries on sliding out to the left.

export type AppKind = "layout" | "booth";

const KEY = "ig-layout:switch";
const COVER_MS = 380;
const REVEAL_MS = 460;
const HREF: Record<AppKind, string> = { layout: "/", booth: "/booth" };

/** Each app's sheet: its background, and its name in its own manner. */
function Sheet({ kind }: { kind: AppKind }) {
  return kind === "booth" ? (
    <div className="flex h-full w-full items-center justify-center bg-[#1a1310]">
      <span className="font-serif text-4xl font-black tracking-tight text-[#f3e9d6] [text-shadow:0_0_18px_rgba(234,166,60,0.45)]">Photobooth</span>
    </div>
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-bg">
      <span className="font-display text-3xl font-bold text-text">IG Layout</span>
    </div>
  );
}

/** The tag's side: peek while pulling, cover on release, then go. */
export function useAppSwitch(to: AppKind) {
  const router = useRouter();
  const [peek, setPeek] = useState(0);
  const [going, setGoing] = useState(false);
  // Load the other app as soon as the tag is touched: it's ready by the time the sheet has
  // covered the screen, and a home screen that's only looked at loads nothing extra.
  const ready = useRef(false);
  const prefetch = () => {
    if (ready.current) return;
    ready.current = true;
    router.prefetch(HREF[to]);
  };
  const onProgress = (p: number) => {
    if (p > 0) prefetch();
    setPeek(p);
  };

  function onSwitch() {
    if (going) return;
    prefetch();
    setGoing(true);
    setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, to);
      } catch {}
      router.push(HREF[to]);
    }, COVER_MS);
  }

  const shown = going ? 1 : peek * 0.22;
  const overlay = (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 shadow-[-18px_0_40px_rgba(0,0,0,0.35)] ${going ? "z-[60]" : "z-[39]"}`}
      style={{
        transform: `translateX(${(1 - shown) * 100}%)`,
        // Following the finger: no easing; letting go / covering: eased.
        transition: going ? `transform ${COVER_MS}ms cubic-bezier(.4,0,.2,1)` : peek === 0 ? "transform 300ms ease-out" : "none",
        visibility: shown > 0 || peek > 0 ? "visible" : "hidden",
      }}
    >
      <Sheet kind={to} />
    </div>
  );
  return { onProgress, onSwitch, overlay };
}

/** The arriving side: if we came by the tag, start covered and slide the sheet away. */
export function SwitchCurtain({ kind }: { kind: AppKind }) {
  const [on, setOn] = useState(() => {
    try {
      if (sessionStorage.getItem(KEY) !== kind) return false;
      sessionStorage.removeItem(KEY);
      return true;
    } catch {
      return false;
    }
  });
  const [away, setAway] = useState(false);
  useEffect(() => {
    if (!on) return;
    // One frame covered (the page draws under it), then slide out.
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setAway(true)));
    const done = setTimeout(() => setOn(false), REVEAL_MS + 60);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [on]);
  if (!on) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] shadow-[18px_0_40px_rgba(0,0,0,0.35)]"
      style={{ transform: away ? "translateX(-100%)" : "none", transition: `transform ${REVEAL_MS}ms cubic-bezier(.4,0,.2,1)` }}
    >
      <Sheet kind={kind} />
    </div>
  );
}
