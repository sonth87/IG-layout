"use client";

import { useRef, useState } from "react";
import { useImportPhotos } from "@/components/editor/useImportPhotos";
import { LayoutPicker } from "@/components/layout/LayoutPicker";
import { Icon } from "@/components/ui/Icon";
import { formatShortDate } from "@/lib/format";
import { type AspectRatio, type ImageAsset, MAX_SLIDES, POST_RATIOS, SLIDE_SIZE } from "@/lib/project/types";
import { templateSlides } from "@/lib/templates/apply";
import { useEditor } from "@/store/editor";
import { useSettings, useT } from "@/store/settings";

const RATIO_ICON: Record<AspectRatio, string> = {
  "1:1": "h-[22px] w-[22px]",
  "4:5": "h-[25px] w-[20px]",
  "3:4": "h-[26px] w-[19px]",
  "9:16": "h-[28px] w-[16px]",
};

export function NewProject({ onClose }: { onClose: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const [ratio, setRatio] = useState<AspectRatio>("4:5");
  const [slides, setSlides] = useState(5);
  const fileInput = useRef<HTMLInputElement>(null);
  const createProject = useEditor((s) => s.createProject);
  const addImages = useEditor((s) => s.addImages);
  const applyLayout = useEditor((s) => s.applyLayout);
  const { decodeFiles, busy, errors } = useImportPhotos();
  const [picked, setPicked] = useState<ImageAsset[] | null>(null);
  const size = SLIDE_SIZE[ratio];
  const name = () => t("new.defaultName", { date: formatShortDate(Date.now(), locale) });

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
        slides={slides}
        onClose={() => {
          picked.forEach((a) => URL.revokeObjectURL(a.url));
          setPicked(null);
        }}
        onSkip={async () => {
          await createProject(ratio, slides, name());
          addImages(picked);
        }}
        onApply={async (tpl, photos, options) => {
          await createProject(ratio, templateSlides(tpl, photos.length, slides), name());
          applyLayout(tpl, photos, options);
        }}
      />
    );
  }

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col">
      <header className="flex items-center gap-1 px-3 pt-3.5 pb-1">
        <button
          type="button"
          aria-label={t("common.close")}
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center"
        >
          <Icon name="close" />
        </button>
        <div>
          <h1 className="font-display text-xl font-semibold">{t("new.title")}</h1>
          <p className="text-xs text-muted">{t("new.subtitle")}</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-5 pt-4">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-wider text-muted uppercase">{t("new.ratio")}</h2>
          <div className="flex gap-2.5">
            {POST_RATIOS.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={ratio === r}
                onClick={() => setRatio(r)}
                className={`flex h-[72px] flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border text-sm ${
                  ratio === r
                    ? "border-2 border-accent bg-accent-soft font-bold"
                    : "border-border bg-surface font-semibold"
                }`}
              >
                <span
                  className={`${RATIO_ICON[r]} rounded-[3px] border-2 ${ratio === r ? "border-accent" : "border-muted"}`}
                />
                {r}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-wider text-muted uppercase">{t("new.slides")}</h2>
          <div className="flex items-center justify-between rounded-2xl bg-surface px-3 py-2.5">
            <button
              type="button"
              aria-label={t("new.fewer")}
              onClick={() => setSlides((n) => Math.max(1, n - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-2"
            >
              <Icon name="minus" />
            </button>
            <div className="text-center">
              <div className="font-display text-3xl font-bold">{slides}</div>
              <div className="text-xs text-muted">{t("new.upTo", { max: MAX_SLIDES })}</div>
            </div>
            <button
              type="button"
              aria-label={t("new.more")}
              onClick={() => setSlides((n) => Math.min(MAX_SLIDES, n + 1))}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-2"
            >
              <Icon name="plus" />
            </button>
          </div>
          <div aria-hidden="true" className="flex h-16 overflow-hidden rounded-lg border border-dashed border-border-2">
            {Array.from({ length: slides }, (_, i) => (
              <div
                key={i}
                className="flex flex-1 items-center justify-center border-dashed border-border-2 text-xs text-muted [&:not(:last-child)]:border-r"
              >
                {i + 1}
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted">
            {t("new.cutInfo", { count: slides, width: size.width, height: size.height })}
          </p>
        </section>

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
          accept="image/*"
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
          {busy ? t("new.importing") : t("new.choosePhotos")}
        </button>
      </div>
    </main>
  );
}
