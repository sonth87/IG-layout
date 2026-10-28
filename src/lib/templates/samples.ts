import type { ImageAsset } from "@/lib/project/types";
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
  const pool = PHOTOS.filter((p) => themes.includes(p.theme));
  const h = hash(tpl.id);
  // Start somewhere in the pool that depends on the template.
  const rotated = [...pool.slice(h % pool.length), ...pool.slice(0, h % pool.length)];
  const used = new Set<string>();
  const list = Array.from(cellAspects(tpl), (aspect, i) => {
    const want = Math.log(aspect ?? 1);
    // Themes take turns.
    const theme = themes[(i + h) % themes.length];
    const candidates = rotated.filter((p) => !used.has(p.id));
    const own = candidates.filter((p) => p.theme === theme);
    const from = own.length ? own : candidates.length ? candidates : rotated;
    // The first photo close enough in shape (each template starts at its own place in the
    // pool, so photos spread out), else the closest one.
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
