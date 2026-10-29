import type { BoothFrame, FrameCell } from "./frames";
import { rng, shapePath, type CellShape } from "./layout";

// Booth decorations drawn by code (D-161 step 2, docs/discussions/2026-10-30-booth-khung-
// theme.md §2): they follow the layout — a vine climbs the margin and dips into the gaps
// between the cells, lights drape across the top, neon traces each cell's own shape.
// Scope "print" draws one across the whole print (default); "cells" draws the same on every
// cell, turned with it (synced: one setting, every cell). Seeded: 🎲 = a new seed. Front-
// layer pieces never land on a cell's middle (the faces); paths run along the edges.

export type DecorKind = "vine" | "garland" | "ribbon" | "lights" | "neon" | "fireworks" | "sparklers" | "stars" | "moon" | "confetti";
export const DECOR_KINDS: DecorKind[] = ["vine", "garland", "ribbon", "lights", "neon", "fireworks", "sparklers", "stars", "moon", "confetti"];

export interface Decor {
  kind: DecorKind;
  seed: number;
  scope: "print" | "cells";
  /** 1 few · 2 some · 3 many. */
  density: 1 | 2 | 3;
  /** Behind the photos or over them (default: fireworks behind, the rest over). */
  layer?: "back" | "front";
  /** Own colours; default: the kind's palette. */
  colors?: string[];
}

export const PALETTES: Record<DecorKind, string[]> = {
  vine: ["#3f7d3a", "#5c9a45", "#86b75a", "#2f5f2d"],
  garland: ["#f29bb4", "#ffd36e", "#ffffff", "#c5a3ff"],
  ribbon: ["#d8394f", "#f5c6cf"],
  lights: ["#ffd36e", "#ff8a8a", "#8ad4ff", "#b6ff8a", "#ffb3f1"],
  neon: ["#ff4fd8", "#4ff3ff"],
  fireworks: ["#ffd36e", "#ff6b8a", "#7ad7ff", "#c8a2ff"],
  sparklers: ["#fff3c4", "#ffcf6e"],
  stars: ["#ffe28a", "#ffffff"],
  moon: ["#fff2c2", "#ffe28a"],
  confetti: ["#ff6b8a", "#ffd36e", "#6fd3c1", "#8aa8ff", "#ffffff"],
};

export function defaultLayer(kind: DecorKind) {
  return kind === "fireworks" ? "back" : "front";
}

type Pt = { x: number; y: number };
type Box = { x0: number; y0: number; x1: number; y1: number };
type Sheet = Pick<BoothFrame, "width" | "height" | "foot"> & { cells: FrameCell[]; shape?: CellShape };

/** Draw the decorations of one layer. */
export function drawDecor(c: CanvasRenderingContext2D, f: Sheet, list: Decor[] | undefined, layer: "back" | "front") {
  for (const d of list ?? []) {
    if ((d.layer ?? defaultLayer(d.kind)) !== layer) continue;
    const colors = d.colors?.length ? d.colors : PALETTES[d.kind];
    // Sized to read on a phone screen and in print.
    const unit = (Math.min(f.width, f.height) / 600) * 1.7;
    c.save();
    if (d.scope === "cells") {
      f.cells.forEach((cell, i) => {
        c.save();
        c.translate(cell.x + cell.w / 2, cell.y + cell.h / 2);
        if (cell.rot) c.rotate((cell.rot * Math.PI) / 180);
        // Same seed on every cell: the same piece, synced.
        cellPiece(c, d, colors, cell.w, cell.h, unit, f.shape ?? "rect", i);
        c.restore();
      });
    } else printPiece(c, d, colors, f, unit);
    c.restore();
  }
}

// ---- the whole print ------------------------------------------------------------------

function faces(f: Sheet): Box[] {
  return f.cells.map((cell) => {
    const cx = cell.x + cell.w / 2;
    const cy = cell.y + cell.h / 2;
    return { x0: cx - cell.w * 0.32, y0: cy - cell.h * 0.32, x1: cx + cell.w * 0.32, y1: cy + cell.h * 0.32 };
  });
}

/** Cells' outer box. */
function hull(f: Sheet): Box {
  return {
    x0: Math.min(...f.cells.map((c) => c.x)),
    y0: Math.min(...f.cells.map((c) => c.y)),
    x1: Math.max(...f.cells.map((c) => c.x + c.w)),
    y1: Math.max(...f.cells.map((c) => c.y + c.h)),
  };
}

