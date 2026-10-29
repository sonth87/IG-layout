"use client";

import { useRef, useState } from "react";
import { useImportPhotos } from "@/components/editor/useImportPhotos";
import { GapDemo, GridProfilePreview, gridRowsHint } from "@/components/layout/GridProfilePreview";
import { LayoutPicker } from "@/components/layout/LayoutPicker";
import { Icon } from "@/components/ui/Icon";
import { formatShortDate } from "@ig-layout/core/format";
import { GRID_COLS, MAX_GRID_TILES, MIN_GRID_TILES } from "@ig-layout/core/project/layout";
import {
  type AspectRatio,
  type ImageAsset,
  MAX_SLIDES,
  POST_RATIOS,
  type ProjectType,
  slideSize,
} from "@ig-layout/core/project/types";
import { templateSlides } from "@ig-layout/core/templates/apply";
import { useEditor } from "@/store/editor";
import { useSettings, useT } from "@/store/settings";

const RATIO_ICON: Record<AspectRatio, string> = {
  "1:1": "h-[22px] w-[22px]",
  "4:5": "h-[25px] w-[20px]",
  "3:4": "h-[26px] w-[19px]",
  "9:16": "h-[28px] w-[16px]",
};

const MAX_STORY_FRAMES = 10;

function TypeIcon({ type, active }: { type: ProjectType; active: boolean }) {
  const c = active ? "bg-accent" : "bg-muted";
  if (type === "post")
    return (
      <span aria-hidden="true" className="flex gap-0.5">
        <span className={`h-5 w-4 rounded-[2px] ${c}`} />
        <span className={`h-5 w-4 rounded-[2px] opacity-60 ${c}`} />
        <span className={`h-5 w-4 rounded-[2px] opacity-35 ${c}`} />
      </span>
    );
  if (type === "story") return <span aria-hidden="true" className={`h-7 w-4 rounded-[3px] ${c}`} />;
  return (
    <span aria-hidden="true" className="grid w-[30px] grid-cols-3 gap-0.5">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className={`h-2 ${c}`} />
      ))}
    </span>
  );
}

