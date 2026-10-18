import { frameInset, straightenScale } from "./geometry";
import type { ImageElement, Rect } from "./types";

// Cropping on the canvas (D-111, editor-v2/09 §6). The stored crop (a rect of the picture,
// then turned by `straighten` and zoomed to cover) is edited as a "view": where the
// picture sits in the frame window — its centre (frame px from the window centre), its
// zoom (frame px per picture px) and its turn. Everything is in the element's own axes.

export interface CropView {
  /** Window px per picture px. */
  z: number;
  /** Degrees (= straighten). */
  theta: number;
  /** Centre of the picture, from the window centre (window px). */
  px: number;
  py: number;
}

export interface Size {
  width: number;
  height: number;
}

const rad = (d: number) => (d * Math.PI) / 180;
const rot = (x: number, y: number, deg: number) => {
  const r = rad(deg);
  return { x: x * Math.cos(r) - y * Math.sin(r), y: x * Math.sin(r) + y * Math.cos(r) };
};

/** The photo window of an element: size, and its centre from the element's centre. */
export function cropWindow(el: Pick<ImageElement, "width" | "height" | "frame">) {
  const r = frameInset(el.frame ?? "none", el.width, el.height);
  return { width: r.width, height: r.height, cx: r.x + r.width / 2 - el.width / 2, cy: r.y + r.height / 2 - el.height / 2 };
}

/** The view of a stored crop. */
export function toView(el: Pick<ImageElement, "crop" | "straighten" | "flipX" | "flipY">, win: Size, pic: Size): CropView {
  const s = straightenScale(win.width, win.height, el.straighten);
  const c = el.crop;
  const z = (s * win.width) / c.width;
  // Picture centre → window: p = z · R(θ) · F · (centre − crop centre).
  const f = { x: (el.flipX ? -1 : 1) * (pic.width / 2 - (c.x + c.width / 2)), y: (el.flipY ? -1 : 1) * (pic.height / 2 - (c.y + c.height / 2)) };
  const p = rot(f.x, f.y, el.straighten);
  return { z, theta: el.straighten, px: p.x * z, py: p.y * z };
}

/** The stored crop + straighten of a view. */
export function fromView(v: CropView, el: Pick<ImageElement, "flipX" | "flipY">, win: Size, pic: Size): { crop: Rect; straighten: number } {
  const s = straightenScale(win.width, win.height, v.theta);
  const width = (s * win.width) / v.z;
  const height = (width * win.height) / win.width;
  const q = rot(v.px / v.z, v.py / v.z, -v.theta);
  const mx = pic.width / 2 - (el.flipX ? -1 : 1) * q.x;
  const my = pic.height / 2 - (el.flipY ? -1 : 1) * q.y;
  return { crop: { x: mx - width / 2, y: my - height / 2, width, height }, straighten: v.theta };
}

/** Smallest zoom at which the turned window still fits in the picture. */
export function minZoom(theta: number, win: Size, pic: Size) {
  const c = Math.abs(Math.cos(rad(theta)));
  const s = Math.abs(Math.sin(rad(theta)));
  return Math.max((win.width * c + win.height * s) / pic.width, (win.width * s + win.height * c) / pic.height);
}

/**
 * The nearest view where the picture covers the whole window: zoomed up if needed, then
 * moved so no edge of the window leaves the picture.
 */
export function clampView(v: CropView, win: Size, pic: Size): CropView {
  const z = Math.max(v.z, minZoom(v.theta, win, pic));
  const c = Math.abs(Math.cos(rad(v.theta)));
  const s = Math.abs(Math.sin(rad(v.theta)));
  // Half extents of the turned window, in picture px.
  const ex = (win.width * c + win.height * s) / (2 * z);
  const ey = (win.width * s + win.height * c) / (2 * z);
  // Window centre in picture px, relative to the picture centre (in the picture's turned axes).
  const q = rot(-v.px / z, -v.py / z, -v.theta);
  const qx = Math.max(ex - pic.width / 2, Math.min(pic.width / 2 - ex, q.x));
  const qy = Math.max(ey - pic.height / 2, Math.min(pic.height / 2 - ey, q.y));
  const p = rot(-qx * z, -qy * z, v.theta);
  return { z, theta: v.theta, px: p.x, py: p.y };
}

/** Does the picture cover the window (with a little slack for rounding)? */
export function covers(v: CropView, win: Size, pic: Size) {
  const k = clampView(v, win, pic);
  return Math.abs(k.z - v.z) < 1e-6 * v.z + 1e-9 && Math.hypot(k.px - v.px, k.py - v.py) < 0.5;
}

/** Corners of the picture in window px (top-left, top-right, bottom-right, bottom-left). */
export function pictureCorners(v: CropView, pic: Size) {
  const hw = (pic.width * v.z) / 2;
  const hh = (pic.height * v.z) / 2;
  return ([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]] as const).map(([x, y]) => {
    const p = rot(x, y, v.theta);
    return { x: v.px + p.x, y: v.py + p.y };
  });
}

export { rot as rotatePoint };
