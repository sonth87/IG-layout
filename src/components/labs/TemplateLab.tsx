"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TemplatePreview } from "@/components/layout/TemplatePreview";
import { templateSlides } from "@/lib/templates/apply";
import { DESIGNS } from "@/lib/templates/designs";
import { samplePhotosFor } from "@/lib/templates/samples";
import { EVENTS, type EventId } from "@/lib/templates/seasons";
import type { CutoutText } from "@/lib/project/types";
import { CUTOUT_STYLES, loadCutoutFonts, cutoutLayout, cutoutStyle, DEFAULT_CUTOUT, drawCutout } from "@/lib/text/cutout";
import { DEFAULT_OPTIONS, type SampleTheme, TEMPLATE_CATEGORIES, type Template, type TemplateCategory } from "@/lib/templates/types";
import { useSettings, useT } from "@/store/settings";

// Template lab (/labs/templates, 2026-10-28): every home template at once, by group or by
// event, with the whole carousel strip — to review the library on a phone.
// Filters live in the URL (?cat=film, ?event=christmas) so a view can be shared.

type Filter = { cat: TemplateCategory | "all" } | { event: EventId } | { cutout: true } | { theme: SampleTheme[] };

const SAMPLES = ["Happy birthday!", "Chúc mừng năm mới", "weekend mood"];

/** Every cut-out letter style (D-141) on a few sample lines, flat and curved. */
function CutoutGallery() {
  const locale = useSettings((s) => s.locale);
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CUTOUT_STYLES.map((style, i) => (
        <figure key={style.id} className="m-0 rounded-lg bg-white p-2">
          {SAMPLES.map((text, j) => (
            <CutoutSample key={j} text={text} cutout={{ ...DEFAULT_CUTOUT, style: style.id, seed: i * 3 + j + 1, curve: j === 2 ? 0.6 : 0 }} />
          ))}
          <figcaption className="text-xs text-black/60">
            {style.name[locale]} · {style.id}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function CutoutSample({ text, cutout }: { text: string; cutout: CutoutText }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(0);
  useEffect(() => {
    let alive = true;
    void import("@/lib/text/webfonts")
      .then(() => loadCutoutFonts(cutoutStyle(cutout.style)))
      .then(() => alive && setReady((n) => n + 1));
    return () => {
      alive = false;
    };
  }, [cutout.style]);
  useEffect(() => {
    const canvas = ref.current;
    const c = canvas?.getContext("2d");
    if (!canvas || !c) return;
    const layout = cutoutLayout({ text, width: 900, fontSize: 80, align: "center", letterSpacing: 0, lineHeight: 1.15, cutout });
    const W = 420;
    const k = W / 900;
    canvas.width = W * 2;
    canvas.height = Math.ceil(layout.height * k * 2);
    canvas.style.height = `${layout.height * k}px`;
    c.setTransform(k * 2, 0, 0, k * 2, 0, 0);
    drawCutout(c, layout);
  }, [text, cutout, ready]);
  return <canvas ref={ref} className="block w-full max-w-[420px]" />;
}

function slidesOf(tpl: Template) {
  const type = tpl.design!.type;
  return templateSlides(tpl, 0, type === "grid" ? 9 : 3, type);
}

function Card({ tpl }: { tpl: Template }) {
  const locale = useSettings((s) => s.locale);
  const d = tpl.design!;
  const grid = d.type === "grid";
  const slides = slidesOf(tpl);
  const per = grid ? 260 : d.type === "story" ? 130 : 180;
  return (
    <figure className="m-0 min-w-0">
      <div className="overflow-x-auto rounded-lg bg-black/5">
        <TemplatePreview
          template={tpl}
          photos={samplePhotosFor(tpl)}
          ratio={d.ratio}
          slides={slides}
          type={d.type}
          grid={grid ? { rows: 3, gapCompensation: false } : undefined}
          options={DEFAULT_OPTIONS}
          width={grid ? per : per * slides}
          plain={!grid}
        />
      </div>
      <figcaption className="px-0.5 pt-1 text-xs opacity-70">
        {tpl.name[locale]} · {tpl.id.replace("design-", "")} · {tpl.photos}📷
      </figcaption>
    </figure>
  );
}

export function TemplateLab() {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const [filter, setFilter] = useState<Filter>({ cat: "seasonal" });
  // Names follow the saved language, unknown at build time: draw after mount.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Reading the URL once on mount (static export: no server props).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    const q = new URLSearchParams(location.search);
    const event = q.get("event");
    const cat = q.get("cat");
    const theme = q.get("theme");
    if (q.get("cutout")) setFilter({ cutout: true });
    else if (theme) setFilter({ theme: theme.split(",") as SampleTheme[] });
    else if (event) setFilter({ event: event as EventId });
    else if (cat) setFilter({ cat: cat as TemplateCategory });
  }, []);
  const choose = (f: Filter) => {
    setFilter(f);
    history.replaceState(null, "", `?${"theme" in f ? `theme=${f.theme.join(",")}` : "cutout" in f ? "cutout=1" : "event" in f ? `event=${f.event}` : `cat=${f.cat}`}`);
  };
  const shown = useMemo(
    () => ("theme" in filter ? DESIGNS.filter((d) => d.design?.themes?.some((th) => filter.theme.includes(th))) : "cutout" in filter ? [] : DESIGNS.filter((d) => ("event" in filter ? d.design?.events?.includes(filter.event) : filter.cat === "all" || d.design?.category === filter.cat))),
    [filter],
  );
  const count = (c: TemplateCategory) => DESIGNS.filter((d) => d.design?.category === c).length;
  const eventCount = (e: EventId) => DESIGNS.filter((d) => d.design?.events?.includes(e)).length;
  const chip = (active: boolean) => `shrink-0 rounded-full px-3 py-1.5 text-xs ${active ? "bg-[var(--fg)] text-[var(--bg)]" : "bg-black/5"}`;

  if (!ready) return <main className="min-h-dvh bg-[var(--bg)]" />;
  return (
    <main className="min-h-dvh bg-[var(--bg)] p-4 text-[var(--fg)]">
      <h1 className="text-lg font-semibold">Template lab · {DESIGNS.length}</h1>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button className={chip("cat" in filter && filter.cat === "all")} onClick={() => choose({ cat: "all" })}>
          all
        </button>
        {TEMPLATE_CATEGORIES.map((c) => (
          <button key={c} className={chip("cat" in filter && filter.cat === c)} onClick={() => choose({ cat: c })}>
            {t(`library.category.${c}` as never)} {count(c)}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button className={chip("cutout" in filter)} onClick={() => choose({ cutout: true })}>
          ✂ cut-out {CUTOUT_STYLES.length}
        </button>
        {EVENTS.map((e) => (
          <button key={e.id} className={chip("event" in filter && filter.event === e.id)} onClick={() => choose({ event: e.id })}>
            {e.name[locale]} {eventCount(e.id)}
          </button>
        ))}
      </div>
      {"cutout" in filter && <CutoutGallery />}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((tpl) => (
          <Card key={tpl.id} tpl={tpl} />
        ))}
      </div>
    </main>
  );
}
