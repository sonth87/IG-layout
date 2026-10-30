"use client";

import { useEffect, useState } from "react";
import { catalogAsset, fold, loadCatalog, loadPack, packsOf, packUrl, useCatalog } from "@ig-layout/core/catalog/load";
import type { CatalogItem, CatalogKind } from "@ig-layout/core/catalog/types";
import { collectionOrder, COLLECTIONS, mainCollection } from "@ig-layout/core/catalog/collections";
import { Icon, type IconName } from "@/components/ui/Icon";
import { iconDataUrl } from "@ig-layout/core/elements/icons";
import { newCardWidget, newEmoji, newFramedPhoto, newShape, newSticker, newWidget, newOverlay, WIDGETS } from "@ig-layout/core/elements/create";
import { WIDGET_GROUPS, WIDGET_VARIANTS, widgetName, widgetThumb } from "@ig-layout/core/elements/widgets";
import { drawOverlay, OVERLAY_KINDS, OVERLAYS, overlayBlob, type OverlayKind } from "@ig-layout/core/elements/overlays";
import { SHAPE_GROUPS } from "@ig-layout/core/elements/shapeLibrary";
import { drawShape, libraryShape } from "@ig-layout/core/elements/shapes";
import { DOODLE_KEYS } from "@ig-layout/core/elements/doodles";
import { PROP_GROUPS, propsIn } from "@ig-layout/core/elements/props";
import { STICKER_KEYS, STICKERS } from "@ig-layout/core/elements/stickers";
import { slideRect } from "@ig-layout/core/project/layout";
import { imageElement } from "@ig-layout/core/project/placement";
import { type FrameStyle, type MaskShape, newId, type ShapeKind, slideSize } from "@ig-layout/core/project/types";
import type { LibraryItem } from "@ig-layout/core/storage/db";
import { libraryAsset, listLibrary, saveLibrary, useBrand } from "@ig-layout/core/storage/library";
import { SLIDE_GRIDS, SLIDE_LAYOUTS } from "@ig-layout/core/templates/slideLayouts";
import { useEditor, useViewDoc } from "@/store/editor";
import { useSettings, useT } from "@/store/settings";
import { DragSheet } from "../DragSheet";
import { Thumb } from "../NewSlideSheet";
import { EmojiStickers } from "../tools/EmojiStickers";

// The "+" libraries (M19, editor-v2/11): every one groups its items; a group shows 7 and
// a "+N" tile that opens the whole group (‹ back). Tapping an item adds it to the middle
// of the slide in view, selects it and closes the sheet (its toolbar shows at once).

export type LibraryKind = "sticker" | "shape" | "frame" | "grid" | "widget" | "brand";

const SHOWN = 7;
const TILE = "flex aspect-square items-center justify-center overflow-hidden rounded-[14px] bg-surface-2 p-2 active:scale-95 transition-transform";

function ShapePreview({ shape }: { shape: string }) {
  return (
    <canvas
      aria-hidden="true"
      width={72}
      height={72}
      className="h-11 w-11 text-muted"
      ref={(c) => {
        if (!c) return;
        const ctx = c.getContext("2d")!;
        ctx.clearRect(0, 0, 72, 72);
        const aspect = libraryShape(shape)?.aspect ?? (shape === "line" ? 8 : shape === "arrow" ? 3 : shape === "film" ? 2.2 : 1);
        const w = aspect >= 1 ? 64 : 64 * aspect;
        const h = aspect >= 1 ? 64 / aspect : 64;
        ctx.save();
        ctx.translate((72 - w) / 2, (72 - h) / 2);
        drawShape(ctx, shape as ShapeKind, w, h, getComputedStyle(c).color);
        ctx.restore();
      }}
    />
  );
}

function OverlayPreview({ kind }: { kind: OverlayKind }) {
  return <canvas aria-hidden="true" width={60} height={60} className="h-full w-full rounded-lg" ref={(c) => {
        if (c) drawOverlay(c.getContext("2d")!, kind, 60, 60);
      }} />;
}

