import type { FrameStyle } from "@/lib/project/types";

// Layouts of the "New slide" sheet (editor-v2/05 §5): each one becomes a layout block
// covering the new slide, with every cell empty. Data only (D-49): adding one = adding
// an entry. Coordinates are relative to the slide (0..1).

export interface SlideCell {
  x: number;
  /** Omitted: centred vertically. */
  y?: number;
  w: number;
  /** Omitted with `square`: the height that makes the cell square on this slide. */
  h?: number;
  /** Square cell, centred vertically when `y` is omitted. */
  square?: boolean;
  rotation?: number;
  frame?: FrameStyle;
  /** Photo border, relative to slide width. */
  border?: number;
  shadow?: boolean;
}

export interface SlideLayout {
  id: string;
  kind: "layout" | "grid";
  cells: SlideCell[];
}

/** Gap between grid cells (white lines), relative to slide width. Outer edges have none. */
export const GRID_LINE = 0.008;

/** Cells of a grid given as rows: [height, [widths…]] (each list sums to 1). */
function rows(spec: [number, number[]][]): SlideCell[] {
  const out: SlideCell[] = [];
  let y = 0;
  for (const [h, widths] of spec) {
    let x = 0;
    for (const w of widths) {
      out.push({ x, y, w, h });
      x += w;
    }
    y += h;
  }
  return out;
}

/** Cells of a grid given as columns: [width, [heights…]]. */
function cols(spec: [number, number[]][]): SlideCell[] {
  return rows(spec).map((c) => ({ x: c.y!, y: c.x, w: c.h!, h: c.w }));
}

const even = (n: number) => Array.from({ length: n }, () => 1 / n);
/** n × m evenly divided. */
const grid = (c: number, r: number) => rows(even(r).map((h) => [h, even(c)] as [number, number[]]));

export const SLIDE_LAYOUTS: SlideLayout[] = [
  { id: "l-margin", kind: "layout", cells: [{ x: 0.08, y: 0.08, w: 0.84, h: 0.84 }] },
  {
    id: "l-diagonal",
    kind: "layout",
    cells: [
      { x: 0.06, y: 0.06, w: 0.56, h: 0.5 },
      { x: 0.38, y: 0.44, w: 0.56, h: 0.5 },
    ],
  },
  {
    id: "l-pair",
    kind: "layout",
    cells: [
      { x: 0.06, y: 0.2, w: 0.42, h: 0.6 },
      { x: 0.52, y: 0.2, w: 0.42, h: 0.6 },
    ],
  },
  {
    id: "l-stack",
    kind: "layout",
    cells: [
      { x: 0.1, y: 0.06, w: 0.8, h: 0.42 },
      { x: 0.1, y: 0.52, w: 0.8, h: 0.42 },
    ],
  },
  { id: "l-landscape", kind: "layout", cells: [{ x: 0.08, y: 0.3, w: 0.84, h: 0.4 }] },
  { id: "l-square", kind: "layout", cells: [{ x: 0.15, w: 0.7, square: true }] },
  { id: "l-mat", kind: "layout", cells: [{ x: 0.1, y: 0.1, w: 0.8, h: 0.8, frame: "white", shadow: true }] },
  {
    id: "l-mat-2",
    kind: "layout",
    cells: [
      { x: 0.12, y: 0.06, w: 0.76, h: 0.42, frame: "white", shadow: true },
      { x: 0.12, y: 0.52, w: 0.76, h: 0.42, frame: "white", shadow: true },
    ],
  },
  { id: "l-bleed-border", kind: "layout", cells: [{ x: 0.03, y: 0.03, w: 0.94, h: 0.94 }] },
  { id: "l-bleed", kind: "layout", cells: [{ x: 0, y: 0, w: 1, h: 1 }] },
  { id: "l-polaroid", kind: "layout", cells: [{ x: 0.15, y: 0.12, w: 0.7, h: 0.74, frame: "polaroid", shadow: true, rotation: -3 }] },
  {
    id: "l-black-2",
    kind: "layout",
    cells: [
      { x: 0.1, y: 0.06, w: 0.8, h: 0.42, frame: "black" },
      { x: 0.1, y: 0.52, w: 0.8, h: 0.42, frame: "black" },
    ],
  },
];

