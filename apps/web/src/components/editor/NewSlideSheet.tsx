"use client";

import { DragSheet } from "./DragSheet";
import { SLIDE_GRIDS, SLIDE_LAYOUTS, type SlideLayout, slideCells } from "@ig-layout/core/templates/slideLayouts";
import { useT } from "@/store/settings";

// "New slide" sheet (editor-v2/05 §5): a blank slide, ~12 layouts, ~36 grids. Picking one
// adds a slide holding a layout block of that kind, every cell empty.

export function Thumb({ layout, aspect }: { layout: SlideLayout; aspect: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative block w-full overflow-hidden rounded-md border border-border bg-white"
      style={{ aspectRatio: aspect }}
    >
      {slideCells(layout, aspect).map((c, i) => (
        <span
          key={i}
          className={`absolute ${c.style.frame === "black" ? "bg-neutral-800" : "bg-neutral-300"}`}
          style={{
            left: `${c.x * 100}%`,
            top: `${c.y * 100}%`,
            width: `${c.w * 100}%`,
            height: `${c.h * 100}%`,
            transform: c.style.rotation ? `rotate(${c.style.rotation}deg)` : undefined,
            boxShadow: c.style.frame === "white" || c.style.frame === "polaroid" ? "0 0 0 2px #fff, 0 1px 4px rgba(0,0,0,.25)" : undefined,
          }}
        />
      ))}
    </span>
  );
}

export function NewSlideSheet({ aspect, onPick, onClose }: { aspect: number; onPick: (layoutId: string | null) => void; onClose: () => void }) {
  const t = useT();
  const item = "rounded-lg p-1 hover:bg-surface-2 active:scale-95 transition-transform";
  const section = (title: string, list: SlideLayout[], label: (i: number) => string) => (
    <section>
      <h3 className="px-1 pb-2 text-[13px] font-semibold text-muted">{title}</h3>
      <div className="grid grid-cols-4 gap-2">
        {list.map((l, i) => (
          <button key={l.id} type="button" aria-label={label(i + 1)} onClick={() => onPick(l.id)} className={item}>
            <Thumb layout={l} aspect={aspect} />
          </button>
        ))}
      </div>
    </section>
  );
  return (
    <DragSheet title={t("newSlide.title")} onClose={onClose}>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pt-1 pb-2">
          <section>
            <div className="grid grid-cols-4 gap-2">
              <button type="button" aria-label={t("newSlide.blank")} onClick={() => onPick(null)} className={item}>
                <span aria-hidden="true" className="block w-full rounded-md border border-border bg-white" style={{ aspectRatio: aspect }} />
                <span className="mt-1 block text-center text-[11px] text-muted">{t("newSlide.blank")}</span>
              </button>
            </div>
          </section>
          {section(t("newSlide.layouts"), SLIDE_LAYOUTS, (i) => t("newSlide.layoutItem", { index: i }))}
          {section(t("newSlide.grids"), SLIDE_GRIDS, (i) => t("newSlide.gridItem", { index: i }))}
        </div>
    </DragSheet>
  );
}
