import { useEffect, useMemo, useState } from "react";
import { frameById } from "@ig-layout/core/booth/frames";
import { layoutFrame } from "@ig-layout/core/booth/layout";
import { paintBackdrop, renderFrame, type RenderOptions, type ShotImage } from "@ig-layout/core/booth/render";
import { themeById, themePieces, type BoothTheme } from "@ig-layout/core/booth/themes";
import { newSeed } from "@ig-layout/core/booth/layout";
import { filterById } from "@ig-layout/core/color/filters";
import { PROPS } from "@ig-layout/core/elements/props";
import { stickerSvg } from "@ig-layout/core/elements/stickers";
import { stickerAspect, type BoothSticker, type StickerDraw } from "@ig-layout/core/booth/stickers";
import { NO_ADJUST, shaderParams } from "@ig-layout/core/color/params";
import { processImage } from "@ig-layout/core/color/processor";
import type { BoothRoll } from "@ig-layout/core/storage/booth";
import { canvasFonts } from "./fonts";
import { shotImages, useShotImages } from "./images";

// How a roll looks: its frame, theme, the filter on its shots (IG Layout's colour pipeline,
// shared through packages/core) and the caption — one place for the previews, the saved
// file and the thumbnail.

/** The filter in effect: the roll's choice, else its theme's. */
export function rollFilter(roll: Pick<BoothRoll, "filter" | "theme">) {
  return roll.filter === undefined ? themeById(roll.theme).filter : roll.filter ?? undefined;
}

const MAX = 2048;
const canvases = new WeakMap<object, HTMLCanvasElement>();

/** A shot with a filter applied (the original when there's none or no WebGL). */
export function filtered(img: ShotImage, filterId: string | undefined): ShotImage {
  const f = filterId ? filterById(filterId) : undefined;
  if (!f) return img;
  let src = canvases.get(img.source as object);
  if (!src) {
    src = document.createElement("canvas");
    src.width = img.width;
    src.height = img.height;
    src.getContext("2d")!.drawImage(img.source, 0, 0);
    canvases.set(img.source as object, src);
  }
  const out = processImage(src, shaderParams(NO_ADJUST, f.preset, 100), MAX);
  return out ? { source: out, width: out.width, height: out.height } : img;
}

/** A theme picked: its whole look — filter, arrangement + cell shape, decorations (the frame,
 * photos and caption stay). */
export function withTheme(roll: BoothRoll, t: BoothTheme): BoothRoll {
  return { ...roll, theme: t.id, filter: undefined, layout: { ...t.layout, seed: roll.layout?.seed ?? newSeed() }, decor: themePieces(t) };
}

/** The roll's frame with its layout (arrangement, shape) applied. */
export function rollFrame(roll: Pick<BoothRoll, "frameId" | "layout">) {
  return layoutFrame(frameById(roll.frameId), roll.layout);
}

// ---- stickers: their SVG pictures, loaded once per sticker + colour ----

const stickerImages = new Map<string, HTMLImageElement>();
const stickerLoads = new Map<string, Promise<void>>();
const stickerKey = (s: BoothSticker) => `${s.key}|${s.color ?? PROPS[s.key]?.color ?? ""}`;