/** A free spot for a round piece of radius r: not on a face (over the photos) or outside
 * the photos (behind them, so it shows), not on the caption's text. */
function spot(r: () => number, f: Sheet, rad: number, front: boolean): Pt | null {
  // No room behind (cells everywhere) → over the photos, off the faces; still none → smaller.
  return place(r, f, rad, front) ?? (front ? null : place(r, f, rad, true)) ?? place(r, f, rad / 2, true);
}

function place(r: () => number, f: Sheet, rad: number, front: boolean): Pt | null {
  const cells = f.cells.map((c) => ({ x0: c.x + rad, y0: c.y + rad, x1: c.x + c.w - rad, y1: c.y + c.h - rad }));
  const block = [...(front ? faces(f) : cells), { x0: f.foot.x + f.foot.w * 0.15, y0: f.foot.y + f.foot.h * 0.2, x1: f.foot.x + f.foot.w * 0.85, y1: f.foot.y + f.foot.h * 0.8 }];
  for (let i = 0; i < 30; i++) {
    const p = { x: rad + r() * (f.width - rad * 2), y: rad + r() * (f.height - rad * 2) };
    if (!block.some((b) => p.x + rad > b.x0 && p.x - rad < b.x1 && p.y + rad > b.y0 && p.y - rad < b.y1)) return p;
  }
  return null;
}

/** The route along the margins: up the left side (dipping into the gaps between rows),
 * across the top, a way down the right side — "from one end of the print to the other". */
function marginRoute(f: Sheet, r: () => number): Pt[] {
  const h = hull(f);
  const left = Math.max(10, h.x0 * 0.55);
  const right = Math.min(f.width - 10, f.width - (f.width - h.x1) * 0.55);
  const top = Math.max(10, h.y0 * 0.55);
  const bottom = h.y1;
  // Gaps between rows: where the vine can lean in.
  const rows = [...new Set(f.cells.map((c) => Math.round(c.y + c.h)))].sort((a, b) => a - b).slice(0, -1);
  const pts: Pt[] = [{ x: left, y: bottom }];
  for (const y of [...rows].reverse()) pts.push({ x: left + (h.x0 - left) * (0.8 + r() * 0.4), y: y + 8 });
  pts.push({ x: left, y: top + (bottom - top) * 0.08 }, { x: left + (right - left) * 0.08, y: top });
  for (let k = 1; k <= 3; k++) pts.push({ x: left + ((right - left) * k) / 4, y: top + (r() - 0.5) * top * 0.6 });
  pts.push({ x: right - (right - left) * 0.06, y: top }, { x: right, y: top + (bottom - top) * 0.1 });
  for (const y of rows.slice(0, Math.ceil(rows.length / 2))) pts.push({ x: right - (right - h.x1) * (0.8 + r() * 0.4), y: y + 8 });
  pts.push({ x: right, y: top + (bottom - top) * 0.55 });
  return pts;
}

