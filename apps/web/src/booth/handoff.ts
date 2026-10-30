import { imageElement } from "@ig-layout/core/project/placement";
import { slideRect } from "@ig-layout/core/project/layout";
import { newId, type ImageAsset } from "@ig-layout/core/project/types";
import { saveState } from "@ig-layout/core/storage/projects";
import type { BoothRoll } from "@ig-layout/core/storage/booth";
import { templateSlides } from "@ig-layout/core/templates/apply";
import { suggestTemplates } from "@ig-layout/core/templates/library";
import { DEFAULT_OPTIONS } from "@ig-layout/core/templates/types";
import { useEditor } from "@/store/editor";
import type { LiveMode } from "@ig-layout/core/booth/live";
import { clipVideo, printVideo } from "./live";
import { backdropCanvas, placements, printCanvas, shotBlobs, toBlob } from "./look";

// Booth → IG Layout (step 3, D-155): a new IG Layout project from a roll, built with the
// editor's own store (same app); IG Layout opens it in the editor on its next start.
// Post / Story / Carousel's first slide: the print is a photo of its own (move it, resize it,
// style it) and the theme's paper is the slide's background — or not, if asked without it
// (owner, 2026-10-30: "tùy chọn bật/tắt nền, hoặc sang IG có thể điều chỉnh") — changeable
// there like any background. Carousel: then every shot on its own slide. Surprise: the shots
// in a layout picked at random from the ones that fit their number. As video (2026-10-30, a
// roll with clips): the print is its moving version and every shot its clip — IG Layout's
// own video elements, so they play, trim and export like any video there.

/** "Open this project in the editor" for IG Layout's next start (App.tsx). */
export const OPEN_KEY = "ig-layout:open-project";

export type Handoff = "post" | "carousel" | "story" | "surprise";

/** At most this many slides in a carousel (Instagram's limit is 20). */
const MAX_SLIDES = 20;

async function asset(blob: Blob, name: string): Promise<ImageAsset> {
  const b = await createImageBitmap(blob);
  const a = { id: newId(), blob, url: URL.createObjectURL(blob), width: b.width, height: b.height, name };
  b.close();
  return a;
}

/** A video asset (MP4, no sound) with `poster` as its still. */
function videoAsset(v: { blob: Blob; duration: number; width: number; height: number }, poster: Blob, name: string): ImageAsset {
  return { id: newId(), blob: v.blob, url: URL.createObjectURL(v.blob), width: v.width, height: v.height, name, video: { duration: v.duration, hasAudio: false, poster, posterUrl: URL.createObjectURL(poster) } };
}

/** Each taken shot as an asset: its photo, or its clip when `video` and it has one. */
async function shotAssets(roll: BoothRoll, video: LiveMode | null) {
  const stills = await shotBlobs(roll);
  const taken = roll.shots.flatMap((b, i) => (b ? [i] : []));
  return Promise.all(
    stills.map(async (b, k) => {
      const cell = taken[k];
      if (video && roll.clips?.[cell]?.frames.length) return videoAsset(await clipVideo(roll, cell, video), b, `shot_${k + 1}.mp4`);
      return asset(b, `shot_${k + 1}.jpg`);
    }),
  );
}

/** The print on slide `slide` (and the theme's paper as the background, if wanted). */
async function placePrint(roll: BoothRoll, format: "post" | "story", slide: number, backdrop: boolean, video: LiveMode | null) {
  const { print, theme } = await printCanvas(roll);
  const still = await toBlob(print);
  const printAsset = video ? videoAsset(await printVideo(roll, video), still, "photobooth.mp4") : await asset(still, "photobooth.jpg");
  const ed = useEditor.getState();
  const doc = ed.doc!;
  const rect = slideRect(doc, slide);
  const { W, list } = placements(print, format);
  const k = rect.width / W;
  if (backdrop) {
    const bg = await asset(await toBlob(backdropCanvas(theme, format)), `${theme.id}-paper.jpg`);
    ed.addAsset(bg);
    // A picture covering the canvas: IG Layout's Background tool changes or removes it.
    useEditor.setState((s) => ({ doc: s.doc && { ...s.doc, background: { kind: "texture", texture: `booth-${theme.id}`, assetId: bg.id, tile: false } } }));
  }
  list.forEach((p, i) => {
    const el = { ...imageElement(printAsset, { x: rect.x + (p.cx - p.w / 2) * k, y: rect.y + (p.cy - p.h / 2) * k, width: p.w * k, height: p.h * k }), rotation: p.rot, shadow: true };
    if (i === 0) useEditor.getState().addAssetElement(printAsset, el);
    else useEditor.getState().addElement(el);
  });
}

/** `video`: open the moving print and the clips (how they play), not the photos. */
export async function openInLayout(roll: BoothRoll, kind: Handoff, name: string, backdrop = true, video: LiveMode | null = null) {
  const editor = useEditor.getState();
  if (kind === "post" || kind === "story") {
    await editor.createProject(kind === "post" ? { type: "post", ratio: "4:5", slideCount: 1, name } : { type: "story", ratio: "9:16", slideCount: 1, name });
    await placePrint(roll, kind, 0, backdrop, video);
  } else if (kind === "carousel") {
    const shots = await shotAssets(roll, video);
    const list = shots.slice(0, MAX_SLIDES - 1);
    await editor.createProject({ type: "post", ratio: "4:5", slideCount: 1 + list.length, name });
    await placePrint(roll, "post", 0, backdrop, video);
    // Every shot fills a slide of its own.
    const doc = useEditor.getState().doc!;
    list.forEach((a, i) => useEditor.getState().addAssetElement(a, imageElement(a, slideRect(doc, i + 1))));
  } else {
    const shots = await shotAssets(roll, video);
    const fit = suggestTemplates(shots.length, "post");
    const exact = fit.filter((t) => !t.perPhoto && t.photos === shots.length);
    const pool = exact.length ? exact : fit;
    const tpl = pool[Math.floor(Math.random() * pool.length)];
    await editor.createProject({ type: "post", ratio: "4:5", slideCount: templateSlides(tpl, shots.length, 1, "post"), name });
    useEditor.getState().applyLayout(tpl, shots, DEFAULT_OPTIONS);
  }
  useEditor.setState({ selectedId: null });
  // The editor's autosave starts with the editor screen: save this first version now.
  const { projectId, doc, past, future } = useEditor.getState();
  if (projectId && doc) await saveState({ id: projectId, doc, past, future }, {});
  // IG Layout opens it in the editor when it starts — also if the page was loaded afresh.
  if (projectId) {
    try {
      sessionStorage.setItem(OPEN_KEY, projectId);
    } catch {}
  }
}
