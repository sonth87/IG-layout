"use client";

import { useEffect, useRef, type ReactNode } from "react";

// The hanging tag that switches between IG Layout and the booth (D-151: home screen only).
// A tag on a string from the top edge: it sways gently, occasional gusts blow it from right
// to left, the pointer brushes it, and it can be grabbed. Pull it down past a threshold (or,
// if `side`, sideways towards the middle) and let go → onSwitch; a short tug only makes it
// swing (like a lamp's pull cord). A tap or Enter also switches. While pulling,
// onProgress(0…1) lets the page show the other app coming in. The string is a Verlet rope
// (points + distance constraints), drawn into an SVG path; the tag follows the last segment.
// Nothing re-renders per frame. Each app gives its own face (TagFaces.tsx).

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

export const DEFAULT_TAG: TagPhysics = { length: 84, gravity: 2200, damping: 0.988, threshold: 64, side: 140, sway: true };

const N = 9; // rope points, the first one pinned
const STEP = 1 / 120;
/** Where the string meets the tag, from its top edge. */
const EYE = 7;

interface Props {
  /** Accessible name ("Switch to Photobooth"). */
  label: string;
  /** What the tag looks like (its own size: width × height). */
  face: ReactNode;
  width: number;
  height: number;
  /** String colour. */
  string?: string;
  /** Distance of the pin from the right edge, px. */
  right?: number;
  physics?: TagPhysics;
  onSwitch: () => void;
  onProgress?: (p: number) => void;
}

export function SwitchTag({ label, face, width, height, string = "#3d4047", right = 60, physics = DEFAULT_TAG, onSwitch, onProgress }: Props) {
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
    if (!reduced) pts.forEach((p, i) => (p.px = p.x + (i / N) * 3.5));

    // x, y: where the string's end is held (the pointer minus where on the tag it was grabbed).
    let grab: { id: number; x: number; y: number; ox: number; oy: number; sx: number; sy: number; moved: boolean; armed: boolean } | null = null;
    let hover: { x: number; y: number } | null = null;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let t = 0;
    // Occasional wind gusts blowing from right to left (-x), on top of the continuous sway.
    let gustStart = 2.0;
    let gustDur = 2.4;
    let gustPeak = 420;

    const progress = () => {
      if (!grab) return 0;
      const c = cfg.current;
      const pull = (grab.y - anchor.y - c.length) / c.threshold;
      const side = c.side ? (anchor.x - grab.x) / c.side : 0;
      return Math.max(0, Math.min(1, Math.max(pull, side)));
    };

    const step = () => {
      const c = cfg.current;
      const seg = c.length / (N - 1);
      t += STEP;
      let breeze = 0;
      if (c.sway && !reduced) {
        if (t > gustStart + gustDur) {
          gustStart = t + 4.5 + Math.random() * 4.5;
          gustDur = 2.0 + Math.random() * 1.2;
          gustPeak = 380 + Math.random() * 140;
        }
        const idle = Math.sin(t * 1.8) * 110 + Math.sin(t * 3.1) * 55 + Math.cos(t * 0.95) * 40;
        let gust = 0;
        if (t >= gustStart && t <= gustStart + gustDur) {
          const u = (t - gustStart) / gustDur;
          const env = Math.sin(Math.PI * u) ** 2;
          // Wind from right to left (-x) with natural flutter ripples.
          gust = -env * gustPeak * (0.65 + 0.35 * Math.sin(t * 5.4) + 0.2 * Math.sin(t * 8.7));
        }
        breeze = idle + gust;
      }
      for (let i = 1; i < N; i++) {
        const p = pts[i];
        const vx = (p.x - p.px) * c.damping;
        const vy = (p.y - p.py) * c.damping;
        p.px = p.x;
        p.py = p.y;
        const wind = breeze * Math.pow(i / (N - 1), 1.2);
        p.x += vx + wind * STEP * STEP;
        p.y += vy + c.gravity * STEP * STEP;
      }
      const end = pts[N - 1];
      if (grab) {
        end.x = grab.x;
        end.y = grab.y;
      }
      // The screen edges are walls: the tag never swings out of sight.
      const wallR = innerWidth - width / 2 - 6;
      const wallL = width / 2 + 6;
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
      if (!path.current || !tag.current) return;
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
      tag.current.style.transform = `translate(${end.x - width / 2}px, ${end.y - EYE}px) rotate(${-angle}rad)`;
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
    const pdown = (e: PointerEvent) => {
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
    // Only the string, not the tag: a pointer resting on the tag must not make it bounce.
    const brush = (e: PointerEvent) => {
      if (grab || e.pointerType === "touch") return;
      const prevHover = hover;
      hover = { x: e.clientX, y: e.clientY };
      if (!prevHover || el.contains(e.target as Node)) return;
      const vx = Math.max(-12, Math.min(12, hover.x - prevHover.x));
      for (let i = 1; i < N - 1; i++) {
        const p = pts[i];
        if (Math.hypot(p.x - hover.x, p.y - hover.y) < 18) p.px -= vx * 0.2;
      }
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        cb.current.onSwitch();
      }
    };
    el.addEventListener("pointerdown", pdown);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("keydown", key);
    addEventListener("pointermove", brush);
    addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", pdown);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("keydown", key);
      removeEventListener("pointermove", brush);
      removeEventListener("resize", place);
    };
  }, [right, width]);

  return (
    <>
      <svg className="pointer-events-none fixed inset-0 z-40 h-full w-full overflow-visible" aria-hidden>
        {/* A faint shadow keeps the string visible over light and dark content. */}
        <path ref={path} fill="none" stroke={string} strokeWidth={1.6} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 1px rgba(0,0,0,0.45))" }} />
      </svg>
      <button
        ref={tag}
        type="button"
        aria-label={label}
        title={label}
        className="fixed top-0 left-0 z-40 touch-none select-none outline-offset-4"
        style={{ width, height, transformOrigin: `${width / 2}px ${EYE}px`, filter: "drop-shadow(2px 4px 4px rgba(0,0,0,0.35))" }}
      >
        {face}
      </button>
    </>
  );
}
