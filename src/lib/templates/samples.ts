import type { ImageAsset } from "@/lib/project/types";
import { PACK_ART } from "./apply";
import manifest from "./samplePhotos.json";
import type { SampleTheme, Template } from "./types";

// Sample photos for template previews (2026-10-28, replaces the drawn landscapes of M18):
// real photos from Pexels, small WebP files in public/samples (scripts/fetch-samples.mjs),
// plus the owner's own photos (concert, mirror, ootd: JPEG, no EXIF).
// Each template asks for themes; every photo cell gets a photo of a matching shape.

interface SamplePhoto {
  id: string;
  theme: SampleTheme;
  width: number;
  height: number;
  /** File type: WebP from Pexels; the owner's own photos are JPEG (2026-10-29). */
  ext?: "jpg";
}

const PHOTOS = manifest as SamplePhoto[];
/** Themes of the owner's own photos. */
const OWN_THEMES = new Set(PHOTOS.filter((p) => p.ext === "jpg").map((p) => p.theme));
const DEFAULT_THEMES: SampleTheme[] = ["portrait", "friends", "city", "food"];

const assets = new Map<string, ImageAsset>();
function asset(p: SamplePhoto): ImageAsset {
  let a = assets.get(p.id);
  if (!a) {
    a = { id: `sample-${p.id}`, blob: new Blob(), url: `/samples/${p.id}.${p.ext ?? "webp"}`, width: p.width, height: p.height, name: p.id };
    assets.set(p.id, a);
  }
  return a;
}

function hash(key: string) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Width / height of each photo number's cell (the first cell using it). */
function cellAspects(tpl: Template): number[] {
  const d = tpl.design;
  const [rw, rh] = (d?.ratio ?? "4:5").split(":").map(Number);
  const slide = rw / rh;
  const out: number[] = [];
  if (tpl.background?.kind === "photo") out[tpl.background.photo] = d?.type === "grid" ? slide : slide * (typeof tpl.slides === "number" ? tpl.slides : 3);
  for (const s of tpl.slots) out[s.photo] ??= (s.w / s.h) * slide;
  for (const a of tpl.art ?? []) {
    const info = PACK_ART[a.id];
    info?.windows?.forEach((w, i) => (out[(a.photo ?? 0) + i] ??= (w.w * info.width) / (w.h * info.height)));
  }
  return out;
}

const byTemplate = new Map<string, ImageAsset[]>();

/**
 * Sample photos for a template's preview, in photo order: from its themes, each one shaped
 * like its cell, a different pick per template so cards don't all look alike.
 */
export function samplePhotosFor(tpl: Template): ImageAsset[] {
  const hit = byTemplate.get(tpl.id);
  if (hit) return hit;
  const themes = tpl.design?.themes ?? DEFAULT_THEMES;
  // Two separate stocks: the owner's own photos (JPEG) and the Pexels ones.
  const own = themes.some((th) => OWN_THEMES.has(th));
  const pool = PHOTOS.filter((p) => (p.ext === "jpg") === own);
  const h = hash(tpl.id);
  const used = new Set<string>();
  const list = Array.from(cellAspects(tpl), (aspect, i) => {
    const want = Math.log(aspect ?? 1);
    // Themes take turns; each cell starts at its own place within the theme so templates
    // don't all open on the same photo.
    const theme = themes[(i + h) % themes.length];
    let from = pool.filter((p) => p.theme === theme && !used.has(p.id));
    if (!from.length) from = pool.filter((p) => themes.includes(p.theme) && !used.has(p.id));
    // The owner's photos are never mixed with stock ones (owner, 2026-10-29): when a theme runs
    // out, its photos come round again rather than borrowing others.
    if (!from.length) from = own ? pool.filter((p) => themes.includes(p.theme)) : pool.filter((p) => !used.has(p.id));
    if (!from.length) from = pool;
    const start = hash(`${tpl.id}:${i}`) % from.length;
    from = [...from.slice(start), ...from.slice(0, start)];
    // The first photo close enough in shape, else the closest one.
    let best = from[0];
    let bestScore = Infinity;
    for (const p of from) {
      const score = Math.abs(Math.log(p.width / p.height) - want);
      if (score < 0.35) {
        best = p;
        break;
      }
      if (score < bestScore) {
        best = p;
        bestScore = score;
      }
    }
    used.add(best.id);
    return asset(best);
  });
  byTemplate.set(tpl.id, list);
  return list;
}

/** Sample photos of some themes (URL and shape), for other previews (grid profile mock-up). */
export function samplesOf(themes: SampleTheme[]) {
  return PHOTOS.filter((p) => themes.includes(p.theme)).map((p) => ({ url: `/samples/${p.id}.${p.ext ?? "webp"}`, width: p.width, height: p.height }));
}