function printPiece(c: CanvasRenderingContext2D, d: Decor, colors: string[], f: Sheet, unit: number) {
  const r = rng(d.seed);
  const front = (d.layer ?? defaultLayer(d.kind)) === "front";
  const n = [0, 6, 12, 22][d.density];
  switch (d.kind) {
    case "vine":
    case "garland":
      vine(c, sample(marginRoute(f, r)), r, colors, unit, d.kind === "garland", d.density);
      break;
    case "ribbon": {
      const route = marginRoute(f, r);
      ribbon(c, sample(route.slice(0, Math.ceil(route.length * 0.7))), colors, unit);
      bow(c, route[Math.floor(route.length * 0.45)], colors, unit * 1.2);
      break;
    }
    case "lights": {
      const h = hull(f);
      const top = Math.max(12, h.y0 * 0.5);
      swags(c, { x: 6, y: top }, { x: f.width - 6, y: top }, 2 + d.density, Math.max(14, h.y0 * 0.6), colors, unit, r, true);
      break;
    }
    case "neon": {
      const h = hull(f);
      const pad = 14 * unit;
      c.save();
      c.translate((h.x0 + h.x1) / 2, (h.y0 + h.y1) / 2);
      neonStroke(c, () => shapePath(c, "rounded", h.x1 - h.x0 + pad * 2, h.y1 - h.y0 + pad * 2, 1, 18 * unit), colors[0], unit * 1.2);
      c.restore();
      for (let i = 0; i < d.density; i++) {
        const p = spot(r, f, 26 * unit, front);
        if (p) {
          c.save();
          c.translate(p.x, p.y);
          c.rotate((r() - 0.5) * 0.5);
          neonStroke(c, () => (r() < 0.5 ? heart(c, 22 * unit) : starPath(c, 22 * unit, 5)), colors[(i + 1) % colors.length], unit);
          c.restore();
        }
      }
      break;
    }
    case "fireworks":
      for (let i = 0; i < Math.max(2, n / 4); i++) {
        const p = spot(r, f, 60 * unit, front);
        if (p) burst(c, p, (40 + r() * 50) * unit, colors[i % colors.length], r, unit);
      }
      break;
    case "sparklers":
      for (let i = 0; i < Math.max(2, n / 5); i++) {
        const p = spot(r, f, 34 * unit, front);
        if (p) sparkler(c, p, 30 * unit, (r() - 0.5) * 0.9, colors, r, unit);
      }
      break;
    case "stars":
      for (let i = 0; i < n * 2; i++) {
        const s = (5 + r() * 12) * unit;
        const p = spot(r, f, s, front);
        if (p) twinkle(c, p, s, colors[i % colors.length], r() < 0.6 ? 4 : 5);
      }
      break;
    case "moon": {
      const h = hull(f);
      const p = spot(r, f, 40 * unit, front) ?? { x: h.x1, y: h.y0 };
      crescent(c, p, 34 * unit, colors[0]);
      for (let i = 0; i < n; i++) {
        const s = (4 + r() * 8) * unit;
        const q = spot(r, f, s, front);
        if (q) twinkle(c, q, s, colors[1] ?? colors[0], 4);
      }
      break;
    }
    case "confetti":
      for (let i = 0; i < n * 4; i++) {
        const s = (5 + r() * 7) * unit;
        const p = spot(r, f, s, front);
        if (p) bit(c, p, s, colors[Math.floor(r() * colors.length)], r);
      }
      break;
  }
}

// ---- one cell (centred on 0, 0, turned with the cell) ---------------------------------

function cellPiece(c: CanvasRenderingContext2D, d: Decor, colors: string[], w: number, h: number, unit: number, shape: CellShape, i: number) {
  const r = rng(d.seed);
  const L = -w / 2;
  const T = -h / 2;
  const s = Math.min(w, h);
  const k = s / 260; // pieces scale with the cell
  switch (d.kind) {
    case "vine":
    case "garland":
      // Hugging the top-left corner: up the left edge and along the top.
      vine(c, sample([{ x: L, y: T + h * 0.7 }, { x: L - 4 * k, y: T + h * 0.3 }, { x: L + w * 0.08, y: T - 2 * k }, { x: L + w * 0.55, y: T + 3 * k }]), r, colors, k * 0.9, d.kind === "garland", d.density);
      break;
    case "ribbon":
      bow(c, { x: 0, y: T }, colors, k * 1.1);
      break;
    case "lights":
      swags(c, { x: L, y: T }, { x: L + w, y: T }, 1 + d.density, s * 0.12, colors, k, r, false);
      break;
    case "neon":
      neonStroke(c, () => shapePath(c, shape, w + 14 * k, h + 14 * k, i + 1, 10 * k), colors[i % colors.length], k);
      break;
    case "fireworks":
      burst(c, { x: L + w * 0.85, y: T + h * 0.1 }, s * 0.35, colors[i % colors.length], r, k);
      break;
    case "sparklers":
      sparkler(c, { x: L + w * 0.9, y: T + h * 0.9 }, 34 * k, -0.5, colors, r, k);
      break;
    case "stars":
      for (let j = 0; j < 2 + d.density * 2; j++) {
        const corner = j % 2 ? { x: L + w, y: T } : { x: L, y: T + h };
        twinkle(c, { x: corner.x + (r() - 0.5) * w * 0.25, y: corner.y + (r() - 0.5) * h * 0.25 }, (6 + r() * 10) * k, colors[j % colors.length], j % 3 ? 4 : 5);
      }
      break;
    case "moon":
      crescent(c, { x: L + w * 0.9, y: T + h * 0.08 }, 30 * k, colors[0]);
      break;
    case "confetti":
      for (let j = 0; j < 4 + d.density * 4; j++) {
        // Around the edges, not the middle.
        const t = r();
        const side = Math.floor(r() * 4);
        const p = side === 0 ? { x: L + t * w, y: T } : side === 1 ? { x: L + w, y: T + t * h } : side === 2 ? { x: L + t * w, y: T + h } : { x: L, y: T + t * h };
        bit(c, p, (5 + r() * 6) * k, colors[Math.floor(r() * colors.length)], r);
      }
      break;
  }
}

