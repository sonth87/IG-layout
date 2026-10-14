"use client";

import { create } from "zustand";
import { placeImages } from "@/lib/project/placement";
import {
  type AspectRatio,
  type CanvasElement,
  type ImageAsset,
  MAX_SLIDES,
  type ProjectDoc,
} from "@/lib/project/types";

// History follows the "confirm then record" model (D-12, D-17): only `commit`
// adds a step. Each step is an immutable ProjectDoc; unchanged elements are
// shared between steps, so steps stay small. No step limit.

interface EditorState {
  doc: ProjectDoc | null;
  assets: Record<string, ImageAsset>;
  past: ProjectDoc[];
  future: ProjectDoc[];
  selectedId: string | null;

  createProject: (ratio: AspectRatio, slideCount: number) => void;
  closeProject: () => void;
  addImages: (assets: ImageAsset[], firstSlide?: number) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;
  setSlideCount: (count: number) => void;
  select: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
}

export const useEditor = create<EditorState>()((set, get) => {
  /** Records the current doc as one history step and replaces it. */
  function commit(update: (doc: ProjectDoc) => ProjectDoc) {
    const { doc, past } = get();
    if (!doc) return;
    const next = update(doc);
    if (next === doc) return;
    set({ doc: next, past: [...past, doc], future: [] });
  }

  return {
    doc: null,
    assets: {},
    past: [],
    future: [],
    selectedId: null,

    createProject: (ratio, slideCount) =>
      set({
        doc: { type: "post", ratio, slideCount, background: "#ffffff", elements: [] },
        past: [],
        future: [],
        selectedId: null,
      }),

    closeProject: () => {
      Object.values(get().assets).forEach((a) => URL.revokeObjectURL(a.url));
      set({ doc: null, assets: {}, past: [], future: [], selectedId: null });
    },

    addImages: (assets, firstSlide = 0) => {
      const doc = get().doc;
      if (!doc || assets.length === 0) return;
      set((s) => ({ assets: { ...s.assets, ...Object.fromEntries(assets.map((a) => [a.id, a])) } }));
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
