"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TemplatePreview } from "@/components/layout/TemplatePreview";
import { Icon } from "@/components/ui/Icon";
import { formatRelative } from "@/lib/format";
import { listProjects, type ProjectMeta } from "@/lib/storage/projects";
import { templateSlides } from "@/lib/templates/apply";
import { DESIGNS, MIXED } from "@/lib/templates/designs";
import { useFavorites } from "@/lib/templates/favorites";
import { samplePhotosFor } from "@/lib/templates/samples";
import { activeEvents, type EventId, homeToday } from "@/lib/templates/seasons";
import { DEFAULT_OPTIONS, TEMPLATE_CATEGORIES, type Template, type TemplateCategory } from "@/lib/templates/types";
import { useEditor } from "@/store/editor";
import { useSettings, useT } from "@/store/settings";

// Home tab (M18, editor-v2/03): floating top bar (♡ · For you / Explore · search), banners,
// Continue / Create new, template groups that slide sideways, "Explore more" in two
// staggered columns; group, template detail, liked and search screens slide in on top.


function slidesOf(tpl: Template) {
  const type = tpl.design!.type;
  return templateSlides(tpl, 0, type === "grid" ? 9 : 3, type);
}

/** A carousel template's whole strip, `width` per slide. */
function Strip({ tpl, width }: { tpl: Template; width: number }) {
  const d = tpl.design!;
  return (
    <TemplatePreview
      template={tpl}
      photos={samplePhotosFor(tpl)}
      ratio={d.ratio}
      slides={slidesOf(tpl)}
      type={d.type}
      options={DEFAULT_OPTIONS}
      width={width * slidesOf(tpl)}
      plain
    />
  );
}

/** Every template preview shows sample photos (editor-v2/03 §3; real photos since 2026-10-28). */
function Preview({ tpl, width, slide = 0 }: { tpl: Template; width: number; slide?: number }) {
  const d = tpl.design!;
  const grid = d.type === "grid";
  const slides = slidesOf(tpl);
  // A carousel shows one slide: the whole strip, shifted and clipped to that slide.
  const strip = grid ? width : width * slides;
  return (
    <div className="overflow-hidden" style={{ width }}>
      <div style={{ marginLeft: grid ? 0 : -slide * width }}>
        <TemplatePreview
          template={tpl}
          photos={samplePhotosFor(tpl)}
          ratio={d.ratio}
          slides={slides}
          type={d.type}
          grid={grid ? { rows: 3, gapCompensation: false } : undefined}
          options={DEFAULT_OPTIONS}
          width={strip}
          plain={!grid}
        />
      </div>
    </div>
  );
}

/** Card height / width before its preview is drawn. */
function cardRatio(tpl: Template) {
  const type = tpl.design!.type;
  return type === "story" ? 16 / 9 : type === "grid" ? 4 / 3 : 5 / 4;
}

/** True once the element has come near the screen: previews are built (and photos fetched) only then. */
function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setSeen(true);
        io.disconnect();
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}

/** A banner's picture, built once the banner is swiped into view. */
function LazyBanner({ tpl, width }: { tpl: Template; width: number }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className="absolute inset-0 flex items-center justify-center bg-surface-2 opacity-90">
      {seen && <Preview tpl={tpl} width={width} />}
    </div>
  );
}