// ---- pieces ----------------------------------------------------------------------------

/** Points every few px along a smooth (Catmull-Rom) curve through `pts`, with direction. */
function sample(pts: Pt[]): (Pt & { a: number })[] {
  const out: (Pt & { a: number })[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const steps = Math.max(4, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 4));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c2: number, d: number) => 0.5 * (2 * b + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d) * t2 + (-a + 3 * b - 3 * c2 + d) * t3);
      out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y), a: 0 });
    }
  }
  out.push({ ...pts[pts.length - 1], a: 0 });
  for (let i = 0; i < out.length; i++) {
    const a = out[Math.max(0, i - 1)];
    const b = out[Math.min(out.length - 1, i + 1)];
    out[i].a = Math.atan2(b.y - a.y, b.x - a.x);
  }
  return out;
}

function vine(c: CanvasRenderingContext2D, path: (Pt & { a: number })[], r: () => number, colors: string[], unit: number, flowers: boolean, density: number) {
  if (path.length < 2) return;
  // Stem, slightly thicker at the start.
  c.lineCap = "round";
  c.strokeStyle = colors[3] ?? colors[0];
  for (let i = 1; i < path.length; i++) {
    c.lineWidth = (3.2 - (2 * i) / path.length) * unit;
    c.beginPath();
    c.moveTo(path[i - 1].x, path[i - 1].y);
    c.lineTo(path[i].x, path[i].y);
    c.stroke();
  }
  // Leaves on alternate sides; now and then a tendril curl; flowers for a garland.
  const every = Math.max(3, Math.round(9 / density));
  for (let i = 2; i < path.length - 1; i += every) {
    const p = path[i];
    const side = (i / every) % 2 ? 1 : -1;
    const size = (11 + r() * 8) * unit;
    leaf(c, p, p.a + side * (0.9 + r() * 0.5), size, colors[Math.floor(r() * Math.min(3, colors.length))]);
    if (r() < 0.12) curl(c, p, p.a - side * 1.2, 9 * unit, colors[3] ?? colors[0], unit);
    if (flowers && r() < 0.45) flower(c, { x: p.x + Math.cos(p.a - side * 1.4) * 5 * unit, y: p.y + Math.sin(p.a - side * 1.4) * 5 * unit }, (6 + r() * 5) * unit, colors[Math.floor(r() * colors.length)], r);
  }
}

function leaf(c: CanvasRenderingContext2D, p: Pt, a: number, size: number, color: string) {
  c.save();
  c.translate(p.x, p.y);
  c.rotate(a);
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(size * 0.5, -size * 0.45, size, 0);
  c.quadraticCurveTo(size * 0.5, size * 0.45, 0, 0);
  c.fill();
  c.strokeStyle = "rgba(255,255,255,0.35)";
  c.lineWidth = Math.max(0.6, size * 0.06);
  c.beginPath();
  c.moveTo(size * 0.1, 0);
  c.lineTo(size * 0.85, 0);
  c.stroke();
  c.restore();
}

