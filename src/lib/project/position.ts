import { respaced } from "@/lib/templates/blockLayout";
import { cellFromFrame, isLayout, refitCrop, syncLayout } from "./blocks";
import { innerFrame, rotatedBounds } from "./geometry";
import { slideOfElement, slideRect } from "./layout";
import { type CanvasElement, isImage, type ProjectDoc } from "./types";

// Position sheet operations (M17, editor-v2/08 §1): align, fill, flip, and a patch that
// keeps a block's cells and a photo's crop right.

type AssetSize = (id: string) => { width: number; height: number } | undefined;

/** Applies `patch` to an element; a block re-places its cells, a photo whose frame changed shape is re-cropped. */
export function patchElement(doc: ProjectDoc, id: string, patch: Partial<CanvasElement>, assetSize: AssetSize): ProjectDoc {
  const before = doc.elements.find((e) => e.id === id);
  if (!before) return doc;
  let after = { ...before, ...patch } as CanvasElement;
  if (isImage(before) && isImage(after) && before.assetId && !("crop" in patch)) {
    const a = innerFrame(before);
    const b = innerFrame(after);
    const size = assetSize(before.assetId);
    if (size && Math.abs(a.width / a.height - b.width / b.height) > 1e-3) after = { ...after, crop: refitCrop(before.crop, b.width / b.height, size) };
  }
  // A block's spacing changed (Adjust sheet): its cells are laid out again.
  // Cells placed by hand (D-113) keep their places when only the block's size changes.
  const spacing = "gap" in patch || "padding" in patch;
  if (isLayout(after) && (spacing || (!after.custom && ("width" in patch || "height" in patch)))) {
    const cells = respaced(after);
    if (cells) after = { ...after, cells, custom: undefined };
  }
  let next = { ...doc, elements: doc.elements.map((e) => (e.id === id ? after : e)) };
  // A cell placed through the sheet (D-113): its block remembers where it is now.
  const block = after.parentId ? next.elements.find((e) => e.id === after.parentId) : undefined;
  if (isLayout(block) && ("x" in patch || "y" in patch || "width" in patch || "height" in patch || "rotation" in patch)) {
    const at = cellFromFrame(block, after);
    next = { ...next, elements: next.elements.map((e) => (e.id === block.id ? { ...block, custom: true, cells: block.cells.map((c) => (c.id === id ? { id, ...at } : c)) } : e)) };
  }
  return isLayout(after) ? syncLayout(next, id, assetSize) : next;
}

export type Align = "left" | "centerX" | "right" | "top" | "centerY" | "bottom";

/** Moves the element so its (turned) outline lines up with the slide holding its centre. */
export function alignPatch(doc: ProjectDoc, el: CanvasElement, how: Align): Partial<CanvasElement> {
  const r = slideRect(doc, slideOfElement(doc, el));
  const b = rotatedBounds(el);
  const dx = how === "left" ? r.x - b.x : how === "right" ? r.x + r.width - (b.x + b.width) : how === "centerX" ? r.x + r.width / 2 - (b.x + b.width / 2) : 0;
  const dy = how === "top" ? r.y - b.y : how === "bottom" ? r.y + r.height - (b.y + b.height) : how === "centerY" ? r.y + r.height / 2 - (b.y + b.height / 2) : 0;
  return { x: el.x + dx, y: el.y + dy };
}

export type Fill = "height" | "width" | "width2";

/**
 * Scales the element (keeping its shape) to the slide's height / width, or to two slides
 * wide across this slide and the next (editor-v2/08 §1.1).
 */
export function fillPatch(doc: ProjectDoc, el: CanvasElement, how: Fill): Partial<CanvasElement> {
  const s = slideOfElement(doc, el);
  const r = slideRect(doc, s);
  const k = how === "height" ? r.height / el.height : how === "width" ? r.width / el.width : (r.width * 2) / el.width;
  const width = el.width * k;
  const height = el.height * k;
  const cx = how === "width2" ? r.x + r.width : how === "width" ? r.x + r.width / 2 : el.x + el.width / 2;
  const cy = how === "height" ? r.y + r.height / 2 : r.y + r.height / 2;
  return { x: how === "height" ? el.x + el.width / 2 - width / 2 : cx - width / 2, y: cy - height / 2, width, height, rotation: 0 };
}

/** Mirror: a photo flips its picture; a block mirrors where its cells are. */
export function flipPatch(el: CanvasElement, axis: "x" | "y"): Partial<CanvasElement> | null {
  if (isImage(el)) return axis === "x" ? { flipX: !el.flipX } : { flipY: !el.flipY };
  if (isLayout(el))
    return { cells: el.cells.map((c) => (axis === "x" ? { ...c, x: 1 - c.x - c.w } : { ...c, y: 1 - c.y - c.h })) };
  return null;
}
