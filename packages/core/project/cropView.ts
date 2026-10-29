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

// ── 3D tilt (D-111 part 2) ─────────────────────────────────────────────────
// The picture lies on a plane turned around the window's horizontal axis (tiltX, "Dọc")
// and vertical axis (tiltY, "Ngang"), through the window centre, seen in perspective.
// The view (z, θ, px, py) lives on that plane ("flat" window px); the screen shows its
// projection. A homography maps flat → screen (window px from the window centre).

export interface Tilt {
  x: number;
  y: number;
}

export const NO_TILT: Tilt = { x: 0, y: 0 };
export const tilted = (t: Tilt | undefined) => !!t && (Math.abs(t.x) > 1e-3 || Math.abs(t.y) > 1e-3);

/** 3×3 row-major. */
export type Mat3 = [number, number, number, number, number, number, number, number, number];

/** flat → screen. */
export function tiltMatrix(t: Tilt, win: Size): Mat3 {
  const f = 1.6 * Math.hypot(win.width, win.height);
  const a = rad(-t.x);
  const b = rad(t.y);
  // R = Ry(b) · Rx(a)
  const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
  const r00 = cb, r01 = sb * sa;
  const r10 = 0, r11 = ca;
  const r20 = -sb, r21 = cb * sa;
  return [f * r00, f * r01, 0, f * r10, f * r11, 0, r20, r21, f];
}

export function invert3(m: Mat3): Mat3 {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [A / det, -(b * i - c * h) / det, (b * f - c * e) / det, B / det, (a * i - c * g) / det, -(a * f - c * d) / det, C / det, -(a * h - b * g) / det, (a * e - b * d) / det];
}

export function mul3(m: Mat3, n: Mat3): Mat3 {
  const o = new Array(9).fill(0) as Mat3;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) for (let k = 0; k < 3; k++) o[r * 3 + c] += m[r * 3 + k] * n[k * 3 + c];
  return o;
}

export function apply3(m: Mat3, x: number, y: number) {
  const w = m[6] * x + m[7] * y + m[8];
  return { x: (m[0] * x + m[1] * y + m[2]) / w, y: (m[3] * x + m[4] * y + m[5]) / w };
}

/** Screen (window px from its centre) → flat. */
export function unproject(p: { x: number; y: number }, t: Tilt | undefined, win: Size) {
  return tilted(t) ? apply3(invert3(tiltMatrix(t!, win)), p.x, p.y) : p;
}

/** Flat → screen. */
export function project(p: { x: number; y: number }, t: Tilt | undefined, win: Size) {
  return tilted(t) ? apply3(tiltMatrix(t!, win), p.x, p.y) : p;
}

/** The window's corners on the picture's plane (flat px). */
function windowOnPlane(win: Size, t: Tilt | undefined) {
  const hw = win.width / 2;
  const hh = win.height / 2;
  return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => unproject({ x, y }, t, win));
}

/** Extents of the window on the plane, in the picture's turned axes (window px, before / z). */
function spans(theta: number, win: Size, t: Tilt | undefined) {
  const g = windowOnPlane(win, t).map((p) => rot(p.x, p.y, -theta));
  return { minX: Math.min(...g.map((p) => p.x)), maxX: Math.max(...g.map((p) => p.x)), minY: Math.min(...g.map((p) => p.y)), maxY: Math.max(...g.map((p) => p.y)) };
}

/** Smallest zoom at which the (turned, tilted) window still fits in the picture. */
export function minZoom(theta: number, win: Size, pic: Size, t?: Tilt) {
  const s = spans(theta, win, t);
  return Math.max((s.maxX - s.minX) / pic.width, (s.maxY - s.minY) / pic.height);
}

/**
 * The nearest view where the picture covers the whole window: zoomed up if needed, then
 * moved so no edge of the window leaves the picture.
 */
export function clampView(v: CropView, win: Size, pic: Size, t?: Tilt): CropView {
  const z = Math.max(v.z, minZoom(v.theta, win, pic, t));
  const s = spans(v.theta, win, t);
  // Picture centre in the turned axes (window px); every window corner g must satisfy
  // |g − h| ≤ size · z / 2 on each axis.
  const h = rot(v.px, v.py, -v.theta);
  const hx = Math.max(s.maxX - (pic.width * z) / 2, Math.min(s.minX + (pic.width * z) / 2, h.x));
  const hy = Math.max(s.maxY - (pic.height * z) / 2, Math.min(s.minY + (pic.height * z) / 2, h.y));
  const p = rot(hx, hy, v.theta);
  return { z, theta: v.theta, px: p.x, py: p.y };
}

/** Does the picture cover the window (with a little slack for rounding)? */
export function covers(v: CropView, win: Size, pic: Size, t?: Tilt) {
  const k = clampView(v, win, pic, t);
  return Math.abs(k.z - v.z) < 1e-6 * v.z + 1e-9 && Math.hypot(k.px - v.px, k.py - v.py) < 0.5;
}

/**
 * Output px of a w×h canvas showing the window (or a part of it: `area`, window px from
 * its centre) → picture px. Used to draw a tilted picture with a homography (WebGL).
 */
export function screenToPicture(v: CropView, el: { flipX: boolean; flipY: boolean }, win: Size, pic: Size, t: Tilt, area: { x: number; y: number; width: number; height: number }, out: Size): Mat3 {
  // out px → screen (window px)
  const S: Mat3 = [area.width / out.width, 0, area.x, 0, area.height / out.height, area.y, 0, 0, 1];
  const Minv = invert3(tiltMatrix(t, win));
  // flat → picture: u = c + F · R(−θ) · (q − p) / z
  const r = rad(-v.theta);
  const fx = el.flipX ? -1 : 1;
  const fy = el.flipY ? -1 : 1;
  const A: Mat3 = [
    (fx * Math.cos(r)) / v.z, (-fx * Math.sin(r)) / v.z, 0,
    (fy * Math.sin(r)) / v.z, (fy * Math.cos(r)) / v.z, 0,
    0, 0, 1,
  ];
  const T: Mat3 = [1, 0, -v.px, 0, 1, -v.py, 0, 0, 1];
  const C: Mat3 = [1, 0, pic.width / 2, 0, 1, pic.height / 2, 0, 0, 1];
  return mul3(C, mul3(A, mul3(T, mul3(Minv, S))));
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
