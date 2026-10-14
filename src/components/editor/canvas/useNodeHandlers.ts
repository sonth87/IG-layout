"use client";

import type Konva from "konva";
import type { CanvasElement } from "@/lib/project/types";
import { useEditor } from "@/store/editor";
import { useElementInteraction } from "./interaction";

export interface DragHooks {
  onDragMove: (node: Konva.Node, element: CanvasElement) => void;
  onDragEnd: () => void;
}

/**
 * Common Konva props for a canvas element positioned by its center:
 * select on tap, drag (with snapping), resize / rotate via the Transformer.
 * Each gesture records one history step when released.
 * `onResize` turns the transformer scale into element changes (default: width / height).
 */
export function useNodeHandlers(
  el: CanvasElement,
  hooks: DragHooks,
  onResize?: (scale: number) => Partial<CanvasElement>,
) {
  const updateElement = useEditor((s) => s.updateElement);
  const { draggable, preventDefault, onSelect, onMouseSelect } = useElementInteraction(el);
  const w = el.width;
  const h = el.height;

  return {
    id: el.id,
    x: el.x + w / 2,
    y: el.y + h / 2,
    offsetX: w / 2,
    offsetY: h / 2,
    rotation: el.rotation,
    opacity: el.opacity,
    draggable,
    preventDefault,
    onMouseDown: onMouseSelect,
    onTap: onSelect,
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => hooks.onDragMove(e.target, el),
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      hooks.onDragEnd();
      updateElement(el.id, { x: e.target.x() - w / 2, y: e.target.y() - h / 2 });
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const sx = node.scaleX();
      const sy = node.scaleY();
      node.scale({ x: 1, y: 1 });
      const extra = onResize ? onResize(sx) : {};
      const nw = Math.max(10, w * sx);
      const nh = Math.max(10, h * sy);
      updateElement(el.id, {
        x: node.x() - nw / 2,
        y: node.y() - nh / 2,
        width: nw,
        height: nh,
        rotation: node.rotation(),
        ...extra,
      });
    },
  };
}
