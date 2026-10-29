"use client";

import type Konva from "konva";
import { Shape } from "react-konva";
import type { LayoutElement } from "@ig-layout/core/project/types";

/**
 * A layout block (M14): draws only its background colour (its cells are image elements drawn
 * right above it), but it has a shape so it can be hit, selected and transformed.
 * Positioned by its centre so it turns around it, like every element.
 */
export function LayoutNode({ element: el }: { element: LayoutElement }) {
  return (
    <Shape
      id={el.id}
      preventDefault={false}
      x={el.x + el.width / 2}
      y={el.y + el.height / 2}
      width={el.width}
      height={el.height}
      offsetX={el.width / 2}
      offsetY={el.height / 2}
      rotation={el.rotation}
      visible={!el.hidden}
      // Its colour behind the cells, if any (Adjust sheet, M17).
      sceneFunc={(ctx: Konva.Context) => {
        if (!el.fill) return;
        ctx.fillStyle = el.fill;
        ctx.fillRect(0, 0, el.width, el.height);
      }}
      hitFunc={(ctx: Konva.Context, shape: Konva.Shape) => {
        ctx.beginPath();
        ctx.rect(0, 0, el.width, el.height);
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
    />
  );
}
