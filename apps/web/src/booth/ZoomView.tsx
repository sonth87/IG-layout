"use client";

import { useRef, useState, type ReactNode } from "react";
import { mono } from "./ui";

// Zoom on the print while decorating (owner, 2026-10-30): pinch or ctrl / ⌘ + wheel (trackpad
// pinch) zooms around the fingers / pointer, two fingers (or one, once zoomed in — except on
// a cell being placed by hand) pan, "100 %" in the corner resets. Only on this screen, only
// on this device: in a room, everyone has their own zoom. A drag never counts as a tap.
// The content gets `--inv` (1 / zoom) so handles and outlines can keep their screen size.

const MIN = 1;
const MAX = 5;

/** `children` gets the zoom step (1, 2, 3…) to draw sharper as it grows. */
export function ZoomView({ children, label }: { children: (step: number) => ReactNode; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState({ k: 1, x: 0, y: 0 });
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ k: number; x: number; y: number; d: number; cx: number; cy: number } | null>(null);
  const moved = useRef(false);

  /** Zoom to k around a point of the box (px from its centre). */
  function zoomAt(k: number, px: number, py: number, from = z) {
    k = Math.max(MIN, Math.min(MAX, k));
    const s = k / from.k;
    const x = px - (px - from.x) * s;
    const y = py - (py - from.y) * s;
    setZ(k === 1 ? { k: 1, x: 0, y: 0 } : { k, x, y });
  }

  const centre = (cx: number, cy: number) => {
    const r = box.current!.getBoundingClientRect();
    return { x: cx - r.left - r.width / 2, y: cy - r.top - r.height / 2 };
  };

  return (
    <div
      ref={box}
      className="relative h-full w-full touch-none overflow-hidden"
      onWheel={(e) => {
        if (!e.ctrlKey && !e.metaKey && z.k === 1) return;
        e.preventDefault();
        const c = centre(e.clientX, e.clientY);
        if (e.ctrlKey || e.metaKey) zoomAt(z.k * Math.exp(-e.deltaY * 0.01), c.x, c.y);
        else setZ({ ...z, x: z.x - e.deltaX, y: z.y - e.deltaY });
      }}
      onPointerDownCapture={(e) => {
        pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        moved.current = false;
        // Something being placed by hand — a cell (free layout) or a sticker, with its handles —
        // takes one-finger drags; two fingers are always ours.
        const onCell = (e.target as Element).closest("[data-cell], [data-sticker]");
        if (pts.current.size === 2 || (z.k > 1 && !onCell)) {
          const [a, b] = [...pts.current.values()];
          const m = b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : a;
          const c = centre(m.x, m.y);
          gesture.current = { ...z, d: b ? Math.hypot(a.x - b.x, a.y - b.y) : 0, cx: c.x, cy: c.y };
          if (pts.current.size === 2) e.stopPropagation();
        }
      }}
      onPointerMoveCapture={(e) => {
        const p = pts.current.get(e.pointerId);
        if (!p) return;
        p.x = e.clientX;
        p.y = e.clientY;
        const g = gesture.current;
        if (!g) return;
        const [a, b] = [...pts.current.values()];
        const m = b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : a;
        const c = centre(m.x, m.y);
        if (Math.hypot(c.x - g.cx, c.y - g.cy) > 6) moved.current = true;
        const k = b && g.d ? g.k * (Math.hypot(a.x - b.x, a.y - b.y) / g.d) : g.k;
        if (b) moved.current = true;
        const s = Math.max(MIN, Math.min(MAX, k)) / g.k;
        // Zoom around where the fingers started, then follow their middle.
        const x = g.cx - (g.cx - g.x) * s + (c.x - g.cx);
        const y = g.cy - (g.cy - g.y) * s + (c.y - g.cy);
        setZ(k <= MIN ? { k: 1, x: 0, y: 0 } : { k: Math.min(MAX, k), x, y });
        e.stopPropagation();
      }}
      onPointerUpCapture={(e) => {
        pts.current.delete(e.pointerId);
        if (pts.current.size < 2) gesture.current = null;
      }}
      onPointerCancelCapture={(e) => {
        pts.current.delete(e.pointerId);
        gesture.current = null;
      }}
      // A pan or pinch is not a tap on a photo.
      onClickCapture={(e) => {
        if (moved.current) e.stopPropagation();
      }}
      data-zoom={z.k.toFixed(2)}
    >
      <div className="flex h-full w-full items-center justify-center [container-type:size]" style={{ transform: `translate(${z.x}px, ${z.y}px) scale(${z.k})`, transformOrigin: "50% 50%", ["--inv" as string]: 1 / z.k }}>
        {children(Math.max(1, Math.ceil(z.k - 0.15)))}
      </div>
      {z.k > 1.01 && (
        <button
          type="button"
          aria-label={label}
          onClick={() => setZ({ k: 1, x: 0, y: 0 })}
          className={`${mono} absolute top-3 right-3 z-20 border-2 border-[var(--c-ink)] bg-[var(--c-paper)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--c-ink)] shadow-[3px_3px_0_var(--c-shadow)]`}
        >
          ⟲ {Math.round(z.k * 100)}%
        </button>
      )}
    </div>
  );
}
