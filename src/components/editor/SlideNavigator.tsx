"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { layerRegion } from "@/lib/export/slices";
import { whenIdle } from "@/lib/gesture";
import { rotatedBounds } from "@/lib/project/geometry";
import { slideRect } from "@/lib/project/layout";
import { MAX_SLIDES, type ProjectDoc } from "@/lib/project/types";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";

const THUMB_HEIGHT = 52;

/** What a slide's thumbnail depends on: the background and the elements over it. */
function slideKey(doc: ProjectDoc, index: number) {
  const r = slideRect(doc, index);
  const over = doc.elements.filter((el) => {
    const b = rotatedBounds(el);
    return b.x < r.x + r.width && b.x + b.width > r.x && b.y < r.y + r.height && b.y + b.height > r.y;
  });
  return JSON.stringify([doc.background, r, over]);
}

/**
 * Strip of slide thumbnails under the canvas (UX-04): see the whole carousel,
 * tap to jump to a slide, "+" adds one at the end. Post / Story only.
 */
export function SlideNavigator({ onPick }: { onPick: (index: number) => void }) {
  const t = useT();
  const doc = useViewDoc();
  const canvas = useEditor((s) => s.canvas);
  const current = useEditor((s) => s.currentSlide);
  const insertSlide = useEditor((s) => s.insertSlide);
  const [thumbs, setThumbs] = useState<string[]>([]);

  // Re-render thumbnails after the content changes: only slides whose content changed,
  // one per idle moment, never during a gesture (they force a full redraw).
  const rendered = useRef<string[]>([]);
  useEffect(() => {
    if (!doc || !canvas) return;
    const keys = Array.from({ length: doc.slideCount }, (_, i) => slideKey(doc, i));
    let cancel = () => {};
    const next = () => {
      const i = keys.findIndex((k, n) => rendered.current[n] !== k);
      if (i < 0) return;
      cancel = whenIdle(() => {
        const r = slideRect(doc, i);
        const url = canvas.layer.toDataURL({
          ...layerRegion(canvas.layer, r, canvas.viewScale),
          pixelRatio: (THUMB_HEIGHT * 2) / (r.height * canvas.viewScale),
          mimeType: "image/jpeg",
          quality: 0.7,
        });
        rendered.current[i] = keys[i];
        setThumbs((t) => Object.assign([...t], { [i]: url }));
        next();
      });
    };
    const timer = setTimeout(next, 300);
    return () => {
      clearTimeout(timer);
      cancel();
    };
  }, [doc, canvas]);

  if (!doc) return null;
  const aspect = slideRect(doc, 0).width / slideRect(doc, 0).height;

  return (
    <nav aria-label={t("nav.slides")} className="flex items-center gap-2 overflow-x-auto border-t border-border bg-bg px-3 py-2">
      {Array.from({ length: doc.slideCount }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={t("nav.goTo", { index: i + 1 })}
          aria-current={i === current ? "true" : undefined}
          onClick={() => onPick(i)}
          className={`relative shrink-0 overflow-hidden rounded-md bg-surface-2 ${i === current ? "ring-2 ring-accent" : "ring-1 ring-border"}`}
          style={{ height: THUMB_HEIGHT, width: THUMB_HEIGHT * aspect }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- generated thumbnail */}
          {thumbs[i] && <img src={thumbs[i]} alt="" className="h-full w-full object-cover" />}
          <span className="absolute bottom-0.5 left-1 text-[10px] font-bold text-white drop-shadow">{i + 1}</span>
        </button>
      ))}
      <button
        type="button"
        aria-label={t("editor.addSlide")}
        disabled={doc.slideCount >= MAX_SLIDES}
        onClick={() => {
          insertSlide(doc.slideCount - 1);
          onPick(doc.slideCount);
        }}
        className="flex shrink-0 items-center justify-center rounded-md border border-dashed border-border-2 text-muted disabled:opacity-40"
        style={{ height: THUMB_HEIGHT, width: THUMB_HEIGHT * aspect }}
      >
        <Icon name="plus" size={20} />
      </button>
    </nav>
  );
}
