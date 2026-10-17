"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { TextElement } from "@/lib/project/types";
import { fontWeight, TEXT_FONTS } from "@/lib/text/fonts";
import { updateEl, useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";

// Typing straight on the canvas (M19, editor-v2/10 §1): a text area laid exactly over the
// text element (same font, size, colours, turn), which is hidden meanwhile. What is typed
// goes into the editing draft, so the canvas and the export always match.

export function InlineText(props: {
  elementId: string;
  /** Where the canvas origin is on screen (stage position) and its scale. */
  origin: { x: number; y: number };
  viewScale: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** Keyboard shown (typing) or set aside (a format / align sheet is open). */
  active: boolean;
}) {
  const t = useT();
  const doc = useViewDoc();
  const el = doc?.elements.find((e) => e.id === props.elementId) as TextElement | undefined;
  const ref = useRef<HTMLTextAreaElement>(null);
  const first = useRef(true);
  const [scroll, setScroll] = useState({ x: 0, y: 0 });

  // Follow the canvas when it scrolls.
  useEffect(() => {
    const area = props.scrollRef.current;
    if (!area) return;
    const on = () => setScroll({ x: area.scrollLeft, y: area.scrollTop });
    on();
    area.addEventListener("scroll", on, { passive: true });
    return () => area.removeEventListener("scroll", on);
  }, [props.scrollRef]);

  // Keyboard on; the first time, the sample text is selected so typing replaces it.
  useEffect(() => {
    const box = ref.current;
    if (!box || !props.active) return;
    box.focus({ preventScroll: true });
    if (first.current) box.select();
    first.current = false;
  }, [props.active]);

  // Grows with what is typed.
  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return;
    box.style.height = "auto";
    box.style.height = `${box.scrollHeight}px`;
  });

  if (!el || el.type !== "text") return null;
  const k = props.viewScale;
  const pad = (el.background?.padding ?? 0) * k;
  return (
    <textarea
      ref={ref}
      aria-label={t("text.edit")}
      value={el.text}
      readOnly={!props.active}
      onChange={(e) => {
        const text = e.target.value;
        useEditor.getState().updateDraft((d) => updateEl(d, el.id, { text }));
      }}
      rows={1}
      spellCheck={false}
      className="absolute z-[3] resize-none overflow-hidden border-0 outline-none"
      style={{
        left: props.origin.x - scroll.x + el.x * k,
        top: props.origin.y - scroll.y + el.y * k,
        width: el.width * k,
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
        transformOrigin: "center",
        padding: pad,
        fontFamily: TEXT_FONTS[el.font].family,
        fontWeight: fontWeight(el),
        fontStyle: el.italic ? "italic" : "normal",
        textDecoration: [el.underline && "underline", el.strike && "line-through"].filter(Boolean).join(" ") || "none",
        fontSize: el.fontSize * k,
        lineHeight: el.lineHeight,
        letterSpacing: el.letterSpacing * k,
        textAlign: el.align,
        color: el.color,
        background: el.background?.color ?? "transparent",
        borderRadius: (el.background?.radius ?? 0) * k,
        opacity: el.opacity,
        caretColor: "var(--accent)",
        // A dashed outline shows the box while typing.
        boxShadow: "0 0 0 1.5px var(--accent)",
      }}
    />
  );
}
