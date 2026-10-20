"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CAMERAS, drawFilmFx, FILM_FX, type FilmFx, type FxKind, type RetroCamera, todayStamp } from "@/lib/color/filmfx";
import { filterById } from "@/lib/color/filters";
import { NO_ADJUST, shaderParams, vignetteOf } from "@/lib/color/params";
import { processImage } from "@/lib/color/processor";
import { useSettings, useT } from "@/store/settings";
import { Slider } from "./controls";

// Film FX and Retro cameras in the Adjust screen (Filter v2, D-132; VSCO's Film FX and
// Huji / Dazz-style cameras: docs/discussions/2026-10-20-filter-v2.md).

const THUMB = 96;

/** A small preview of the photo with a filter and Film FX. */
function thumb(image: HTMLImageElement, filterId: string | undefined, fx: FilmFx | undefined) {
  const f = filterById(filterId);
  const done = f ? processImage(image, shaderParams(NO_ADJUST, f.preset, 100), THUMB) : null;
  const s = THUMB / Math.max(image.width, image.height);
  const c = document.createElement("canvas");
  c.width = Math.round(image.width * s);
  c.height = Math.round(image.height * s);
  const ctx = c.getContext("2d")!;
  ctx.drawImage(done ?? image, 0, 0, c.width, c.height);
  const v = vignetteOf(undefined, f ? { id: f.id, intensity: 100 } : null) / 100;
  if (v > 0) {
    const r = Math.hypot(c.width, c.height) / 2;
    const g = ctx.createRadialGradient(c.width / 2, c.height / 2, r * 0.35, c.width / 2, c.height / 2, r);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${0.75 * v})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  drawFilmFx(ctx, c.width, c.height, fx);
  return c.toDataURL("image/jpeg", 0.8);
}

function Chip(props: { src: string | null; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={props.active}
      onClick={props.onClick}
      className={`flex w-[70px] shrink-0 flex-col items-center gap-1.5 text-xs ${props.active ? "font-bold text-white" : "text-white/70"}`}
    >
      <span className={`h-16 w-16 overflow-hidden rounded-[10px] bg-white/10 ${props.active ? "ring-2 ring-white" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- generated preview */}
        {props.src && <img src={props.src} alt="" className="h-full w-full object-cover" />}
      </span>
      <span className="w-full truncate text-center">{props.label}</span>
    </button>
  );
}

const PREVIEW_SEED = 11;

export function CameraPanel(props: { image: HTMLImageElement | null; active: string | undefined; onPick: (cam: RetroCamera) => void }) {
  const t = useT();
  const { image } = props;
  const thumbs = useMemo(() => {
    if (!image) return {};
    return Object.fromEntries(
      CAMERAS.map((cam) => {
        const fx: FilmFx = { date: cam.date ? todayStamp() : undefined };
        for (const [k, l] of Object.entries(cam.layers)) fx[k as FxKind] = { ...l, seed: PREVIEW_SEED };
        return [cam.id, thumb(image, cam.filter, fx)];
      }),
    );
  }, [image]);
  return (
    <>
      <p className="pb-2 text-xs text-white/60">{t("camera.hint")}</p>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
        {CAMERAS.map((cam) => (
          <Chip key={cam.id} src={thumbs[cam.id] ?? null} label={cam.name} active={props.active === cam.id} onClick={() => props.onPick(cam)} />
        ))}
      </div>
    </>
  );
}

type Tab = FxKind | "date";
const TABS: Tab[] = ["light", "texture", "frame", "distress", "date"];

export function FilmFxPanel(props: { image: HTMLImageElement | null; fx: FilmFx; onChange: (fx: FilmFx, key: string) => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const [tab, setTab] = useState<Tab>("light");
  const { image, fx } = props;
  const items = useMemo(() => (tab === "date" ? [] : FILM_FX.filter((f) => f.kind === tab)), [tab]);
  const thumbs = useMemo(() => {
    if (!image || tab === "date") return {};
    return Object.fromEntries(items.map((f) => [f.id, thumb(image, undefined, { [tab]: { id: f.id, amount: 100, seed: PREVIEW_SEED } })]));
  }, [image, items, tab]);
  const plain = useMemo(() => (image ? thumb(image, undefined, undefined) : null), [image]);

  // A manual change means the look is no longer exactly a camera's.
  const change = (next: FilmFx, key: string) => props.onChange({ ...next, camera: undefined }, key);
  const layer = tab === "date" ? undefined : fx[tab];

  return (
    <>
      <div role="tablist" aria-label="Film FX" className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {TABS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`relative h-8 shrink-0 text-sm ${tab === k ? "border-b-2 border-white font-bold" : "text-white/60"}`}
          >
            {t(`fx.kind.${k}`)}
            {(k === "date" ? !!fx.date : !!fx[k]) && <span aria-hidden="true" className="absolute top-0.5 -right-2 h-1.5 w-1.5 rounded-full bg-red-500" />}
          </button>
        ))}
      </div>
      {tab === "date" ? (
        <div className="flex items-center gap-3 pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!fx.date}
              onChange={(e) => change({ ...fx, date: e.target.checked ? todayStamp() : undefined }, "date")}
              className="h-[20px] w-[20px] accent-accent"
            />
            {t("fx.dateStamp")}
          </label>
          {fx.date !== undefined && (
            <input
              value={fx.date}
              aria-label={t("fx.dateStamp")}
              onChange={(e) => change({ ...fx, date: e.target.value }, "dateText")}
              className="h-10 min-w-0 flex-1 rounded-lg bg-white/10 px-3 font-mono text-sm text-[#ff9b3d]"
            />
          )}
        </div>
      ) : (
        <>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            <Chip src={plain} label={t("filter.none")} active={!layer} onClick={() => change({ ...fx, [tab]: undefined }, tab)} />
            {items.map((f) => (
              <Chip
                key={f.id}
                src={thumbs[f.id] ?? null}
                label={f.name[locale === "vi" ? "vi" : "en"]}
                active={layer?.id === f.id}
                onClick={() => change({ ...fx, [tab]: { id: f.id, amount: layer?.amount ?? (tab === "frame" ? 100 : 70), seed: layer?.seed ?? Math.floor(Math.random() * 1e9) } }, tab)}
              />
            ))}
          </div>
          {layer && (
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <Slider label={t("fx.amount")} value={layer.amount} min={0} max={100} defaultValue={70} onChange={(v) => change({ ...fx, [tab]: { ...layer, amount: v } }, `${tab}-amount`)} />
              </div>
              <button
                type="button"
                onClick={() => change({ ...fx, [tab]: { ...layer, seed: Math.floor(Math.random() * 1e9) } }, `${tab}-seed`)}
                className="mb-1 flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white/12 px-3.5 text-[13px] font-semibold"
              >
                <Icon name="shuffle" size={18} />
                {t("fx.shuffle")}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