function Heart({ id, className = "" }: { id: string; className?: string }) {
  const t = useT();
  const liked = useFavorites((s) => s.ids.includes(id));
  const toggle = useFavorites((s) => s.toggle);
  return (
    <button
      type="button"
      aria-label={liked ? t("home.unlike") : t("home.like")}
      aria-pressed={liked}
      onClick={(e) => {
        e.stopPropagation();
        toggle(id);
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white ${className}`}
    >
      <Icon name="heart" size={18} filled={liked} />
    </button>
  );
}

/** Template card (§3): cover, ♡ that doesn't open it, photo / slide counts, dots for carousels. */
function TemplateCard({ tpl, width, onOpen, inRow }: { tpl: Template; width: number; onOpen: (tpl: Template) => void; inRow?: boolean }) {
  const locale = useSettings((s) => s.locale);
  const slides = slidesOf(tpl);
  const swipe = slides > 1 && tpl.design!.type !== "grid";
  const [at, setAt] = useState(0);
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className="relative shrink-0 overflow-hidden rounded-xl bg-surface-2" style={{ width }}>
      {swipe ? (
        // A carousel template: swipe on the card to see its other slides (owner, 2026-10-17).
        <div
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          style={{ touchAction: "pan-x pan-y" }}
          onScroll={(e) => setAt(Math.round(e.currentTarget.scrollLeft / width))}
        >
          {/* The strip is drawn once; one see-through stop per slide on top of it (not one copy per slide). */}
          <div className="relative flex shrink-0" style={{ width: width * slides }}>
            {seen && (
              <div className="pointer-events-none absolute inset-0">
                <Strip tpl={tpl} width={width} />
              </div>
            )}
            {Array.from({ length: slides }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={i === 0 ? tpl.name[locale] : `${tpl.name[locale]} ${i + 1}`}
                onClick={() => onOpen(tpl)}
                className="relative block shrink-0 snap-center"
                style={{ width, height: width * cardRatio(tpl) }}
              />
            ))}
          </div>
        </div>
      ) : (
        <button type="button" aria-label={tpl.name[locale]} onClick={() => onOpen(tpl)} className="block">
          {seen ? <Preview tpl={tpl} width={width} /> : <div style={{ width, height: width * cardRatio(tpl) }} />}
        </button>
      )}
      {swipe && inRow && (
        // In a sideways row (owner, 2026-10-28): the bottom strip and the right edge move
        // the whole row; the rest of the card turns the template's slides. These layers sit
        // outside the card's own scroller, so the browser scrolls the row from them.
        <>
          <div aria-hidden="true" data-row-drag="" onClick={() => onOpen(tpl)} className="absolute inset-x-0 bottom-0 h-[20%]" style={{ touchAction: "pan-x pan-y" }} />
          <div aria-hidden="true" data-row-drag="" onClick={() => onOpen(tpl)} className="absolute top-0 right-0 bottom-0 w-[18%]" style={{ touchAction: "pan-x pan-y" }} />
        </>
      )}
      <Heart id={tpl.id} className="absolute top-2 right-2" />
      <span className="pointer-events-none absolute bottom-2 left-2 flex gap-1 text-[11px] font-semibold text-white">
        <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5">
          <Icon name="image" size={12} />
          {tpl.photos}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5">
          <Icon name="slides" size={12} />
          {slides}
        </span>
      </span>
      {swipe && (
        <span className="pointer-events-none absolute right-2 bottom-3 flex gap-0.5">
          {Array.from({ length: slides }, (_, i) => (
            <span key={i} className={`h-1 rounded-full ${i === at ? "w-2.5 bg-white" : "w-1 bg-white/60"}`} />
          ))}
        </span>
      )}
    </div>
  );
}

/** Two staggered columns (masonry), cards as tall as their shape. */
function Masonry({ list, onOpen, width }: { list: Template[]; onOpen: (tpl: Template) => void; width: number }) {
  // A dozen cards at a time, more as the end comes near (200+ cards at once made the home lag).
  const [shown, setShown] = useState(MASONRY_STEP);
  const more = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = more.current;
    if (!el || shown >= list.length) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setShown((n) => n + MASONRY_STEP), { rootMargin: "800px" });
    io.observe(el);
    return () => io.disconnect();
  }, [shown, list.length]);
  const cols: Template[][] = [[], []];
  const heights = [0, 0];
  for (const tpl of list.slice(0, shown)) {
    const h = cardRatio(tpl);
    const c = heights[0] <= heights[1] ? 0 : 1;
    cols[c].push(tpl);
    heights[c] += h;
  }
  return (
    <div className="flex gap-2.5 px-4">
      {cols.map((col, i) => (
        <div key={i} className="flex flex-1 flex-col gap-2.5">
          {col.map((tpl) => (
            <TemplateCard key={tpl.id} tpl={tpl} width={width} onOpen={onOpen} />
          ))}
        </div>
      ))}
      {shown < list.length && <div ref={more} aria-hidden="true" className="h-px w-px" />}
    </div>
  );
}

const MASONRY_STEP = 12;
/** Cards in a sideways row before "See all" (the group screen has the rest). */
const SHELF_MAX = 10;

/** A sideways group: built once it comes near the screen, at most SHELF_MAX cards and "See all". */
function Shelf(props: { title: string; sub: string; list: Template[]; cardW: number; onOpen: (tpl: Template) => void; onMore: () => void }) {
  const t = useT();
  const [ref, seen] = useSeen<HTMLElement>();
  const rowH = Math.round((props.cardW * 5) / 4);
  return (
    <section ref={ref} aria-label={props.title} className="pt-6">
      <button type="button" onClick={props.onMore} className="flex w-full items-center justify-between px-4 text-left">
        <span className="flex flex-col">
          <span className="text-[17px] font-bold">{props.title}</span>
          <span className="text-[13px] text-muted">{props.sub}</span>
        </span>
        <Icon name="chevronRight" />
      </button>
      <div className="no-scrollbar flex items-start gap-2 overflow-x-auto px-4 pt-3" style={{ touchAction: "pan-x pan-y", minHeight: rowH + 12 }}>
        {seen &&
          props.list.slice(0, SHELF_MAX).map((tpl) => (
            // One height per row (owner, 2026-10-28): stories are narrower, not taller.
            <TemplateCard key={tpl.id} tpl={tpl} width={Math.round(rowH / cardRatio(tpl))} onOpen={props.onOpen} inRow />
          ))}
        {seen && props.list.length > SHELF_MAX && (
          <button
            type="button"
            onClick={props.onMore}
            className="flex shrink-0 flex-col items-center justify-center gap-2 rounded-xl bg-surface-2 text-sm font-semibold"
            style={{ width: Math.round(props.cardW * 0.6), height: rowH }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Icon name="chevronRight" />
            </span>
            {t("home.seeAll", { count: props.list.length })}
          </button>
        )}
      </div>
    </section>
  );
}

/** Width of the content column (CSS px), for card sizes. */
function useColumnWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(390);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

type Screen = { kind: "group"; category: TemplateCategory } | { kind: "event"; id: EventId } | { kind: "detail"; tpl: Template } | { kind: "favorites" } | { kind: "search" };

/** A screen sliding in from the right, over the home tab (§2.4, §5). */
function Pane(props: { title: string; onBack: () => void; children: React.ReactNode; footer?: React.ReactNode; header?: React.ReactNode }) {
  const t = useT();
  return (
    <div role="dialog" aria-label={props.title} className="animate-slide-in fixed inset-0 z-30 flex flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-5xl shrink-0 items-center gap-1 px-2 pt-2.5 pb-1">
        <button type="button" aria-label={t("common.back")} onClick={props.onBack} className="flex h-11 w-11 items-center justify-center">
          <Icon name="back" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold">{props.title}</h1>
        <span className="w-11" />
      </header>
      {props.header}
      <div className="mx-auto w-full max-w-5xl min-h-0 flex-1 overflow-y-auto pb-8">{props.children}</div>
      {props.footer}
    </div>
  );
}

function TemplateDetail({ tpl, onBack, onOpen, onUse }: { tpl: Template; onBack: () => void; onOpen: (tpl: Template) => void; onUse: (tpl: Template) => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const { ref, w } = useColumnWidth();
  const [current, setCurrent] = useState(0);
  const d = tpl.design!;
  const slides = d.type === "grid" ? 1 : slidesOf(tpl);
  const width = Math.min(w - 32, d.type === "story" ? 300 : 520);
  const similar = DESIGNS.filter((x) => x.id !== tpl.id && x.design?.category === d.category);
  const creating = useEditor((s) => s.creating);
  return (
    <Pane
      title={t("home.template")}
      onBack={onBack}
      footer={
        <div className="mx-auto flex w-full max-w-2xl shrink-0 items-center gap-2 px-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={() => onUse(tpl)} disabled={creating} aria-busy={creating} className="flex h-14 flex-1 items-center justify-center rounded-full bg-accent text-[17px] font-bold text-on-accent disabled:opacity-60">
            {creating ? t("library.opening") : t("library.use")}
          </button>
          <Heart id={tpl.id} className="h-14! w-14! bg-surface-2! text-text!" />
        </div>
      }
    >
      <div ref={ref} className="flex flex-col items-center gap-3 pt-2">
        <h2 className="text-lg font-bold">{tpl.name[locale]}</h2>
        {/* Swipe through the slides (§5). */}
        <div
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-2xl"
          style={{ width }}
          onScroll={(e) => setCurrent(Math.round(e.currentTarget.scrollLeft / width))}
        >
          {Array.from({ length: slides }, (_, i) => (
            <div key={i} className="shrink-0 snap-center" style={{ width }}>
              <Preview tpl={tpl} width={width} slide={i} />
            </div>
          ))}
        </div>
        {slides > 1 && (
          <div className="flex gap-1.5" aria-label={`${current + 1} / ${slides}`}>
            {Array.from({ length: slides }, (_, i) => (
              <span key={i} className={`h-1.5 rounded-full ${i === current ? "w-4 bg-text" : "w-1.5 bg-border-2"}`} />
            ))}
          </div>
        )}
        <div className="flex gap-2 text-[12px]">
          {[t(`home.ratio.${d.type}`), t("home.photos", { count: tpl.photos }), t("home.slides", { count: slidesOf(tpl) })].map((label) => (
            <span key={label} className="rounded-full bg-surface-2 px-3 py-1.5 font-semibold">
              {label}
            </span>
          ))}
        </div>
      </div>
      {similar.length > 0 && (
        <section className="pt-6">
          <h3 className="px-4 pb-2 text-[17px] font-bold">{t("home.similar")}</h3>
          <Masonry list={similar} onOpen={onOpen} width={Math.floor((w - 42) / 2)} />
        </section>
      )}
    </Pane>
  );
}

export function HomeScreen(props: { onNew: () => void; onUseTemplate: (tpl: Template) => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const openProject = useEditor((s) => s.openProject);
  const favorites = useFavorites((s) => s.ids);
  const [tab, setTab] = useState<"forYou" | "explore">("forYou");
  const [stack, setStack] = useState<Screen[]>([]);
  const [chip, setChip] = useState<TemplateCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [latest, setLatest] = useState<ProjectMeta | null>(null);
  const [banner, setBanner] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const { ref, w } = useColumnWidth();
  const cardW = Math.max(150, Math.min(240, Math.floor(w * 0.45)));
  const halfW = Math.floor((w - 42) / 2);

  useEffect(() => {
    let alive = true;
    void listProjects().then((list) => alive && setLatest(list[0] ?? null));
    return () => {
      alive = false;
    };
  }, []);
  const thumb = useMemo(() => (latest?.thumbnail ? URL.createObjectURL(latest.thumbnail) : null), [latest]);
  useEffect(() => () => void (thumb && URL.revokeObjectURL(thumb)), [thumb]);

  // Banners move on by themselves every 6 s until the user touches them (§2.2).
  useEffect(() => {
    const id = window.setInterval(() => {
      const el = bannerRef.current;
      if (!el || touched.current) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % el.childElementCount;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  const push = (s: Screen) => setStack((st) => [...st, s]);
  const pop = () => setStack((st) => st.slice(0, -1));
  const open = (tpl: Template) => push({ kind: "detail", tpl });
  // Liked / recently liked categories first (§4).
  const categories = TEMPLATE_CATEGORIES.filter((c) => DESIGNS.some((d) => d.design?.category === c)).sort((a, b) => {
    const score = (c: TemplateCategory) => DESIGNS.filter((d) => d.design?.category === c && favorites.includes(d.id)).length;
    return score(b) - score(a);
  });
  // Seasons and events coming up (seasons.ts) lead the banners and the groups.
  const events = useMemo(
    () =>
      activeEvents(homeToday())
        .map((e) => ({ ...e, list: DESIGNS.filter((d) => d.design?.events?.includes(e.id)) }))
        .filter((e) => e.list.length > 0)
        .slice(0, 3),
    [],
  );
  const banners: { title: string; sub: string; screen: Screen; tpl: Template }[] = [
    ...events.slice(0, 2).map((e) => ({ title: e.name[locale], sub: e.sub[locale], screen: { kind: "event", id: e.id } as Screen, tpl: e.list[0] })),
    ...(["torn", "film", "travel"] as const).map((c) => ({
      title: t(`library.category.${c}`),
      sub: t(`library.desc.${c}`),
      screen: { kind: "group", category: c } as Screen,
      tpl: DESIGNS.find((d) => d.design?.category === c) ?? DESIGNS[0],
    })),
  ].slice(0, 4);
  const shelves: { key: string; title: string; sub: string; screen: Screen; list: Template[] }[] = [
    ...events.map((e) => ({ key: e.id, title: e.name[locale], sub: e.sub[locale], screen: { kind: "event", id: e.id } as Screen, list: e.list })),
    ...categories.map((c) => ({
      key: c,
      title: t(`library.category.${c}`),
      sub: t(`library.desc.${c}`),
      screen: { kind: "group", category: c } as Screen,
      list: DESIGNS.filter((d) => d.design?.category === c),
    })),
  ];
  const eventOf = (id: EventId) => events.find((e) => e.id === id);
  const top = stack.at(-1);
  const q = query.trim().toLowerCase();
  const found = q
    ? DESIGNS.filter((d) => `${d.name.en} ${d.name.vi} ${t(`library.category.${d.design!.category}`)} ${t(`library.desc.${d.design!.category}`)}`.toLowerCase().includes(q))
    : [];

  return (
    <main ref={ref} className="mx-auto flex h-dvh max-w-md flex-col md:max-w-3xl lg:max-w-5xl">
      {/* Floating top bar over the content (§2.1). */}
      <header className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-5xl items-center justify-between px-3 pt-3">
        <button type="button" aria-label={t("home.favorites")} onClick={() => push({ kind: "favorites" })} className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/70 backdrop-blur-xl">
          <Icon name="heart" />
        </button>
        <div role="tablist" aria-label={t("home.forYou")} className="flex rounded-full border border-border bg-surface/70 p-1 backdrop-blur-xl">
          {(["forYou", "explore"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`h-9 rounded-full px-4 text-[14px] font-semibold ${tab === k ? "bg-surface text-text shadow-sm" : "text-muted"}`}
            >
              {t(k === "forYou" ? "home.forYou" : "home.explore")}
            </button>
          ))}
        </div>
        <button type="button" aria-label={t("home.search")} onClick={() => push({ kind: "search" })} className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/70 backdrop-blur-xl">
          <Icon name="search" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-32">
        {tab === "forYou" ? (
          <>
            {/* Banners (§2.2). */}
            <section aria-label={t("home.banners")} className="relative">
              <div
                ref={bannerRef}
                className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
                onPointerDown={() => (touched.current = true)}
                onScroll={(e) => setBanner(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
              >
                {banners.map((b) => (
                  <div key={b.title} className="relative h-[55dvh] min-h-[340px] w-full shrink-0 snap-center overflow-hidden">
                    <LazyBanner tpl={b.tpl} width={Math.max(w, 360)} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/75" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-5 text-white">
                      <h2 className="font-display text-[34px] leading-[1.02] font-bold">{b.title}</h2>
                      <p className="text-sm text-white/85">{b.sub}</p>
                      <button type="button" onClick={() => push(b.screen)} className="mt-1 h-11 rounded-full bg-white px-5 text-[15px] font-bold text-black">
                        {t("home.exploreNow")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
                {banners.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full ${i === banner ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
                ))}
              </div>
            </section>

            {/* Continue / Create new (§2.3). */}
            <div className="flex gap-2.5 px-4 pt-4">
              {latest && (
                <button type="button" onClick={() => void openProject(latest.id)} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-surface p-2.5 text-left">
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- project thumbnail */}
                    {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[15px] font-semibold">{t("home.continue")}</span>
                    <span className="truncate text-xs text-muted">{formatRelative(latest.updatedAt, locale)}</span>
                  </span>
                </button>
              )}
              <button type="button" onClick={props.onNew} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-surface p-2.5 text-left">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                  <Icon name="plus" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[15px] font-semibold">{t("home.createNew")}</span>
                  <span className="truncate text-xs text-muted">{t("home.blankPage")}</span>
                </span>
              </button>
            </div>

            {/* Groups that slide sideways (§2.4): events in season first. */}
            {shelves.map((sh) => (
              <Shelf key={sh.key} title={sh.title} sub={sh.sub} list={sh.list} cardW={cardW} onOpen={open} onMore={() => push(sh.screen)} />
            ))}

            {/* Explore more (§2.5). */}
            <section className="pt-8">
              <h2 className="px-4 pb-3 text-[17px] font-bold">{t("home.exploreMore")}</h2>
              <Masonry list={MIXED} onOpen={open} width={halfW} />
            </section>
          </>
        ) : (
          <div className="pt-16">
            <nav aria-label={t("library.categories")} className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
              {(["all", ...categories] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={chip === c}
                  onClick={() => setChip(c)}
                  className={`h-9 shrink-0 rounded-full px-4 text-sm ${chip === c ? "bg-text font-semibold text-bg" : "border border-border"}`}
                >
                  {t(`library.category.${c}`)}
                </button>
              ))}
            </nav>
            <Masonry list={chip === "all" ? MIXED : DESIGNS.filter((d) => d.design?.category === chip)} onOpen={open} width={halfW} />
          </div>
        )}
      </div>

      {top?.kind === "group" && (
        <Pane title={t(`library.category.${top.category}`)} onBack={pop}>
          <div className="grid grid-cols-2 gap-2.5 px-4 pt-2 sm:grid-cols-3 lg:grid-cols-4">
            {DESIGNS.filter((d) => d.design?.category === top.category).map((tpl) => (
              <TemplateCard key={tpl.id} tpl={tpl} width={halfW > 260 ? 220 : halfW} onOpen={open} />
            ))}
          </div>
        </Pane>
      )}
      {top?.kind === "event" && (
        <Pane title={eventOf(top.id)?.name[locale] ?? ""} onBack={pop}>
          <div className="grid grid-cols-2 gap-2.5 px-4 pt-2 sm:grid-cols-3 lg:grid-cols-4">
            {(eventOf(top.id)?.list ?? []).map((tpl) => (
              <TemplateCard key={tpl.id} tpl={tpl} width={halfW > 260 ? 220 : halfW} onOpen={open} />
            ))}
          </div>
        </Pane>
      )}
      {top?.kind === "favorites" && (
        <Pane title={t("home.favorites")} onBack={pop}>
          {favorites.length === 0 ? (
            <p className="px-6 pt-16 text-center text-sm text-muted">{t("home.noFavorites")}</p>
          ) : (
            <Masonry list={DESIGNS.filter((d) => favorites.includes(d.id))} onOpen={open} width={halfW} />
          )}
        </Pane>
      )}
      {top?.kind === "search" && (
        <Pane
          title={t("home.search")}
          onBack={pop}
          header={
            <label className="mx-auto mb-2 flex h-11 w-[calc(100%-32px)] max-w-2xl items-center gap-2.5 rounded-xl bg-surface-2 px-3 text-muted">
              <Icon name="search" size={18} />
              <input
                autoFocus
                type="search"
                aria-label={t("home.search")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("home.searchHint")}
                className="flex-1 bg-transparent text-sm text-text outline-none"
              />
            </label>
          }
        >
          {!q ? (
            <div className="flex flex-wrap gap-2 px-4 pt-2">
              {categories.map((c) => (
                <button key={c} type="button" onClick={() => push({ kind: "group", category: c })} className="h-9 rounded-full border border-border px-4 text-sm">
                  {t(`library.category.${c}`)}
                </button>
              ))}
            </div>
          ) : found.length ? (
            <Masonry list={found} onOpen={open} width={halfW} />
          ) : (
            <p className="px-6 pt-16 text-center text-sm text-muted">{t("home.noResults")}</p>
          )}
        </Pane>
      )}
      {top?.kind === "detail" && <TemplateDetail key={top.tpl.id} tpl={top.tpl} onBack={pop} onOpen={open} onUse={props.onUseTemplate} />}
    </main>
  );
}
