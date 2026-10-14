import { GRID_COLS, GRID_GAP, MAX_GRID_ROWS, slideOfElement, slideRect } from "./layout";
import { MAX_SLIDES, type ProjectDoc } from "./types";

// Slide operations. An element belongs to the slide containing its center;
// elements move along with their slide (docs/architecture/editor-model.md, mục 5).
// Post / Story: one row — insert / delete / move slides.
// Grid: add / remove rows at the bottom, toggle the profile-gap compensation.

/** Moves every element whose slide changes from `from[i]` to `to[i]` by the slides' offset. */
function relocate(doc: ProjectDoc, next: ProjectDoc, map: (slide: number) => number | null): ProjectDoc {
  const elements = doc.elements.flatMap((el) => {
    const s = slideOfElement(doc, el);
    const target = map(s);
    if (target === null) return [];
    const a = slideRect(doc, s);
    const b = slideRect(next, target);
    return [{ ...el, x: el.x + b.x - a.x, y: el.y + b.y - a.y }];
  });
  return { ...next, elements };
}

export function insertSlide(doc: ProjectDoc, after: number): ProjectDoc {
  if (doc.type === "grid" || doc.slideCount >= MAX_SLIDES) return doc;
  const next = { ...doc, slideCount: doc.slideCount + 1 };
  return relocate(doc, next, (s) => (s > after ? s + 1 : s));
}

export function deleteSlide(doc: ProjectDoc, index: number): ProjectDoc {
  if (doc.type === "grid" || doc.slideCount <= 1) return doc;
  const next = { ...doc, slideCount: doc.slideCount - 1 };
  return relocate(doc, next, (s) => (s === index ? null : s > index ? s - 1 : s));
}

/** Swaps slide `index` with its neighbour (`direction` -1 = left, +1 = right). */
export function moveSlide(doc: ProjectDoc, index: number, direction: -1 | 1): ProjectDoc {
  const target = index + direction;
  if (doc.type === "grid" || target < 0 || target >= doc.slideCount) return doc;
  return relocate(doc, doc, (s) => (s === index ? target : s === target ? index : s));
}

/** Grid: change the number of rows (rows are added / removed at the bottom). */
export function setGridRows(doc: ProjectDoc, rows: number): ProjectDoc {
  if (doc.type !== "grid" || !doc.grid) return doc;
  const r = Math.max(1, Math.min(MAX_GRID_ROWS, rows));
  if (r === doc.grid.rows) return doc;
  const next = { ...doc, slideCount: r * GRID_COLS, grid: { ...doc.grid, rows: r } };
  return relocate(doc, next, (s) => (s < r * GRID_COLS ? s : null));
}

/** Grid: turn the profile-gap compensation on / off; content follows its tile. */
export function setGridGap(doc: ProjectDoc, on: boolean): ProjectDoc {
  if (doc.type !== "grid" || !doc.grid || doc.grid.gapCompensation === on) return doc;
  const next = { ...doc, grid: { ...doc.grid, gapCompensation: on } };
  return relocate(doc, next, (s) => s);
}

export { GRID_GAP };
