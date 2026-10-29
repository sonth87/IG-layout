"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/store/settings";

// Bottom sheet for browsing content (editor-v2/12 §1): opens at 50 % of the screen, the
// handle drags it between 50 % and 95 %. Released under 20 % it closes, under 50 % it
// springs back to 50 %, above that it settles on 50 % or 95 % (with the flick's speed).
// It sits in the page flow under the canvas, so opening it pushes the canvas up.

const MID = 0.5;
const FULL = 0.95;

/**
 * `onBack`: an inner screen is open (a group's "+N", all emoji): ‹ in the pinned header
 * goes back, and `title` is that screen's (owner, 2026-10-20: back and title must not
 * scroll away).
 */
export function DragSheet(props: { title: string; onClose: () => void; children: React.ReactNode; header?: React.ReactNode; onBack?: () => void }) {
  const t = useT();
  const [frac, setFrac] = useState(MID);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ y: number; frac: number; t: number; lastY: number; lastT: number } | null>(null);
  /** The sheet itself: while dragging it is resized directly, over the canvas (no re-render). */
  const sheetRef = useRef<HTMLElement>(null);
  const screen = () => window.innerHeight;

  function onDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, frac, t: e.timeStamp, lastY: e.clientY, lastT: e.timeStamp };
    setDragging(true);
  }
  function onMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const f = Math.max(0.05, Math.min(FULL, d.frac + (d.y - e.clientY) / screen()));
    if (sheetRef.current) sheetRef.current.style.height = `min(${f * 100}dvh, calc(100dvh - 64px))`;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
  }
  function onUp(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    const now = Math.max(0.05, Math.min(FULL, d.frac + (d.y - e.clientY) / screen()));
    // Upward speed in screen fractions per second (positive = up).
    const v = ((d.lastY - e.clientY) / screen() / Math.max(1, e.timeStamp - d.lastT)) * 1000;
    if (now < 0.2) return props.onClose();
    const target = now < MID ? MID : v > 0.8 ? FULL : v < -0.8 ? MID : now - MID < FULL - now ? MID : FULL;
    // The sheet settles at once; the strip (and the canvas) follows with its transition.
    const el = sheetRef.current;
    if (el) {
      el.style.transition = "height 260ms cubic-bezier(.2,.9,.3,1.15)";
      el.style.height = `min(${target * 100}dvh, calc(100dvh - 64px))`;
      window.setTimeout(() => {
        el.style.transition = "";
        el.style.height = "";
      }, 300);
    }
    setFrac(target);
  }

  return (
    // Full-width strip in the canvas colour; the sheet is centred in it on wide screens.
    <div
      className="relative z-20 flex shrink-0 justify-center bg-(--canvas)"
      style={{
        height: `${frac * 100}dvh`,
        // Never taller than the space under the header.
        maxHeight: "calc(100dvh - 64px)",
        transition: dragging ? "none" : "height 260ms cubic-bezier(.2,.9,.3,1.15)",
      }}
    >
    <section
      ref={sheetRef}
      aria-label={props.title}
      // Pinned to the bottom of its strip: dragged taller, it rises over the canvas; the
      // strip (and the canvas above it) only changes once the finger lifts.
      className="absolute inset-x-0 bottom-0 mx-auto flex h-full w-full max-w-2xl flex-col rounded-t-[22px] border-t border-border bg-surface shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
    >
      <div
        role="separator"
        aria-label={t("sheet.resize")}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ touchAction: "none" }}
        className="flex h-6 shrink-0 cursor-grab items-center justify-center"
      >
        <span className="h-1.5 w-10 rounded-full bg-border-2" />
      </div>
      {/* Pinned header like the colour sheet (D-129): round ‹ · title · round ✕. */}
      <div className="flex shrink-0 items-center gap-2 px-4 pb-2">
        <div className="w-11 shrink-0">
          {props.onBack && (
            <button type="button" aria-label={t("common.back")} onClick={props.onBack} className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 active:scale-95">
              <Icon name="back" size={22} />
            </button>
          )}
        </div>
        <h2 className="min-w-0 flex-1 truncate text-center text-[16px] font-bold">{props.title}</h2>
        <button type="button" aria-label={t("common.close")} onClick={props.onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2 active:scale-95">
          <Icon name="close" size={22} />
        </button>
      </div>
      {props.header}
      <div className="min-h-0 flex-1 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">{props.children}</div>
    </section>
    </div>
  );
}
