import { frameInset, innerFrame } from "./geometry";
import { slideOfElement, slideRect } from "./layout";
import { type CanvasElement, type ImageElement, isImage, type LayoutElement, newId, type ProjectDoc, type Rect } from "./types";

// Layout blocks and their cells (M14, editor-v2/02, dev/editor-v2 §2): parent / child
// helpers, cell frames from block geometry, and grouping of legacy grid cells.

export function isLayout(el: CanvasElement | undefined): el is LayoutElement {
  return el?.type === "layout";
}

export function childrenOf(doc: Pick<ProjectDoc, "elements">, layoutId: string) {
  return doc.elements.filter((e) => e.parentId === layoutId);
}

/** The outermost element: the block of a cell, or the element itself. */
export function outermost(doc: Pick<ProjectDoc, "elements">, el: CanvasElement): CanvasElement {
  return (el.parentId && doc.elements.find((e) => e.id === el.parentId)) || el;
}

/** Ids of an element and everything inside it (a block and its cells). */
export function blockIds(doc: Pick<ProjectDoc, "elements">, id: string) {
  return [id, ...doc.elements.filter((e) => e.parentId === id).map((e) => e.id)];
}

const rot = (x: number, y: number, deg: number) => {
  const r = (deg * Math.PI) / 180;
  return { x: x * Math.cos(r) - y * Math.sin(r), y: x * Math.sin(r) + y * Math.cos(r) };
};

/** Frame of each cell (canvas px), given the block's geometry. Cells turn with the block. */
export function cellFrames(block: Pick<LayoutElement, "x" | "y" | "width" | "height" | "rotation" | "cells">) {
  const cx = block.x + block.width / 2;
  const cy = block.y + block.height / 2;
  return new Map(
    block.cells.map((c) => {
      const w = c.w * block.width;
      const h = c.h * block.height;
      // Cell centre relative to the block centre, turned with the block.
      const o = rot((c.x + c.w / 2 - 0.5) * block.width, (c.y + c.h / 2 - 0.5) * block.height, block.rotation);
      return [c.id, { x: cx + o.x - w / 2, y: cy + o.y - h / 2, width: w, height: h, rotation: block.rotation }];
    }),
  );
}

/** Crop with a new aspect (width / height), same centre and about the same zoom, kept inside the image. */
export function refitCrop(crop: Rect, aspect: number, image: { width: number; height: number }): Rect {
  const area = crop.width * crop.height;
  let w = Math.sqrt(area * aspect);
  let h = w / aspect;
  const k = Math.min(1, image.width / w, image.height / h);
  w *= k;
  h *= k;
  const cx = crop.x + crop.width / 2;
  const cy = crop.y + crop.height / 2;
  return {
    x: Math.max(0, Math.min(image.width - w, cx - w / 2)),
    y: Math.max(0, Math.min(image.height - h, cy - h / 2)),
    width: w,
    height: h,
  };
}

type AssetSize = (id: string) => { width: number; height: number } | undefined;

/** Puts the cells of `layoutId` where the block says (after it moved / resized / turned). */
export function syncLayout(doc: ProjectDoc, layoutId: string, assetSize: AssetSize): ProjectDoc {
  const block = doc.elements.find((e) => e.id === layoutId);
  if (!isLayout(block)) return doc;
  const frames = cellFrames(block);
  return {
    ...doc,
    elements: doc.elements.map((el) => {
      const f = el.parentId === layoutId ? frames.get(el.id) : undefined;
      if (!f || !isImage(el)) return el;
      const moved: ImageElement = { ...el, ...f, hidden: block.hidden || undefined };
      if (!moved.hidden) delete moved.hidden;
      // Same picture, new frame shape: refit the crop so the photo isn't stretched.
      const inner = innerFrame(moved);
      const before = innerFrame(el);
      const size = el.assetId ? assetSize(el.assetId) : undefined;
      if (size && Math.abs(inner.width / inner.height - before.width / before.height) > 1e-3) {
        moved.crop = refitCrop(el.crop, inner.width / inner.height, size);
      }
      return moved;
    }),
  };
}

/**
 * Legacy / template grid cells (`slot` images without a parent) grouped into one layout
 * block per slide, covering the slide. The block goes where its lowest cell was; its
 * cells follow it in layer order.
 */
