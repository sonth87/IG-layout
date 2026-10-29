import { DEFAULT_CUTOUT } from "../text/cutout";
import { imageElement } from "../project/placement";
import { coverCrop, innerFrame } from "../project/geometry";
import { canvasSize, slideRect } from "../project/layout";
import { type CanvasElement, MAX_SLIDES, type ImageAsset, newId, type ProjectDoc, slideSize } from "../project/types";
import { groupSlots, syncLayout } from "../project/blocks";
import { insertSlideAt } from "../project/slides";
import type { LayoutElement } from "../project/types";
import { catalogAsset, loadCatalog, loadPack } from "../catalog/load";
import type { FrameWindow } from "../catalog/types";
import type { WidgetData } from "../elements/widgets";
import { STICKERS } from "../elements/stickers";
import packArt from "./packArt.json";
import { type SlideLayout, slideCells } from "./slideLayouts";
import type { Template, TemplateOptions, TemplateSlot, TemplateWidget } from "./types";

const EPS = 0.001;

/** Pack pictures the templates use: size, file and (thinned) windows (scripts/build-template-art.mjs). */
export const PACK_ART = packArt as Record<string, { kind: string; file: string; thumb: string; width: number; height: number; windows?: FrameWindow[] }>;

/** Id of a pack picture shown straight from its URL (previews; not stored in a project). */
export const packAssetId = (id: string) => `pack:${id}`;

/** What a real project adds to a template (store/editor createFromTemplate); previews go without. */
export interface TemplateExtras {
  /** Pack pictures already in the project, by catalog id. Without: drawn from the pack URL. */
  art?: Record<string, ImageAsset>;
  /** Exact frame windows, by catalog id. Without: the thinned preview ones. */
  windows?: Record<string, FrameWindow[]>;
  /** Builds a widget (widgets module, loaded on demand). Without: widgets are left out. */
  widget?: (spec: TemplateWidget, locale: "en" | "vi") => { widget: WidgetData; color: string; aspect: number };
}

/**
 * Pack pictures (stored in the project, exact windows) and widgets for a template that
 * becomes a real project. A picture that can't be fetched (offline) is left out.
 */
