"use client";

import type Konva from "konva";
import type { CanvasElement } from "@ig-layout/core/project/types";
import { useEditor } from "@/store/editor";

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
  _hooks: DragHooks,
  onResize?: (scale: number) => Partial<CanvasElement>,
) {
  const updateElement = useEditor((s) => s.updateLive);
  const w = el.width;
  const h = el.height;

  // Selecting, dragging and pinching are handled by the canvas for whatever is selected
  // (M14, editor-v2/06); nodes only report transformer resizes / turns.
  return {
    id: el.id,
    x: el.x + w / 2,
    y: el.y + h / 2,
    offsetX: w / 2,
    offsetY: h / 2,
    rotation: el.rotation,
    opacity: el.opacity,
    visible: !el.hidden,
    // Who owns a touch is decided by CanvasStage (M14); Konva must not block scrolling.
    preventDefault: false,
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const sx = node.scaleX();
      const sy = node.scaleY();
      node.scale({ x: 1, y: 1 });
      // A side handle stretches one way (M14): no font / stroke scaling then.
      const uniform = Math.abs(sx - sy) < 1e-3;
      const extra = onResize && uniform ? onResize(sx) : {};
      const nw = Math.max(10, w * sx);
      const nh = el.type === "text" && !uniform ? h : Math.max(10, h * sy);
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
