import type { BoothFrame, FrameCell } from "./frames";

// Booth layouts (D-161, docs/discussions/2026-10-30-booth-khung-theme.md §1): a frame gives
// the sheet, the shots and the straight cells (column / row / grid); the arrangement moves
// them — staggered left / right, scattered like prints on a board, or free (placed by hand)
// — and the shape cuts them. Random arrangements are seeded (🎲 = a new seed) and follow
// rules so they always look right: inside the margins, off the caption, cells overlap only
// at their edges (≤ 12 %) and never over another cell's middle (where the faces are),
// tilted 2–6°.

export type Arrange = "straight" | "stagger" | "scatter" | "free";
export type CellShape = "rect" | "rounded" | "polaroid" | "arch" | "circle" | "heart" | "torn";

export const ARRANGES: Arrange[] = ["straight", "stagger", "scatter", "free"];
export const SHAPES: CellShape[] = ["rect", "rounded", "polaroid", "arch", "circle", "heart", "torn"];

/** A cell with its turn (degrees) and stacking order. */
export type PlacedCell = FrameCell & { rot: number; z: number };

export interface LayoutChoice {
  arrange?: Arrange;
  shape?: CellShape;
  seed?: number;
  /** Free arrangement: the cells as placed by hand. */
  cells?: PlacedCell[];
}

export type Laid = Omit<BoothFrame, "cells"> & { cells: PlacedCell[]; shape: CellShape };

/** Same numbers for the same seed (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);

const MARGIN = 0.03; // of the sheet's short side
const MAX_OVERLAP = 0.12; // of the smaller cell's side
const FACE = 0.3; // half-size of a cell's middle that nothing may cover, as a fraction

/** Corners of a turned cell. */
function corners(c: PlacedCell) {
  const a = (c.rot * Math.PI) / 180;
  const cx = c.x + c.w / 2;
  const cy = c.y + c.h / 2;
  return [
    [-c.w / 2, -c.h / 2],
    [c.w / 2, -c.h / 2],
    [c.w / 2, c.h / 2],
    [-c.w / 2, c.h / 2],
  ].map(([x, y]) => [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)]);
}

