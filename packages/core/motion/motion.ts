import type Konva from "konva";
import { slideOfElement } from "../project/layout";
import type { CanvasElement, ImageAsset, KenBurns, Motion, ProjectDoc, Rect } from "../project/types";

// Animation (M13.3): elements enter / leave their slide, photos drift (Ken Burns).
// Pure state at time t (seconds from the slide start), applied to the Konva nodes
// directly while playing / exporting and removed afterwards, so editing always sees
// the element where it really is.

export const DEFAULT_MOTION_DURATION = 5;
const DEFAULT_IN = 0.6;
const DEFAULT_OUT = 0.6;
/** How far slides travel (fraction of the slide size) and zoom / pop amounts. */
const TRAVEL = 0.18;

export function hasMotion(el: CanvasElement) {
  const m = el.motion;
  return !!m && !!(m.in || m.out || m.kenBurns || m.loop);
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (p: number) => 1 - (1 - p) ** 3;
const easeIn = (p: number) => p ** 3;
/** Overshoots a little before settling (pop). */
const backOut = (p: number) => {
  const c = 1.7;
  return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2;
};

export interface MotionState {
  opacity: number;
  /** Offset in export px. */
  dx: number;
  dy: number;
  scale: number;
  /** Typewriter: fraction of the characters shown. */
  chars: number;
  /** 0..1 progress over the whole slide (Ken Burns). */
  progress: number;
  /** Extra rotation in degrees (spin, shake). */
  rotation: number;
}

/** Smooth pseudo-random wobble in -1..1 (deterministic: the same frame always looks the same). */
function wobble(t: number, seed: number) {
  return Math.sin(t * 13.1 + seed) * 0.5 + Math.sin(t * 29.7 + seed * 2.3) * 0.3 + Math.sin(t * 47.3 + seed * 4.1) * 0.2;
}

/** State of `el` at `t` seconds into a slide lasting `slideDuration`. */
export function motionAt(el: CanvasElement, t: number, slideDuration: number, slide: Pick<Rect, "width" | "height">): MotionState {
  const m: Motion = el.motion ?? {};
  const s: MotionState = { opacity: 1, dx: 0, dy: 0, scale: 1, chars: 1, progress: clamp01(t / Math.max(0.1, slideDuration)), rotation: 0 };
  const move = (dir: string, amount: number) => {
    if (dir === "slideUp") s.dy += slide.height * TRAVEL * amount;
    if (dir === "slideDown") s.dy -= slide.height * TRAVEL * amount;
    if (dir === "slideLeft") s.dx += slide.width * TRAVEL * amount;
    if (dir === "slideRight") s.dx -= slide.width * TRAVEL * amount;
  };
  if (m.in) {
    const d = m.inDuration ?? DEFAULT_IN;
    const raw = clamp01((t - (m.delay ?? 0)) / d);
    const p = m.in === "pop" ? backOut(raw) : easeOut(raw);
    const rest = 1 - p; // how much is still to come
    if (m.in === "typewriter") s.chars = raw;
    else if (m.in === "zoom") s.scale *= 0.6 + 0.4 * p;
    else if (m.in === "pop") s.scale *= Math.max(0, p);
    else if (m.in !== "fade") move(m.in, rest);
    s.opacity *= m.in === "typewriter" ? (raw > 0 ? 1 : 0) : clamp01(easeOut(raw) * 1.15);
  }
  if (m.loop === "pulse") s.scale *= 1 + 0.06 * Math.sin((2 * Math.PI * t) / 1.2);
  if (m.loop === "float") s.dy += Math.sin((2 * Math.PI * t) / 2.4) * slide.height * 0.015;
  if (m.loop === "flicker") s.opacity *= 0.72 + 0.28 * (0.5 + 0.5 * wobble(t, 1));
  if (m.loop === "spin") s.rotation += (360 * t) / 4;
  if (m.loop === "shake") {
    s.dx += wobble(t * 1.7, 2) * slide.width * 0.006;
    s.dy += wobble(t * 1.7, 5) * slide.width * 0.006;
    s.rotation += wobble(t * 1.7, 9) * 1.2;
  }
  if (m.out) {
    const d = m.outDuration ?? DEFAULT_OUT;
    const raw = clamp01((t - (slideDuration - d)) / d);
    const p = easeIn(raw);
    if (m.out === "zoom") s.scale *= 1 - 0.4 * p;
    else if (m.out !== "fade") move(m.out === "slideUp" ? "slideDown" : m.out === "slideDown" ? "slideUp" : m.out === "slideLeft" ? "slideRight" : "slideLeft", p);
    s.opacity *= 1 - p;
  }
  return s;
}

/** Crop for a Ken Burns frame: zoom / pan the picture inside its frame over the slide. */
export function kenBurnsCrop(crop: Rect, kb: KenBurns, progress: number, image: { width: number; height: number }): Rect {
  const p = progress * progress * (3 - 2 * progress); // smooth start and end
  const zoom = kb === "zoomIn" ? 1 + 0.18 * p : kb === "zoomOut" ? 1.18 - 0.18 * p : 1.12;
  const w = crop.width / zoom;
  const h = crop.height / zoom;
  let x = crop.x + (crop.width - w) / 2;
  const y = crop.y + (crop.height - h) / 2;
  if (kb === "panLeft" || kb === "panRight") {
    const room = crop.width - w;
    x = crop.x + (kb === "panLeft" ? room * (1 - p) : room * p);
  }
  return { x: Math.max(0, Math.min(image.width - w, x)), y: Math.max(0, Math.min(image.height - h, y)), width: w, height: h };
}

/** Does slide `index` have animated elements? */
export function slideHasMotion(doc: ProjectDoc, index: number) {
  return doc.elements.some((el) => !el.hidden && hasMotion(el) && slideOfElement(doc, el) === index);
}

export function motionDuration(doc: ProjectDoc) {
  return doc.motionDuration ?? DEFAULT_MOTION_DURATION;
}

// ── Applying to the canvas ───────────────────────────────────────────
// Ken Burns is read by ImageNode while drawing; node transforms are set here.

let current: { t: number; progress: Map<string, number> } | null = null;
const touched = new Set<string>();

/** Time + per-element slide progress (Ken Burns) while playing / exporting (null = not animating). */
export function motionClock() {
  return current;
}

/**
 * Puts every animated element of `doc` in its state at `t` (seconds). `slideDuration(i)`
 * gives each slide's length (videos make slides longer).
 */
export function applyMotion(
  layer: Konva.Layer,
  doc: ProjectDoc,
  /** Seconds — the same for every slide, or per slide (the single-video export plays slides one after another). */
  time: number | ((index: number) => number),
  slideDuration: (index: number) => number,
  slide: Pick<Rect, "width" | "height">,
) {
  const timeOf = typeof time === "number" ? () => time : time;
  current = { t: timeOf(0), progress: new Map() };
  for (const el of doc.elements) {
    if (el.hidden || !hasMotion(el)) continue;
    const index = slideOfElement(doc, el);
    const d = slideDuration(index);
    const node = layer.findOne(`#${el.id}`);
    if (!node) continue;
    const s = motionAt(el, Math.min(timeOf(index), d), d, slide);
    current.progress.set(el.id, s.progress);
    node.opacity(el.opacity * s.opacity);
    node.position({ x: el.x + el.width / 2 + s.dx, y: el.y + el.height / 2 + s.dy });
    node.scale({ x: s.scale, y: s.scale });
    node.rotation(el.rotation + s.rotation);
    if (el.type === "text") {
      const text = (node as Konva.Group).findOne<Konva.Text>("Text");
      text?.text(el.text.slice(0, Math.round(el.text.length * s.chars)));
    }
    touched.add(el.id);
  }
}

/** Puts animated elements back where the document says (stopping / editing). */
export function clearMotion(layer: Konva.Layer, doc: ProjectDoc) {
  current = null;
  for (const id of touched) {
    const el = doc.elements.find((e) => e.id === id);
    const node = layer.findOne(`#${id}`);
    if (!el || !node) continue;
    node.opacity(el.opacity);
    node.position({ x: el.x + el.width / 2, y: el.y + el.height / 2 });
    node.scale({ x: 1, y: 1 });
    node.rotation(el.rotation);
    if (el.type === "text") (node as Konva.Group).findOne<Konva.Text>("Text")?.text(el.text);
  }
  touched.clear();
}

/** Length of slide `index` when it plays: its longest video, or the animation length. */
export function makeSlideDuration(doc: ProjectDoc, assets: Record<string, ImageAsset>, videoLength: (el: CanvasElement, asset: ImageAsset) => number) {
  return (index: number) => {
    let d = 0;
    for (const el of doc.elements) {
      if (el.type !== "image" || el.hidden || !el.assetId) continue;
      const a = assets[el.assetId];
      if (a?.video && slideOfElement(doc, el) === index) d = Math.max(d, videoLength(el, a));
    }
    return d > 0 ? d : motionDuration(doc);
  };
}
