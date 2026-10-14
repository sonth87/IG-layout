"use client";

import { layerRegion } from "@/lib/export/slices";
import { canvasSize, slideRect } from "@/lib/project/layout";
import { saveState } from "@/lib/storage/projects";
import { create } from "zustand";
import { useEditor } from "./editor";

/** Shown in the editor header (UX-11). */
export const useSaveStatus = create<{ status: "idle" | "pending" | "saving" | "saved" | "error" }>()(() => ({
  status: "idle",
}));

// Saves doc + history after every recorded step (debounced), plus a thumbnail
// of slide 1. Saving is "nice to have" (D-22): failures are logged, never thrown.

const SAVE_DELAY = 400;
const THUMB_WIDTH = 240;

let timer: ReturnType<typeof setTimeout> | null = null;
let pending: Promise<void> = Promise.resolve();

async function thumbnail(): Promise<Blob | undefined> {
  const { canvas, doc } = useEditor.getState();
  if (!canvas || !doc) return undefined;
  // Grid: the whole profile picture; otherwise the first slide.
  const area = doc.type === "grid" ? { x: 0, y: 0, ...canvasSize(doc) } : slideRect(doc, 0);
  const region = layerRegion(canvas.layer, area, canvas.viewScale);
  try {
    return (await canvas.layer.toBlob({
      ...region,
      pixelRatio: THUMB_WIDTH / region.width,
      mimeType: "image/jpeg",
      quality: 0.8,
    })) as Blob;
  } catch {
    return undefined;
  }
}

async function save() {
  const { projectId, doc, past, future } = useEditor.getState();
  if (!projectId || !doc) return;
  useSaveStatus.setState({ status: "saving" });
  try {
    const thumb = await thumbnail();
    await saveState({ id: projectId, doc, past, future }, thumb ? { thumbnail: thumb } : {});
    useSaveStatus.setState({ status: timer ? "pending" : "saved" });
  } catch (err) {
    console.warn("Autosave failed", err);
    useSaveStatus.setState({ status: "error" });
  }
}

/** Writes any pending change now. Call before leaving the editor. */
export function flushSave() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
    pending = pending.then(save);
  }
  return pending;
}

/** Starts watching the editor store; returns the unsubscribe function. */
export function startAutosave() {
  // Save right away when the app is hidden or closed (switching apps on a phone).
  const onHide = () => {
    if (document.visibilityState === "hidden") void flushSave();
  };
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onHide);

  const unsubscribe = useEditor.subscribe((state, prev) => {
    if (!state.projectId || state.projectId !== prev.projectId) return;
    if (state.doc === prev.doc && state.past === prev.past && state.future === prev.future) return;
    useSaveStatus.setState({ status: "pending" });
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      pending = pending.then(save);
    }, SAVE_DELAY);
  });

  return () => {
    unsubscribe();
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", onHide);
  };
}
