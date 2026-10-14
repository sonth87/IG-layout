"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Group, Rect, Text } from "react-konva";
import type { TextElement } from "@/lib/project/types";
import { fontWeight, loadFont, TEXT_FONTS } from "@/lib/text/fonts";
import { useEditor } from "@/store/editor";
import { type DragHooks, useNodeHandlers } from "./useNodeHandlers";

/**
 * Text element: optional rounded background, stroke drawn behind the fill,
 * soft shadow. Width wraps; height follows the text and is written back as
 * a derived value (no history). Resizing scales the font size.
 */
export function TextNode({ element: el, hooks }: { element: TextElement; hooks: DragHooks }) {
  const setDerived = useEditor((s) => s.setDerived);
  const textRef = useRef<Konva.Text>(null);
  const family = TEXT_FONTS[el.font].family;
  const fontKey = `${el.font}:${el.bold}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const props = useNodeHandlers(el, hooks, (scale) => ({
    fontSize: Math.max(8, el.fontSize * scale),
    letterSpacing: el.letterSpacing * scale,
    background: el.background ? { ...el.background, padding: el.background.padding * scale, radius: el.background.radius * scale } : null,
    stroke: el.stroke ? { ...el.stroke, width: el.stroke.width * scale } : null,
  }));

  // Draw with a fallback until the web font is loaded, then switch (re-measures).
  useEffect(() => {
    let alive = true;
    void loadFont(el.font, el.bold).then(() => alive && setLoadedKey(fontKey));
    return () => {
      alive = false;
    };
  }, [el.font, el.bold, fontKey]);

  // Height follows the text.
  useEffect(() => {
    const node = textRef.current;
    if (!node) return;
    const h = node.height();
    if (Math.abs(h - el.height) > 0.5) setDerived(el.id, { height: h });
  });

  const pad = el.background?.padding ?? 0;
  return (
    <Group {...props}>
      {el.background && (
        <Rect width={el.width} height={el.height} fill={el.background.color} cornerRadius={el.background.radius} />
      )}
      <Text
        ref={textRef}
        text={el.text}
        width={el.width}
        padding={pad}
        fontFamily={loadedKey === fontKey ? family : "sans-serif"}
        fontStyle={String(fontWeight(el.bold))}
        fontSize={el.fontSize}
        lineHeight={el.lineHeight}
        letterSpacing={el.letterSpacing}
        align={el.align}
        fill={el.color}
        stroke={el.stroke?.color}
        strokeWidth={el.stroke ? el.stroke.width * 2 : 0}
        fillAfterStrokeEnabled
        lineJoin="round"
        shadowEnabled={el.shadow}
        shadowColor="rgba(0,0,0,0.45)"
        shadowBlur={el.fontSize * 0.12}
        shadowOffsetY={el.fontSize * 0.04}
        wrap="word"
      />
    </Group>
  );
}
