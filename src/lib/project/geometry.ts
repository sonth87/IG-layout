import type { FrameStyle, ImageAsset, ImageElement, Rect } from "./types";

/** Largest rect with the given aspect (w/h) centered inside `area`. */
export function centeredRect(area: { width: number; height: number }, aspect: number): Rect {
  let width = area.width;
  let height = width / aspect;
  if (height > area.height) {
    height = area.height;
    width = height * aspect;
  }
  return { x: (area.width - width) / 2, y: (area.height - height) / 2, width, height };
}

/** Crop of the whole image that fills a frame of the given size (center crop). */
export function coverCrop(asset: Pick<ImageAsset, "width" | "height">, frame: { width: number; height: number }) {
  return centeredRect(asset, frame.width / frame.height);
}

/**
 * Zoom needed so a w×h image rotated by `degrees` still covers a w×h frame
 * (used by "straighten").
 */
export function straightenScale(width: number, height: number, degrees: number) {
  const t = (Math.abs(degrees) * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  return Math.max((width * c + height * s) / width, (width * s + height * c) / height);
}

/** Axis-aligned bounds of a frame rotated around its center. */
export function rotatedBounds(el: Pick<ImageElement, "x" | "y" | "width" | "height" | "rotation">): Rect {
  const t = (el.rotation * Math.PI) / 180;
  const c = Math.abs(Math.cos(t));
  const s = Math.abs(Math.sin(t));
  const width = el.width * c + el.height * s;
  const height = el.width * s + el.height * c;
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}

export function center(el: Pick<Rect, "x" | "y" | "width" | "height">) {
  return { x: el.x + el.width / 2, y: el.y + el.height / 2 };
}

/**
 * Photo area inside a decorative frame, relative to the element box (M5):
 * polaroid = thick bottom, white = even margin, film = dark border with holes.
 */
export function frameInset(frame: FrameStyle, width: number, height: number): Rect {
  const m = Math.min(width, height);
  switch (frame) {
    case "polaroid":
      return { x: m * 0.06, y: m * 0.06, width: width - m * 0.12, height: height - m * 0.06 - m * 0.22 };
    case "white":
      return { x: m * 0.04, y: m * 0.04, width: width - m * 0.08, height: height - m * 0.08 };
    case "film":
      return { x: m * 0.05, y: m * 0.14, width: width - m * 0.1, height: height - m * 0.28 };
    default:
      return { x: 0, y: 0, width, height };
  }
}

/** Size of the area the photo fills (whole frame unless a decorative frame is set). */
export function innerFrame(el: Pick<ImageElement, "width" | "height" | "frame">) {
  const r = frameInset(el.frame ?? "none", el.width, el.height);
  return { width: r.width, height: r.height };
}
