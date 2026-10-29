"use client";

import { useEffect, useRef } from "react";

// The hanging tag that switches between IG Layout and the booth (D-151: home screen only).
// A tag on a string from the top edge: it sways, the pointer brushes it, it can be grabbed.
// Pull it down past a threshold (or, if `side`, sideways towards the middle) and let go →
// onSwitch; a short tug only makes it swing (like a lamp's pull cord). A tap or Enter also
// switches. While pulling, onProgress(0…1) lets the page show the other app coming in.
// The string is a Verlet rope (points + distance constraints), drawn into an SVG path; the
// tag follows the last segment. Nothing re-renders per frame.

export interface TagPhysics {
  /** String length, px. */
  length: number;
  /** px / s². */
  gravity: number;
  /** Velocity kept per 1/120 s step (0.97 = loose, 0.995 = keeps swinging). */
  damping: number;
  /** How far past the string's length to pull down, px. */
  threshold: number;
  /** Also switch when pulled sideways towards the middle (this far, px). 0 = off. */
  side: number;
  /** A light breeze so it never fully stops. */
  sway: boolean;
}

export const DEFAULT_TAG: TagPhysics = { length: 96, gravity: 2200, damping: 0.985, threshold: 70, side: 150, sway: true };

const N = 9; // rope points, the first one pinned
const STEP = 1 / 120;
const TAG_W = 96;
const TAG_H = 104;

interface Props {
  label: string;
  /** Small line above the label ("Chuyển sang"). */
  kicker?: string;
  icon?: React.ReactNode;
  /** Distance of the pin from the right edge, px. */
  right?: number;
  physics?: TagPhysics;
  tone?: "light" | "dark";
  onSwitch: () => void;
  onProgress?: (p: number) => void;
}

