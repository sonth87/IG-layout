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

export function DragSheet(props: { title: string; onClose: () => void; children: React.ReactNode; header?: React.ReactNode }) {
  const t = useT();
  const [frac, setFrac] = useState(MID);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ y: number; frac: number; t: number; lastY: number; lastT: number } | null>(null);
  const screen = () => window.innerHeight;

  function onDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, frac, t: e.timeStamp, lastY: e.clientY, lastT: e.timeStamp };
    setDragging(true);
  }
  function onMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    setFrac(Math.max(0.05, Math.min(FULL, d.frac + (d.y - e.clientY) / screen())));
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
    if (now < MID) return setFrac(MID);
    if (v > 0.8) return setFrac(FULL);
    if (v < -0.8) return setFrac(MID);
    setFrac(now - MID < FULL - now ? MID : FULL);
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
      aria-label={props.title}
      className="flex h-full w-full max-w-2xl flex-col rounded-t-[22px] border-t border-border bg-surface shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
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
      <div className="flex shrink-0 items-center justify-between px-5 pb-1">
        <h2 className="text-[15px] font-bold">{props.title}</h2>
        <button type="button" aria-label={t("common.close")} onClick={props.onClose} className="flex h-10 w-10 items-center justify-center">
          <Icon name="close" />
        </button>
      </div>
      {props.header}
      <div className="min-h-0 flex-1 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">{props.children}</div>
    </section>
    </div>
  );
}
