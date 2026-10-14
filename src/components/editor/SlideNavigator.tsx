"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { layerRegion } from "@/lib/export/slices";
import { slideRect } from "@/lib/project/layout";
import { MAX_SLIDES } from "@/lib/project/types";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";

const THUMB_HEIGHT = 52;

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

  // Re-render thumbnails shortly after the content changes.
  useEffect(() => {
    if (!doc || !canvas) return;
    const timer = setTimeout(() => {
      const vs = canvas.viewScale;
      setThumbs(
        Array.from({ length: doc.slideCount }, (_, i) => {
          const r = slideRect(doc, i);
          return canvas.layer.toDataURL({
            ...layerRegion(canvas.layer, r, vs),
            pixelRatio: (THUMB_HEIGHT * 2) / (r.height * vs),
            mimeType: "image/jpeg",
            quality: 0.7,
          });
        }),
      );
    }, 350);
    return () => clearTimeout(timer);
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
