import { useMemo } from "react";
import { frameById } from "@ig-layout/core/booth/frames";
import { paintBackdrop, renderFrame, type RenderOptions, type ShotImage } from "@ig-layout/core/booth/render";
import { themeById } from "@ig-layout/core/booth/themes";
import { filterById } from "@ig-layout/core/color/filters";
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

export function lookOptions(roll: BoothRoll): RenderOptions {
  return { theme: themeById(roll.theme), flip: roll.flip, title: roll.title, showDate: roll.showDate, date: new Date(roll.createdAt), fonts: canvasFonts };
}

/** The roll's shots, filtered, for drawing (null until decoded). */
export function useRollImages(roll: BoothRoll) {
  const images = useShotImages(roll.shots);
  const filterId = rollFilter(roll);
  return useMemo(() => images && images.map((i) => (i ? filtered(i, filterId) : null)), [images, filterId]);
}

/** Everything a render of the roll needs, outside React (thumbnail, export). */
export async function rollRender(roll: BoothRoll) {
  const filterId = rollFilter(roll);
  const images = (await shotImages(roll.shots)).map((i) => (i ? filtered(i, filterId) : null));
  return { frame: frameById(roll.frameId), images, opts: lookOptions(roll) };
}

/** Load the faces this roll's theme uses (canvas can't wait for fonts by itself). */
export function loadThemeFonts(themeId: string | undefined) {
  const th = themeById(themeId);
  return Promise.all([th.title.font, th.sub.font].map((r) => document.fonts.load(`${th.title.weight} 20px ${canvasFonts[r]}`).catch(() => []))).then(() => {});
}

export type Format = "print" | "post" | "story";
const FORMAT_SIZE = { post: { width: 1080, height: 1350 }, story: { width: 1080, height: 1920 } };

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92));
}

/** The print in an Instagram size (step 3): on the theme's paper, a little tilted with a soft
 * shadow; a strip in a Post goes twice, side by side, like the two strips of a 4 × 6 print. */
export async function formatCanvas(roll: BoothRoll, format: Format): Promise<HTMLCanvasElement> {
  const { frame, images, opts } = await rollRender(roll);
  await loadThemeFonts(roll.theme);
  const print = document.createElement("canvas");
  renderFrame(print, frame, images, opts);
  if (format === "print") return print;
  const { width: W, height: H } = FORMAT_SIZE[format];
  const out = document.createElement("canvas");
  const c = paintBackdrop(out, W, H, opts.theme);
  const twice = format === "post" && frame.width / frame.height < 0.5;
  const copies = twice ? [-1, 1] : [0];
  // Fit: two strips share the width; otherwise one print within 84 % of the sheet.
  const maxW = twice ? W * 0.4 : W * 0.84;
  const k = Math.min(maxW / print.width, (H * 0.84) / print.height);
  const w = print.width * k;
  const h = print.height * k;
  for (const side of copies) {
    c.save();
    c.translate(W / 2 + side * (w / 2 + W * 0.03), H / 2);
    c.rotate(((side || -1) * 1.5 * Math.PI) / 180);
    c.shadowColor = "rgba(0,0,0,0.32)";
    c.shadowBlur = 28;
    c.shadowOffsetY = 12;
    c.drawImage(print, -w / 2, -h / 2, w, h);
    c.restore();
  }
  return out;
}

export async function formatBlob(roll: BoothRoll, format: Format) {
  return toBlob(await formatCanvas(roll, format));
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
