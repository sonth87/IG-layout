"use client";

import { lazy, Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// The slide between IG Layout and the booth when the hanging tag is pulled (D-151), so the
// switch is one motion instead of "pull… blink… new page": while pulling, the other app comes
// in from the right as far as the pull — its real home screen (owner, 2026-10-30: "preview
// thật thay vì chỉ là dải màu"), loaded when the tag is touched; on release it slides over the
// whole screen and the route changes underneath it to that same screen.

export type AppKind = "layout" | "booth";

const COVER_MS = 380;
const HREF: Record<AppKind, string> = { layout: "/", booth: "/booth" };

const noop = () => {};
const LayoutPreview = lazy(() =>
  import("./home/HomeScreen").then((m) => ({
    default: () => (
      <div className="h-full w-full bg-bg text-text">
        <m.HomeScreen preview onNew={noop} onUseTemplate={noop} />
      </div>
    ),
  })),
);
const BoothPreview = lazy(() => import("@/booth/Preview"));

/** Each app's plain colour, while its preview loads. */
function Plain({ kind }: { kind: AppKind }) {
  return <div className={`h-full w-full ${kind === "booth" ? "bg-[#1a1310]" : "bg-bg"}`} />;
}

/** The tag's side: peek while pulling, cover on release, then go. */
export function useAppSwitch(to: AppKind) {
  const router = useRouter();
  const [peek, setPeek] = useState(0);
  const [going, setGoing] = useState(false);
  // Load the other app (and its preview) as soon as the tag is touched: it's ready by the
  // time the sheet has covered the screen, and a home that's only looked at loads nothing.
  const [touched, setTouched] = useState(false);
  const ready = useRef(false);
  const prefetch = () => {
    if (ready.current) return;
    ready.current = true;
    setTouched(true);
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
    setTimeout(() => router.push(HREF[to]), COVER_MS);
  }

  const shown = going ? 1 : peek * 0.22;
  const overlay = (
    <div
      aria-hidden
      inert
      className={`pointer-events-none fixed inset-0 overflow-hidden shadow-[-18px_0_40px_rgba(0,0,0,0.35)] ${going ? "z-[60]" : "z-[39]"}`}
      style={{
        transform: `translateX(${(1 - shown) * 100}%)`,
        // Following the finger: no easing; letting go / covering: eased.
        transition: going ? `transform ${COVER_MS}ms cubic-bezier(.4,0,.2,1)` : peek === 0 ? "transform 300ms ease-out" : "none",
        visibility: shown > 0 || peek > 0 ? "visible" : "hidden",
      }}
      data-switch-sheet={to}
    >
      {touched ? <Suspense fallback={<Plain kind={to} />}>{to === "booth" ? <BoothPreview /> : <LayoutPreview />}</Suspense> : <Plain kind={to} />}
    </div>
  );
  return { onProgress, onSwitch, overlay };
}