export async function templateExtras(tpl: Template): Promise<TemplateExtras> {
  const extras: TemplateExtras = { art: {}, windows: {} };
  const ids = [...new Set((tpl.art ?? []).map((a) => a.id))];
  if (ids.length) {
    const catalog = await loadCatalog().catch(() => null);
    await Promise.all(
      ids.map(async (id) => {
        const pack = catalog?.packs.find((p) => p.id === id.split("/")[0]);
        const item = pack && (await loadPack(pack)).find((it) => it.id === id);
        if (!item) return;
        try {
          extras.art![id] = await catalogAsset(item);
          if (item.windows) extras.windows![id] = item.windows;
        } catch {
          // Offline: the template goes on without this picture.
        }
      }),
    );
  }
  if (tpl.widgets?.length) extras.widget = (await import("./widgetSpec")).widgetFromSpec;
  return extras;
}

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
  extras: TemplateExtras = {},
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

  const shape = (sh: NonNullable<Template["shapes"]>[number]): CanvasElement => {
    const r = slideRect(sized, sh.slide);
    return {
      id: newId(),
      type: "shape",
      x: r.x + sh.x * W,
      y: r.y + sh.y * H,
      width: sh.w * W,
      height: sh.h * H,
      rotation: sh.rotation ?? 0,
      opacity: sh.opacity ?? 1,
      shape: sh.shape,
      fill: sh.fill,
    };
  };
  for (const sh of tpl.shapes ?? []) if (!sh.above && sh.slide < slideCount) elements.push(shape(sh));

  // Pack frames (their windows take the next photos) and stickers, in order; stickers
  // marked `under` go below the photo cells.
  const frameBlocks: string[] = [];
  const placeArt = (a: NonNullable<Template["art"]>[number]) => {
    const info = PACK_ART[a.id];
    if (!info || a.slide >= slideCount) return;
    // A real project without the picture (offline): leave it out rather than point at the pack.
    if (extras.art && !extras.art[a.id]) return;
    const asset = extras.art?.[a.id] ?? { id: packAssetId(a.id), blob: new Blob(), url: `/packs/${info.file}`, width: info.width, height: info.height, name: a.id };
    const r = slideRect(sized, a.slide);
    const w = a.w * W;
    const h = (w * info.height) / info.width;
    const box = { x: r.x + a.x * W, y: r.y + a.y * H, width: w, height: h };
    const windows = extras.windows?.[a.id] ?? info.windows;
    if (info.kind !== "frame" || !windows?.length) {
      elements.push({ ...imageElement(asset, box), rotation: a.rotation ?? 0, opacity: a.opacity ?? 1 });
      return;
    }
    const block: LayoutElement = { id: newId(), type: "layout", ...box, rotation: a.rotation ?? 0, opacity: a.opacity ?? 1, cells: [], art: { assetId: asset.id, catalogId: a.id } };
    elements.push(block);
    windows.forEach((win, i) => {
      const frame = { x: box.x + win.x * w, y: box.y + win.y * h, width: win.w * w, height: win.h * h };
      const p = photos[(a.photo ?? 0) + i];
      const el = p ? imageElement(p, frame) : { ...imageElement({ id: "", width: frame.width, height: frame.height }, frame), assetId: null };
      el.parentId = block.id;
      el.slot = true;
      if (win.shape === "ellipse") el.mask = "circle";
      if (win.points?.length) el.maskPoints = win.points;
      block.cells.push({ id: el.id, x: win.x, y: win.y, w: win.w, h: win.h, ...(win.rotation ? { rotation: win.rotation } : {}) });
      elements.push(el);
    });
    frameBlocks.push(block.id);
  };
  for (const a of tpl.art ?? []) if (a.under) placeArt(a);

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

  for (const a of tpl.art ?? []) if (!a.under) placeArt(a);

  // Tape and stickers over the photos' edges.
  for (const sh of tpl.shapes ?? []) if (sh.above && sh.slide < slideCount) elements.push(shape(sh));
  for (const ic of tpl.icons ?? []) {
    const st = STICKERS[ic.icon];
    if (!st || ic.slide >= slideCount) continue;
    const r = slideRect(sized, ic.slide);
    const width = ic.w * W;
    elements.push({ id: newId(), type: "icon", x: r.x + ic.x * W, y: r.y + ic.y * H, width, height: (width * st.h) / st.w, rotation: ic.rotation ?? 0, opacity: ic.opacity ?? 1, icon: ic.icon, color: ic.color ?? st.color });
  }
  for (const wd of extras.widget ? (tpl.widgets ?? []) : []) {
    if (wd.slide >= slideCount) continue;
    const { widget, color, aspect } = extras.widget!(wd, locale);
    const r = slideRect(sized, wd.slide);
    const width = wd.w * W;
    elements.push({ id: newId(), type: "icon", x: r.x + wd.x * W, y: r.y + wd.y * H, width, height: width / aspect, rotation: wd.rotation ?? 0, opacity: 1, icon: `widget:${wd.kind}`, color, widget });
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
      stroke: tx.stroke ? { color: tx.stroke.color, width: Math.max(1, Math.round(tx.stroke.width * fontSize)) } : null,
      shadow: tx.shadow ?? false,
      ...(tx.italic && { italic: true }),
      ...(tx.cutout && { cutout: { ...DEFAULT_CUTOUT, ...tx.cutout } }),
      ...(tx.opacity !== undefined && { opacity: tx.opacity }),
      background: tx.background
        ? { color: tx.background.color, padding: Math.round(tx.background.padding * fontSize), radius: Math.round(fontSize * (tx.background.radius ?? 0.2)) }
        : null,
    });
  }

  // Grid cells become one layout block per slide (M14); frame cells follow their frame's turn.
  let out = groupSlots({ ...doc, slideCount, background, elements: elements.map((e) => ({ ...e, fromLayout: true })) });
  const sizes = new Map(photos.filter((p): p is ImageAsset => !!p).map((p) => [p.id, p]));
  for (const id of frameBlocks) out = syncLayout(out, id, (assetId) => sizes.get(assetId));
  return out;
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
  windows: { x: number; y: number; w: number; h: number; shape?: "rect" | "ellipse"; points?: number[]; rotation?: number }[],
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
    if (win.points?.length) el.maskPoints = win.points;
    block.cells.push({ id: el.id, x: win.x, y: win.y, w: win.w, h: win.h, ...(win.rotation ? { rotation: win.rotation } : {}) });
    return el;
  });
  const withBlock = { ...doc, elements: [...doc.elements, block, ...cells] };
  return { doc: syncLayout(withBlock, block.id, () => undefined), id: block.id };
}
