"use client";

import { useMemo, useState } from "react";
import { FILTER_GROUPS, FILTERS, filterById, type FilterDef, type FilterGroup } from "@/lib/color/filters";
import { ADJUST_KEYS, ADJUST_MIN, type AdjustKey, type FilterRef, NO_ADJUST, shaderParams } from "@/lib/color/params";
import { processImage } from "@/lib/color/processor";
import { type ImageElement, isImage } from "@/lib/project/types";
import { updateEl, useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { useHtmlImage } from "../canvas/useHtmlImage";
import { Slider, ToolSheet } from "./controls";

interface ToolProps {
  elementId: string;
  onClose: () => void;
}

/** "Hold to compare": shows the selected photo without colour changes while pressed. */
function CompareButton() {
  const t = useT();
  const setCompare = useEditor((s) => s.setCompare);
  const off = () => setCompare(false);
  return (
    <button
      type="button"
      onPointerDown={() => setCompare(true)}
      onPointerUp={off}
      onPointerLeave={off}
      onPointerCancel={off}
      onContextMenu={(e) => e.preventDefault()}
      className="h-8 shrink-0 rounded-full border border-border px-3 text-xs font-semibold select-none"
    >
      {t("tool.compare")}
    </button>
  );
}

function useDraftImage(id: string) {
  const found = useViewDoc()?.elements.find((e) => e.id === id);
  const el = found?.type === "image" ? found : undefined;
  const updateDraft = useEditor((s) => s.updateDraft);
  const patch = (p: Partial<ImageElement>) => updateDraft((d) => updateEl(d, id, p));
  return { el, patch };
}

function useSheet(onClose: () => void) {
  const applyDraft = useEditor((s) => s.applyDraft);
  const cancelDraft = useEditor((s) => s.cancelDraft);
  const setCompare = useEditor((s) => s.setCompare);
  return {
    onApply: () => {
      setCompare(false);
      applyDraft();
      onClose();
    },
    onCancel: () => {
      setCompare(false);
      cancelDraft();
      onClose();
    },
  };
}

export function AdjustTool({ elementId, onClose }: ToolProps) {
  const t = useT();
  const { el, patch } = useDraftImage(elementId);
  const actions = useSheet(onClose);
  const [active, setActive] = useState<AdjustKey>("exposure");
  if (!el) return null;
  const value = el.adjust[active];

  return (
    <ToolSheet title={t("tool.adjust")} {...actions}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">
          {t(`adjust.${active}`)} <span className="font-display text-accent-text">{value > 0 ? `+${value}` : value}</span>
        </span>
        <CompareButton />
      </div>
      <Slider
        label={t(`adjust.${active}`)}
        value={value}
        min={ADJUST_MIN[active]}
        max={100}
        defaultValue={0}
        onChange={(v) => patch({ adjust: { ...el.adjust, [active]: v } })}
      />
      <div role="tablist" aria-label={t("tool.adjust")} className="flex gap-2 overflow-x-auto pt-1 pb-1">
        {ADJUST_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            onClick={() => setActive(key)}
            className={`relative h-9 shrink-0 rounded-full px-3 text-[13px] ${
              active === key ? "bg-text font-bold text-bg" : "border border-border"
            }`}
          >
            {t(`adjust.${key}`)}
            {el.adjust[key] !== 0 && (
              <span aria-hidden="true" className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>
    </ToolSheet>
  );
}

/** Small preview of the photo with a filter at full intensity. */
function useFilterThumb(image: HTMLImageElement | null, filter: FilterDef | null) {
  return useMemo(() => {
    if (!image) return null;
    if (filter) return processImage(image, shaderParams(NO_ADJUST, filter.preset, 100), 96)?.toDataURL("image/jpeg", 0.8) ?? null;
    const c = document.createElement("canvas");
    const s = 96 / Math.max(image.width, image.height);
    c.width = Math.round(image.width * s);
    c.height = Math.round(image.height * s);
    c.getContext("2d")!.drawImage(image, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.8);
  }, [image, filter]);
}

function FilterChip(props: { image: HTMLImageElement | null; filter: FilterDef | null; active: boolean; label: string; onClick: () => void }) {
  const thumb = useFilterThumb(props.image, props.filter);
  return (
    <button
      type="button"
      aria-pressed={props.active}
      onClick={props.onClick}
      className={`flex w-[72px] shrink-0 flex-col items-center gap-1.5 text-xs ${props.active ? "font-bold text-accent-text" : ""}`}
    >
      <span className={`h-16 w-16 overflow-hidden rounded-[10px] bg-surface-2 ${props.active ? "ring-2 ring-accent" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- generated preview */}
        {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
      </span>
      {props.label}
    </button>
  );
}

export function FilterTool({ elementId, onClose }: ToolProps) {
  const t = useT();
  const { el, patch } = useDraftImage(elementId);
  const actions = useSheet(onClose);
  const asset = useEditor((s) => (el?.assetId ? s.assets[el.assetId] : undefined));
  const image = useHtmlImage(asset?.url);
  const doc = useViewDoc();
  const updateDraft = useEditor((s) => s.updateDraft);
  const current = filterById(el?.filter?.id);
  const [group, setGroup] = useState<FilterGroup>(current?.group ?? "vintage");
  const [applyAll, setApplyAll] = useState(false);
  const [confirming, setConfirming] = useState(false);
  if (!el || !doc) return null;

  const photoCount = doc.elements.filter((e) => isImage(e) && e.assetId).length;
  const choose = (f: FilterDef | null) => patch({ filter: f ? { id: f.id, intensity: el.filter?.intensity ?? 80 } : null });

  function apply() {
    if (applyAll && photoCount > 1) return setConfirming(true);
    actions.onApply();
  }

  function applyToAll() {
    const filter: FilterRef | null = el!.filter;
    // Filter only (D-16): manual adjustments of each photo stay as they are. One history step.
    updateDraft((d) => ({ ...d, elements: d.elements.map((e) => (isImage(e) && e.assetId ? { ...e, filter } : e)) }));
    setConfirming(false);
    actions.onApply();
  }

  return (
    <>
      <ToolSheet title={t("tool.filters")} onCancel={actions.onCancel} onApply={apply}>
        <div className="flex items-center justify-between pb-1">
          <span className="text-sm font-semibold">
            {current ? `${current.name} · ${el.filter!.intensity}` : t("filter.none")}
          </span>
          <CompareButton />
        </div>
        <div className="border-b border-border">
          <div role="tablist" aria-label={t("tool.filters")} className="flex gap-5 overflow-x-auto">
            {FILTER_GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                role="tab"
                aria-selected={group === g}
                onClick={() => setGroup(g)}
                className={`h-10 shrink-0 text-sm ${group === g ? "border-b-2 border-accent font-bold" : "text-muted"}`}
              >
                {t(`filter.group.${g}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5 overflow-x-auto py-3">
          <FilterChip image={image} filter={null} active={!el.filter} label={t("filter.none")} onClick={() => choose(null)} />
          {FILTERS.filter((f) => f.group === group).map((f) => (
            <FilterChip key={f.id} image={image} filter={f} active={el.filter?.id === f.id} label={f.name} onClick={() => choose(f)} />
          ))}
        </div>

        {el.filter && (
          <Slider
            label={t("tool.intensity")}
            value={el.filter.intensity}
            min={0}
            max={100}
            defaultValue={80}
            onChange={(v) => patch({ filter: { ...el.filter!, intensity: v } })}
          />
        )}

        {photoCount > 1 && (
          <label className="mt-1 flex items-center gap-3 rounded-[14px] bg-surface-2 px-3.5 py-3 text-sm">
            <input
              type="checkbox"
              checked={applyAll}
              onChange={(e) => setApplyAll(e.target.checked)}
              className="h-[22px] w-[22px] accent-accent"
            />
            <span className="flex-1">{t("filter.applyAll", { count: photoCount })}</span>
            <span className="text-xs text-muted">{t("filter.filterOnly")}</span>
          </label>
        )}
      </ToolSheet>

      {confirming && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-6">
          <div role="alertdialog" aria-modal="true" aria-labelledby="apply-all-title" className="flex w-full max-w-sm flex-col gap-3.5 rounded-[22px] border border-border bg-surface p-5">
            <h2 id="apply-all-title" className="font-display text-[21px] leading-tight font-bold">
              {current
                ? t("filter.confirmTitle", { name: current.name, count: photoCount })
                : t("filter.confirmTitleNone", { count: photoCount })}
            </h2>
            <p className="text-sm leading-relaxed text-text-2">{t("filter.confirmBody")}</p>
            <div className="mt-1 flex gap-2.5">
              <button type="button" onClick={() => setConfirming(false)} className="h-12 flex-1 rounded-[14px] border border-border-2 font-semibold">
                {t("common.cancel")}
              </button>
              <button type="button" onClick={applyToAll} className="h-12 flex-[1.4] rounded-[14px] bg-accent font-bold text-on-accent">
                {t("filter.confirmApply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
