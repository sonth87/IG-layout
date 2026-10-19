"use client";

import Konva from "konva";
import { useLayoutEffect, useRef } from "react";
import { EFFECT_BY_ID, type ElementEffect } from "@/lib/effects/catalog";
import { effectPad, runEffect } from "@/lib/effects/fx";
import type { CanvasElement } from "@/lib/project/types";

// Effects on the canvas (editor-v2/14): a node with an effect is drawn once into a cache
// with room around it, the effect runs on those pixels, and the cache is what is shown,
// hit-tested and exported. Redone only when what it shows changes.

/** Most pixels one effect works on: keeps phones quick. */
const MAX_PIXELS = 2_400_000;

const ids = new WeakMap<object, number>();
let nextId = 1;
const idOf = (v: unknown) => {
  if (v && typeof v === "object") {
    if (!ids.has(v)) ids.set(v, nextId++);
    return ids.get(v);
  }
  return v;
};

/** What the element looks like, without where it is (moving does not redo the effect). */
function look(el: CanvasElement) {
  const rest: Record<string, unknown> = { ...el };
  delete rest.x;
  delete rest.y;
  delete rest.rotation;
  delete rest.opacity;
  delete rest.hidden;
  delete rest.locked;
  delete rest.motion;
  return rest;
}

function fxFilter(this: Konva.Node, data: ImageData) {
  const box = this.getAttr("fxBox") as { e: ElementEffect; x0: number; y0: number; w: number; h: number; k: number } | undefined;
  if (box) runEffect(data, box.e, box);
}

/** Pixel ratio of the effect: about what the screen shows, between 1 and 2. */
function ratioFor(node: Konva.Node) {
  const s = (node.getStage()?.scaleX() ?? 1) * (typeof window === "undefined" ? 1 : window.devicePixelRatio || 1);
  return s > 1.6 ? 2 : s > 1.15 ? 1.5 : 1;
}

/**
 * Gives a node its element's effect. `tokens`: what else changes the drawing (a picture
 * that finished loading, a font…). Returns the ref for the node.
 */
export function useFx<T extends Konva.Node>(el: CanvasElement, tokens: unknown[] = []) {
  const ref = useRef<T | null>(null);
  const last = useRef("");
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const e = el.effect;
    if (!e || !EFFECT_BY_ID[e.id]) {
      if (last.current) {
        node.clearCache();
        node.filters([]);
        node.setAttr("fxBox", undefined);
        last.current = "";
        node.getLayer()?.batchDraw();
      }
      return;
    }
    let pr = ratioFor(node);
    const key = JSON.stringify([look(el), tokens.map(idOf), pr]);
    if (key === last.current) return;
    last.current = key;
    const w = el.width;
    const h = el.height;
    const pad = effectPad(e, w, h);
    const cw = w + pad.l + pad.r;
    const ch = h + pad.t + pad.b;
    if (cw * ch * pr * pr > MAX_PIXELS) pr = Math.sqrt(MAX_PIXELS / (cw * ch));
    node.setAttr("fxBox", { e, x0: pad.l * pr, y0: pad.t * pr, w: w * pr, h: h * pr, k: pr });
    node.clearCache();
    node.filters([fxFilter]);
    node.cache({ x: -pad.l, y: -pad.t, width: cw, height: ch, pixelRatio: pr });
    node.getLayer()?.batchDraw();
  });
  return ref;
}

/** The element drawn with an effect, small, for the Effects sheet (`node`: its canvas node). */
export function effectPreview(node: Konva.Node, el: CanvasElement, e: ElementEffect | null, size = 160): string {
  const pad = e ? effectPad(e, el.width, el.height) : { l: 0, t: 0, r: 0, b: 0 };
  const cw = el.width + pad.l + pad.r;
  const ch = el.height + pad.t + pad.b;
  const pr = size / Math.max(cw, ch);
  // A plain copy, upright, with room around it.
  const copy = node.clone({ rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, visible: true, x: pad.l + el.width / 2, y: pad.t + el.height / 2 }) as Konva.Node;
  copy.clearCache();
  copy.filters([]);
  const layer = new Konva.Layer();
  layer.add(copy as Konva.Shape);
  const canvas = layer.toCanvas({ x: 0, y: 0, width: cw, height: ch, pixelRatio: pr });
  layer.destroy();
  if (e) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      runEffect(img, e, { x0: pad.l * pr, y0: pad.t * pr, w: el.width * pr, h: el.height * pr, k: pr });
      ctx.putImageData(img, 0, 0);
    }
  }
  return canvas.toDataURL("image/png");
}