export function groupSlots(doc: ProjectDoc): ProjectDoc {
  const loose = doc.elements.filter((e): e is ImageElement => isImage(e) && e.slot && !e.parentId);
  if (loose.length === 0) return doc;
  const bySlide = new Map<number, ImageElement[]>();
  for (const el of loose) {
    const s = slideOfElement(doc, el);
    bySlide.set(s, [...(bySlide.get(s) ?? []), el]);
  }
  const blockOf = new Map<string, LayoutElement>();
  for (const [s, cells] of bySlide) {
    const r = slideRect(doc, s);
    const block: LayoutElement = {
      id: newId(),
      type: "layout",
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      rotation: 0,
      opacity: 1,
      cells: cells.map((c) => ({ id: c.id, x: (c.x - r.x) / r.width, y: (c.y - r.y) / r.height, w: c.width / r.width, h: c.height / r.height })),
      ...(cells.some((c) => c.fromLayout) && { fromLayout: true }),
      ...(cells.every((c) => c.locked) && { locked: true }),
    };
    for (const c of cells) blockOf.set(c.id, block);
  }
  const out: CanvasElement[] = [];
  const placed = new Set<string>();
  for (const el of doc.elements) {
    const block = blockOf.get(el.id);
    if (!block) {
      out.push(el);
      continue;
    }
    if (placed.has(block.id)) continue;
    placed.add(block.id);
    out.push(block);
    for (const c of block.cells) {
      const cell = loose.find((x) => x.id === c.id)!;
      out.push({ ...cell, parentId: block.id });
    }
  }
  return { ...doc, elements: out };
}

/** Layer units, back to front: each top-level element with the cells inside it. */
export function units(doc: Pick<ProjectDoc, "elements">): CanvasElement[][] {
  const out: CanvasElement[][] = [];
  for (const el of doc.elements) {
    if (el.parentId && doc.elements.some((p) => p.id === el.parentId)) continue;
    out.push([el, ...doc.elements.filter((c) => c.parentId === el.id)]);
  }
  return out;
}

/** Moves the unit of `id` to position `to` (0 = back) among the layer units. */
export function moveUnit(doc: ProjectDoc, id: string, to: (from: number, count: number) => number): ProjectDoc {
  const list = units(doc);
  const from = list.findIndex((u) => u[0].id === id);
  if (from < 0) return doc;
  const target = Math.max(0, Math.min(list.length - 1, to(from, list.length)));
  if (target === from) return doc;
  const [u] = list.splice(from, 1);
  list.splice(target, 0, u);
  return { ...doc, elements: list.flat() };
}

/** Copy of a block (new ids for it and its cells), shifted by `offset`. */
export function copyUnit(doc: ProjectDoc, id: string, offset: number): { doc: ProjectDoc; copyId: string } | null {
  const list = units(doc);
  const i = list.findIndex((u) => u[0].id === id);
  if (i < 0) return null;
  const ids = new Map(list[i].map((e) => [e.id, newId()]));
  const copy = list[i].map((e) => {
    const c = { ...e, id: ids.get(e.id)!, x: e.x + offset, y: e.y + offset } as CanvasElement;
    if (e.parentId) c.parentId = ids.get(e.parentId);
    if (isLayout(c)) c.cells = c.cells.map((cell) => ({ ...cell, id: ids.get(cell.id) ?? cell.id }));
    return c;
  });
  list.splice(i + 1, 0, copy);
  return { doc: { ...doc, elements: list.flat() }, copyId: ids.get(id)! };
}

/**
 * Crop after the finger moved (dx, dy canvas px) over a photo shown in a frame: the
 * picture follows the finger (in the frame's own, possibly turned, axes).
 */
export function panCrop(el: ImageElement, crop: Rect, image: { width: number; height: number }, dx: number, dy: number): Rect {
  const scale = crop.width / innerFrame(el).width; // picture px per frame px
  const t = (-el.rotation * Math.PI) / 180;
  const fx = dx * Math.cos(t) - dy * Math.sin(t);
  const fy = dx * Math.sin(t) + dy * Math.cos(t);
  return {
    ...crop,
    x: Math.max(0, Math.min(image.width - crop.width, crop.x - fx * scale * (el.flipX ? -1 : 1))),
    y: Math.max(0, Math.min(image.height - crop.height, crop.y - fy * scale * (el.flipY ? -1 : 1))),
  };
}

/**
 * Where the whole picture of a framed photo lies (canvas px): centre, size, turn.
 * Used for the selection box around a photo in a cell (editor-v2/07 §1).
 */
export function wholePicture(el: ImageElement, crop: Rect, image: { width: number; height: number }) {
  const inner = frameInset(el.frame ?? "none", el.width, el.height);
  const z = inner.width / crop.width;
  const w = image.width * z;
  const h = image.height * z;
  // Picture centre relative to the frame centre, before turning.
  const fx = (el.flipX ? -1 : 1) * (image.width / 2 - (crop.x + crop.width / 2)) * z;
  const fy = (el.flipY ? -1 : 1) * (image.height / 2 - (crop.y + crop.height / 2)) * z;
  // The photo area may be off-centre in a decorative frame (polaroid).
  const ix = inner.x + inner.width / 2 - el.width / 2;
  const iy = inner.y + inner.height / 2 - el.height / 2;
  const o = rot(ix + fx, iy + fy, el.rotation);
  return { x: el.x + el.width / 2 + o.x, y: el.y + el.height / 2 + o.y, width: w, height: h, rotation: el.rotation };
}