function loadSticker(s: BoothSticker): Promise<void> {
  const k = stickerKey(s);
  let p = stickerLoads.get(k);
  if (!p) {
    p = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        stickerImages.set(k, img);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(stickerSvg(s.key, s.color ?? PROPS[s.key]?.color ?? "#000", 600))}`;
    });
    stickerLoads.set(k, p);
  }
  return p;
}

export function loadStickers(list: BoothSticker[] | undefined) {
  return Promise.all((list ?? []).map(loadSticker)).then(() => {});
}

/** The roll's stickers that are loaded, ready to draw. */
function stickerDraws(list: BoothSticker[] | undefined): StickerDraw[] {
  return (list ?? []).flatMap((s) => {
    const img = stickerImages.get(stickerKey(s));
    return img ? [{ ...s, img, h: s.w * stickerAspect(s.key) }] : [];
  });
}

/** Re-render when the roll's sticker pictures arrive. */
export function useStickersLoaded(list: BoothSticker[] | undefined) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let gone = false;
    void loadStickers(list).then(() => !gone && setN((x) => x + 1));
    return () => {
      gone = true;
    };
  }, [list]);
  return n;
}

export function lookOptions(roll: BoothRoll): RenderOptions {
  return { theme: themeById(roll.theme), decor: roll.decor, stickers: stickerDraws(roll.stickers), flip: roll.flip, title: roll.title, showDate: roll.showDate, date: new Date(roll.createdAt), fonts: canvasFonts };
}

/** The roll's shots, filtered, for drawing (null until decoded). */
export function useRollImages(roll: BoothRoll) {
  const images = useShotImages(roll.shots);
  const filterId = rollFilter(roll);
  return useMemo(() => images && images.map((i) => (i ? filtered(i, filterId) : null)), [images, filterId]);
}

/** Everything a render of the roll needs, outside React (thumbnail, export). */
export async function rollRender(roll: BoothRoll) {
  await loadStickers(roll.stickers);
  const filterId = rollFilter(roll);
  const images = (await shotImages(roll.shots)).map((i) => (i ? filtered(i, filterId) : null));
  return { frame: rollFrame(roll), images, opts: lookOptions(roll) };
}

/** Load the faces this roll's theme uses (canvas can't wait for fonts by itself). */
export function loadThemeFonts(themeId: string | undefined) {
  const th = themeById(themeId);
  return Promise.all([th.title.font, th.sub.font].map((r) => document.fonts.load(`${th.title.weight} 20px ${canvasFonts[r]}`).catch(() => []))).then(() => {});
}

export type Format = "print" | "post" | "story";
const FORMAT_SIZE = { post: { width: 1080, height: 1350 }, story: { width: 1080, height: 1920 } };

export function toBlob(canvas: HTMLCanvasElement, type = "image/jpeg"): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), type, 0.92));
}

/** The print in an Instagram size (step 3): on the theme's paper, a little tilted with a soft
 * shadow; a strip in a Post goes twice, side by side, like the two strips of a 4 × 6 print. */
/** Where the print goes on an Instagram-sized sheet (step 3): a little tilted; a strip in a
 * Post goes twice, side by side, like the two strips of a 4 × 6 print. Sheet pixels. */
export function placements(print: { width: number; height: number }, format: "post" | "story") {
  const { width: W, height: H } = FORMAT_SIZE[format];
  const twice = format === "post" && print.width / print.height < 0.5;
  const copies = twice ? [-1, 1] : [0];
  // Fit: two strips share the width; otherwise one print within 84 % of the sheet.
  const maxW = twice ? W * 0.4 : W * 0.84;
  const k = Math.min(maxW / print.width, (H * 0.84) / print.height);
  const w = print.width * k;
  const h = print.height * k;
  return { W, H, list: copies.map((side) => ({ cx: W / 2 + side * (w / 2 + W * 0.03), cy: H / 2, w, h, rot: (side || -1) * 1.5 })) };
}

/** The print alone (the frame with its photos, theme, decorations, stickers). */
export async function printCanvas(roll: BoothRoll) {
  const { frame, images, opts } = await rollRender(roll);
  await loadThemeFonts(roll.theme);
  const print = document.createElement("canvas");
  renderFrame(print, frame, images, opts);
  return { print, theme: opts.theme! };
}

/** The theme's paper for an Instagram-sized sheet, on its own (a background in IG Layout). */
export function backdropCanvas(theme: BoothTheme, format: "post" | "story") {
  const { width: W, height: H } = FORMAT_SIZE[format];
  const out = document.createElement("canvas");
  paintBackdrop(out, W, H, theme);
  return out;
}

export async function formatCanvas(roll: BoothRoll, format: Format): Promise<HTMLCanvasElement> {
  const { print, theme } = await printCanvas(roll);
  if (format === "print") return print;
  const out = backdropCanvas(theme, format);
  drawOnSheet(out.getContext("2d")!, print, format);
  return out;
}

/** The print placed on an Instagram-sized sheet already painted on `c`. */
export function drawOnSheet(c: CanvasRenderingContext2D, print: HTMLCanvasElement, format: "post" | "story") {
  for (const p of placements(print, format).list) {
    c.save();
    c.translate(p.cx, p.cy);
    c.rotate((p.rot * Math.PI) / 180);
    c.shadowColor = "rgba(0,0,0,0.32)";
    c.shadowBlur = 28;
    c.shadowOffsetY = 12;
    c.drawImage(print, -p.w / 2, -p.h / 2, p.w, p.h);
    c.restore();
  }
}

export async function formatBlob(roll: BoothRoll, format: Format = "print", type = "image/jpeg") {
  return toBlob(await formatCanvas(roll, format), type);
}

/** Each shot as it looks in the print (filter, flip), for IG Layout. */
export async function shotBlobs(roll: BoothRoll): Promise<Blob[]> {
  const { images, opts } = await rollRender(roll);
  const out: Blob[] = [];
  for (const img of images) {
    if (!img) continue;
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext("2d")!;
    if (opts.flip) {
      g.translate(img.width, 0);
      g.scale(-1, 1);
    }
    g.drawImage(img.source, 0, 0);
    out.push(await toBlob(c));
  }
  return out;
}
