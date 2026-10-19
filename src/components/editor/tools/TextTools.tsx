"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { FONT_KEYS, type FontKey, type TextElement } from "@/lib/project/types";
import { type FontCategory, fontInfo, fontWeight, nearestWeight, prepareCatalogFonts, TEXT_FONTS } from "@/lib/text/fonts";
import { PREVIEW_SENTENCES } from "@/lib/text/previewSentences";
import { fold, useCatalog } from "@/lib/catalog/load";
import type { FontLanguage, FontStyleTag } from "@/lib/catalog/types";
import { updateEl, useEditor, useViewDoc } from "@/store/editor";
import { useSettings, useT } from "@/store/settings";
import { Slider, Swatches, ToolSheet } from "./controls";

interface ToolProps {
  elementId: string;
  onClose: () => void;
}

function useDraftText(id: string) {
  const el = useViewDoc()?.elements.find((e) => e.id === id);
  const updateDraft = useEditor((s) => s.updateDraft);
  const patch = (p: Partial<TextElement>) => updateDraft((d) => updateEl(d, id, p));
  return { el: el?.type === "text" ? el : undefined, patch };
}

type Tab = "font" | "style" | "color" | "effects";

/** Text styling (wireframe 11). Edits a draft: ✕ / ✓. */
export function TextTool({ elementId, onClose }: ToolProps) {
  const t = useT();
  const { el, patch } = useDraftText(elementId);
  const applyDraft = useEditor((s) => s.applyDraft);
  const cancelDraft = useEditor((s) => s.cancelDraft);
  const [tab, setTab] = useState<Tab>("font");
  if (!el) return null;
  const toggle = (on: boolean) => (on ? "bg-text font-bold text-bg" : "border border-border");

  return (
    <ToolSheet
      title={t("tool.text")}
      onApply={() => {
        applyDraft();
        onClose();
      }}
      onCancel={() => {
        cancelDraft();
        onClose();
      }}
    >
      <div role="tablist" className="mb-2 flex gap-5 border-b border-border">
        {(["font", "style", "color", "effects"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`h-10 text-sm ${tab === k ? "border-b-2 border-accent font-bold" : "text-muted"}`}
          >
            {t(`text.tab.${k}`)}
          </button>
        ))}
      </div>

      {tab === "font" && <FontPicker el={el} patch={patch} />}

      {tab === "style" && (
        <>
          <div className="flex items-center gap-2 py-1">
            <button
              type="button"
              aria-pressed={fontWeight(el) >= 600}
              onClick={() => {
                const bold = fontWeight(el) < 600;
                patch({ bold, weight: nearestWeight(el.font, bold ? 700 : 400) });
              }}
              className={`h-10 rounded-xl px-4 text-sm font-bold ${toggle(fontWeight(el) >= 600)}`}
            >
              B
            </button>
            <div role="radiogroup" aria-label={t("text.align")} className="flex gap-1">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={el.align === a}
                  aria-label={t(`text.align.${a}`)}
                  onClick={() => patch({ align: a })}
                  className={`flex h-10 w-11 items-center justify-center rounded-xl ${toggle(el.align === a)}`}
                >
                  <Icon name={`align${a[0].toUpperCase()}${a.slice(1)}` as "alignLeft"} size={18} />
                </button>
              ))}
            </div>
          </div>
          <Slider label={t("text.size")} value={Math.round(el.fontSize)} min={16} max={400} defaultValue={97} onChange={(v) => patch({ fontSize: v })} />
          <Slider label={t("text.spacing")} value={Math.round(el.letterSpacing)} min={-10} max={60} defaultValue={0} onChange={(v) => patch({ letterSpacing: v })} />
          <Slider
            label={t("text.lineHeight")}
            value={Math.round(el.lineHeight * 100)}
            min={80}
            max={200}
            step={5}
            defaultValue={115}
            format={(v) => (v / 100).toFixed(2)}
            onChange={(v) => patch({ lineHeight: v / 100 })}
          />
        </>
      )}

      {tab === "color" && <Swatches value={el.color} gradient onChange={(color) => patch({ color })} />}

      {tab === "effects" && (
        <>
          <Slider
            label={t("text.stroke")}
            value={Math.round(el.stroke?.width ?? 0)}
            min={0}
            max={24}
            defaultValue={0}
            onChange={(v) => patch({ stroke: v > 0 ? { color: el.stroke?.color ?? "#111111", width: v } : null })}
          />
          {el.stroke && <Swatches value={el.stroke.color} onChange={(color) => patch({ stroke: { ...el.stroke!, color } })} />}
          <label className="flex items-center justify-between py-2 text-sm">
            <span>{t("tool.shadow")}</span>
            <input type="checkbox" checked={el.shadow} onChange={(e) => patch({ shadow: e.target.checked })} className="h-[22px] w-[22px] accent-accent" />
          </label>
          <label className="flex items-center justify-between py-2 text-sm">
            <span>{t("text.background")}</span>
            <input
              type="checkbox"
              checked={!!el.background}
              onChange={(e) =>
                patch({ background: e.target.checked ? { color: "#111111", padding: el.fontSize * 0.3, radius: el.fontSize * 0.2 } : null })
              }
              className="h-[22px] w-[22px] accent-accent"
            />
          </label>
          {el.background && (
            <>
              <Swatches value={el.background.color} onChange={(color) => patch({ background: { ...el.background!, color } })} />
              <Slider
                label={t("tool.corner")}
                value={Math.round(el.background.radius)}
                min={0}
                max={Math.round(el.fontSize)}
                defaultValue={Math.round(el.fontSize * 0.2)}
                onChange={(v) => patch({ background: { ...el.background!, radius: v } })}
              />
            </>
          )}
        </>
      )}
    </ToolSheet>
  );
}

