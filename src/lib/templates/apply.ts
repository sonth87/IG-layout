import { imageElement } from "@/lib/project/placement";
import { coverCrop, innerFrame } from "@/lib/project/geometry";
import { canvasSize, slideRect } from "@/lib/project/layout";
import { type CanvasElement, MAX_SLIDES, type ImageAsset, newId, type ProjectDoc, slideSize } from "@/lib/project/types";
import { groupSlots, syncLayout } from "@/lib/project/blocks";
import { insertSlideAt } from "@/lib/project/slides";
import type { LayoutElement } from "@/lib/project/types";
import { type SlideLayout, slideCells } from "./slideLayouts";
import type { Template, TemplateOptions, TemplateSlot } from "./types";

const EPS = 0.001;

/** Number of slides the template will produce for `photoCount` photos. Grid keeps its tiles. */
export function templateSlides(tpl: Template, photoCount: number, current: number, type: ProjectDoc["type"] = "post") {
  if (type === "grid") return current;
  if (tpl.perPhoto) return Math.max(1, Math.min(MAX_SLIDES, photoCount));
  return tpl.slides === "any" ? current : tpl.slides;
}

/**
 * Builds the project content from a template. `photos[i]` fills slots with
 * `photo: i`; missing photos leave empty slots (assetId null).
 * Replaces all elements and the background (one history step for the caller).
 */
export function applyTemplate(
  doc: ProjectDoc,
  tpl: Template,
  photos: (ImageAsset | undefined)[],
  opts: TemplateOptions,
  locale: "en" | "vi" = "en",
): ProjectDoc {
  const { width: W, height: H } = slideSize(doc.ratio);
  const slideCount = templateSlides(tpl, photos.length, doc.slideCount, doc.type);
  const sized = { ...doc, slideCount };
  const full = canvasSize(sized);
  const elements: CanvasElement[] = [];
  let background = doc.background;

  const bg = tpl.background;
  if (bg?.kind === "color" || bg?.kind === "gradient") background = bg;
  else if (tpl.gridded) background = { kind: "color", color: opts.color };
  if (bg?.kind === "photo") {
    const asset = photos[bg.photo];
    const frame = { x: 0, y: 0, width: full.width, height: full.height };
    // No photo yet (template from the home library): an empty locked cell to fill later.
    const el = asset ? imageElement(asset, frame) : { ...imageElement({ id: "", width: frame.width, height: frame.height }, frame), assetId: null };
    elements.push({ ...el, locked: true });
  }

  for (const sh of tpl.shapes ?? []) {
    const r = slideRect(sized, sh.slide);
    elements.push({
      id: newId(),
      type: "shape",
      x: r.x + sh.x * W,
      y: r.y + sh.y * H,
      width: sh.w * W,
      height: sh.h * H,
      rotation: 0,
      opacity: 1,
      shape: sh.shape,
      fill: sh.fill,
    });
  }

  const slots: TemplateSlot[] = tpl.perPhoto
    ? Array.from({ length: slideCount }, (_, i) => ({ ...tpl.slots[0], photo: i, slide: i }))
    : tpl.slots;

  for (const slot of slots) {
    if (slot.slide >= slideCount) continue;
    const r = slideRect(sized, slot.slide);
    let x = r.x + slot.x * W;
    let y = r.y + slot.y * H;
    let w = slot.w * W;
    let h = slot.h * H;

    if (tpl.gridded && opts.spacing > 0) {
      // Half a gap on inner edges, a full gap on slide edges.
      const g = opts.spacing * W;
      const left = Math.abs(slot.x) < EPS ? g : g / 2;
      const right = Math.abs(slot.x + slot.w - Math.round(slot.x + slot.w)) < EPS ? g : g / 2;
      const top = Math.abs(slot.y) < EPS ? g : g / 2;
      const bottom = Math.abs(slot.y + slot.h - 1) < EPS ? g : g / 2;
      x += left;
      y += top;
      w -= left + right;
      h -= top + bottom;
    }

    const asset = photos[slot.photo];
    const frame = { x, y, width: w, height: h };
    const el = asset
      ? imageElement(asset, frame)
      : { ...imageElement({ id: "", width: w, height: h }, frame), assetId: null };

    el.rotation = slot.rotation ?? 0;
    el.mask = slot.mask ?? "none";
    if (slot.cornerRadius) el.cornerRadius = slot.cornerRadius * W;
    if (tpl.gridded && opts.radius > 0) {
      el.mask = "rounded";
      el.cornerRadius = opts.radius * W;
    }
    if (slot.border) el.border = { width: slot.border.width * W, color: slot.border.color };
    el.shadow = slot.shadow ?? false;
    el.slot = tpl.gridded ?? false;
    if (slot.frame) {
      el.frame = slot.frame;
      if (asset) el.crop = coverCrop(asset, innerFrame(el));
    }
    elements.push(el);
  }

  // Texts on top of the photos (designed templates).
  for (const tx of tpl.texts ?? []) {
    if (tx.slide >= slideCount) continue;
    const r = slideRect(sized, tx.slide);
    const fontSize = Math.round(tx.size * W);
    const lineHeight = tx.lineHeight ?? 1.15;
    const text = tx.text[locale];
    elements.push({
      id: newId(),
      type: "text",
      x: r.x + tx.x * W,
      y: r.y + tx.y * H,
      width: tx.w * W,
      // Real height is measured when drawn (setDerived); this is a close first guess.
      height: fontSize * lineHeight * text.split("\n").length,
      rotation: tx.rotation ?? 0,
      opacity: 1,
      text,
      font: tx.font,
      bold: tx.bold ?? false,
      fontSize,
      color: tx.color,
      align: tx.align ?? "center",
      letterSpacing: Math.round((tx.letterSpacing ?? 0) * fontSize),
      lineHeight,
      stroke: null,
      shadow: false,
      background: tx.background
        ? { color: tx.background.color, padding: Math.round(tx.background.padding * fontSize), radius: Math.round(fontSize * 0.2) }
        : null,
    });
  }

  // Grid cells become one layout block per slide (M14).
  return groupSlots({ ...doc, slideCount, background, elements: elements.map((e) => ({ ...e, fromLayout: true })) });
}