const t = 2 / 3;
const s = 1 / 3;
export const SLIDE_GRIDS: SlideLayout[] = (
  [
    ["g-2v", grid(2, 1)],
    ["g-2h", grid(1, 2)],
    ["g-3r", grid(1, 3)],
    ["g-3c", grid(3, 1)],
    ["g-l1r2", cols([[0.6, [1]], [0.4, [0.5, 0.5]]])],
    ["g-l2r1", cols([[0.4, [0.5, 0.5]], [0.6, [1]]])],
    ["g-t1b2", rows([[0.6, [1]], [0.4, [0.5, 0.5]]])],
    ["g-t2b1", rows([[0.4, [0.5, 0.5]], [0.6, [1]]])],
    ["g-4", grid(2, 2)],
    ["g-t1b3", rows([[0.6, [1]], [0.4, even(3)]])],
    ["g-t3b1", rows([[0.4, even(3)], [0.6, [1]]])],
    ["g-l1r3", cols([[0.6, [1]], [0.4, even(3)]])],
    ["g-l3r1", cols([[0.4, even(3)], [0.6, [1]]])],
    ["g-cols-21", cols([[t, [1]], [s, [1]]])],
    ["g-cols-12", cols([[s, [1]], [t, [1]]])],
    ["g-rows-21", rows([[t, [1]], [s, [1]]])],
    ["g-rows-12", rows([[s, [1]], [t, [1]]])],
    ["g-mid-wide", cols([[0.25, [1]], [0.5, [1]], [0.25, [1]]])],
    ["g-mid-tall", rows([[0.25, [1]], [0.5, [1]], [0.25, [1]]])],
    ["g-4r", grid(1, 4)],
    ["g-4c", grid(4, 1)],
    ["g-5-23", rows([[0.5, even(2)], [0.5, even(3)]])],
    ["g-5-32", rows([[0.5, even(3)], [0.5, even(2)]])],
    ["g-5-c23", cols([[0.5, even(2)], [0.5, even(3)]])],
    ["g-5-big", rows([[0.6, [1]], [0.4, even(4)]])],
    ["g-6", grid(2, 3)],
    ["g-6w", grid(3, 2)],
    ["g-6-big", rows([[t, [t, s]], [s, even(3)]]).flatMap((c, i) => (i === 1 ? [{ ...c, h: t / 2 }, { ...c, y: t / 2, h: t / 2 }] : [c]))],
    ["g-7", rows([[0.5, even(3)], [0.5, even(4)]])],
    ["g-8", grid(2, 4)],
    ["g-8w", grid(4, 2)],
    ["g-9", grid(3, 3)],
    ["g-uneven-3", rows([[0.55, [0.62, 0.38]], [0.45, [1]]])],
    ["g-uneven-4", rows([[0.45, [0.38, 0.62]], [0.55, [0.62, 0.38]]])],
    ["g-uneven-5", cols([[0.55, [0.4, 0.6]], [0.45, [0.3, 0.4, 0.3]]])],
    ["g-uneven-6", rows([[0.35, [0.5, 0.5]], [0.3, [0.25, 0.5, 0.25]], [0.35, [0.5, 0.5]]])],
  ] as [string, SlideCell[]][]
).map(([id, cells]) => ({ id, kind: "grid", cells }));

/**
 * Cell rects (0..1 of the slide / block) for an `aspect` = width / height. Grids get `gap`
 * between cells (white lines by default) and `padding` around them, both relative to the width.
 */
export function slideCells(layout: SlideLayout, aspect: number, gap = layout.kind === "grid" ? GRID_LINE : 0, padding = 0) {
  const EPS = 0.001;
  return layout.cells.map((c) => {
    const h = c.square ? c.w * aspect : (c.h ?? c.w);
    let r = { x: c.x, y: c.y ?? (1 - h) / 2, w: c.w, h };
    if (layout.kind === "grid") {
      // Half a gap on inner edges, the padding on the outer ones.
      const gx = gap / 2;
      const gy = (gap * aspect) / 2;
      const px = padding;
      const py = padding * aspect;
      const l = r.x < EPS ? px : gx;
      const rt = r.x + r.w > 1 - EPS ? px : gx;
      const tp = r.y < EPS ? py : gy;
      const b = r.y + r.h > 1 - EPS ? py : gy;
      r = { x: r.x + l, y: r.y + tp, w: Math.max(0.01, r.w - l - rt), h: Math.max(0.01, r.h - tp - b) };
    }
    return { ...r, style: c };
  });
}

export function slideLayoutById(id: string) {
  return [...SLIDE_LAYOUTS, ...SLIDE_GRIDS].find((l) => l.id === id);
}