/** Edit the words of a text element in a real text box (phone keyboard). One history step. */
export function TextEditDialog({ elementId, onClose }: ToolProps) {
  const t = useT();
  const el = useViewDoc()?.elements.find((e) => e.id === elementId);
  const updateElement = useEditor((s) => s.updateElement);
  const [value, setValue] = useState(el?.type === "text" ? el.text : "");
  if (el?.type !== "text") return null;

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-end bg-black/60">
      <div role="dialog" aria-modal="true" aria-label={t("text.edit")} className="rounded-t-[20px] bg-surface px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between pb-2">
          <button type="button" onClick={onClose} className="h-10 px-2 text-sm font-semibold">
            {t("common.cancel")}
          </button>
          <h2 className="text-[15px] font-bold">{t("text.edit")}</h2>
          <button
            type="button"
            onClick={() => {
              const text = value.trim() ? value : el.text;
              if (text !== el.text) updateElement(el.id, { text });
              onClose();
            }}
            className="h-10 rounded-xl bg-accent px-4 text-sm font-bold text-on-accent"
          >
            {t("common.done")}
          </button>
        </div>
        <textarea
          autoFocus
          aria-label={t("text.edit")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={(e) => e.target.select()}
          rows={4}
          className="w-full rounded-xl border border-border bg-surface-2 p-3 text-lg outline-none focus:border-accent"
          style={{ fontFamily: fontInfo(el.font).family, fontWeight: fontWeight(el) }}
        />
      </div>
    </div>
  );
}

type FontStyleChip = "all" | "sans" | "serif" | "display" | "handwriting" | "calligraphy" | "fantasy" | "playful" | "festive" | "retro" | "brush" | "mono";
const STYLE_CHIPS: FontStyleChip[] = ["all", "sans", "serif", "display", "handwriting", "calligraphy", "fantasy", "playful", "festive", "retro", "brush", "mono"];
const STYLE_TAGS: Record<Exclude<FontStyleChip, "all">, FontStyleTag[]> = {
  sans: ["sans"],
  serif: ["serif"],
  display: ["display", "outline", "stencil"],
  handwriting: ["handwriting"],
  calligraphy: ["script", "calligraphy"],
  fantasy: ["fantasy"],
  playful: ["playful"],
  festive: ["festive"],
  retro: ["retro", "pixel"],
  brush: ["brush"],
  mono: ["mono"],
};
/** Built-in fonts have categories only. */
const BUILTIN_STYLES: Record<FontCategory, FontStyleTag[]> = { sans: ["sans"], serif: ["serif"], display: ["display"], script: ["handwriting", "script"], mono: ["mono"] };
type LangChip = "all" | "vietnamese" | "japanese" | "korean" | "chinese" | "thai" | "cyrillic";
const LANG_CHIPS: LangChip[] = ["all", "vietnamese", "japanese", "korean", "chinese", "thai", "cyrillic"];
const langOf = (l: FontLanguage): LangChip | null => (l === "chinese-simplified" || l === "chinese-traditional" ? "chinese" : l === "latin" || l === "greek" ? null : l);
const SAMPLE_LANG: Partial<Record<LangChip, keyof typeof PREVIEW_SENTENCES>> = { japanese: "ja", korean: "ko", chinese: "zh" };

/**
 * Font list (M11, S12; M20 C5): every font shows the element's own text (or a nice line)
 * in itself, its name small below; filters by style and by language, and a search.
 * Catalog fonts are declared with @font-face up front; off-screen rows are not rendered
 * (content-visibility), so a font file is fetched only once its row is seen.
 */
