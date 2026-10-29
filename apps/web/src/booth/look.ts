import { useMemo } from "react";
import { frameById } from "@ig-layout/core/booth/frames";
import type { RenderOptions, ShotImage } from "@ig-layout/core/booth/render";
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
