"use client";

import type Konva from "konva";
import { create } from "zustand";
import { migrateDoc } from "@/lib/project/migrate";
import { coverCrop } from "@/lib/project/geometry";
import { placeImages } from "@/lib/project/placement";
import { deleteSlide, insertSlide, moveSlide } from "@/lib/project/slides";
import {
  type AspectRatio,
  type CanvasElement,
  type ImageAsset,
  type ProjectDoc,
  newId,
} from "@/lib/project/types";
import { createProjectRecord, loadProject, requestPersistence, saveAssets } from "@/lib/storage/projects";

// History follows the "confirm then record" model (D-12, D-17): only `commit`
// adds a step. Each step is an immutable ProjectDoc; unchanged elements are
// shared between steps, so steps stay small. No step limit.
//
// Tools edit a `draft` copy (live preview, no history, not saved);
// applyDraft records it as one step, cancelDraft drops it.
// Persistence lives in ./autosave.ts.

interface EditorState {
  projectId: string | null;
  doc: ProjectDoc | null;
  draft: ProjectDoc | null;
  assets: Record<string, ImageAsset>;
  past: ProjectDoc[];
  future: ProjectDoc[];
  selectedId: string | null;
  /** Slide closest to the middle of the screen. */
  currentSlide: number;
  /** Content layer + scale of the mounted canvas, used for thumbnails and export. */
  canvas: { layer: Konva.Layer; viewScale: number } | null;

  createProject: (ratio: AspectRatio, slideCount: number, name: string) => Promise<void>;
  openProject: (id: string) => Promise<boolean>;
  closeProject: () => void;

  addImages: (assets: ImageAsset[], firstSlide?: number) => void;
  replaceImage: (id: string, asset: ImageAsset) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  duplicateElement: (id: string) => void;
  removeElement: (id: string) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;

  insertSlide: (after: number) => void;
  deleteSlide: (index: number) => void;
  moveSlide: (index: number, direction: -1 | 1) => void;

  beginDraft: () => void;
  updateDraft: (update: (doc: ProjectDoc) => ProjectDoc) => void;
  applyDraft: () => void;
  cancelDraft: () => void;

  select: (id: string | null) => void;
  setCurrentSlide: (index: number) => void;
  setCanvas: (canvas: EditorState["canvas"]) => void;
  undo: () => void;
  redo: () => void;
}

const EMPTY = {
  projectId: null,
  doc: null,
  draft: null,
  assets: {},
  past: [],
  future: [],
  selectedId: null,
  currentSlide: 0,
  canvas: null,
} satisfies Partial<EditorState>;

/** The doc to display: the tool draft while a tool is open, else the committed doc. */
export function useViewDoc() {
  return useEditor((s) => s.draft ?? s.doc);
}

export function updateEl(doc: ProjectDoc, id: string, patch: Partial<CanvasElement>): ProjectDoc {
  return { ...doc, elements: doc.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)) };
}

export const useEditor = create<EditorState>()((set, get) => {
  /** Records the current doc as one history step and replaces it. */
  function commit(update: (doc: ProjectDoc) => ProjectDoc) {
    const { doc, past } = get();
    if (!doc) return;
    const next = update(doc);
    if (next === doc) return;
    set({ doc: next, draft: null, past: [...past, doc], future: [] });
  }

  function revokeAll() {
    Object.values(get().assets).forEach((a) => URL.revokeObjectURL(a.url));
  }

  function storeAssets(assets: ImageAsset[]) {
    const projectId = get().projectId;
    if (!projectId) return;
    set((s) => ({ assets: { ...s.assets, ...Object.fromEntries(assets.map((a) => [a.id, a])) } }));
    void saveAssets(assets.map(({ id, blob, width, height, name }) => ({ id, projectId, blob, width, height, name })));
  }

  return {
    ...EMPTY,

    createProject: async (ratio, slideCount, name) => {
      const id = newId();
      const doc: ProjectDoc = {
        type: "post",
        ratio,
        slideCount,
        background: { kind: "color", color: "#ffffff" },
        elements: [],
      };
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
      const assets = Object.fromEntries(loaded.assets.map((a) => [a.id, { ...a, url: URL.createObjectURL(a.blob) }]));
      const size = (assetId: string) => assets[assetId];
      set({
        ...EMPTY,
        projectId: id,
        doc: migrateDoc(loaded.state.doc, size),
        past: loaded.state.past.map((d) => migrateDoc(d, size)),
        future: loaded.state.future.map((d) => migrateDoc(d, size)),
        assets,
      });
      return true;
    },

    closeProject: () => {
      revokeAll();
      set(EMPTY);
    },

    addImages: (assets, firstSlide = get().currentSlide) => {
      const doc = get().doc;
      if (!doc || assets.length === 0) return;
      storeAssets(assets);
      const added = placeImages(doc, assets, doc.elements.length === 0 ? 0 : firstSlide);
      commit((d) => ({ ...d, elements: [...d.elements, ...added] }));
      set({ selectedId: added[added.length - 1]?.id ?? null });
    },

    replaceImage: (id, asset) => {
      storeAssets([asset]);
      commit((d) => {
        const el = d.elements.find((e) => e.id === id);
        if (!el) return d;
        return updateEl(d, id, { assetId: asset.id, crop: coverCrop(asset, el), straighten: 0 });
      });
    },

    updateElement: (id, patch) => commit((d) => updateEl(d, id, patch)),

    duplicateElement: (id) => {
      const copyId = newId();
      commit((d) => {
        const i = d.elements.findIndex((el) => el.id === id);
        if (i < 0) return d;
        const copy = { ...d.elements[i], id: copyId, x: d.elements[i].x + 40, y: d.elements[i].y + 40 };
        const elements = [...d.elements];
        elements.splice(i + 1, 0, copy);
        return { ...d, elements };
      });
      set({ selectedId: copyId });
    },

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

    insertSlide: (after) => commit((d) => insertSlide(d, after)),
    deleteSlide: (index) => {
      commit((d) => deleteSlide(d, index));
      set({ selectedId: null });
    },
    moveSlide: (index, direction) => commit((d) => moveSlide(d, index, direction)),

    beginDraft: () => set((s) => ({ draft: s.doc })),
    updateDraft: (update) => set((s) => (s.draft ? { draft: update(s.draft) } : {})),
    applyDraft: () => {
      const draft = get().draft;
      if (draft) commit(() => draft);
      set({ draft: null });
    },
    cancelDraft: () => set({ draft: null }),

    select: (id) => set({ selectedId: id }),
    setCurrentSlide: (index) => set({ currentSlide: index }),
    setCanvas: (canvas) => set({ canvas }),

    undo: () => {
      const { doc, past, future } = get();
      if (!doc || past.length === 0) return;
      set({ doc: past[past.length - 1], draft: null, past: past.slice(0, -1), future: [doc, ...future] });
    },

    redo: () => {
      const { doc, past, future } = get();
      if (!doc || future.length === 0) return;
      set({ doc: future[0], draft: null, past: [...past, doc], future: future.slice(1) });
    },
  };
});

// Exposed for automated end-to-end checks (read-only use).
if (typeof window !== "undefined") (window as unknown as { __igEditor: typeof useEditor }).__igEditor = useEditor;