export function FontPicker({ el, patch }: { el: TextElement; patch: (p: Partial<TextElement>) => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const catalog = useCatalog((s) => s.catalog);
  const [style, setStyle] = useState<FontStyleChip>("all");
  const [lang, setLang] = useState<LangChip>("all");
  const [query, setQuery] = useState("");
  // One line per opening, so the list doesn't change while scrolling.
  const [line] = useState(() => {
    const list = PREVIEW_SENTENCES[locale === "vi" ? "vi" : "en"];
    return list[Math.floor(Math.random() * list.length)];
  });
  const [cjk] = useState(() => Object.fromEntries((["ja", "ko", "zh"] as const).map((k) => [k, PREVIEW_SENTENCES[k][Math.floor(Math.random() * PREVIEW_SENTENCES[k].length)]])));
  useEffect(() => {
    void prepareCatalogFonts();
  }, []);

  const own = el.text.split("\n").find((l) => l.trim())?.trim().slice(0, 32);
  const fonts = [
    ...FONT_KEYS.map((key) => ({ key: key as FontKey, info: TEXT_FONTS[key], styles: BUILTIN_STYLES[TEXT_FONTS[key].category], langs: ["vietnamese"] as LangChip[] })),
    ...(catalog?.fonts ?? []).map((f) => {
      const key = `c:${f.id}` as FontKey;
      return { key, info: fontInfo(key), styles: f.styles, langs: f.languages.map(langOf).filter((l): l is LangChip => !!l) };
    }),
  ];
  const q = fold(query.trim());
  const shown = fonts.filter(
    (f) => (style === "all" || f.styles.some((s) => STYLE_TAGS[style].includes(s))) && (lang === "all" || f.langs.includes(lang)) && (!q || fold(f.info.label).includes(q)),
  );
  const styles = STYLE_CHIPS.filter((c) => c === "all" || fonts.some((f) => f.styles.some((s) => STYLE_TAGS[c].includes(s))));
  const langs = LANG_CHIPS.filter((c) => c === "all" || fonts.some((f) => f.langs.includes(c)));
  /** What a font shows: the text itself, else a line in a language the font has. */
  const sample = (langsOfFont: LangChip[]) => {
    if (own) return own;
    if (lang !== "all" && SAMPLE_LANG[lang]) return cjk[SAMPLE_LANG[lang]!];
    if (!langsOfFont.includes("vietnamese") && locale === "vi") {
      const other = langsOfFont.map((l) => SAMPLE_LANG[l]).find(Boolean);
      return other ? cjk[other] : PREVIEW_SENTENCES.en[0];
    }
    return line;
  };
  const weights = fontInfo(el.font).weights;
  const weight = fontWeight(el);
  const setWeight = (w: number) => patch({ weight: w, bold: w >= 600 });
  const chip = (active: boolean) => `h-8 shrink-0 rounded-full px-3 text-[13px] ${active ? "bg-text font-semibold text-bg" : "border border-border"}`;

  return (
    <>
      <label className="mb-2 flex h-9 items-center gap-2 rounded-full bg-surface-2 px-3 text-muted">
        <Icon name="search" size={16} />
        <input type="search" aria-label={t("font.search")} placeholder={t("font.search")} value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none" />
      </label>
      <div role="radiogroup" aria-label={t("font.style")} className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1.5">
        {styles.map((c) => (
          <button key={c} type="button" role="radio" aria-checked={style === c} onClick={() => setStyle(c)} className={chip(style === c)}>
            {t(`font.style.${c}`)}
          </button>
        ))}
      </div>
      {langs.length > 1 && (
        <div role="radiogroup" aria-label={t("font.language")} className="no-scrollbar flex gap-1.5 overflow-x-auto pb-2">
          {langs.map((c) => (
            <button key={c} type="button" role="radio" aria-checked={lang === c} onClick={() => setLang(c)} className={chip(lang === c)}>
              {t(`font.lang.${c}`)}
            </button>
          ))}
        </div>
      )}
      <div role="radiogroup" aria-label={t("text.tab.font")} className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
        {shown.length === 0 && <p className="py-4 text-center text-sm text-muted">{t("font.none")}</p>}
        {shown.map(({ key, info, langs: fl }) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={el.font === key}
            aria-label={info.label}
            onClick={() => patch({ font: key, weight: nearestWeight(key, weight) })}
            style={{ contentVisibility: "auto", containIntrinsicSize: "auto 60px" }}
            className={`flex min-h-15 shrink-0 flex-col items-start justify-center rounded-xl px-3 py-1.5 text-left ${
              el.font === key ? "border-2 border-accent bg-accent-soft" : "border border-border bg-surface-2"
            }`}
          >
            <span style={{ fontFamily: info.family, fontWeight: nearestWeight(key, 500) }} className="w-full truncate text-[19px] leading-snug">
              {sample(fl)}
            </span>
            <span className="max-w-full truncate text-[11px] text-muted">
              {info.label}
              {!fl.includes("vietnamese") && ` · ${t("font.noVietnamese")}`}
            </span>
          </button>
        ))}
      </div>
      {Array.isArray(weights) ? (
        weights.length > 1 && (
          <div role="radiogroup" aria-label={t("text.weight")} className="flex flex-wrap gap-1.5 pt-2.5">
            {weights.map((w) => (
              <button
                key={w}
                type="button"
                role="radio"
                aria-checked={weight === w}
                onClick={() => setWeight(w)}
                style={{ fontFamily: fontInfo(el.font).family, fontWeight: w }}
                className={`h-9 min-w-11 rounded-lg px-2 text-sm ${weight === w ? "bg-text text-bg" : "border border-border"}`}
              >
                {w}
              </button>
            ))}
          </div>
        )
      ) : (
        <Slider label={t("text.weight")} value={weight} min={weights.min} max={weights.max} step={10} defaultValue={nearestWeight(el.font, 400)} onChange={setWeight} />
      )}
    </>
  );
}
