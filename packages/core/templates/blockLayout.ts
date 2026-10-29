import { isLayout, syncLayout, units } from "../project/blocks";
import { imageElement } from "../project/placement";
import { type CanvasElement, type ImageElement, isImage, type LayoutElement, type ProjectDoc } from "../project/types";
import { GRID_LINE, slideCells, slideLayoutById } from "./slideLayouts";

// Changing a block's split and spacing (M17, editor-v2/08 §4–5).

type AssetSize = (id: string) => { width: number; height: number } | undefined;

/** Cells of `block` re-computed from its split, gap and padding; same ids, same order. */
export function respaced(block: LayoutElement): LayoutElement["cells"] | null {
  const def = block.layout ? slideLayoutById(block.layout) : undefined;
  if (!def || block.cells.length < def.cells.length) return null;
  const rects = slideCells(def, block.width / block.height, block.gap ?? (def.kind === "grid" ? GRID_LINE : 0), block.padding ?? 0);
  // The pattern's cells first; cells added by hand (D-113) keep their places.
  return block.cells.map((c, i) => (i < rects.length ? { id: c.id, x: rects[i].x, y: rects[i].y, w: rects[i].w, h: rects[i].h, ...(rects[i].style.rotation ? { rotation: rects[i].style.rotation } : {}) } : c));
}

/**
 * Gives a block another split, keeping its place and size. Photos keep their cell order
 * (first photo → first cell…); photos left over become free photos beside the block;
 * extra cells are empty. Returns the doc and how many photos were put outside.
 */
export function relayout(doc: ProjectDoc, blockId: string, layoutId: string, assetSize: AssetSize): { doc: ProjectDoc; outside: number } {
  const block = doc.elements.find((e) => e.id === blockId);
  const def = slideLayoutById(layoutId);
  if (!isLayout(block) || !def) return { doc, outside: 0 };
  const kids = block.cells.map((c) => doc.elements.find((e) => e.id === c.id)).filter((e): e is ImageElement => !!e && isImage(e));
  const photos = kids.filter((k) => k.assetId);
  const empties = kids.filter((k) => !k.assetId);
  const next: LayoutElement = { ...block, layout: layoutId, gap: block.gap ?? (def.kind === "grid" ? GRID_LINE : 0), padding: block.padding ?? 0, custom: undefined };
  const rects = slideCells(def, block.width / block.height, next.gap, next.padding);
  const children: ImageElement[] = rects.map((r) => {
    const reused = photos.shift() ?? empties.shift();
    const frame = { x: block.x, y: block.y, width: r.w * block.width, height: r.h * block.height };
    const cell: ImageElement = reused
      ? { ...reused }
      : { ...imageElement({ id: "", width: frame.width, height: frame.height }, frame), assetId: null, parentId: block.id, slot: true };
    cell.frame = r.style.frame ?? "none";
    cell.shadow = r.style.shadow ?? false;
    return cell;
  });
  next.cells = rects.map((r, i) => ({ id: children[i].id, x: r.x, y: r.y, w: r.w, h: r.h, ...(r.style.rotation ? { rotation: r.style.rotation } : {}) }));
  // Photos left over: free photos to the right of the block.
  const outside: ImageElement[] = photos.map((p, i) => {
    const free: ImageElement = { ...p, slot: false, rotation: 0, x: block.x + block.width + 40 + i * 40, y: block.y + i * 40 };
    delete free.parentId;
    return free;
  });
  const elements: CanvasElement[] = units(doc).flatMap((u) => (u[0].id === blockId ? [next, ...children, ...outside] : u));
  return { doc: syncLayout({ ...doc, elements }, blockId, assetSize), outside: outside.length };
}