export function SwitchTag({ label, kicker, icon, right = 64, physics = DEFAULT_TAG, tone = "light", onSwitch, onProgress }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const tag = useRef<HTMLButtonElement>(null);
  const cfg = useRef(physics);
  const cb = useRef({ onSwitch, onProgress });
  useEffect(() => {
    cfg.current = physics;
    cb.current = { onSwitch, onProgress };
  });

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pts = Array.from({ length: N }, () => ({ x: 0, y: 0, px: 0, py: 0 }));
    let anchor = { x: 0, y: 0 };
    const place = () => {
      anchor = { x: innerWidth - right, y: 0 };
      const seg = cfg.current.length / (N - 1);
      pts.forEach((p, i) => {
        p.x = p.px = anchor.x;
        p.y = p.py = anchor.y + i * seg;
      });
    };
    place();
    // A small swing on arrival (towards the middle), so the tag is noticed.
    if (!reduced) pts.forEach((p, i) => (p.px = p.x + (i / N) * 2.5));

    // x, y: where the string's end is held (the pointer minus where on the tag it was grabbed).
    let grab: { id: number; x: number; y: number; ox: number; oy: number; sx: number; sy: number; moved: boolean; armed: boolean } | null = null;
    let hover: { x: number; y: number } | null = null;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let t = 0;

    const progress = () => {
      if (!grab) return 0;
      const c = cfg.current;
      const down = (grab.y - anchor.y - c.length) / c.threshold;
      const side = c.side ? (anchor.x - grab.x) / c.side : 0;
      return Math.max(0, Math.min(1, Math.max(down, side)));
    };

    const step = () => {
      const c = cfg.current;
      const seg = c.length / (N - 1);
      t += STEP;
      const breeze = c.sway && !reduced ? Math.sin(t * 1.3) * 18 + Math.sin(t * 3.1) * 6 : 0;
      for (let i = 1; i < N; i++) {
        const p = pts[i];
        const vx = (p.x - p.px) * c.damping;
        const vy = (p.y - p.py) * c.damping;
        p.px = p.x;
        p.py = p.y;
        p.x += vx + breeze * (i / N) * STEP * STEP;
        p.y += vy + c.gravity * STEP * STEP;
      }
      const end = pts[N - 1];
      if (grab) {
        end.x = grab.x;
        end.y = grab.y;
      }
      // The screen edges are walls: the tag never swings out of sight.
      const wallR = innerWidth - TAG_W / 2 - 6;
      const wallL = TAG_W / 2 + 6;
      for (let k = 0; k < 14; k++) {
        pts[0].x = anchor.x;
        pts[0].y = anchor.y;
        for (let i = 0; i < N - 1; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          // Pulled: the string may stretch a little (it reads as tension), else it's exact.
          const rest = grab ? Math.max(seg, Math.min(d, seg * 1.25)) : seg;
          const f = (d - rest) / d;
          const wa = i === 0 ? 0 : 0.5;
          const wb = grab && i + 1 === N - 1 ? 0 : 1 - wa;
          a.x += dx * f * wa;
          a.y += dy * f * wa;
          b.x -= dx * f * wb;
          b.y -= dy * f * wb;
        }
        if (!grab) end.x = Math.min(wallR, Math.max(wallL, end.x));
      }
    };

    const draw = () => {
      if (!path.current || !tag.current || !svg.current) return;
      let d = `M${pts[0].x},${pts[0].y}`;
      for (let i = 1; i < N - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        d += ` Q${pts[i].x},${pts[i].y} ${mx},${my}`;
      }
      const end = pts[N - 1];
      d += ` L${end.x},${end.y}`;
      path.current.setAttribute("d", d);
      const prev = pts[N - 3];
      const angle = Math.atan2(end.x - prev.x, end.y - prev.y);
      tag.current.style.transform = `translate(${end.x - TAG_W / 2}px, ${end.y - 8}px) rotate(${-angle}rad)`;
    };

    const frame = (now: number) => {
      acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      while (acc >= STEP) {
        step();
        acc -= STEP;
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const el = tag.current!;
    const down = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      const end = pts[N - 1];
      grab = { id: e.pointerId, x: end.x, y: end.y, ox: e.clientX - end.x, oy: e.clientY - end.y, sx: e.clientX, sy: e.clientY, moved: false, armed: false };
      e.preventDefault();
    };
    const move = (e: PointerEvent) => {
      if (grab && e.pointerId === grab.id) {
        grab.x = e.clientX - grab.ox;
        grab.y = e.clientY - grab.oy;
        if (Math.hypot(e.clientX - grab.sx, e.clientY - grab.sy) > 6) grab.moved = true;
        const p = progress();
        cb.current.onProgress?.(p);
        if (p >= 1 !== grab.armed) {
          grab.armed = p >= 1;
          if (grab.armed) navigator.vibrate?.(12);
        }
      }
    };
    const up = (e: PointerEvent) => {
      if (!grab || e.pointerId !== grab.id) return;
      const g = grab;
      grab = null;
      cb.current.onProgress?.(0);
      if (g.armed || !g.moved) {
        // A tap: a small tug so it still feels like pulling the string.
        if (!g.moved) pts[N - 1].py -= 10;
        cb.current.onSwitch();
      }
    };
    // The pointer brushing past the string pushes it (mouse / pen only — touch can't hover).
    const brush = (e: PointerEvent) => {
      if (grab || e.pointerType === "touch") return;
      const prevHover = hover;
      hover = { x: e.clientX, y: e.clientY };
      if (!prevHover) return;
      const vx = hover.x - prevHover.x;
      for (let i = 1; i < N; i++) {
        const p = pts[i];
        if (Math.hypot(p.x - hover.x, p.y - hover.y) < 28) p.px -= vx * 0.35;
      }
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        cb.current.onSwitch();
      }
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("keydown", key);
    addEventListener("pointermove", brush);
    addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("keydown", key);
      removeEventListener("pointermove", brush);
      removeEventListener("resize", place);
    };
  }, [right]);

  const dark = tone === "dark";
  return (
    <>
      <svg ref={svg} className="pointer-events-none fixed inset-0 z-40 h-full w-full overflow-visible" aria-hidden>
        <path ref={path} fill="none" stroke={dark ? "#efe6d6" : "#3d4047"} strokeWidth={1.6} strokeLinecap="round" />
      </svg>
      <button
        ref={tag}
        type="button"
        aria-label={kicker ? `${kicker} ${label}` : label}
        className="fixed left-0 top-0 z-40 flex touch-none select-none flex-col items-center gap-1 rounded-[10px] pb-3 pt-5 shadow-lg outline-offset-4"
        style={{
          width: TAG_W,
          height: TAG_H,
          transformOrigin: `${TAG_W / 2}px 8px`,
          background: dark ? "#efe6d6" : "#1c1a17",
          color: dark ? "#1c1a17" : "#efe6d6",
        }}
      >
        {/* The eyelet the string goes through. */}
        <span className="absolute left-1/2 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2" style={{ borderColor: dark ? "#8a7f70" : "#6b6358", background: dark ? "#15110e" : "#f6f5f2" }} />
        {icon}
        {kicker && <span className="text-[9px] uppercase tracking-[0.12em] opacity-70">{kicker}</span>}
        <span className="text-[13px] font-bold leading-tight">{label}</span>
      </button>
    </>
  );
}
