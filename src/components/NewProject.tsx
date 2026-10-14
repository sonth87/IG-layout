"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useImportPhotos } from "@/components/editor/useImportPhotos";
import { type AspectRatio, MAX_SLIDES, POST_RATIOS, SLIDE_SIZE } from "@/lib/project/types";
import { useEditor } from "@/store/editor";

const RATIO_ICON: Record<AspectRatio, string> = {
  "1:1": "h-[22px] w-[22px]",
  "4:5": "h-[25px] w-[20px]",
  "3:4": "h-[26px] w-[19px]",
  "9:16": "h-[28px] w-[16px]",
};

export function NewProject() {
  const [ratio, setRatio] = useState<AspectRatio>("4:5");
  const [slides, setSlides] = useState(5);
  const fileInput = useRef<HTMLInputElement>(null);
  const createProject = useEditor((s) => s.createProject);
  const { importFiles, busy } = useImportPhotos();
  const size = SLIDE_SIZE[ratio];

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    createProject(ratio, slides);
    await importFiles(files);
  }

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col">
      <header className="px-5 pt-6 pb-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">New post</h1>
        <p className="mt-1 text-sm text-muted">Prototype · Post (carousel) only for now</p>
      </header>

      <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-5 pt-4">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-wider text-muted uppercase">Ratio</h2>
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
          <h2 className="text-sm font-semibold tracking-wider text-muted uppercase">Slides</h2>
          <div className="flex items-center justify-between rounded-2xl bg-surface px-3 py-2.5">
            <button
              type="button"
              aria-label="Fewer slides"
              onClick={() => setSlides((n) => Math.max(1, n - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-2"
            >
              <Icon name="minus" />
            </button>
            <div className="text-center">
              <div className="font-display text-3xl font-bold">{slides}</div>
              <div className="text-xs text-muted">up to {MAX_SLIDES} · change later</div>
            </div>
            <button
              type="button"
              aria-label="More slides"
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
            One continuous canvas. On export it is cut into {slides} image{slides > 1 ? "s" : ""} of{" "}
            {size.width} × {size.height}.
          </p>
        </section>
      </div>

      <div className="border-t border-border px-5 pt-4 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => onFiles(e.target.files)}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[17px] font-bold text-on-accent disabled:opacity-60"
        >
          <Icon name="image" />
          {busy ? "Importing…" : "Choose photos"}
        </button>
      </div>
    </main>
  );
}
