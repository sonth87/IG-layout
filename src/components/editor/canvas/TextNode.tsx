"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Group, Rect, Text } from "react-konva";
import type { TextElement } from "@/lib/project/types";
import { fontWeight, loadFont, TEXT_FONTS } from "@/lib/text/fonts";
import { scaleExtras } from "@/lib/elements/resize";
import { useEditor } from "@/store/editor";
import { type DragHooks, useNodeHandlers } from "./useNodeHandlers";

/**
 * Text element: optional rounded background, stroke drawn behind the fill,
 * soft shadow. Width wraps; height follows the text and is written back as
 * a derived value (no history). Resizing scales the font size.
 */
export function TextNode({ element: el, hooks }: { element: TextElement; hooks: DragHooks }) {
  const setDerived = useEditor((s) => s.setDerived);
  const setEditingText = useEditor((s) => s.setEditingText);
  // While typing, an HTML box stands in for it (InlineText).
  const typing = useEditor((s) => s.editingTextId === el.id);
  const textRef = useRef<Konva.Text>(null);
  const family = TEXT_FONTS[el.font].family;
  const weight = fontWeight(el);
  const fontKey = `${el.font}:${weight}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const props = useNodeHandlers(el, hooks, (scale) => scaleExtras(el, scale));

  // Draw with a fallback until the web font is loaded, then switch (re-measures).
  useEffect(() => {
    let alive = true;
    void loadFont(el.font, weight).then(() => alive && setLoadedKey(fontKey));
    return () => {
      alive = false;
    };
  }, [el.font, weight, fontKey]);

  // Height follows the text.
  useEffect(() => {
    const node = textRef.current;
    if (!node) return;
    const h = node.height();
    if (Math.abs(h - el.height) > 0.5) setDerived(el.id, { height: h });
  });

  const pad = el.background?.padding ?? 0;
  return (
    <Group {...props} opacity={typing ? 0 : props.opacity} onDblTap={() => setEditingText(el.id)} onDblClick={() => setEditingText(el.id)}>
      {el.background && (
        <Rect width={el.width} height={el.height} fill={el.background.color} cornerRadius={el.background.radius} />
      )}
      <Text
        ref={textRef}
        text={el.text}
        width={el.width}
        padding={pad}
        fontFamily={loadedKey === fontKey ? family : "sans-serif"}
        fontStyle={`${el.italic ? "italic " : ""}${weight}`}
        textDecoration={[el.underline && "underline", el.strike && "line-through"].filter(Boolean).join(" ")}
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
