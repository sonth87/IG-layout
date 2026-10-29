"use client";

import { SheetHeader } from "@/components/ui/SheetHeader";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatShortDate } from "@ig-layout/core/format";
import { type AspectRatio, CUSTOM_HEIGHT, slideSize } from "@ig-layout/core/project/types";
import { useEditor } from "@/store/editor";
import { useSettings, useT } from "@/store/settings";

// "New project" (M18, editor-v2/04): pick a slide shape → a project with one blank slide
// opens at once. "Other" lists more ratios and a custom height; "Profile grid" and
// "From photos" lead to the step-by-step screen (type, slides, photos, layout).

const BOX = 64;
/** Current time, for the default project name (kept out of render code). */
const now = () => Date.now();

/** A card drawn in the shape it stands for; every card sits on the same baseline. */
function Shape({ ratio, label }: { ratio: AspectRatio | "W:H"; label: string }) {
  const s = ratio === "W:H" ? { width: 1, height: 1 } : slideSize(ratio);
  const r = s.width / s.height;
  const w = r >= 1 ? BOX : BOX * r;
  const h = r >= 1 ? BOX / r : BOX;
  return (
    <span className="flex flex-col items-center gap-1.5">
      <span className="flex h-[64px] items-end">
        <span className="flex items-center justify-center rounded-md border-2 border-text/70 text-[11px] font-bold" style={{ width: w, height: h }}>
          {ratio.replace("1080x", "")}
        </span>
      </span>
      <span className="text-[12px] text-muted">{label}</span>
    </span>
  );
}

const OTHER: AspectRatio[] = ["2:3", "3:2", "3:4", "4:3", "5:4", "5:6", "16:9"];

