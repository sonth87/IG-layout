"use client";

import type Konva from "konva";
import { useEffect, useMemo, useState } from "react";
import { Group, Shape } from "react-konva";
import type { CutoutText, TextElement } from "@/lib/project/types";
import { cutoutFonts, cutoutLayout, cutoutStyle, drawCutout, drawnLayouts } from "@/lib/text/cutout";
import { loadFont } from "@/lib/text/fonts";
import { scaleExtras } from "@/lib/elements/resize";
import { useEditor } from "@/store/editor";
import { useFx } from "./useFx";
import { type DragHooks, useNodeHandlers } from "./useNodeHandlers";

/**
 * Cut-out letters (D-141): the text laid out as scraps (lib/text/cutout) and drawn by one
 * Konva shape, so the export draws exactly the same. Height follows the scraps.
 */
export function CutoutTextNode({ element: el, hooks }: { element: TextElement & { cutout: CutoutText }; hooks: DragHooks }) {
  const setDerived = useEditor((s) => s.setDerived);
  const setEditingText = useEditor((s) => s.setEditingText);
  const typing = useEditor((s) => s.editingTextId === el.id);
  const props = useNodeHandlers(el, hooks, (scale) => scaleExtras(el, scale));
  const [fontsReady, setFontsReady] = useState(0);
  const fxRef = useFx<Konva.Group>(el, [fontsReady]);
  const style = cutoutStyle(el.cutout.style);

  // Measure again once the style's fonts are loaded.
  useEffect(() => {
    let alive = true;
    void Promise.all(cutoutFonts(style).map((f) => loadFont(f.font, f.weight))).then(() => alive && setFontsReady((n) => n + 1));
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

  useEffect(() => {
    if (Math.abs(layout.height - el.height) > 0.5) setDerived(el.id, { height: layout.height });
  });

  return (
    <Group ref={fxRef} {...props} opacity={typing ? 0 : props.opacity} onDblTap={() => setEditingText(el.id)} onDblClick={() => setEditingText(el.id)}>
      <Shape
        width={el.width}
        height={layout.height}
        sceneFunc={(ctx) => drawCutout((ctx as unknown as { _context: CanvasRenderingContext2D })._context, layout)}
        hitFunc={(ctx, shape) => {
          ctx.beginPath();
          ctx.rect(0, 0, el.width, layout.height);
          ctx.closePath();
          ctx.fillStrokeShape(shape);
        }}
      />
    </Group>
  );
}
