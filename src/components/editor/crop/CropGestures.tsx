"use client";

import { useRef } from "react";
import { clampView, cropWindow, unproject, type CropView, type Size } from "@/lib/project/cropView";
import type { ImageElement } from "@/lib/project/types";
import { useEditor } from "@/store/editor";
import { cropTarget, oppositeHandle, picSize, pictureHandles, resizeWindow, tiltOf, toWindow, viewOf, windowHandles, windowResizable, writeView } from "./cropModel";

// Gestures while cropping (D-111), on a layer over the stage so nothing else (scrolling,
// selecting, the canvas pinch) reacts:
// - a window handle resizes the window (free photos only; it never moves);
// - a picture handle zooms the picture, its opposite handle staying put;
// - dragging anywhere else moves the picture; two fingers zoom it.
// The picture always covers the window.

const GRAB = 24; // screen px

type Start = { el: ImageElement; view: CropView; win: Size; pic: Size; p: { x: number; y: number } };
type Mode =
  | { kind: "move" }
  | { kind: "window"; sx: -1 | 0 | 1; sy: -1 | 0 | 1 }
  | { kind: "picture"; anchor: { x: number; y: number }; handle: { x: number; y: number } }
  | { kind: "pinch"; d0: number; c0: { x: number; y: number } }
  /** A window handle on top of a picture handle: decided by the first move (out = zoom, in = resize). */
  | { kind: "either"; window: { sx: -1 | 0 | 1; sy: -1 | 0 | 1 }; picture: { anchor: { x: number; y: number }; handle: { x: number; y: number } } };

export function CropGestures({ id, aspect }: { id: string; aspect: number | null }) {
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const state = useRef<{ start: Start; mode: Mode } | null>(null);
  const frame = useRef(0);
  const pending = useRef<(() => void) | null>(null);

  /** Canvas px of a pointer event. */
  function canvasPoint(e: { clientX: number; clientY: number }) {
    const stage = useEditor.getState().canvas?.layer.getStage();
    if (!stage) return null;
    const r = stage.container().getBoundingClientRect();
    return { x: (e.clientX - r.left - stage.x()) / stage.scaleX(), y: (e.clientY - r.top - stage.y()) / stage.scaleY() };
  }

  function schedule(fn: () => void) {
    pending.current = fn;
    frame.current ||= requestAnimationFrame(() => {
      frame.current = 0;
      pending.current?.();
      pending.current = null;
    });
  }

  function begin() {
    const t = cropTarget(id);
    const pts = [...pointers.current.values()];
    if (!t || pts.length === 0) return (state.current = null);
    const { win, view } = viewOf(t.el, t.asset);
    const pic = picSize(t.asset);
    const scale = useEditor.getState().canvas?.layer.getStage()?.scaleX() ?? 1;
    // The picture lives on its (tilted) plane: its gestures are measured there.
    const flat = (q: { x: number; y: number }) => unproject(toWindow(t.el, q), tiltOf(t.el), win);
    if (pts.length >= 2) {
      const a = flat(pts[0]);
      const b = flat(pts[1]);
      state.current = { start: { el: t.el, view, win, pic, p: a }, mode: { kind: "pinch", d0: Math.hypot(b.x - a.x, b.y - a.y) || 1, c0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } } };
      return;
    }
    const p = toWindow(t.el, pts[0]);
    const pf = flat(pts[0]);
    const tol = GRAB / scale;
    const start = { el: t.el, view, win, pic, p: pf };
    const near = (h: { x: number; y: number }) => Math.hypot(h.x - p.x, h.y - p.y);
    const wh = windowResizable(t.el) ? windowHandles(win).filter((h) => near(h) < tol).sort((a, b) => near(a) - near(b))[0] : undefined;
    const hs = pictureHandles(view, pic);
    const nearFlat = (h: { x: number; y: number }) => Math.hypot(h.x - pf.x, h.y - pf.y);
    const order = hs.map((h, i) => ({ h, i })).filter(({ h }) => nearFlat(h) < tol).sort((a, b) => nearFlat(a.h) - nearFlat(b.h));
    const ph = order[0] ? { handle: order[0].h, anchor: hs[oppositeHandle(order[0].i)] } : undefined;
    if (wh && ph) return (state.current = { start, mode: { kind: "either", window: { sx: wh.sx, sy: wh.sy }, picture: ph } });
    if (wh) return (state.current = { start, mode: { kind: "window", sx: wh.sx, sy: wh.sy } });
    if (ph) return (state.current = { start, mode: { kind: "picture", ...ph } });
    state.current = { start, mode: { kind: "move" } };
  }

  function update() {
    const s = state.current;
    const t = cropTarget(id);
    if (!s || !t) return;
    const { start } = s;
    const screen = [...pointers.current.values()].map((p) => toWindow(start.el, p));
    const pts = screen.map((p) => unproject(p, tiltOf(start.el), start.win));
    let mode = s.mode;
    if (mode.kind === "either") {
      // Outwards (away from the window's middle) the window can't grow past the picture: zoom it.
      const dx = pts[0].x - start.p.x;
      const dy = pts[0].y - start.p.y;
      // (on the plane; close enough to the screen direction for the in / out choice)
      if (Math.hypot(dx, dy) * (useEditor.getState().canvas?.layer.getStage()?.scaleX() ?? 1) < 4) return;
      const out = dx * mode.window.sx * start.win.width + dy * mode.window.sy * start.win.height > 0;
      mode = out ? { kind: "picture", ...mode.picture } : { kind: "window", ...mode.window };
      s.mode = mode;
    }
    if (mode.kind === "window") {
      const r = resizeWindow(start, mode, screen[0], aspect);
      return writeView(t.el, t.asset, r.view, r.frame);
    }
    let v: CropView = start.view;
    if (mode.kind === "move") v = { ...v, px: v.px + pts[0].x - start.p.x, py: v.py + pts[0].y - start.p.y };
    else if (mode.kind === "picture") {
      const d = { x: mode.handle.x - mode.anchor.x, y: mode.handle.y - mode.anchor.y };
      const k = Math.max(0.05, ((pts[0].x - mode.anchor.x) * d.x + (pts[0].y - mode.anchor.y) * d.y) / (d.x * d.x + d.y * d.y || 1));
      v = { ...v, z: v.z * k, px: mode.anchor.x + (v.px - mode.anchor.x) * k, py: mode.anchor.y + (v.py - mode.anchor.y) * k };
    } else if (mode.kind === "pinch" && pts.length >= 2) {
      const k = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) / mode.d0;
      const c = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      v = { ...v, z: v.z * k, px: c.x + (v.px - mode.c0.x) * k, py: c.y + (v.py - mode.c0.y) * k };
    }
    writeView(t.el, t.asset, clampView(v, cropWindow(t.el), start.pic, tiltOf(t.el)));
  }

  return (
    <div
      aria-hidden="true"
      data-crop-gestures
      className="absolute inset-0 z-[2] touch-none select-none"
      onPointerDown={(e) => {
        const p = canvasPoint(e);
        if (!p) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        pointers.current.set(e.pointerId, p);
        begin();
      }}
      onPointerMove={(e) => {
        if (!pointers.current.has(e.pointerId)) return;
        const p = canvasPoint(e);
        if (!p) return;
        pointers.current.set(e.pointerId, p);
        schedule(update);
      }}
      onPointerUp={(e) => {
        pointers.current.delete(e.pointerId);
        // A finger lifted from a pinch: carry on with the other one from here.
        begin();
      }}
      onPointerCancel={(e) => {
        pointers.current.delete(e.pointerId);
        begin();
      }}
    />
  );
}
