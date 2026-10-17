import { isLayout, outermost, syncLayout, units } from "./blocks";
import { GRID_COLS, GRID_GAP, MAX_GRID_ROWS, slideOfElement, slideRect } from "./layout";
import { type CanvasElement, MAX_SLIDES, newId, type ProjectDoc, slideSize } from "./types";

// Slide operations. An element belongs to the slide containing its center;
// elements move along with their slide (docs/architecture/editor-model.md, mục 5).
// Post / Story: one row — insert / delete / move slides.
// Grid: add / remove rows at the bottom, toggle the profile-gap compensation.

/** Slide an element belongs to: its centre's, or its block's for a cell (M14). */
export function slideOfUnit(doc: ProjectDoc, el: CanvasElement) {
  return slideOfElement(doc, outermost(doc, el));
}

/** Moves every element whose slide changes from `from[i]` to `to[i]` by the slides' offset. */
function relocate(doc: ProjectDoc, next: ProjectDoc, map: (slide: number) => number | null): ProjectDoc {
  const elements = doc.elements.flatMap((el) => {
    const s = slideOfUnit(doc, el);
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

/** Inserts a blank slide so that it becomes slide `at` (0 = first). */
export function insertSlideAt(doc: ProjectDoc, at: number): ProjectDoc {
  return insertSlide(doc, at - 1);
}

/** Moves slide `from` to position `to`; the slides between shift by one (editor-v2/05 §4). */
export function moveSlideTo(doc: ProjectDoc, from: number, to: number): ProjectDoc {
  if (doc.type === "grid" || from === to || to < 0 || to >= doc.slideCount) return doc;
  return relocate(doc, doc, (s) => {
    if (s === from) return to;
    if (from < to && s > from && s <= to) return s - 1;
    if (from > to && s >= to && s < from) return s + 1;
    return s;
  });
}

/** A copy of slide `index` right after it, with copies of everything on it (editor-v2/05 §3). */
export function duplicateSlide(doc: ProjectDoc, index: number): ProjectDoc {
  const next = insertSlide(doc, index);
  if (next === doc) return doc;
  const dx = slideRect(next, index + 1).x - slideRect(next, index).x;
  const dy = slideRect(next, index + 1).y - slideRect(next, index).y;
  const ids = new Map<string, string>();
  for (const el of next.elements) if (slideOfUnit(next, el) === index) ids.set(el.id, newId());
  const copyOf = (el: CanvasElement) => {
    const copy = { ...el, id: ids.get(el.id)!, x: el.x + dx, y: el.y + dy } as CanvasElement;
    if (el.parentId) copy.parentId = ids.get(el.parentId) ?? el.parentId;
    if (isLayout(copy)) copy.cells = copy.cells.map((c) => ({ ...c, id: ids.get(c.id) ?? c.id }));
    return copy;
  };
  // Each copied unit (a block with its cells) sits right above its original.
  const elements = units(next).flatMap((unit) => (ids.has(unit[0].id) ? [...unit, ...unit.map(copyOf)] : unit));
  return { ...next, elements };
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

/**
 * Another slide shape for the whole project (project ⋯ → Ratio, editor-v2/12 §2): every
 * element keeps its place relative to its slide (centre height scaled); layout blocks
 * also take the new height, their cells following.
 */
export function changeRatio(doc: ProjectDoc, ratio: ProjectDoc["ratio"], assetSize: (id: string) => { width: number; height: number } | undefined): ProjectDoc {
  if (doc.type === "grid" || ratio === doc.ratio) return doc;
  const next: ProjectDoc = { ...doc, ratio };
  const k = slideSize(ratio).height / slideSize(doc.ratio).height;
  let out: ProjectDoc = {
    ...next,
    elements: doc.elements.map((el) => {
      if (el.parentId) return el; // placed by their block below
      if (isLayout(el)) return { ...el, y: el.y * k, height: el.height * k };
      const cy = (el.y + el.height / 2) * k;
      return { ...el, y: cy - el.height / 2 };
    }),
  };
  for (const el of out.elements) if (isLayout(el)) out = syncLayout(out, el.id, assetSize);
  return out;
}
