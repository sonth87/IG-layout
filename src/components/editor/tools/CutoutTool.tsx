"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { CutoutText, TextElement } from "@/lib/project/types";
import { CUTOUT_STYLES, type CutoutStyle, loadCutoutFonts, cutoutLayout, DEFAULT_CUTOUT, drawCutout } from "@/lib/text/cutout";
import { updateEl, useEditor, useViewDoc } from "@/store/editor";
import { useSettings, useT } from "@/store/settings";
import { Slider, ToolSheet } from "./controls";

// Cut-out letters sheet (D-141): pick a style (previewed with the text itself), Shuffle,
// cut by letter / word, mess, wave (up / down) and curve. Edits a draft: ✕ / ✓.

/** One style drawn with the first letters of the text. */
function StyleThumb({ style, text, cutout }: { style: CutoutStyle; text: string; cutout: CutoutText }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(0);
  useEffect(() => {
    let alive = true;
    void loadCutoutFonts(style).then(() => alive && setReady((n) => n + 1));
    return () => {
      alive = false;
    };
  }, [style]);
  useEffect(() => {
    const canvas = ref.current;
    const c = canvas?.getContext("2d");
    if (!canvas || !c) return;
    const sample = [...(text.replace(/\s+/g, " ").trim() || "Aa")].slice(0, 6).join("");
    const layout = cutoutLayout({ text: sample, width: 400, fontSize: 60, align: "center", letterSpacing: 0, lineHeight: 1.15, cutout: { ...cutout, style: style.id, rolls: undefined } });
    const W = 112;
    const H = 52;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const k = Math.min(W / 400, H / layout.height) * 0.95;
    c.setTransform(k * dpr, 0, 0, k * dpr, ((W - 400 * k) / 2) * dpr, ((H - layout.height * k) / 2) * dpr);
    drawCutout(c, layout);
  }, [style, text, cutout, ready]);
  return <canvas ref={ref} aria-hidden="true" style={{ width: 112, height: 52 }} />;
}

export function CutoutTool({ elementId, onClose }: { elementId: string; onClose: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const el = useViewDoc()?.elements.find((e) => e.id === elementId);
  const updateDraft = useEditor((s) => s.updateDraft);
  const applyDraft = useEditor((s) => s.applyDraft);
  const cancelDraft = useEditor((s) => s.cancelDraft);
  if (el?.type !== "text") return null;
  const patch = (p: Partial<TextElement>) => updateDraft((d) => updateEl(d, elementId, p));
  const cutout = el.cutout;
  const set = (p: Partial<CutoutText>) => patch({ cutout: { ...(cutout ?? DEFAULT_CUTOUT), ...p } });
  const shown = cutout ?? DEFAULT_CUTOUT;
  const chip = (on: boolean) => `h-9 flex-1 rounded-full text-[13px] ${on ? "bg-text font-semibold text-bg" : "bg-surface-2"}`;

  return (
    <ToolSheet
      title={t("cutout.title")}
      onApply={() => {
        applyDraft();
        onClose();
      }}
      onCancel={() => {
        cancelDraft();
        onClose();
      }}
    >
      <div role="radiogroup" aria-label={t("cutout.style")} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
        <button
          type="button"
          role="radio"
          aria-checked={!cutout}
          onClick={() => patch({ cutout: undefined })}
          className={`flex w-[112px] shrink-0 flex-col items-center gap-1 rounded-xl p-1 text-[11px] ${!cutout ? "ring-2 ring-accent" : ""}`}
        >
          <span className="flex h-[52px] w-full items-center justify-center rounded-lg bg-surface-2 text-[13px]">{t("cutout.off")}</span>
          {t("cutout.plain")}
        </button>
        {CUTOUT_STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={cutout?.style === s.id}
            aria-label={s.name[locale]}
            onClick={() => set({ style: s.id, rolls: undefined })}
            className={`flex w-[112px] shrink-0 flex-col items-center gap-1 rounded-xl p-1 text-[11px] ${cutout?.style === s.id ? "ring-2 ring-accent" : ""}`}
          >
            <span className="rounded-lg bg-surface-2">
              <StyleThumb style={s} text={el.text} cutout={shown} />
            </span>
            {s.name[locale]}
          </button>
        ))}
      </div>

      {cutout && (
        <>
          <div className="flex items-center gap-2 py-1">
            <button type="button" onClick={() => set({ seed: Math.floor(Math.random() * 1e6) + 1, rolls: undefined })} className="flex h-9 items-center gap-1.5 rounded-full bg-surface-2 px-4 text-[13px] font-semibold">
              <Icon name="shuffle" size={16} />
              {t("cutout.shuffle")}
            </button>
            <div role="radiogroup" aria-label={t("cutout.by")} className="flex flex-1 gap-1">
              {(["letter", "word"] as const).map((by) => (
                <button key={by} type="button" role="radio" aria-checked={cutout.by === by} onClick={() => set({ by, rolls: undefined })} className={chip(cutout.by === by)}>
                  {t(`cutout.by.${by}`)}
                </button>
              ))}
            </div>
          </div>
          <Slider label={t("cutout.mess")} value={Math.round(cutout.mess * 100)} min={0} max={100} defaultValue={40} onChange={(v) => set({ mess: v / 100 })} />
          <Slider label={t("cutout.wave")} value={Math.round(cutout.wave * 100)} min={0} max={100} defaultValue={20} onChange={(v) => set({ wave: v / 100 })} />
          <Slider label={t("cutout.curve")} value={Math.round(cutout.curve * 100)} min={-100} max={100} defaultValue={0} onChange={(v) => set({ curve: v / 100 })} />
          <p className="pt-1 text-xs text-muted">{t("cutout.tapHint")}</p>
        </>
      )}
    </ToolSheet>
  );
}
