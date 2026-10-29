"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Two views of the shoot, picture-in-picture (owner, 2026-10-29): "me" (the big polaroid of
// the cell being shot) and "the frame" (the whole print, everyone in it). One fills the
// screen, the other sits small in a corner: tap it to swap, drag it to another corner (it
// snaps to the nearest; the corner is remembered).

export type ViewKind = "me" | "frame";
type Corner = "tl" | "tr" | "bl" | "br";

const KEY = "ig-layout:booth-pip";
const W = 118;
const H = 150;
const M = 12;

function loadCorner(): Corner {
  try {
    const c = localStorage.getItem(KEY);
    if (c === "tl" || c === "tr" || c === "bl" || c === "br") return c;
  } catch {}
  return "br";
}

export function DualView({ main, onSwap, me, frame, overlay, label }: {
  main: ViewKind;
  onSwap: () => void;
  /** Render a view; `small` when it's the corner one. */
  me: (small: boolean) => ReactNode;
  frame: (small: boolean) => ReactNode;
  /** Over the main view (countdown…). */
  overlay?: ReactNode;
  /** Accessible name of the corner button ("Show the whole frame"…). */
  label: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [corner, setCorner] = useState<Corner>(loadCorner);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const start = useRef<{ px: number; py: number; x: number; y: number; moved: boolean } | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const small = main === "me" ? "frame" : "me";
  const view = (k: ViewKind, isSmall: boolean) => (k === "me" ? me(isSmall) : frame(isSmall));

  const at = (c: Corner) => ({ x: c[1] === "l" ? M : size.w - W - M, y: c[0] === "t" ? M : size.h - H - M });
  const pos = drag ?? at(corner);

  return (
    <div ref={box} className="relative h-full w-full overflow-hidden">
      <div key={main} className="h-full w-full animate-[booth-pop_0.3s_ease-out]">
        {view(main, false)}
      </div>
      {overlay}
      <button
        type="button"
        aria-label={label}
        className={`absolute z-20 touch-none overflow-hidden border-2 border-[#1d1612] bg-[#2a1d16] shadow-[4px_4px_0_#0b0806] ${drag ? "" : "transition-[left,top] duration-200 ease-out"}`}
        style={{ left: pos.x, top: pos.y, width: W, height: H, visibility: size.w ? "visible" : "hidden" }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = at(corner);
          start.current = { px: e.clientX, py: e.clientY, x: p.x, y: p.y, moved: false };
        }}
        onPointerMove={(e) => {
          const s = start.current;
          if (!s) return;
          const dx = e.clientX - s.px;
          const dy = e.clientY - s.py;
          if (!s.moved && Math.hypot(dx, dy) < 6) return;
          s.moved = true;
          setDrag({ x: s.x + dx, y: s.y + dy });
        }}
        onPointerUp={() => {
          const s = start.current;
          start.current = null;
          if (!s?.moved || !drag) {
            setDrag(null);
            onSwap();
            return;
          }
          // Snap to the nearest corner.
          const c: Corner = `${drag.y + H / 2 < size.h / 2 ? "t" : "b"}${drag.x + W / 2 < size.w / 2 ? "l" : "r"}`;
          setCorner(c);
          setDrag(null);
          try {
            localStorage.setItem(KEY, c);
          } catch {}
        }}
        onPointerCancel={() => {
          start.current = null;
          setDrag(null);
        }}
      >
        <span className="pointer-events-none block h-full w-full p-1.5">{view(small, true)}</span>
        <span aria-hidden className="pointer-events-none absolute right-1 bottom-1 flex h-5 w-5 items-center justify-center bg-[#f3e9d6] text-[11px] font-bold text-[#1d1612]">
          ⤢
        </span>
      </button>
    </div>
  );
}
