import { type ProjectDoc, type Rect, slideSize } from "./types";

// Where each slide sits on the canvas (M6). Post / Story: one row of slides.
// Grid: 3 columns × rows tiles, optionally separated by the profile gap. Any number of
// tiles (owner, 2026-10-28): the last row may be short, like the newest posts on a profile.
// Every place that needs slide positions goes through this module.

/** Gap between tiles on the Instagram profile grid, in export px (≈1.5 pt on a phone — needs checking). */
export const GRID_GAP = 12;
export const GRID_COLS = 3;
export const MAX_GRID_ROWS = 8;
export const MIN_GRID_TILES = 2;
export const MAX_GRID_TILES = MAX_GRID_ROWS * GRID_COLS;

export type LayoutDoc = Pick<ProjectDoc, "type" | "ratio" | "slideCount" | "grid">;

export function gridShape(doc: LayoutDoc) {
  if (doc.type === "grid") {
    const rows = Math.max(doc.grid?.rows ?? 1, Math.ceil(doc.slideCount / GRID_COLS));
    return { cols: GRID_COLS, rows, gap: doc.grid?.gapCompensation ? GRID_GAP : 0 };
  }
  return { cols: doc.slideCount, rows: 1, gap: 0 };
}

export function slideRect(doc: LayoutDoc, index: number): Rect {
  const { width, height } = slideSize(doc.ratio);
  const { cols, gap } = gridShape(doc);
  const c = index % cols;
  const r = Math.floor(index / cols);
  return { x: c * (width + gap), y: r * (height + gap), width, height };
}

export function canvasSize(doc: LayoutDoc) {
  const slide = slideSize(doc.ratio);
  const { cols, rows, gap } = gridShape(doc);
  return { width: cols * slide.width + (cols - 1) * gap, height: rows * slide.height + (rows - 1) * gap, slide };
}

/** Slide whose area contains (or is nearest to) a canvas point. */
export function slideAt(doc: LayoutDoc, x: number, y: number) {
  const slide = slideSize(doc.ratio);
  const { cols, rows, gap } = gridShape(doc);
  const c = Math.max(0, Math.min(cols - 1, Math.floor((x + gap / 2) / (slide.width + gap))));
  const r = Math.max(0, Math.min(rows - 1, Math.floor((y + gap / 2) / (slide.height + gap))));
  // The empty end of a short last row belongs to the last tile.
  return Math.min(r * cols + c, doc.slideCount - 1);
}

/** Slide an element belongs to: the one containing its center. */
export function slideOfElement(doc: LayoutDoc, el: Pick<Rect, "x" | "y" | "width" | "height">) {
  return slideAt(doc, el.x + el.width / 2, el.y + el.height / 2);
}

/**
 * Order of exported files. Grid: Instagram shows the newest post top-left,
 * so the bottom-right tile must be posted first → it becomes `_01`.
 */
export function exportOrder(doc: LayoutDoc) {
  const ids = Array.from({ length: doc.slideCount }, (_, i) => i);
  return doc.type === "grid" ? ids.reverse() : ids;
}

/** Posting number (1-based) of a tile, as shown on the canvas. */
export function postingNumber(doc: LayoutDoc, index: number) {
  return exportOrder(doc).indexOf(index) + 1;
}

/** Story areas covered by Instagram's UI (export px) — needs checking against the current app. */
export const STORY_SAFE = { top: 250, bottom: 340 };
