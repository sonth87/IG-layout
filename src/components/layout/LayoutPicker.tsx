"use client";

import { useState } from "react";
import { Slider, Swatches } from "@/components/editor/tools/controls";
import { Icon } from "@/components/ui/Icon";
import type { AspectRatio, ImageAsset, ProjectDoc, ProjectType } from "@/lib/project/types";
import { templateSlides } from "@/lib/templates/apply";
import { suggestTemplates, templatesFor } from "@/lib/templates/library";
import { DEFAULT_OPTIONS, TEMPLATE_GROUPS, type Template, type TemplateGroup, type TemplateOptions } from "@/lib/templates/types";
import { useSettings, useT } from "@/store/settings";
import { stillUrl } from "@/lib/project/types";
import { TemplatePreview } from "./TemplatePreview";

interface Props {
  photos: ImageAsset[];
  ratio: AspectRatio;
  /** Slide count used by "any"-slide templates (Grid: tiles). */
  slides: number;
  type: ProjectType;
  grid?: ProjectDoc["grid"];
  onApply: (template: Template, photos: ImageAsset[], options: TemplateOptions) => void;
  onClose: () => void;
  /** Shown when choosing a layout is optional (new project). */
  onSkip?: () => void;
}

type Tab = "suggested" | TemplateGroup;

/** Choose a layout for the picked photos (wireframe 3). Full-screen. */
export function LayoutPicker({ photos: initial, ratio, slides, type, grid, onApply, onClose, onSkip }: Props) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const [photos, setPhotos] = useState(initial);
  const [picked, setPicked] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("suggested");
  const suggested = suggestTemplates(photos.length, type);
  const forType = templatesFor(type);
  const [selected, setSelected] = useState<Template>(suggested[0] ?? forType[0]);
  const [options, setOptions] = useState<TemplateOptions>(DEFAULT_OPTIONS);

  const list = tab === "suggested" ? suggested : forType.filter((tpl) => tpl.group === tab);

  /** Tap one photo, then another, to swap their order. */
  function onPhoto(i: number) {
    if (picked === null) return setPicked(i);
    if (picked !== i) {
      const next = [...photos];
      [next[picked], next[i]] = [next[i], next[picked]];
      setPhotos(next);
    }
    setPicked(null);
  }

  // Only groups that have layouts for this project type.
  const tabs: Tab[] = ["suggested", ...TEMPLATE_GROUPS.filter((g) => forType.some((tpl) => tpl.group === g))];

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="layout-title" className="fixed inset-0 z-20 flex flex-col bg-bg">
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        <header className="flex items-center justify-between px-2 pt-2.5 pb-1">
          <div className="flex items-center gap-1">
            <button type="button" aria-label={t("common.back")} onClick={onClose} className="flex h-11 w-11 items-center justify-center">
              <Icon name="back" />
            </button>
            <h1 id="layout-title" className="font-display text-xl font-semibold">
              {t("layout.title")}
            </h1>
          </div>
          {onSkip && (
            <button type="button" onClick={onSkip} className="px-3 py-2.5 text-[15px] font-semibold text-accent-text">
              {t("layout.skip")}
            </button>
          )}
        </header>

        <section className="px-5 pt-1">
          <p className="pb-2 text-[13px] text-muted">
            {t("layout.trayHint", { count: photos.length })}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={picked === i}
                aria-label={t("layout.photo", { index: i + 1 })}
                onClick={() => onPhoto(i)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] ${picked === i ? "ring-2 ring-accent ring-offset-2 ring-offset-bg" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob thumbnail */}
                <img src={stillUrl(p)} alt="" className="h-full w-full object-cover" />
                <span className="absolute top-1 left-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-bg/90 text-[11px] font-bold">
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        </section>

        <nav aria-label={t("layout.groups")} className="flex gap-2 overflow-x-auto px-5 pt-3 pb-2.5">
          {tabs.map((tb) => (
            <button
              key={tb}
              type="button"
              aria-pressed={tab === tb}
              onClick={() => setTab(tb)}
              className={`h-9 shrink-0 rounded-full px-3.5 text-sm whitespace-nowrap ${
                tab === tb ? "bg-text font-semibold text-bg" : "border border-border"
              }`}
            >
              {tb === "suggested" ? t("layout.forN", { count: photos.length }) : t(`layout.group.${tb}`)}
            </button>
          ))}
        </nav>

        <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto px-5 pb-3">
          {list.map((tpl) => {
            const active = tpl.id === selected.id;
            const s = templateSlides(tpl, photos.length, slides, type);
            return (
              <button
                key={tpl.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(tpl)}
                className={`flex flex-col gap-2 rounded-[14px] bg-surface p-2.5 text-left ${active ? "border-2 border-accent" : "border border-border"}`}
              >
                <TemplatePreview template={tpl} photos={photos} ratio={ratio} slides={slides} type={type} grid={grid} options={options} width={148} />
                <span className="text-[13px] leading-tight font-semibold">{tpl.name[locale]}</span>
                <span className="text-[11px] text-muted">
                  {type === "grid" ? t("layout.metaGrid", { photos: tpl.perPhoto ? s : tpl.photos }) : t("layout.meta", { photos: tpl.perPhoto ? photos.length : tpl.photos, slides: s })}
                </span>
              </button>
            );
          })}
        </div>

        {selected.gridded && (
          <section aria-label={t("layout.options")} className="border-t border-border px-5 pt-1">
            <Slider
              label={t("layout.spacing")}
              value={Math.round(options.spacing * 1000)}
              min={0}
              max={50}
              defaultValue={Math.round(DEFAULT_OPTIONS.spacing * 1000)}
              onChange={(v) => setOptions({ ...options, spacing: v / 1000 })}
            />
            <Slider
              label={t("layout.corners")}
              value={Math.round(options.radius * 1000)}
              min={0}
              max={80}
              defaultValue={0}
              onChange={(v) => setOptions({ ...options, radius: v / 1000 })}
            />
            <Swatches value={options.color} onChange={(color) => setOptions({ ...options, color })} />
          </section>
        )}

        <div className="border-t border-border px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => onApply(selected, photos, options)}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-accent text-[17px] font-bold text-on-accent"
          >
            {t("layout.use")}
          </button>
        </div>
      </div>
    </div>
  );
}
