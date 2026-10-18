import { clampView, covers, cropWindow, fromView, pictureCorners, rotatePoint, toView, type CropView, type Size, type Tilt } from "@/lib/project/cropView";
import type { ImageAsset, ImageElement } from "@/lib/project/types";
import { updateEl, useEditor } from "@/store/editor";

// What the crop layer, its gestures and its bar share (D-111).

export const MIN_WINDOW = 40;

/** The image being cropped, from the draft (or the doc). */
export function cropTarget(id: string | null) {
  const s = useEditor.getState();
  const doc = s.draft ?? s.doc;
  const el = doc?.elements.find((e) => e.id === id);
  if (!el || el.type !== "image" || !el.assetId) return null;
  const asset = s.assets[el.assetId];
  return asset ? { el, asset } : null;
}

/** Picture size (videos: their poster, same size). */
export const picSize = (a: Pick<ImageAsset, "width" | "height">): Size => ({ width: a.width, height: a.height });

/** Can the window be resized? Only a free photo; cells and framed photos keep their window. */
export function windowResizable(el: ImageElement) {
  return !el.parentId && !el.slot && (el.frame ?? "none") === "none";
}

export const tiltOf = (el: Pick<ImageElement, "tiltX" | "tiltY">): Tilt => ({ x: el.tiltX ?? 0, y: el.tiltY ?? 0 });

export function viewOf(el: ImageElement, asset: ImageAsset) {
  const win = cropWindow(el);
  return { win, view: toView(el, win, picSize(asset)) };
}

/** Writes a view (and optionally a new window / tilt) back into the draft, covering the window. */
export function writeView(el: ImageElement, asset: ImageAsset, view: CropView, frame?: { width: number; height: number; x: number; y: number }, tilt?: Tilt) {
  const geom = frame ? { ...el, ...frame } : el;
  const win = cropWindow(geom);
  const t = tilt ?? tiltOf(el);
  const v = clampView(view, win, picSize(asset), t);
  const stored = fromView(v, el, win, picSize(asset));
  const tiltPatch = tilt ? { tiltX: tilt.x, tiltY: tilt.y } : {};
  useEditor.getState().updateDraft((d) => updateEl(d, el.id, { ...stored, ...(frame ?? {}), ...tiltPatch }));
}

/** Canvas point → the window's own axes (origin at the window centre). */
export function toWindow(el: ImageElement, p: { x: number; y: number }) {
  const win = cropWindow(el);
  const local = rotatePoint(p.x - (el.x + el.width / 2), p.y - (el.y + el.height / 2), -el.rotation);
  return { x: local.x - win.cx, y: local.y - win.cy };
}

export type Handle = { kind: "window"; sx: -1 | 0 | 1; sy: -1 | 0 | 1 } | { kind: "picture"; index: number };

/** Handles of the window (corners, then edge middles), in window px. */
export function windowHandles(win: Size) {
  const out: { sx: -1 | 0 | 1; sy: -1 | 0 | 1; x: number; y: number }[] = [];
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [1, 0], [0, 1], [-1, 0]] as const)
    out.push({ sx, sy, x: (sx * win.width) / 2, y: (sy * win.height) / 2 });
  return out;
}

/** Handles of the picture: 4 corners then 4 edge middles (window px). */
export function pictureHandles(view: CropView, pic: Size) {
  const c = pictureCorners(view, pic);
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  return [...c, mid(c[0], c[1]), mid(c[1], c[2]), mid(c[2], c[3]), mid(c[3], c[0])];
}

/** The handle opposite a picture handle (it stays put while the other is dragged). */
export function oppositeHandle(index: number) {
  return index < 4 ? (index + 2) % 4 : 4 + ((index - 4 + 2) % 4);
}

/**
 * Resizes the window from a handle towards `p` (window px of the start), the opposite side
 * fixed; `aspect` keeps its shape. Stops where the picture would no longer cover it.
 * Returns the new element geometry and the picture's centre from the new window centre.
 */
export function resizeWindow(start: { el: ImageElement; view: CropView; pic: Size }, h: { sx: number; sy: number }, p: { x: number; y: number }, aspect: number | null) {
  const { el, view, pic } = start;
  const L0 = -el.width / 2;
  const R0 = el.width / 2;
  const T0 = -el.height / 2;
  const B0 = el.height / 2;
  let L = h.sx < 0 ? Math.min(p.x, R0 - MIN_WINDOW) : L0;
  let R = h.sx > 0 ? Math.max(p.x, L0 + MIN_WINDOW) : R0;
  let T = h.sy < 0 ? Math.min(p.y, B0 - MIN_WINDOW) : T0;
  let B = h.sy > 0 ? Math.max(p.y, T0 + MIN_WINDOW) : B0;
  if (aspect) {
    let w = R - L;
    let hh = B - T;
    if (h.sx && h.sy) {
      // Corner: the bigger change wins.
      if (w / el.width > hh / el.height) hh = w / aspect;
      else w = hh * aspect;
    } else if (h.sx) hh = w / aspect;
    else w = hh * aspect;
    if (h.sx < 0) L = R - w;
    else if (h.sx > 0) R = L + w;
    else {
      L = -w / 2;
      R = w / 2;
    }
    if (h.sy < 0) T = B - hh;
    else if (h.sy > 0) B = T + hh;
    else {
      T = -hh / 2;
      B = hh / 2;
    }
  }
  const at = (t: number) => {
    const l = L0 + (L - L0) * t;
    const r = R0 + (R - R0) * t;
    const tp = T0 + (T - T0) * t;
    const b = B0 + (B - B0) * t;
    const o = { x: (l + r) / 2, y: (tp + b) / 2 };
    const win = { width: r - l, height: b - tp };
    return { win, o, v: { ...view, px: view.px - o.x, py: view.py - o.y } };
  };
  const tilt = tiltOf(el);
  let t = 1;
  if (!covers(at(1).v, at(1).win, pic, tilt)) {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      if (covers(at(mid).v, at(mid).win, pic, tilt)) lo = mid;
      else hi = mid;
    }
    t = lo;
  }
  const r = at(t);
  const c = rotatePoint(r.o.x, r.o.y, el.rotation);
  const cx = el.x + el.width / 2 + c.x;
  const cy = el.y + el.height / 2 + c.y;
  return { frame: { width: r.win.width, height: r.win.height, x: cx - r.win.width / 2, y: cy - r.win.height / 2 }, view: r.v };
}
