import { centeredRect, coverCrop, innerFrame } from "./geometry";
import { imageElement } from "./placement";
import { slideOfElement, slideRect } from "./layout";
import { type ImageAsset, type ImageElement, isImage, type ProjectDoc } from "./types";

// Filling empty photo cells and adding free photos (M16, editor-v2/09 §1–2, dev §6).

/** Most free photos added at once from the toolbar (editor-v2/09 §2). */
export const MAX_FREE_PHOTOS = 10;

/** Empty photo cells / frames: images without a picture. */
function emptyCells(doc: ProjectDoc) {
  return doc.elements.filter((e): e is ImageElement => isImage(e) && !e.assetId && !e.hidden);
}

/** Reading order inside a slide: top to bottom (rows within 4 % of the slide), then left to right. */
function reading(doc: ProjectDoc, cells: ImageElement[]) {
  const row = slideRect(doc, 0).height * 0.04;
  const centre = (c: ImageElement) => ({ x: c.x + c.width / 2, y: c.y + c.height / 2 });
  return [...cells].sort((a, b) => {
    const p = centre(a);
    const q = centre(b);
    return Math.abs(p.y - q.y) > row ? p.y - q.y : p.x - q.x;
  });
}

/**
 * Empty cells in the order photos go into them (editor-v2/09 §1.3): the active cell,
 * then the other empty cells of its slide, then every other slide from first to last.
 * A cell belongs to the slide holding its centre.
 */
export function fillTargets(doc: ProjectDoc, activeId: string | null): string[] {
  const bySlide = new Map<number, ImageElement[]>();
  for (const c of emptyCells(doc)) {
    const s = slideOfElement(doc, c);
    bySlide.set(s, [...(bySlide.get(s) ?? []), c]);
  }
  const out: string[] = [];
  const active = activeId ? emptyCells(doc).find((c) => c.id === activeId) : undefined;
  const first = active ? slideOfElement(doc, active) : -1;
  if (active) {
    out.push(active.id);
    for (const c of reading(doc, bySlide.get(first) ?? [])) if (c.id !== active.id) out.push(c.id);
  }
  for (const s of [...bySlide.keys()].sort((a, b) => a - b)) {
    if (s === first) continue;
    for (const c of reading(doc, bySlide.get(s)!)) out.push(c.id);
  }
  return out;
}

/** Puts `assets[i]` into cell `targets[i]`, each covering its cell, centred. */
export function fillCells(doc: ProjectDoc, targets: string[], assets: ImageAsset[]): ProjectDoc {
  const into = new Map(targets.slice(0, assets.length).map((id, i) => [id, assets[i]]));
  return {
    ...doc,
    elements: doc.elements.map((el) => {
      const asset = into.get(el.id);
      return asset && isImage(el) ? { ...el, assetId: asset.id, crop: coverCrop(asset, innerFrame(el)), straighten: 0 } : el;
    }),
  };
}

/**
 * Free photos on slide `slide` (editor-v2/09 §2): from its top-left corner, each about
 * 60 % of the slide wide in its own shape, every next one 40 px further down and right.
 */
export function freePhotos(doc: ProjectDoc, assets: ImageAsset[], slide: number): ImageElement[] {
  const r = slideRect(doc, Math.max(0, Math.min(slide, doc.slideCount - 1)));
  const margin = r.width * 0.06;
  return assets.map((asset, i) => {
    const box = centeredRect({ width: r.width * 0.6, height: r.height * 0.6 }, asset.width / asset.height);
    return imageElement(asset, { x: r.x + margin + i * 40, y: r.y + margin + i * 40, width: box.width, height: box.height });
  });
}