function curl(c: CanvasRenderingContext2D, p: Pt, a: number, size: number, color: string, unit: number) {
  c.save();
  c.translate(p.x, p.y);
  c.rotate(a);
  c.strokeStyle = color;
  c.lineWidth = 1.2 * unit;
  c.beginPath();
  for (let t = 0; t < 4 * Math.PI; t += 0.2) {
    const rr = size * (1 - t / (4 * Math.PI));
    const x = size + Math.cos(t + Math.PI) * rr;
    const y = Math.sin(t + Math.PI) * rr;
    if (t === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.stroke();
  c.restore();
}

function flower(c: CanvasRenderingContext2D, p: Pt, size: number, color: string, r: () => number) {
  c.save();
  c.translate(p.x, p.y);
  c.rotate(r() * Math.PI);
  c.fillStyle = color;
  for (let k = 0; k < 5; k++) {
    c.rotate((Math.PI * 2) / 5);
    c.beginPath();
    c.ellipse(size * 0.55, 0, size * 0.55, size * 0.36, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#ffcf4d";
  c.beginPath();
  c.arc(0, 0, size * 0.3, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

/** A band along the path that seems to twist (its width breathes), darker inside a twist. */
function ribbon(c: CanvasRenderingContext2D, path: (Pt & { a: number })[], colors: string[], unit: number) {
  const W = 9 * unit;
  for (let i = 1; i < path.length; i++) {
    const p = path[i - 1];
    const q = path[i];
    const twist = Math.cos(i / 9);
    const w = W * (0.25 + 0.75 * Math.abs(twist));
    const nx = -Math.sin(q.a);
    const ny = Math.cos(q.a);
    c.fillStyle = twist > 0 ? colors[0] : shade(colors[0], -0.25);
    c.beginPath();
    c.moveTo(p.x + nx * w, p.y + ny * w);
    c.lineTo(q.x + nx * w, q.y + ny * w);
    c.lineTo(q.x - nx * w, q.y - ny * w);
    c.lineTo(p.x - nx * w, p.y - ny * w);
    c.fill();
  }
}

function bow(c: CanvasRenderingContext2D, p: Pt, colors: string[], unit: number) {
  c.save();
  c.translate(p.x, p.y);
  const s = 22 * unit;
  c.fillStyle = colors[0];
  for (const side of [-1, 1]) {
    // Loop.
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(side * s * 1.4, -s * 1.1, side * s * 1.6, s * 0.5, 0, 0);
    c.fill();
    // Tail.
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(side * s * 0.7, s * 1.4);
    c.lineTo(side * s * 0.45, s * 1.25);
    c.lineTo(side * s * 0.3, s * 1.5);
    c.lineTo(side * s * 0.05, s * 0.3);
    c.fill();
  }
  c.fillStyle = shade(colors[0], -0.2);
  c.beginPath();
  c.ellipse(0, 0, s * 0.28, s * 0.32, 0, 0, Math.PI * 2);
  c.fill();
  if (colors[1]) {
    c.fillStyle = colors[1];
    c.globalAlpha = 0.5;
    c.beginPath();
    c.ellipse(-s * 0.6, -s * 0.25, s * 0.25, s * 0.12, -0.5, 0, Math.PI * 2);
    c.ellipse(s * 0.6, -s * 0.25, s * 0.25, s * 0.12, 0.5, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;
  }
  c.restore();
}

/** Strings sagging between a and b in `count` swags, with glowing bulbs. */
function swags(c: CanvasRenderingContext2D, a: Pt, b: Pt, count: number, sag: number, colors: string[], unit: number, r: () => number, bulbs: boolean) {
  const span = (b.x - a.x) / count;
  for (let k = 0; k < count; k++) {
    const x0 = a.x + span * k;
    const x1 = x0 + span;
    const pts: Pt[] = [];
    for (let t = 0; t <= 1.0001; t += 0.05) pts.push({ x: x0 + span * t, y: a.y + (b.y - a.y) * ((x0 + span * t - a.x) / (b.x - a.x)) + Math.sin(Math.PI * t) * sag });
    c.strokeStyle = "rgba(40,40,40,0.75)";
    c.lineWidth = 1.2 * unit;
    c.beginPath();
    pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
    c.stroke();
    const n = Math.max(3, Math.round(span / (26 * unit)));
    for (let i = 1; i < n; i++) {
      const p = pts[Math.round((i / n) * (pts.length - 1))];
      const color = colors[(k * n + i) % colors.length];
      if (bulbs) {
        const g = c.createRadialGradient(p.x, p.y + 4 * unit, 0, p.x, p.y + 4 * unit, 14 * unit);
        g.addColorStop(0, color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.globalAlpha = 0.55;
        c.fillStyle = g;
        c.beginPath();
        c.arc(p.x, p.y + 4 * unit, 14 * unit, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;
      }
      c.fillStyle = color;
      c.beginPath();
      c.ellipse(p.x, p.y + 4 * unit, 3.2 * unit, 4.6 * unit, (r() - 0.5) * 0.4, 0, Math.PI * 2);
      c.fill();
    }
    void x1;
  }
}

function neonStroke(c: CanvasRenderingContext2D, path: () => void, color: string, unit: number) {
  c.save();
  c.lineJoin = "round";
  c.shadowColor = color;
  for (const [w, blur, col] of [
    [9, 24, color],
    [4.5, 10, color],
    [1.6, 0, "#ffffff"],
  ] as const) {
    c.shadowBlur = blur * unit;
    c.strokeStyle = col;
    c.lineWidth = w * unit;
    path();
    c.stroke();
  }
  c.restore();
}

function heart(c: CanvasRenderingContext2D, s: number) {
  shapePath(c, "heart", s * 2, s * 1.8);
}

function starPath(c: CanvasRenderingContext2D, s: number, points: number) {
  c.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 ? s * 0.45 : s;
    const a = (i * Math.PI) / points - Math.PI / 2;
    if (i) c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  c.closePath();
}

function twinkle(c: CanvasRenderingContext2D, p: Pt, s: number, color: string, points: 4 | 5) {
  c.save();
  c.translate(p.x, p.y);
  c.fillStyle = color;
  c.shadowColor = color;
  c.shadowBlur = s * 0.8;
  if (points === 4) {
    c.beginPath();
    c.moveTo(0, -s);
    c.quadraticCurveTo(0, 0, s, 0);
    c.quadraticCurveTo(0, 0, 0, s);
    c.quadraticCurveTo(0, 0, -s, 0);
    c.quadraticCurveTo(0, 0, 0, -s);
  } else starPath(c, s, 5);
  c.fill();
  c.restore();
}

function crescent(c: CanvasRenderingContext2D, p: Pt, s: number, color: string) {
  c.save();
  c.translate(p.x, p.y);
  c.shadowColor = color;
  c.shadowBlur = s * 0.6;
  c.fillStyle = color;
  c.beginPath();
  c.arc(0, 0, s, Math.PI * 0.35, Math.PI * 1.65, false);
  c.arc(s * 0.38, -s * 0.12, s * 0.82, Math.PI * 1.45, Math.PI * 0.55, true);
  c.closePath();
  c.fill();
  c.restore();
}

function burst(c: CanvasRenderingContext2D, p: Pt, R: number, color: string, r: () => number, unit: number) {
  c.save();
  c.translate(p.x, p.y);
  const rays = 18 + Math.floor(r() * 10);
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + r() * 0.1;
    const len = R * (0.7 + r() * 0.3);
    const g = c.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, color);
    g.addColorStop(1, "#ffffff");
    c.strokeStyle = g;
    c.lineWidth = 1.6 * unit;
    c.beginPath();
    c.moveTo(Math.cos(a) * len * 0.25, Math.sin(a) * len * 0.25);
    // A slight droop, like falling sparks.
    c.quadraticCurveTo(Math.cos(a) * len * 0.7, Math.sin(a) * len * 0.7, Math.cos(a) * len, Math.sin(a) * len + len * 0.08);
    c.stroke();
    c.fillStyle = color;
    c.beginPath();
    c.arc(Math.cos(a) * len, Math.sin(a) * len + len * 0.08, 1.8 * unit, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

function sparkler(c: CanvasRenderingContext2D, p: Pt, s: number, tilt: number, colors: string[], r: () => number, unit: number) {
  c.save();
  c.translate(p.x, p.y);
  c.rotate(tilt);
  // The wire.
  c.strokeStyle = "#8a8a8a";
  c.lineWidth = 2 * unit;
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(0, s * 1.6);
  c.stroke();
  // The glowing head and its broken sparks.
  c.shadowColor = colors[1] ?? colors[0];
  c.shadowBlur = 14 * unit;
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(0, 0, 3.5 * unit, 0, Math.PI * 2);
  c.fill();
  c.lineWidth = 1.1 * unit;
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const len = s * (0.35 + r() * 0.75);
    c.strokeStyle = colors[i % colors.length];
    c.beginPath();
    c.moveTo(0, 0);
    const mx = Math.cos(a) * len * 0.55 + (r() - 0.5) * 4 * unit;
    const my = Math.sin(a) * len * 0.55 + (r() - 0.5) * 4 * unit;
    c.lineTo(mx, my);
    c.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    c.stroke();
  }
  c.restore();
}

function bit(c: CanvasRenderingContext2D, p: Pt, s: number, color: string, r: () => number) {
  c.save();
  c.translate(p.x, p.y);
  c.rotate(r() * Math.PI);
  c.fillStyle = color;
  if (r() < 0.55) c.fillRect(-s / 2, -s / 4, s, s / 2);
  else {
    c.beginPath();
    c.arc(0, 0, s / 2.6, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

/** A colour a little darker (k < 0) or lighter. */
function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}
