"use client";

import type Konva from "konva";
import { Shape } from "react-konva";
import { straightenScale } from "@/lib/project/geometry";
import { traceMask } from "@/lib/project/masks";
import type { ImageElement } from "@/lib/project/types";
import { useEditor } from "@/store/editor";
import { useHtmlImage } from "./useHtmlImage";

interface Props {
  element: ImageElement;
  onDragMove: (node: Konva.Node, element: ImageElement) => void;
  onDragEnd: () => void;
}

/**
 * One Konva shape draws the whole photo: shadow, masked + cropped + straightened
 * image, border. Its self rect is exactly the frame, so selection handles fit it.
 * Positioned by its center (rotation around the center).
 */
export function ImageNode({ element: el, onDragMove, onDragEnd }: Props) {
  const asset = useEditor((s) => (el.assetId ? s.assets[el.assetId] : undefined));
  const select = useEditor((s) => s.select);
  const updateElement = useEditor((s) => s.updateElement);
  const image = useHtmlImage(asset?.url);

  const w = el.width;
  const h = el.height;

  function draw(ctx: Konva.Context, shape: Konva.Shape) {
    const c = ctx._context;
    if (el.shadow) {
      c.save();
      c.shadowColor = "rgba(0,0,0,0.35)";
      // Shadow sizes are in device pixels: account for view scale and export pixel ratio.
      const k = shape.getAbsoluteScale().x * ctx.canvas.getPixelRatio();
      c.shadowBlur = Math.max(w, h) * 0.04 * k;
      c.shadowOffsetY = Math.max(w, h) * 0.015 * k;
      traceMask(c, el.mask, w, h, el.cornerRadius);
      c.fillStyle = "#000";
      c.fill();
      c.restore();
    }

    c.save();
    traceMask(c, el.mask, w, h, el.cornerRadius);
    c.clip();
    if (image) {
      const s = straightenScale(w, h, el.straighten);
      c.translate(w / 2, h / 2);
      c.rotate((el.straighten * Math.PI) / 180);
      c.scale(s * (el.flipX ? -1 : 1), s * (el.flipY ? -1 : 1));
      c.drawImage(image, el.crop.x, el.crop.y, el.crop.width, el.crop.height, -w / 2, -h / 2, w, h);
    } else {
      c.fillStyle = "#d9d5cd";
      c.fillRect(0, 0, w, h);
    }
    c.restore();

    if (el.border && el.border.width > 0) {
      c.save();
      traceMask(c, el.mask, w, h, el.cornerRadius, el.border.width / 2);
      c.lineWidth = el.border.width;
      c.strokeStyle = el.border.color;
      c.stroke();
      c.restore();
    }
  }

  function hit(ctx: Konva.Context, shape: Konva.Shape) {
    traceMask(ctx._context, el.mask, w, h, el.cornerRadius);
    ctx.fillStrokeShape(shape);
  }

  return (
    <Shape
      id={el.id}
      x={el.x + w / 2}
      y={el.y + h / 2}
      width={w}
      height={h}
      offsetX={w / 2}
      offsetY={h / 2}
      rotation={el.rotation}
      opacity={el.opacity}
      sceneFunc={draw}
      hitFunc={hit}
      draggable
      onMouseDown={() => select(el.id)}
      onTap={() => select(el.id)}
      onDragStart={() => select(el.id)}
      onDragMove={(e) => onDragMove(e.target, el)}
      // One history step per gesture: recorded when the finger is lifted.
      onDragEnd={(e) => {
        onDragEnd();
        updateElement(el.id, { x: e.target.x() - w / 2, y: e.target.y() - h / 2 });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const nw = Math.max(20, w * node.scaleX());
        const nh = Math.max(20, h * node.scaleY());
        node.scale({ x: 1, y: 1 });
        updateElement(el.id, {
          x: node.x() - nw / 2,
          y: node.y() - nh / 2,
          width: nw,
          height: nh,
          rotation: node.rotation(),
        });
      }}
    />
  );
}