interface Item {
  key: string;
  label: string;
  node: React.ReactNode;
  add: () => void | Promise<void>;
}

/** One group: a title, 7 items and "+N" (or everything once opened). */
function Group(props: { title: string; items: Item[]; full?: boolean | "titled"; limit?: number; wide?: boolean; onMore: () => void }) {
  const t = useT();
  const limit = props.limit ?? SHOWN;
  const many = !props.full && !props.wide && props.items.length > limit + 1;
  const shown = many ? props.items.slice(0, limit) : props.items;
  if (!props.items.length) return null;
  return (
    <section aria-label={props.title} className="pb-4">
      {props.full !== true && <h3 className="pb-2 text-[15px] font-bold">{props.title}</h3>}
      {props.wide && (
        // Card widgets (D-114): wide cards, two to a row, all shown, named underneath.
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {shown.map((it) => (
            <button key={it.key} type="button" aria-label={it.label} title={it.label} onClick={() => void it.add()} className="flex flex-col items-stretch gap-1 rounded-[14px] bg-surface-2 p-2 transition-transform active:scale-95">
              <span className="flex h-28 items-center justify-center overflow-hidden">{it.node}</span>
              <span className="truncate text-center text-[11.5px] font-semibold text-muted">{it.label}</span>
            </button>
          ))}
        </div>
      )}
      {!props.wide && (
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {shown.map((it) => (
          <button key={it.key} type="button" aria-label={it.label} title={it.label} onClick={() => void it.add()} className={TILE}>
            {it.node}
          </button>
        ))}
        {many && (
          <button type="button" aria-label={t("lib.more", { count: props.items.length - limit })} onClick={props.onMore} className={`${TILE} text-[15px] font-bold text-muted`}>
            +{props.items.length - limit}
          </button>
        )}
      </div>
      )}
    </section>
  );
}

/** Catalog kinds shown in each library sheet (M20). */
const SHEET_PACKS: Partial<Record<LibraryKind, CatalogKind[]>> = { sticker: ["sticker", "overlay"], frame: ["frame"] };

/** Collections in library order: the ones in season first (M20 §9). */
const MONTH = new Date().getMonth() + 1;
const COLLECTION_ORDER = collectionOrder(MONTH);

/** "By type" or "By collection" — remembered on this device. */
const VIEW_KEY = "ig-layout:library-view";
function readView(): "type" | "set" {
  try {
    return localStorage.getItem(VIEW_KEY) === "set" ? "set" : "type";
  } catch {
    return "type";
  }
}

function PackThumb({ item }: { item: CatalogItem }) {
  // eslint-disable-next-line @next/next/no-img-element -- a pack thumbnail (static file)
  return <img src={packUrl(item.thumb)} alt="" loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" />;
}