function bounds(c: PlacedCell) {
  const p = corners(c);
  const xs = p.map((q) => q[0]);
  const ys = p.map((q) => q[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

/** The middle of a cell (faces), as a box. */
function face(c: PlacedCell) {
  const cx = c.x + c.w / 2;
  const cy = c.y + c.h / 2;
  return { x0: cx - c.w * FACE, y0: cy - c.h * FACE, x1: cx + c.w * FACE, y1: cy + c.h * FACE };
}

type Box = { x0: number; y0: number; x1: number; y1: number };
const meet = (a: Box, b: Box) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

/** Does this cell follow the rules, against the sheet and the cells placed before it? */
export function fits(c: PlacedCell, placed: PlacedCell[], f: Pick<BoothFrame, "width" | "height" | "foot">) {
  const m = Math.min(f.width, f.height) * MARGIN;
  const b = bounds(c);
  if (b.x0 < m || b.y0 < m || b.x1 > f.width - m || b.y1 > f.height - m) return false;
  // Off the caption.
  if (meet(b, { x0: f.foot.x, y0: f.foot.y, x1: f.foot.x + f.foot.w, y1: f.foot.y + f.foot.h }) > 0) return false;
  for (const o of placed) {
    const ob = bounds(o);
    const ov = { x0: Math.max(b.x0, ob.x0), y0: Math.max(b.y0, ob.y0), x1: Math.min(b.x1, ob.x1), y1: Math.min(b.y1, ob.y1) };
    if (ov.x1 <= ov.x0 || ov.y1 <= ov.y0) continue;
    const depth = Math.min(ov.x1 - ov.x0, ov.y1 - ov.y0);
    if (depth > MAX_OVERLAP * Math.min(c.w, c.h, o.w, o.h)) return false;
    if (meet(ov, face(o)) > 0 || meet(ov, face(c)) > 0) return false;
  }
  return true;
}

/** Which way the frame runs: its cells mostly in a column, a row, or a grid. */
function flow(f: BoothFrame): "column" | "row" | "grid" {
  const xs = new Set(f.cells.map((c) => Math.round(c.x)));
  const ys = new Set(f.cells.map((c) => Math.round(c.y)));
  if (xs.size === 1) return "column";
  if (ys.size === 1) return "row";
  return "grid";
}

/** The frame's cells, arranged. Free without hand-placed cells starts from staggered. */
export function layoutFrame(f: BoothFrame, choice: LayoutChoice = {}): Laid {
  const arrange = choice.arrange ?? "straight";
  const shape = choice.shape ?? "rect";
  const base: PlacedCell[] = f.cells.map((c, i) => ({ ...c, rot: 0, z: i }));
  if (arrange === "free" && choice.cells?.length === f.cells.length) return { ...f, shape, cells: choice.cells };
  if (arrange === "straight") return { ...f, shape, cells: base };
  const r = rng(choice.seed ?? 1);
  const dir = flow(f);
  const placed: PlacedCell[] = [];
  base.forEach((c, i) => {
    let got: PlacedCell | null = null;
    // Bolder first; if the rules say no, calmer; straight as a last resort.
    for (let tries = 0; tries < 40 && !got; tries++) {
      const calm = 1 - tries / 40;
      const side = i % 2 ? 1 : -1;
      const tilt = (2 + r() * 4) * calm;
      let cand: PlacedCell;
      if (arrange === "stagger") {
        // Alternate left / right (or up / down), a little bigger so neighbours meet.
        const k = 1 + 0.06 * calm;
        const w = c.w * k;
        const h = c.h * k;
        const shift = (0.06 + r() * 0.05) * calm;
        const dx = dir === "row" ? 0 : side * c.w * shift;
        const dy = dir === "row" ? side * c.h * shift : 0;
        cand = { ...c, x: c.x - (w - c.w) / 2 + dx, y: c.y - (h - c.h) / 2 + dy, w, h, rot: side * tilt, z: i };
      } else {
        // Scattered: each print nudged and turned its own way.
        const k = 1 + (0.02 + r() * 0.06) * calm;
        const w = c.w * k;
        const h = c.h * k;
        const dx = (r() - 0.5) * c.w * 0.16 * calm;
        const dy = (r() - 0.5) * c.h * 0.16 * calm;
        cand = { ...c, x: c.x - (w - c.w) / 2 + dx, y: c.y - (h - c.h) / 2 + dy, w, h, rot: (r() < 0.5 ? -1 : 1) * tilt, z: Math.floor(r() * 100) };
      }
      if (fits(cand, placed, f)) got = cand;
    }
    placed.push(got ?? { ...c });
  });
  return { ...f, shape, cells: placed };
}

/** The cell (if any) at a point of the sheet, the topmost first — taking turns into account. */
export function cellAt(cells: PlacedCell[], x: number, y: number): PlacedCell | undefined {
  return [...cells]
    .sort((a, b) => b.z - a.z)
    .find((c) => {
      const a = (-c.rot * Math.PI) / 180;
      const dx = x - (c.x + c.w / 2);
      const dy = y - (c.y + c.h / 2);
      const lx = dx * Math.cos(a) - dy * Math.sin(a);
      const ly = dx * Math.sin(a) + dy * Math.cos(a);
      return Math.abs(lx) <= c.w / 2 && Math.abs(ly) <= c.h / 2;
    });
}

/** Draws the shape's outline (centred on 0, 0, size w × h) as the current path. */
export function shapePath(c: CanvasRenderingContext2D, shape: CellShape, w: number, h: number, seed = 1, radius = 0) {
  const x = -w / 2;
  const y = -h / 2;
  c.beginPath();
  switch (shape) {
    case "rounded":
      c.roundRect(x, y, w, h, Math.max(radius, Math.min(w, h) * 0.08));
      break;
    case "arch": {
      // A round top that stays inside the box (an elliptic top on wide cells).
      const ry = Math.min(w / 2, h / 2);
      c.moveTo(x, y + h);
      c.lineTo(x, y + ry);
      c.ellipse(0, y + ry, w / 2, ry, 0, Math.PI, 0);
      c.lineTo(x + w, y + h);
      c.closePath();
      break;
    }
    case "circle":
      c.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    case "heart": {
      // Two lobes and a point, filling the box.
      const s = Math.min(w, h * 1.1);
      const sx = w / s;
      const sy = h / s;
      c.moveTo(0, (s * 0.5) * sy);
      c.bezierCurveTo(-s * 0.62 * sx, s * 0.05 * sy, -s * 0.62 * sx, -s * 0.5 * sy, -s * 0.25 * sx, -s * 0.5 * sy);
      c.bezierCurveTo(-s * 0.08 * sx, -s * 0.5 * sy, 0, -s * 0.38 * sy, 0, -s * 0.3 * sy);
      c.bezierCurveTo(0, -s * 0.38 * sy, s * 0.08 * sx, -s * 0.5 * sy, s * 0.25 * sx, -s * 0.5 * sy);
      c.bezierCurveTo(s * 0.62 * sx, -s * 0.5 * sy, s * 0.62 * sx, s * 0.05 * sy, 0, s * 0.5 * sy);
      c.closePath();
      break;
    }
    case "torn": {
      // A torn-paper edge, the same every time for the same seed.
      const r = rng(seed);
      const step = Math.max(8, Math.min(w, h) / 22);
      const jag = step * 0.45;
      c.moveTo(x, y);
      for (let p = step; p < w; p += step) c.lineTo(x + p, y + (r() - 0.5) * jag);
      c.lineTo(x + w, y);
      for (let p = step; p < h; p += step) c.lineTo(x + w + (r() - 0.5) * jag, y + p);
      c.lineTo(x + w, y + h);
      for (let p = w - step; p > 0; p -= step) c.lineTo(x + p, y + h + (r() - 0.5) * jag);
      c.lineTo(x, y + h);
      for (let p = h - step; p > 0; p -= step) c.lineTo(x + (r() - 0.5) * jag, y + p);
      c.closePath();
      break;
    }
    default:
      if (radius > 0) c.roundRect(x, y, w, h, radius);
      else c.rect(x, y, w, h);
  }
}
