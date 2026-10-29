import { newId, type ImageAsset } from "@ig-layout/core/project/types";
import { saveState } from "@ig-layout/core/storage/projects";
import type { BoothRoll } from "@ig-layout/core/storage/booth";
import { templateSlides } from "@ig-layout/core/templates/apply";
import { suggestTemplates } from "@ig-layout/core/templates/library";
import { DEFAULT_OPTIONS } from "@ig-layout/core/templates/types";
import { useEditor } from "@/store/editor";
import { formatBlob, shotBlobs } from "./look";

// Booth → IG Layout (step 3, D-155): a new IG Layout project from a roll, built with the
// editor's own store (same app), then the caller goes to "/" where the editor opens it.
// Post / Story: the print on the theme's paper; Carousel: the print, then every shot;
// Surprise: the shots in a layout picked at random from the ones that fit their number.

export type Handoff = "post" | "carousel" | "story" | "surprise";

/** At most this many slides in a carousel (Instagram's limit is 20). */
const MAX_SLIDES = 20;

async function asset(blob: Blob, name: string): Promise<ImageAsset> {
  const b = await createImageBitmap(blob);
  const a = { id: newId(), blob, url: URL.createObjectURL(blob), width: b.width, height: b.height, name };
  b.close();
  return a;
}

export async function openInLayout(roll: BoothRoll, kind: Handoff, name: string) {
  const editor = useEditor.getState();
  if (kind === "post" || kind === "story") {
    const print = await asset(await formatBlob(roll, kind), "photobooth.jpg");
    await editor.createProject(kind === "post" ? { type: "post", ratio: "4:5", slideCount: 1, name } : { type: "story", ratio: "9:16", slideCount: 1, name });
    useEditor.getState().addImages([print]);
  } else if (kind === "carousel") {
    const print = await asset(await formatBlob(roll, "post"), "photobooth.jpg");
    const shots = await Promise.all((await shotBlobs(roll)).map((b, i) => asset(b, `shot_${i + 1}.jpg`)));
    const all = [print, ...shots].slice(0, MAX_SLIDES);
    await editor.createProject({ type: "post", ratio: "4:5", slideCount: all.length, name });
    useEditor.getState().addImages(all);
  } else {
    const shots = await Promise.all((await shotBlobs(roll)).map((b, i) => asset(b, `shot_${i + 1}.jpg`)));
    const fit = suggestTemplates(shots.length, "post");
    const exact = fit.filter((t) => !t.perPhoto && t.photos === shots.length);
    const pool = exact.length ? exact : fit;
    const tpl = pool[Math.floor(Math.random() * pool.length)];
    await editor.createProject({ type: "post", ratio: "4:5", slideCount: templateSlides(tpl, shots.length, 1, "post"), name });
    useEditor.getState().applyLayout(tpl, shots, DEFAULT_OPTIONS);
  }
  // The editor's autosave starts with the editor screen: save this first version now.
  const { projectId, doc, past, future } = useEditor.getState();
  if (projectId && doc) await saveState({ id: projectId, doc, past, future }, {});
}