function Stepper(props: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  fewer: string;
  more: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface px-3 py-2.5">
      <button
        type="button"
        aria-label={props.fewer}
        disabled={props.value <= props.min}
        onClick={() => props.onChange(props.value - 1)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-2 disabled:text-disabled"
      >
        <Icon name="minus" />
      </button>
      <div className="text-center">
        <div className="font-display text-3xl font-bold">{props.value}</div>
        <div className="text-xs text-muted">{props.hint}</div>
      </div>
      <button
        type="button"
        aria-label={props.more}
        disabled={props.value >= props.max}
        onClick={() => props.onChange(props.value + 1)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-2 disabled:text-disabled"
      >
        <Icon name="plus" />
      </button>
    </div>
  );
}

/** New project (wireframe 2): Post / Story / Grid, then photos, then a layout. */
export function NewProject({ onClose, initialType = "post" }: { onClose: () => void; initialType?: ProjectType }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const [type, setType] = useState<ProjectType>(initialType);
  const [postRatio, setPostRatio] = useState<AspectRatio>("4:5");
  const [slides, setSlides] = useState(5);
  const [frames, setFrames] = useState(3);
  // Grid: any number of posts, 2–24 (owner, 2026-10-28); the last row may be short.
  const [tiles, setTiles] = useState(9);
  const rows = Math.ceil(tiles / GRID_COLS);
  const [gap, setGap] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);
  const createProject = useEditor((s) => s.createProject);
  const addImages = useEditor((s) => s.addImages);
  const applyLayout = useEditor((s) => s.applyLayout);
  const { decodeFiles, busy, errors, videoProgress } = useImportPhotos();
  const [picked, setPicked] = useState<ImageAsset[] | null>(null);

  const ratio: AspectRatio = type === "story" ? "9:16" : type === "grid" ? "3:4" : postRatio;
  const count = type === "story" ? frames : type === "grid" ? tiles : slides;
  const size = slideSize(ratio);
  const name = () => t(`new.defaultName.${type}`, { date: formatShortDate(Date.now(), locale) });
  const create = (slideCount: number) => createProject({ type, ratio, slideCount, name: name(), gapCompensation: gap });

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    // Decode first so this screen can show progress and errors; then choose a layout.
    const assets = await decodeFiles(files);
    if (assets.length > 0) setPicked(assets);
  }

  if (picked) {
    return (
      <LayoutPicker
        photos={picked}
        ratio={ratio}
        slides={count}
        type={type}
        grid={type === "grid" ? { rows, gapCompensation: gap } : undefined}
        onClose={() => {
          picked.forEach((a) => URL.revokeObjectURL(a.url));
          setPicked(null);
        }}
        onSkip={async () => {
          await create(count);
          addImages(picked);
        }}
        onApply={async (tpl, photos, options) => {
          await create(templateSlides(tpl, photos.length, count, type));
          applyLayout(tpl, photos, options);
        }}
      />
    );
  }

  const types: ProjectType[] = ["post", "story", "grid"];
  const sectionTitle = "text-sm font-semibold tracking-wider text-muted uppercase";

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col md:max-w-xl">
      <header className="flex items-center gap-1 px-3 pt-3.5 pb-1">
        <button type="button" aria-label={t("common.close")} onClick={onClose} className="flex h-11 w-11 items-center justify-center">
          <Icon name="close" />
        </button>
        <h1 className="font-display text-xl font-semibold">{t("new.title")}</h1>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pt-3">
        <section className="flex flex-col gap-3">
          <h2 className={sectionTitle}>{t("new.what")}</h2>
          <div role="radiogroup" aria-label={t("new.what")} className="grid grid-cols-3 gap-2.5">
            {types.map((ty) => (
              <button
                key={ty}
                type="button"
                role="radio"
                aria-checked={type === ty}
                onClick={() => setType(ty)}
                className={`flex h-[124px] flex-col items-center justify-center gap-2.5 rounded-2xl p-2 ${
                  type === ty ? "border-2 border-accent bg-accent-soft" : "border border-border bg-surface"
                }`}
              >
                <TypeIcon type={ty} active={type === ty} />
                <span className="text-[15px] font-bold">{t(`type.${ty}`)}</span>
                <span className="text-[11px] leading-tight text-muted">{t(`new.typeHint.${ty}`)}</span>
              </button>
            ))}
          </div>
        </section>

        {type === "post" && (
          <>
            <section className="flex flex-col gap-3">
              <h2 className={sectionTitle}>{t("new.ratio")}</h2>
              <div className="flex gap-2.5">
                {POST_RATIOS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={postRatio === r}
                    onClick={() => setPostRatio(r)}
                    className={`flex h-[72px] flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border text-sm ${
                      postRatio === r ? "border-2 border-accent bg-accent-soft font-bold" : "border-border bg-surface font-semibold"
                    }`}
                  >
                    <span className={`${RATIO_ICON[r]} rounded-[3px] border-2 ${postRatio === r ? "border-accent" : "border-muted"}`} />
                    {r}
                  </button>
                ))}
              </div>
            </section>
            <section className="flex flex-col gap-3">
              <h2 className={sectionTitle}>{t("new.slides")}</h2>
              <Stepper
                value={slides}
                min={1}
                max={MAX_SLIDES}
                onChange={setSlides}
                fewer={t("new.fewer")}
                more={t("new.more")}
                hint={t("new.upTo", { max: MAX_SLIDES })}
              />
            </section>
          </>
        )}

        {type === "story" && (
          <section className="flex flex-col gap-3">
            <h2 className={sectionTitle}>{t("new.frames")}</h2>
            <Stepper
              value={frames}
              min={1}
              max={MAX_STORY_FRAMES}
              onChange={setFrames}
              fewer={t("new.fewerFrames")}
              more={t("new.moreFrames")}
              hint={t("new.upTo", { max: MAX_STORY_FRAMES })}
            />
          </section>
        )}

        {type === "grid" && (
          <section className="flex flex-col gap-3">
            <h2 className={sectionTitle}>{t("grid.count")}</h2>
            <div className="flex gap-2">
              {[3, 6, 9, 12].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={t("grid.preset", { count: n })}
                  aria-pressed={tiles === n}
                  onClick={() => setTiles(n)}
                  className={`h-10 flex-1 rounded-xl text-sm font-semibold ${tiles === n ? "border-2 border-accent bg-accent-soft" : "border border-border bg-surface"}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <Stepper
              value={tiles}
              min={MIN_GRID_TILES}
              max={MAX_GRID_TILES}
              onChange={setTiles}
              fewer={t("grid.fewer")}
              more={t("grid.more")}
              hint={gridRowsHint(t, tiles)}
            />
            {tiles % GRID_COLS !== 0 && (
              // Only a heads-up: the choice stays the user's (owner, 2026-10-28).
              <p role="note" className="rounded-xl bg-accent-soft px-3 py-2.5 text-xs leading-relaxed">
                {t("grid.shortRowNote")}
              </p>
            )}
            <GridProfilePreview count={tiles} gap={gap} />
            <label className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-sm">
              <span>
                {t("grid.gap")}
                <span className="block text-xs leading-relaxed text-muted">{t("grid.gapHint")}</span>
              </span>
              <input type="checkbox" checked={gap} onChange={(e) => setGap(e.target.checked)} className="h-[22px] w-[22px] shrink-0 accent-accent" />
            </label>
            <GapDemo on={gap} />
            <p className="text-sm leading-relaxed text-muted">{t("new.cutInfo.grid", { count, width: size.width, height: size.height })}</p>
          </section>
        )}

        {type !== "grid" && (
          <section>
            <div
              aria-hidden="true"
              className="grid gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: count }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center rounded-[3px] border border-dashed border-border-2 text-[10px] text-muted"
                  style={{ aspectRatio: `${size.width} / ${size.height}`, maxHeight: 72 }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <p className="pt-3 text-sm leading-relaxed text-muted">
              {t(`new.cutInfo.${type}`, { count, width: size.width, height: size.height })}
            </p>
          </section>
        )}
        {errors.length > 0 && (
          <div role="alert" className="text-sm text-danger">
            {errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border px-5 pt-4 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
        <input
          ref={fileInput}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => {
            void onFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[17px] font-bold text-on-accent disabled:opacity-60"
        >
          <Icon name="image" />
          {videoProgress
            ? t("import.videoProgress", { name: videoProgress.name, pct: Math.round(videoProgress.value * 100) })
            : busy
              ? t("new.importing")
              : t("new.choosePhotos")}
        </button>
      </div>
    </main>
  );
}
