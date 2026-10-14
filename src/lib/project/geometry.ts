import type { ImageAsset, ImageElement, Rect } from "./types";

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

/** Which slide an element belongs to: the slide containing its center. */
export function slideOf(el: Pick<Rect, "x" | "width">, slideWidth: number, slideCount: number) {
  return Math.max(0, Math.min(slideCount - 1, Math.floor((el.x + el.width / 2) / slideWidth)));
}