export function LibrarySheet({ kind, onClose, onNotice }: { kind: LibraryKind; onClose: () => void; onNotice?: (text: string) => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const doc = useViewDoc();
  const current = useEditor((s) => s.currentSlide);
  const { addElement, addAssetElement, select } = useEditor.getState();
  const brand = useBrand();
  const [open, setOpen] = useState<string | null>(null);
  /** The whole emoji list (with its tabs) instead of the sheet's groups. */
  const [emojiAll, setEmojiAll] = useState(false);
  const [query, setQuery] = useState("");
  const [mine, setMine] = useState<LibraryItem[]>([]);
  const [logos, setLogos] = useState<LibraryItem[]>([]);
  const [assets, setAssets] = useState<LibraryItem[]>([]);
  const [reload, setReload] = useState(0);
  const catalog = useCatalog((s) => s.catalog);
  const packItems = useCatalog((s) => s.items);
  const [view, setViewState] = useState(readView);
  const setView = (v: "type" | "set") => {
    setViewState(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // ignore
    }
  };

  // The packs of this sheet: the catalog, then every pack's items (small JSON files).
  useEffect(() => {
    const kinds = SHEET_PACKS[kind];
    if (!kinds) return;
    void loadCatalog().then((c) => kinds.flatMap((k) => packsOf(c, k)).forEach((p) => void loadPack(p)));
  }, [kind]);

  useEffect(() => {
    let alive = true;
    void Promise.all([listLibrary("sticker"), listLibrary("logo"), listLibrary("asset")]).then(([s, l, a]) => {
      if (!alive) return;
      setMine(s);
      setLogos(l);
      setAssets(a);
    });
    return () => {
      alive = false;
    };
  }, [reload]);

  if (!doc) return null;
  const slide = slideRect(doc, Math.min(current, doc.slideCount - 1));
  const W = slideSize(doc.ratio).width;
  const add = (el: Parameters<typeof addElement>[0]) => {
    addElement(el);
    select(el.id);
    onClose();
  };
  /** A picture as a free image in the middle of the slide (about 40 % of its width). */
  const placePicture = (asset: ReturnType<typeof libraryAsset>) => {
    const w = W * 0.4;
    const h = (w * asset.height) / asset.width;
    const el = imageElement(asset, { x: slide.x + (slide.width - w) / 2, y: slide.y + (slide.height - h) / 2, width: w, height: h });
    addAssetElement(asset, el);
    select(el.id);
    onClose();
  };
  /** A picture from the user's library. */
  const addPicture = (item: LibraryItem) => placePicture(libraryAsset(item));
  /** A pack item (M20): downloaded into the project, then placed like the user's own pictures. */
  const addPackItem = async (item: CatalogItem, packKind: CatalogKind) => {
    let asset;
    try {
      asset = await catalogAsset(item);
    } catch {
      onNotice?.(t("lib.offline"));
      return;
    }
    if (packKind === "frame") {
      useEditor.getState().addFrameBlock(asset, item.id, item.windows ?? [{ x: 0.1, y: 0.1, w: 0.8, h: 0.8 }]);
      onClose();
      return;
    }
    if (packKind === "overlay") {
      const el = newOverlay(slide, asset, item.blend === "normal" || !item.blend ? "screen" : (item.blend as Parameters<typeof newOverlay>[2]));
      addAssetElement(asset, el);
      select(el.id);
      onClose();
      return;
    }
    brand.used({ kind: "pack", item });
    placePicture(asset);
  };
  const packItem = (item: CatalogItem, packKind: CatalogKind): Item => ({
    key: item.id,
    label: item.name[locale],
    node: <PackThumb item={item} />,
    add: () => addPackItem(item, packKind),
  });
  /** Every loaded item of these kinds, with the kind it came from. */
  const allItems = (kinds: CatalogKind[]) =>
    kinds.flatMap((k) => packsOf(catalog, k).flatMap((p) => (packItems[p.id] ?? p.preview).map((item) => ({ item, kind: k, pack: p }))));
  /** Groups by collection instead of by pack ("Bộ" view). */
  const collectionGroups = (kinds: CatalogKind[]) => {
    const all = allItems(kinds).filter(({ item }) => !q || fold(item.search).includes(fold(q)));
    // Each item once, under its most specific collection (owner, 2026-10-19).
    const main = new Map(all.map(({ item, pack }) => [item.id, mainCollection(item.collections, pack.collections, pack.id)]));
    return COLLECTION_ORDER.map((c) => ({
      id: `set-${c}`,
      title: COLLECTIONS[c][locale],
      items: all.filter(({ item }) => main.get(item.id) === c).map(({ item, kind: k }) => ({ ...packItem(item, k), key: `${c}-${item.id}` })),
    })).filter((g) => g.items.length > 0);
  };
  const packGroups = (packKind: CatalogKind) =>
    packsOf(catalog, packKind).map((p) => ({
      id: `pack-${p.id}`,
      title: p.name[locale],
      items: (packItems[p.id] ?? p.preview).filter((it) => !q || fold(it.search).includes(fold(q))).map((it) => packItem(it, packKind)),
    }));
  const q = query.trim().toLowerCase();
  const match = (label: string) => !q || label.toLowerCase().includes(q);

  // ── Groups of each library ───────────────────────────────────────────
  const groups: { id: string; title: string; items: Item[]; limit?: number; wide?: boolean }[] = [];
  if (kind === "sticker") {
    const sticker = (k: string): Item => ({
      key: `s-${k}`,
      label: STICKERS[k].name[locale],
      // eslint-disable-next-line @next/next/no-img-element -- generated SVG
      node: <img src={iconDataUrl(k, STICKERS[k].color, 96)} alt="" className="max-h-full max-w-full" />,
      add: () => {
        add(newSticker(doc.ratio, slide, k));
        brand.used({ kind: "sticker", key: k });
      },
    });
    groups.push({
      id: "recent",
      title: t("lib.recent"),
      // One row, "+N" for the rest (owner, 2026-10-19).
      limit: 3,
      items: brand.recent
        .map((r): Item | null =>
          r.kind === "pack"
            ? packItem(r.item, "sticker")
            : r.kind === "sticker"
            ? STICKERS[r.key]
              ? sticker(r.key)
              : null
            : {
                key: `e-${r.name}`,
                label: r.name.replace(/-/g, " "),
                // The stored body is the emoji's inner SVG: wrapped like the emoji grid does.
                // eslint-disable-next-line @next/next/no-img-element -- emoji SVG
                node: <img src={iconDataUrl(r.name, "", 64, r.body)} alt="" className="h-10 w-10" />,
                add: () => add(newEmoji(doc.ratio, slide, r.name, r.body)),
              },
        )
        .filter((x): x is Item => !!x && match(x.label)),
    });
    groups.push({
      id: "mine",
      title: t("lib.mine"),
      items: mine
        .filter((m) => match(m.name))
        .map((m) => ({ key: m.id, label: m.name, node: <MineThumb item={m} />, add: () => addPicture(m) })),
    });
    // Featured: our own stickers, then catalog items tagged "featured" (G10).
    const featured = allItems(["sticker"]).filter(({ item }) => item.collections.includes("featured") && (!q || fold(item.search).includes(fold(q))));
    groups.push({ id: "featured", title: t("lib.featured"), items: [...STICKER_KEYS.filter((k) => match(STICKERS[k].name[locale])).map(sticker), ...featured.map(({ item }) => packItem(item, "sticker"))] });
    groups.push({ id: "doodles", title: t("lib.doodles"), items: DOODLE_KEYS.filter((k) => match(STICKERS[k].name[locale])).map(sticker) });
    // Photo props and occasions (2026-10-30, shared with the booth): one group each.
    for (const g of PROP_GROUPS) groups.push({ id: `props-${g}`, title: t(`lib.props.${g}`), items: propsIn(g).filter((k) => match(STICKERS[k].name[locale])).map(sticker) });
    groups.push(...packGroups("sticker"));
    groups.push({
      id: "overlays",
      title: t("lib.overlays"),
      items: OVERLAY_KINDS.filter((k) => match(OVERLAYS[k].name[locale])).map((k) => ({
        key: `o-${k}`,
        label: OVERLAYS[k].name[locale],
        node: <OverlayPreview kind={k} />,
        add: async () => {
          const { width, height } = slideSize(doc.ratio);
          const blob = await overlayBlob(k, width, height);
          const asset = { id: newId(), blob, url: URL.createObjectURL(blob), width, height, name: `${k}.jpg` };
          const el = newOverlay(slide, asset, OVERLAYS[k].blend);
          addAssetElement(asset, el);
          select(el.id);
          onClose();
        },
      })),
    });
    // Every overlay (light leaks, bokeh, flares, paper…) in this one group (owner, 2026-10-19).
    groups[groups.length - 1].items.push(...packGroups("overlay").flatMap((g) => g.items));
    // "Bộ": the themes, each item once; Light & texture last — it is no theme (owner, 2026-10-19).
    if (view === "set") groups.splice(0, groups.length, ...collectionGroups(["sticker"]), groups[groups.length - 1]);
  } else if (kind === "shape") {
    for (const g of SHAPE_GROUPS)
      groups.push({
        id: g.id,
        title: g.name[locale],
        items: g.items
          .map((s) => ({ s, label: libraryShape(s)?.name[locale] ?? t(`shape.${s as "rect"}`) }))
          .filter(({ label }) => match(label))
          .map(({ s, label }) => ({ key: `${g.id}-${s}`, label, node: <ShapePreview shape={s} />, add: () => add(newShape(doc.ratio, slide, s as ShapeKind, "#8b8b8b")) })),
      });
  } else if (kind === "frame") {
    const frame = (f: FrameStyle): Item => ({
      key: f,
      label: t(`frame.${f}`),
      node: <span className={`block h-12 w-10 rounded-[3px] shadow-sm ${f === "polaroidBlack" || f === "black" || f === "film" ? "bg-neutral-800" : "bg-white"}`} style={{ padding: f === "gallery" ? 7 : 3, paddingBottom: f.startsWith("polaroid") ? 12 : undefined }}><span className="block h-full w-full rounded-[2px] bg-neutral-300" /></span>,
      add: () => add(newFramedPhoto(doc.ratio, slide, f)),
    });
    const window = (m: MaskShape): Item => ({
      key: `m-${m}`,
      label: t(`lib.win.${m as "circle"}`),
      node: <ShapePreview shape={m === "rounded" ? "roundRect" : m === "arch" ? "archShape" : m === "star" ? "star5" : m === "blob" ? "scallop" : m} />,
      add: () => {
        const el = newFramedPhoto(doc.ratio, slide, "none");
        add({ ...el, mask: m, cornerRadius: el.width * 0.12, shadow: false });
      },
    });
    groups.push({ id: "instant", title: t("lib.instant"), items: (["polaroid", "polaroidBlack", "white", "black", "gallery"] as FrameStyle[]).map(frame) });
    groups.push({ id: "film", title: t("lib.film"), items: [frame("film")] });
    groups.push({ id: "cutouts", title: t("lib.cutouts"), items: (["circle", "heart", "star", "hexagon", "blob", "arch", "rounded"] as MaskShape[]).map(window) });
    groups.push(...packGroups("frame"));
  } else if (kind === "grid") {
    const aspect = slide.width / slide.height;
    const lay = (list: typeof SLIDE_GRIDS, label: (i: number) => string) =>
      list.map((l, i) => ({ key: l.id, label: label(i + 1), node: <Thumb layout={l} aspect={aspect} />, add: () => {
          useEditor.getState().addLayoutBlock(l.id);
          onClose();
        } }));
    groups.push({ id: "grids", title: t("lib.grids"), items: lay(SLIDE_GRIDS, (i) => t("newSlide.gridItem", { index: i })) });
    groups.push({ id: "layouts", title: t("lib.layouts"), items: lay(SLIDE_LAYOUTS, (i) => t("newSlide.layoutItem", { index: i })) });
  } else if (kind === "widget") {
    const looks: Record<(typeof WIDGETS)[number], string> = {
      label: "bg-neutral-900 text-white rounded-md px-2",
      message: "bg-[#2f80ed] text-white rounded-2xl px-2.5",
      location: "bg-white text-black rounded-full px-2.5 shadow",
      highlight: "bg-[#ffe066] text-black px-1.5 font-serif font-bold",
      clock: "bg-[#1c1c1e] text-white rounded-md px-1.5 font-mono font-bold text-lg",
    };
    groups.push({
      id: "widgets",
      title: t("widget.group.text"),
      // The flip clock is one of the Clock looks now (D-119); old projects keep theirs.
      items: WIDGETS.filter((w) => w !== "clock").map((w) => ({
        key: w,
        label: t(`widget.${w}`),
        node: <span className={`truncate py-1 text-[11px] ${looks[w]}`}>{t(`widget.sample.${w}`)}</span>,
        add: () => add(newWidget(doc.ratio, slide, w, t(`widget.sample.${w}`))),
      })),
    });
    // Card widgets (D-114), drawn from their sample texts.
    for (const g of WIDGET_GROUPS)
      groups.push({
        id: `widgets-${g.id}`,
        title: t(`widget.group.${g.id}`),
        wide: true,
        // A widget with several looks shows each of them (D-119).
        items: g.kinds.flatMap((k) =>
          (WIDGET_VARIANTS[k]?.map((v) => v.id) ?? [undefined]).map((v) => ({
            key: v ? `${k}-${v}` : k,
            label: widgetName(k, locale, v),
            // eslint-disable-next-line @next/next/no-img-element -- drawn on a canvas
            node: <img src={widgetThumb(k, locale, 360, v)} alt="" className="max-h-full max-w-full object-contain" />,
            add: () => add(newCardWidget(doc.ratio, slide, k, locale, v)),
          })),
        ),
      });
  }

  const pick = (into: LibraryItem["kind"]) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const img = await createImageBitmap(file);
      await saveLibrary(into, file, img.width, img.height, file.name);
      setReload((r) => r + 1);
    };
    input.click();
  };

  const titles: Record<LibraryKind, string> = { sticker: t("lib.stickers"), shape: t("lib.shapes"), frame: t("lib.frames"), grid: t("lib.grids"), widget: t("lib.widgets"), brand: t("lib.brand") };
  const opened = groups.find((g) => g.id === open);

  return (
    <DragSheet
      title={emojiAll ? t("lib.emoji") : opened ? opened.title : titles[kind]}
      onClose={onClose}
      onBack={emojiAll ? () => setEmojiAll(false) : opened ? () => setOpen(null) : undefined}
    >
      <div className="px-4 pt-1 pb-20">
        {emojiAll ? (
          <div key="emoji" className="sheet-push">
            <EmojiStickers
              query={q}
              onPick={(name, body) => {
                add(newEmoji(doc.ratio, slide, name, body));
                brand.used({ kind: "emoji", name, body });
              }}
            />
          </div>
        ) : opened ? (
          <div key={opened.id} className="sheet-push">
            <Group title={opened.title} items={opened.items} full onMore={() => {}} />
          </div>
        ) : kind === "brand" ? (
          <>
            <BrandRow title={t("lib.logos")} addLabel={t("lib.addLogo")} items={logos} onAdd={() => pick("logo")} onPick={addPicture} />
            <BrandRow title={t("lib.assets")} addLabel={t("lib.addAsset")} items={assets} onAdd={() => pick("asset")} onPick={addPicture} />
            <section className="pb-4">
              <h3 className="pb-2 text-[15px] font-bold">{t("lib.colors")}</h3>
              <div className="flex flex-wrap items-center gap-2">
                {brand.colors.map((c) => (
                  <span key={c} className="h-9 w-9 rounded-full border border-border-2" style={{ background: c }} title={c} />
                ))}
                <label className="relative flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-border-2 text-muted">
                  <Icon name="plus" size={18} />
                  <span className="sr-only">{t("lib.addColor")}</span>
                  <input type="color" onChange={(e) => brand.addColor(e.target.value)} className="absolute inset-0 opacity-0" />
                </label>
              </div>
            </section>
          </>
        ) : (
          <>
            {kind === "sticker" && (
              <div role="radiogroup" aria-label={t("lib.viewBy")} className="mb-3 flex gap-1 rounded-full bg-surface-2 p-1">
                {(["type", "set"] as const).map((v) => (
                  <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)} className={`h-8 flex-1 rounded-full text-[13px] ${view === v ? "bg-surface font-bold shadow-sm" : "text-muted"}`}>
                    {t(v === "type" ? "lib.byType" : "lib.byCollection")}
                  </button>
                ))}
              </div>
            )}
            {groups.map((g) => (
              // Grids are laid out in full: no "+N" to open (owner, 2026-10-17).
              <Group key={g.id} title={g.title} items={g.items} limit={g.limit} wide={g.wide} full={kind === "grid" ? "titled" : undefined} onMore={() => setOpen(g.id)} />
            ))}
            {kind === "sticker" && view === "type" && (
              <section aria-label={t("lib.emoji")} className="pb-4">
                <h3 className="pb-2 text-[15px] font-bold">{t("lib.emoji")}</h3>
                <EmojiStickers
                  query={q}
                  compact={{ limit: 11, onMore: () => setEmojiAll(true), moreLabel: (n) => t("lib.more", { count: n }) }}
                  onPick={(name, body) => {
                    add(newEmoji(doc.ratio, slide, name, body));
                    brand.used({ kind: "emoji", name, body });
                  }}
                />
              </section>
            )}
          </>
        )}
      </div>
      {kind === "sticker" && !opened && (
        // Floating search pill at the bottom of the sheet (§3).
        <label className="sticky bottom-3 mx-auto -mt-16 flex h-11 w-[calc(100%-32px)] max-w-md items-center gap-2 rounded-full border border-border bg-surface/90 px-4 text-muted shadow-lg backdrop-blur-xl">
          <Icon name="search" size={18} />
          <input type="search" aria-label={t("lib.searchStickers")} placeholder={t("lib.searchStickers")} value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-transparent text-sm text-text outline-none" />
        </label>
      )}
    </DragSheet>
  );
}