/**
 * Inserts a new slide at `at` holding a layout block of `layout` with empty cells
 * ("New slide" sheet, editor-v2/05 §5). Without a layout: a blank slide.
 */
export function addLayoutSlide(doc: ProjectDoc, at: number, layout: SlideLayout | null): ProjectDoc {
  const next = insertSlideAt(doc, at);
  if (next === doc || !layout) return next;
  return placeLayoutBlock(next, slideRect(next, at), layout).doc;
}

/**
 * A layout block of `layout` on slide `slide`, about 80 % of it and centred ("+ → Grid",
 * editor-v2/11 §6). Returns the doc and the block's id.
 */
export function addLayoutBlock(doc: ProjectDoc, slide: number, layout: SlideLayout): { doc: ProjectDoc; id: string } {
  const s = slideRect(doc, slide);
  const r = { x: s.x + s.width * 0.1, y: s.y + s.height * 0.1, width: s.width * 0.8, height: s.height * 0.8 };
  return placeLayoutBlock(doc, r, layout);
}

function placeLayoutBlock(next: ProjectDoc, r: { x: number; y: number; width: number; height: number }, layout: SlideLayout): { doc: ProjectDoc; id: string } {
  const block: LayoutElement = { id: newId(), type: "layout", x: r.x, y: r.y, width: r.width, height: r.height, rotation: 0, opacity: 1, cells: [], layout: layout.id };
  const cells: CanvasElement[] = slideCells(layout, r.width / r.height).map((c) => {
    const frame = { x: r.x + c.x * r.width, y: r.y + c.y * r.height, width: c.w * r.width, height: c.h * r.height };
    const el = { ...imageElement({ id: "", width: frame.width, height: frame.height }, frame), assetId: null, parentId: block.id, slot: true };
    if (c.style.frame) el.frame = c.style.frame;
    if (c.style.shadow) el.shadow = true;
    if (c.style.border) el.border = { width: c.style.border * r.width, color: "#ffffff" };
    block.cells.push({ id: el.id, x: c.x, y: c.y, w: c.w, h: c.h, ...(c.style.rotation ? { rotation: c.style.rotation } : {}) });
    return el;
  });
  const withBlock = { ...next, elements: [...next.elements, block, ...cells] };
  return { doc: syncLayout(withBlock, block.id, () => undefined), id: block.id };
}

/**
 * A frame from a pack (M20 C4) on slide `slide`: a block the shape of its art, about 70 %
 * of the slide, one empty cell per window; the art is drawn above the cells.
 */
export function addFrameBlock(
  doc: ProjectDoc,
  slide: number,
  art: { assetId: string; catalogId: string; width: number; height: number },
  windows: { x: number; y: number; w: number; h: number; shape?: "rect" | "ellipse"; rotation?: number }[],
): { doc: ProjectDoc; id: string } {
  const s = slideRect(doc, slide);
  const k = Math.min((s.width * 0.7) / art.width, (s.height * 0.7) / art.height);
  const w = art.width * k;
  const h = art.height * k;
  const r = { x: s.x + (s.width - w) / 2, y: s.y + (s.height - h) / 2, width: w, height: h };
  const block: LayoutElement = { id: newId(), type: "layout", ...r, rotation: 0, opacity: 1, cells: [], art: { assetId: art.assetId, catalogId: art.catalogId } };
  const cells: CanvasElement[] = windows.map((win) => {
    const frame = { x: r.x + win.x * w, y: r.y + win.y * h, width: win.w * w, height: win.h * h };
    const el = { ...imageElement({ id: "", width: frame.width, height: frame.height }, frame), assetId: null, parentId: block.id, slot: true };
    if (win.shape === "ellipse") el.mask = "circle";
    block.cells.push({ id: el.id, x: win.x, y: win.y, w: win.w, h: win.h, ...(win.rotation ? { rotation: win.rotation } : {}) });
    return el;
  });
  const withBlock = { ...doc, elements: [...doc.elements, block, ...cells] };
  return { doc: syncLayout(withBlock, block.id, () => undefined), id: block.id };
}
