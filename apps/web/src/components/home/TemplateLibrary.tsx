"use client";

import { SheetHeader } from "@/components/ui/SheetHeader";
import { useState } from "react";
import { TemplatePreview } from "@/components/layout/TemplatePreview";
import { DESIGNS, designsFor } from "@ig-layout/core/templates/designs";
import { templateSlides } from "@ig-layout/core/templates/apply";
import { DEFAULT_OPTIONS, TEMPLATE_CATEGORIES, type Template, type TemplateCategory } from "@ig-layout/core/templates/types";
import { useSettings, useT } from "@/store/settings";

const NO_PHOTOS: never[] = [];

function slidesOf(tpl: Template) {
  const type = tpl.design!.type;
  return templateSlides(tpl, 0, type === "grid" ? 9 : 3, type);
}

/** Preview width in the details sheet: big, but fits a phone screen. */
function detailWidth(tpl: Template) {
  const type = tpl.design!.type;
  if (type === "story") return 200;
  if (type === "grid") return 270;
  return slidesOf(tpl) === 1 ? 260 : 340;
}

function Preview({ tpl, width }: { tpl: Template; width: number }) {
  const d = tpl.design!;
  return (
    <TemplatePreview
      template={tpl}
      photos={NO_PHOTOS}
      ratio={d.ratio}
      slides={slidesOf(tpl)}
      type={d.type}
      grid={d.type === "grid" ? { rows: 3, gapCompensation: false } : undefined}
      options={DEFAULT_OPTIONS}
      width={width}
      // Grid templates keep the tile lines: they are the point of the design.
      plain={d.type !== "grid"}
    />
  );
}

/**
 * Home template library (M10, like SCRL): categories, large previews, tap → details →
 * "Use template" creates a project with empty photo cells.
 */
export function TemplateLibrary({ onUse }: { onUse: (tpl: Template) => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [open, setOpen] = useState<Template | null>(null);
  const list = designsFor(category);
  const categories: (TemplateCategory | "all")[] = ["all", ...TEMPLATE_CATEGORIES.filter((c) => DESIGNS.some((d) => d.design?.category === c))];

  return (
    <>
      <nav aria-label={t("library.categories")} className="flex shrink-0 gap-2 overflow-x-auto px-5 pt-3 pb-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={`h-9 shrink-0 rounded-full px-4 text-sm ${category === c ? "bg-text font-semibold text-bg" : "border border-border"}`}
          >
            {t(`library.category.${c}`)}
          </button>
        ))}
      </nav>
      <div className="grid flex-1 auto-rows-min grid-cols-2 gap-x-3 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 overflow-y-auto px-5 pt-2 pb-4">
        {list.map((tpl) => {
          // Carousels show the whole strip across both columns; single images sit two by two.
          const wide = tpl.design!.type !== "grid" && slidesOf(tpl) > 1;
          const width = wide ? 330 : tpl.design!.type === "story" ? 100 : 138;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setOpen(tpl)}
              aria-label={tpl.name[locale]}
              className={`flex min-w-0 flex-col gap-1.5 text-left ${wide ? "col-span-2" : ""}`}
            >
              <div className="flex w-full items-center justify-center overflow-hidden rounded-xl bg-surface-2 p-3">
                <div className="overflow-hidden rounded-md shadow-sm">
                  <Preview tpl={tpl} width={width} />
                </div>
              </div>
              <span className="truncate text-[13px] font-semibold">{tpl.name[locale]}</span>
            </button>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end bg-black/50" onClick={() => setOpen(null)}>
          <section
            aria-label={open.name[locale]}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-t-[22px] md:max-w-xl bg-surface px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <SheetHeader
              title={open.name[locale]}
              sub={`${t(`type.${open.design!.type}`)} · ${open.design!.ratio} · ${t("library.meta", { photos: open.photos, slides: slidesOf(open) })}`}
              right={{ icon: "close", label: t("common.close"), onClick: () => setOpen(null) }}
            />
            <div className="flex justify-center overflow-x-auto rounded-xl bg-surface-2 p-3">
              <div className="overflow-hidden rounded-md shadow">
                <Preview tpl={open} width={detailWidth(open)} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const tpl = open;
                setOpen(null);
                onUse(tpl);
              }}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[17px] font-bold text-on-accent"
            >
              {t("library.use")}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