function MineThumb({ item }: { item: LibraryItem }) {
  const [url] = useState(() => URL.createObjectURL(item.blob));
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  // eslint-disable-next-line @next/next/no-img-element -- the user's picture
  return <img src={url} alt="" className="max-h-full max-w-full object-contain" />;
}

function BrandRow(props: { title: string; addLabel: string; items: LibraryItem[]; onAdd: () => void; onPick: (item: LibraryItem) => void }) {
  return (
    <section className="pb-4">
      <h3 className="pb-2 text-[15px] font-bold">{props.title}</h3>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        <button type="button" onClick={props.onAdd} className={`${TILE} flex-col gap-1 border border-dashed border-border-2 bg-transparent! text-[11px] text-muted`}>
          <Icon name="plus" />
          {props.addLabel}
        </button>
        {props.items.map((it) => (
          <button key={it.id} type="button" aria-label={it.name} onClick={() => props.onPick(it)} className={TILE}>
            <MineThumb item={it} />
          </button>
        ))}
      </div>
    </section>
  );
}

/** "New layer" (§1): every kind of thing that can be added. */
export function NewLayerSheet(props: { onPick: (key: NewLayerKey) => void; onClose: () => void }) {
  const t = useT();
  const items: [NewLayerKey, IconName, string][] = [
    ["photo", "image", t("lib.photo")],
    ["video", "video", t("lib.video")],
    ["files", "folder", t("lib.files")],
    ["text", "text", t("lib.text")],
    ["sticker", "origami", t("lib.sticker")],
    ["frame", "style", t("lib.frame")],
    ["grid", "layout", t("lib.grid")],
    ["draw", "pencil", t("lib.draw")],
    ["widget", "widgetPlus", t("lib.widget")],
    ["shape", "shapes", t("lib.shape")],
    ["brand", "palette", t("lib.brand")],
  ];
  return (
    <DragSheet title={t("lib.newLayer")} onClose={props.onClose}>
      <div className="grid grid-cols-4 gap-y-4 px-4 pt-2 pb-6 sm:grid-cols-6">
        {items.map(([key, icon, label]) => (
          <button key={key} type="button" onClick={() => props.onPick(key)} className="flex flex-col items-center gap-1.5 text-[12px]">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
              <Icon name={icon} size={30} />
            </span>
            {label}
          </button>
        ))}
      </div>
    </DragSheet>
  );
}

export type NewLayerKey = "photo" | "video" | "files" | "text" | "sticker" | "frame" | "grid" | "draw" | "widget" | "shape" | "brand";
