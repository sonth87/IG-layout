"use client";

import { useEffect, useState } from "react";
import { CarouselPreview } from "@/components/export/InstagramPreview";
import { Icon } from "@/components/ui/Icon";
import { layerRegion } from "@/lib/export/slices";
import { slideRect } from "@/lib/project/layout";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";

/** "Preview" (editor-v2/12 §4): the post as it will look, swiping through the slides. */
export function PreviewScreen({ onClose }: { onClose: () => void }) {
  const t = useT();
  const doc = useViewDoc();
  const canvas = useEditor((s) => s.canvas);
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!doc || !canvas) return;
    // Rendered once the screen is up (a full redraw of the canvas layer per slide).
    const id = requestAnimationFrame(() => {
      const out = Array.from({ length: doc.slideCount }, (_, i) => {
        const r = slideRect(doc, i);
        return canvas.layer.toDataURL({ ...layerRegion(canvas.layer, r, canvas.viewScale), pixelRatio: 720 / (r.width * canvas.viewScale), mimeType: "image/jpeg", quality: 0.85 });
      });
      setUrls(out);
    });
    return () => cancelAnimationFrame(id);
  }, [doc, canvas]);

  if (!doc) return null;
  const r = slideRect(doc, 0);
  return (
    <div role="dialog" aria-label={t("pm.preview")} className="animate-slide-in fixed inset-0 z-40 flex flex-col bg-bg">
      <header className="relative flex h-14 shrink-0 items-center justify-center">
        <h1 className="text-[17px] font-semibold">{t("pm.preview")}</h1>
        <button type="button" aria-label={t("common.close")} onClick={onClose} className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-2">
          <Icon name="close" size={18} />
        </button>
      </header>
      <div className="mx-auto w-full max-w-md min-h-0 flex-1 overflow-y-auto px-2">{urls.length > 0 && <CarouselPreview urls={urls} aspect={r.width / r.height} />}</div>
    </div>
  );
}
