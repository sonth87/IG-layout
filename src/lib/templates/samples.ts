import type { ImageAsset } from "@/lib/project/types";
import { PACK_ART } from "./apply";
import manifest from "./samplePhotos.json";
import type { SampleTheme, Template } from "./types";

// Sample photos for template previews (2026-10-28, replaces the drawn landscapes of M18):
// real photos from Pexels, small WebP files in public/samples (scripts/fetch-samples.mjs).
// Each template asks for themes; every photo cell gets a photo of a matching shape.

interface SamplePhoto {
  id: string;
  theme: SampleTheme;
  width: number;
  height: number;
}

const PHOTOS = manifest as SamplePhoto[];
const DEFAULT_THEMES: SampleTheme[] = ["portrait", "friends", "city", "food"];

const assets = new Map<string, ImageAsset>();
function asset(p: SamplePhoto): ImageAsset {
  let a = assets.get(p.id);
  if (!a) {
    a = { id: `sample-${p.id}`, blob: new Blob(), url: `/samples/${p.id}.webp`, width: p.width, height: p.height, name: p.id };
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
  const h = hash(tpl.id);
  const used = new Set<string>();
  const list = Array.from(cellAspects(tpl), (aspect, i) => {
    const want = Math.log(aspect ?? 1);
    // Themes take turns; each cell starts at its own place within the theme so templates
    // don't all open on the same photo.
    const theme = themes[(i + h) % themes.length];
    let from = PHOTOS.filter((p) => p.theme === theme && !used.has(p.id));
    if (!from.length) from = PHOTOS.filter((p) => themes.includes(p.theme) && !used.has(p.id));
    if (!from.length) from = PHOTOS.filter((p) => !used.has(p.id));
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
  return PHOTOS.filter((p) => themes.includes(p.theme)).map((p) => ({ url: `/samples/${p.id}.webp`, width: p.width, height: p.height }));
}