export function NewProjectSheet(props: { onClose: () => void; onSteps: (type: "grid" | null) => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const createProject = useEditor((s) => s.createProject);
  const [view, setView] = useState<"main" | "other" | "custom">("main");
  const [height, setHeight] = useState("");
  const [error, setError] = useState(false);

  const name = (type: "post" | "story") => t(`new.defaultName.${type}`, { date: formatShortDate(now(), locale) });
  const create = (ratio: AspectRatio) => {
    const type = ratio === "9:16" ? "story" : "post";
    props.onClose();
    createProject({ type, ratio, slideCount: 1, name: name(type) }).catch(() => {}); // failures are reported by createProject
  };

  const cards: [AspectRatio, string][] = [
    ["4:5", t("newp.portrait")],
    ["3:4", t("newp.portrait")],
    ["9:16", t("newp.story")],
    ["1:1", t("newp.square")],
    ["1.91:1", t("newp.landscape")],
  ];
  const card = "flex shrink-0 flex-col items-center rounded-2xl px-2.5 py-2 hover:bg-surface-2 active:scale-95 transition-transform";

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-end bg-black/40" onClick={props.onClose}>
      <section
        aria-label={view === "main" ? t("newp.title") : t("newp.otherTitle")}
        onClick={(e) => e.stopPropagation()}
        className="mx-auto w-full max-w-2xl rounded-t-[28px] bg-surface/90 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border-2" />
        <div className="px-4 pt-2">
          <SheetHeader
            title={view === "main" ? t("newp.title") : t("newp.otherTitle")}
            left={view !== "main" ? { icon: "back", label: t("common.back"), onClick: () => setView("main") } : undefined}
            right={{ icon: "close", label: t("common.close"), onClick: props.onClose }}
          />
        </div>
        {view === "main" ? (
          <div className="no-scrollbar flex items-end gap-1 overflow-x-auto px-3 pt-2 pb-3">
            {cards.map(([ratio, label]) => (
              <button key={ratio} type="button" aria-label={`${ratio} ${label}`} onClick={() => create(ratio)} className={card}>
                <Shape ratio={ratio} label={label} />
              </button>
            ))}
            <button type="button" aria-label={t("newp.other")} onClick={() => setView("other")} className={card}>
              <Shape ratio="W:H" label={t("newp.other")} />
            </button>
            <button type="button" aria-label={t("newp.grid")} onClick={() => props.onSteps("grid")} className={card}>
              <span className="flex flex-col items-center gap-1.5">
                <span className="flex h-[64px] items-end">
                  <span className="grid h-[60px] w-[46px] grid-cols-3 gap-0.5">
                    {Array.from({ length: 12 }, (_, i) => (
                      <span key={i} className="rounded-[2px] bg-text/60" />
                    ))}
                  </span>
                </span>
                <span className="text-[12px] text-muted">{t("newp.grid")}</span>
              </span>
            </button>
            <button type="button" aria-label={t("newp.fromPhotos")} onClick={() => props.onSteps(null)} className={card}>
              <span className="flex flex-col items-center gap-1.5">
                <span className="flex h-[64px] w-[52px] items-center justify-center rounded-md bg-surface-2">
                  <Icon name="image" size={26} />
                </span>
                <span className="text-[12px] text-muted">{t("newp.fromPhotos")}</span>
              </span>
            </button>
          </div>
        ) : (
          <ul className="px-3 pb-2">
            {OTHER.map((r) => {
              const s = slideSize(r);
              return (
                <li key={r}>
                  <button type="button" onClick={() => create(r)} className="flex h-12 w-full items-center justify-between rounded-xl px-3 text-left hover:bg-surface-2">
                    <span className="flex flex-col">
                      <span className="text-[15px] font-semibold">{r}</span>
                      {s.height > 1350 && <span className="text-[11px] text-muted">{t("newp.cropNote")}</span>}
                    </span>
                    <span className="flex items-center gap-2 text-[13px] text-muted">
                      1080 × {s.height}
                      <Icon name="chevronRight" size={16} />
                    </span>
                  </button>
                </li>
              );
            })}
            <li className="mt-1 border-t border-border pt-1">
              <button type="button" onClick={() => setView("custom")} className="flex h-12 w-full items-center justify-between rounded-xl px-3 text-left hover:bg-surface-2">
                <span className="text-[15px] font-semibold">{t("newp.custom")}</span>
                <Icon name="chevronRight" size={16} />
              </button>
            </li>
          </ul>
        )}
      </section>
      {view === "custom" && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/50 px-6 pt-[18dvh]" onClick={(e) => e.stopPropagation()}>
          <div role="alertdialog" aria-modal="true" aria-label={t("newp.customTitle")} className="flex w-full max-w-sm flex-col gap-3 rounded-[22px] border border-border bg-surface p-5">
            <h2 className="text-lg font-bold">{t("newp.customTitle")}</h2>
            <p className="text-sm text-text-2">{t("newp.customHint", CUSTOM_HEIGHT)}</p>
            <label className="flex flex-col gap-1 text-[13px] text-muted">
              {t("newp.height")}
              <input
                autoFocus
                inputMode="numeric"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value.replace(/\D/g, ""));
                  setError(false);
                }}
                className={`h-12 rounded-xl border bg-surface-2 px-3 text-[17px] text-text outline-none ${error ? "border-danger" : "border-border"}`}
              />
            </label>
            {error && <p className="text-[13px] text-danger">{t("newp.heightError", CUSTOM_HEIGHT)}</p>}
            <div className="mt-1 flex gap-2.5">
              <button type="button" onClick={() => setView("other")} className="h-12 flex-1 rounded-[14px] border border-border-2 font-semibold">
                {t("common.cancel")}
              </button>
              <button
                type="button"
                disabled={!height}
                onClick={() => {
                  const h = Number(height);
                  if (h < CUSTOM_HEIGHT.min || h > CUSTOM_HEIGHT.max) return setError(true);
                  create(`1080x${h}`);
                }}
                className="h-12 flex-1 rounded-[14px] bg-accent font-bold text-on-accent disabled:opacity-40"
              >
                {t("newp.create")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
