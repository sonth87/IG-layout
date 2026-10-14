"use client";

import type Konva from "konva";
import { create } from "zustand";
import { placeImages } from "@/lib/project/placement";
import {
  type AspectRatio,
  type CanvasElement,
  type ImageAsset,
  MAX_SLIDES,
  newId,
  type ProjectDoc,
} from "@/lib/project/types";
import { createProjectRecord, loadProject, requestPersistence, saveAssets } from "@/lib/storage/projects";

// History follows the "confirm then record" model (D-12, D-17): only `commit`
// adds a step. Each step is an immutable ProjectDoc; unchanged elements are
// shared between steps, so steps stay small. No step limit.
// Persistence lives in ./autosave.ts.

interface EditorState {
  projectId: string | null;
  doc: ProjectDoc | null;
  assets: Record<string, ImageAsset>;
  past: ProjectDoc[];
  future: ProjectDoc[];
  selectedId: string | null;
  /** Content layer + scale of the mounted canvas, used for thumbnails and export. */
  canvas: { layer: Konva.Layer; viewScale: number } | null;

  createProject: (ratio: AspectRatio, slideCount: number, name: string) => Promise<void>;
  openProject: (id: string) => Promise<boolean>;
  closeProject: () => void;
  addImages: (assets: ImageAsset[], firstSlide?: number) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;
  setSlideCount: (count: number) => void;
  select: (id: string | null) => void;
  setCanvas: (canvas: EditorState["canvas"]) => void;
  undo: () => void;
  redo: () => void;
}

const EMPTY = {
  projectId: null,
  doc: null,
  assets: {},
  past: [],
  future: [],
  selectedId: null,
  canvas: null,
} satisfies Partial<EditorState>;

export const useEditor = create<EditorState>()((set, get) => {
  /** Records the current doc as one history step and replaces it. */
  function commit(update: (doc: ProjectDoc) => ProjectDoc) {
    const { doc, past } = get();
    if (!doc) return;
    const next = update(doc);
    if (next === doc) return;
    set({ doc: next, past: [...past, doc], future: [] });
  }

  function revokeAll() {
    Object.values(get().assets).forEach((a) => URL.revokeObjectURL(a.url));
  }

  return {
    ...EMPTY,

    createProject: async (ratio, slideCount, name) => {
      const id = newId();
      const doc: ProjectDoc = { type: "post", ratio, slideCount, background: "#ffffff", elements: [] };
      const now = Date.now();
      await createProjectRecord(
        { id, name, type: "post", ratio, slideCount, createdAt: now, updatedAt: now, size: 0 },
        doc,
      );
      revokeAll();
      set({ ...EMPTY, projectId: id, doc });
      void requestPersistence();
    },

    openProject: async (id) => {
      const loaded = await loadProject(id);
      if (!loaded) return false;
      revokeAll();
      const assets = Object.fromEntries(
        loaded.assets.map((a) => [a.id, { ...a, url: URL.createObjectURL(a.blob) }]),
      );
      set({
        ...EMPTY,
        projectId: id,
        doc: loaded.state.doc,
        past: loaded.state.past,
        future: loaded.state.future,
        assets,
      });
      return true;
    },

    closeProject: () => {
      revokeAll();
      set(EMPTY);
    },

    addImages: (assets, firstSlide = 0) => {
      const { doc, projectId } = get();
      if (!doc || !projectId || assets.length === 0) return;
      set((s) => ({ assets: { ...s.assets, ...Object.fromEntries(assets.map((a) => [a.id, a])) } }));
      void saveAssets(
        assets.map(({ id, blob, width, height, name }) => ({ id, projectId, blob, width, height, name })),
      );
      const added = placeImages(doc, assets, firstSlide);
      commit((d) => ({ ...d, elements: [...d.elements, ...added] }));
      set({ selectedId: added[added.length - 1]?.id ?? null });
    },

    updateElement: (id, patch) =>
      commit((d) => ({
        ...d,
        elements: d.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)),
      })),

    removeElement: (id) => {
      commit((d) => ({ ...d, elements: d.elements.filter((el) => el.id !== id) }));
      if (get().selectedId === id) set({ selectedId: null });
    },

    moveLayer: (id, direction) =>
      commit((d) => {
        const i = d.elements.findIndex((el) => el.id === id);
        const j = direction === "up" ? i + 1 : i - 1;
        if (i < 0 || j < 0 || j >= d.elements.length) return d;
        const elements = [...d.elements];
        [elements[i], elements[j]] = [elements[j], elements[i]];
        return { ...d, elements };
      }),

    setSlideCount: (count) =>
      commit((d) => {
        const slideCount = Math.max(1, Math.min(MAX_SLIDES, count));
        return slideCount === d.slideCount ? d : { ...d, slideCount };
      }),

    select: (id) => set({ selectedId: id }),

    setCanvas: (canvas) => set({ canvas }),

    undo: () => {
      const { doc, past, future } = get();
      if (!doc || past.length === 0) return;
      set({ doc: past[past.length - 1], past: past.slice(0, -1), future: [doc, ...future] });
    },

    redo: () => {
      const { doc, past, future } = get();
      if (!doc || future.length === 0) return;
      set({ doc: future[0], past: [...past, doc], future: future.slice(1) });
    },
  };
});
