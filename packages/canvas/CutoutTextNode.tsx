"use client";

import type Konva from "konva";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Shape } from "react-konva";
import type { CutoutText, TextElement } from "@ig-layout/core/project/types";
import { loadCutoutFonts, cutoutLayout, cutoutStyle, drawCutout, drawnLayouts } from "@ig-layout/core/text/cutout";
import { scaleExtras } from "@ig-layout/core/elements/resize";
import { useCanvas } from "./host";
import { useFx } from "./useFx";
import { type DragHooks, useNodeHandlers } from "./useNodeHandlers";

/**
 * Cut-out letters (D-141): the text laid out as scraps (lib/text/cutout) and drawn by one
 * Konva shape, so the export draws exactly the same. Height follows the scraps.
 */
export function CutoutTextNode({ element: el, hooks }: { element: TextElement & { cutout: CutoutText }; hooks: DragHooks }) {
  const setDerived = useCanvas((s) => s.setDerived);
  const setEditingText = useCanvas((s) => s.setEditingText);
  const updateElement = useCanvas((s) => s.updateElement);
  const typing = useCanvas((s) => s.editingTextId === el.id);
  const props = useNodeHandlers(el, hooks, (scale) => scaleExtras(el, scale));
  const [fontsReady, setFontsReady] = useState(0);
  const fxRef = useFx<Konva.Group>(el, [fontsReady]);
  const style = cutoutStyle(el.cutout.style);

  // Measure again once the style's fonts are loaded.
  useEffect(() => {
    let alive = true;
    void loadCutoutFonts(style).then(() => alive && setFontsReady((n) => n + 1));
    return () => {
      alive = false;
    };
  }, [style]);

  const layout = useMemo(
    () => cutoutLayout(el),
    // fontsReady: measured with the real fonts once loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [el.text, el.width, el.fontSize, el.align, el.letterSpacing, el.lineHeight, el.cutout, fontsReady],
  );
  drawnLayouts.set(el.id, layout);
  // While resizing, the scraps are laid out again each frame straight in Konva (no React
  // render): `live` holds the size being dragged, `drawn` what the shape draws.
  const live = useRef<{ fontSize: number; width: number } | null>(null);
  const drawn = useRef(layout);
  useEffect(() => {
    if (!live.current) drawn.current = layout;
  }, [layout]);

  useEffect(() => {
    if (Math.abs(layout.height - el.height) > 0.5) setDerived(el.id, { height: layout.height });
  });

  return (
    <Group
      ref={fxRef}
      {...props}
      opacity={typing ? 0 : props.opacity}
      onDblTap={() => setEditingText(el.id)}
      onDblClick={() => setEditingText(el.id)}
      // Like plain text: every handle sizes the letters with the box, laid out again live
      // (no stretched scraps).
      onTransform={(e) => {
        const g = e.target as unknown as Konva.Group;
        const anchor = g.getStage()?.findOne<Konva.Transformer>("Transformer")?.getActiveAnchor() ?? "";
        const cur = live.current ?? { fontSize: el.fontSize, width: el.width };
        const k = anchor.includes("center") ? g.scaleY() : g.scaleX();
        const next = { fontSize: Math.max(8, cur.fontSize * k), width: Math.max(20, cur.width * k) };
        live.current = next;
        const lay = cutoutLayout({ ...el, ...next, letterSpacing: (el.letterSpacing * next.fontSize) / el.fontSize });
        drawn.current = lay;
        g.scale({ x: 1, y: 1 });
        g.offset({ x: next.width / 2, y: lay.height / 2 });
        g.findOne<Konva.Shape>("Shape")?.size({ width: next.width, height: lay.height });
      }}
      onTransformEnd={(e) => {
        const next = live.current;
        if (!next) return props.onTransformEnd(e);
        const g = e.target as unknown as Konva.Group;
        const h = drawn.current.height;
        live.current = null;
        updateElement(el.id, {
          x: g.x() - next.width / 2,
          y: g.y() - h / 2,
          width: next.width,
          height: h,
          rotation: g.rotation(),
          ...scaleExtras(el, next.fontSize / el.fontSize),
        });
      }}
    >
      <Shape
        width={el.width}
        height={layout.height}
        sceneFunc={(ctx) => drawCutout((ctx as unknown as { _context: CanvasRenderingContext2D })._context, live.current ? drawn.current : layout)}
        hitFunc={(ctx, shape) => {
          ctx.beginPath();
          ctx.rect(0, 0, shape.width(), shape.height());
          ctx.closePath();
          ctx.fillStrokeShape(shape);
        }}
      />
    </Group>
  );
}
