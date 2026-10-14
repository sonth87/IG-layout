"use client";

import type Konva from "konva";
import { create } from "zustand";
import { migrateDoc } from "@/lib/project/migrate";
import { coverCrop, innerFrame } from "@/lib/project/geometry";
import { placeImages } from "@/lib/project/placement";
import { canvasSize, GRID_COLS } from "@/lib/project/layout";
import { deleteSlide, insertSlide, moveSlide, setGridGap, setGridRows } from "@/lib/project/slides";
import { applyTemplate } from "@/lib/templates/apply";
import type { Template, TemplateOptions } from "@/lib/templates/types";
import {
  type AspectRatio,
  type CanvasElement,
  type ImageAsset,
  isImage,
  type ProjectDoc,
  type ProjectType,
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
  /** Name of the open project (used for exported file names). */
  projectName: string;
  doc: ProjectDoc | null;
  draft: ProjectDoc | null;
  assets: Record<string, ImageAsset>;
  past: ProjectDoc[];
  future: ProjectDoc[];
  selectedId: string | null;
  /** While set, the next photo the user taps swaps photos with this one. */
  swapFrom: string | null;
  /** "Hold to compare": the selected photo is drawn without colour changes. */
  compare: boolean;
  /** Export in progress: photos are processed at full resolution. */
  exporting: boolean;
  /** Slide closest to the middle of the screen. */
  currentSlide: number;
  /** Content layer + scale of the mounted canvas, used for thumbnails and export. */
  canvas: { layer: Konva.Layer; viewScale: number } | null;

  createProject: (opts: { type: ProjectType; ratio: AspectRatio; slideCount: number; name: string; gapCompensation?: boolean }) => Promise<void>;
  openProject: (id: string) => Promise<boolean>;
  closeProject: () => void;

  addImages: (assets: ImageAsset[], firstSlide?: number) => void;
  replaceImage: (id: string, asset: ImageAsset) => void;
  addElement: (el: CanvasElement) => void;
  /** Values derived from rendering (e.g. text height): no history step. */
  setDerived: (id: string, patch: Partial<CanvasElement>) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  duplicateElement: (id: string) => void;
  removeElement: (id: string) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;
  startSwap: (id: string | null) => void;
  applyLayout: (tpl: Template, photos: ImageAsset[], opts: TemplateOptions) => void;
  moveLayerTo: (id: string, where: "front" | "back") => void;
  toggleLock: (id: string) => void;
  /** Text element whose words are being edited (dialog), or null. */
  editingTextId: string | null;
  setEditingText: (id: string | null) => void;

  insertSlide: (after: number) => void;
  setGridRows: (rows: number) => void;
  setGridGap: (on: boolean) => void;
  deleteSlide: (index: number) => void;
  moveSlide: (index: number, direction: -1 | 1) => void;

  beginDraft: () => void;
  updateDraft: (update: (doc: ProjectDoc) => ProjectDoc) => void;
  applyDraft: () => void;
  cancelDraft: () => void;

  select: (id: string | null) => void;
  setCompare: (on: boolean) => void;
  setExporting: (on: boolean) => void;
  setCurrentSlide: (index: number) => void;
  setCanvas: (canvas: EditorState["canvas"]) => void;
  undo: () => void;
  redo: () => void;
}

const EMPTY = {
  projectId: null,
  projectName: "",
  editingTextId: null,
  doc: null,
  draft: null,
  assets: {},
  past: [],
  future: [],
  selectedId: null,
  swapFrom: null,
  compare: false,
  exporting: false,
  currentSlide: 0,
  canvas: null,
} satisfies Partial<EditorState>;

/** The doc to display: the tool draft while a tool is open, else the committed doc. */
export function useViewDoc() {
  return useEditor((s) => s.draft ?? s.doc);
}

export function updateEl(doc: ProjectDoc, id: string, patch: Partial<CanvasElement>): ProjectDoc {
  return {
    ...doc,
    elements: doc.elements.map((el) => (el.id === id ? ({ ...el, ...patch } as CanvasElement) : el)),
  };
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

  function storeAssets(all: ImageAsset[]) {
    const projectId = get().projectId;
    const assets = all.filter((a) => !get().assets[a.id]);
    if (!projectId || assets.length === 0) return;
    set((s) => ({ assets: { ...s.assets, ...Object.fromEntries(assets.map((a) => [a.id, a])) } }));
    void saveAssets(assets.map(({ id, blob, width, height, name }) => ({ id, projectId, blob, width, height, name })));
  }

  return {
    ...EMPTY,

    createProject: async ({ type, ratio, slideCount, name, gapCompensation = true }) => {
      const id = newId();
      const doc: ProjectDoc = {
        type,
        ratio,
        slideCount,
        background: { kind: "color", color: "#ffffff" },
        elements: [],
        ...(type === "grid" ? { grid: { rows: Math.ceil(slideCount / GRID_COLS), gapCompensation } } : {}),
      };
      const now = Date.now();
      await createProjectRecord({ id, name, type, ratio, slideCount, createdAt: now, updatedAt: now, size: 0 }, doc);
      revokeAll();
      set({ ...EMPTY, projectId: id, projectName: name, doc });
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
        projectName: loaded.meta.name,
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
        if (!isImage(el)) return d;
        return updateEl(d, id, { assetId: asset.id, crop: coverCrop(asset, innerFrame(el)), straighten: 0 });
      });
    },

    addElement: (el) => {
      commit((d) => ({ ...d, elements: [...d.elements, el] }));
      set({ selectedId: el.id });
    },

    setDerived: (id, patch) =>
      set((s) => ({
        doc: s.doc && s.doc.elements.some((e) => e.id === id) ? updateEl(s.doc, id, patch) : s.doc,
        draft: s.draft ? updateEl(s.draft, id, patch) : null,
      })),

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

    startSwap: (id) => set({ swapFrom: id }),

    applyLayout: (tpl, photos, opts) => {
      storeAssets(photos);
      commit((d) => {
        const next = applyTemplate(d, tpl, photos, opts);
        // Keep what the user added (text, shapes, icons) on top of the new layout (UX-02),
        // moved back inside the canvas if the layout has fewer slides.
        const size = canvasSize(next);
        const kept = d.elements
          .filter((e) => e.type !== "image" && !e.fromLayout)
          .map((e) => ({
            ...e,
            x: Math.min(e.x, size.width - e.width / 2 - Math.min(e.width / 2, 40)),
            y: Math.min(e.y, size.height - e.height / 2 - Math.min(e.height / 2, 40)),
          }));
        return { ...next, elements: [...next.elements, ...kept] };
      });
      set({ selectedId: null, swapFrom: null });
    },

    moveLayerTo: (id, where) =>
      commit((d) => {
        const el = d.elements.find((e) => e.id === id);
        if (!el) return d;
        const rest = d.elements.filter((e) => e.id !== id);
        return { ...d, elements: where === "front" ? [...rest, el] : [el, ...rest] };
      }),

    toggleLock: (id) =>
      commit((d) => {
        const el = d.elements.find((e) => e.id === id);
        return el ? updateEl(d, id, { locked: !el.locked }) : d;
      }),

    setEditingText: (id) => set({ editingTextId: id }),

    insertSlide: (after) => commit((d) => insertSlide(d, after)),
    setGridRows: (rows) => {
      commit((d) => setGridRows(d, rows));
      set({ selectedId: null });
    },
    setGridGap: (on) => commit((d) => setGridGap(d, on)),
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

    select: (id) => {
      const { swapFrom } = get();
      if (swapFrom && id && id !== swapFrom) {
        // Swap the photos of two frames; each keeps its frame and gets a fresh cover crop.
        commit((d) => {
          const a = d.elements.find((e) => e.id === swapFrom);
          const b = d.elements.find((e) => e.id === id);
          if (!isImage(a) || !isImage(b)) return d;
          const assets = get().assets;
          const cropFor = (assetId: string | null, frame: { width: number; height: number }) =>
            assetId && assets[assetId] ? coverCrop(assets[assetId], frame) : { x: 0, y: 0, width: 1, height: 1 };
          let next = updateEl(d, a.id, { assetId: b.assetId, crop: cropFor(b.assetId, innerFrame(a)), straighten: 0 });
          next = updateEl(next, b.id, { assetId: a.assetId, crop: cropFor(a.assetId, innerFrame(b)), straighten: 0 });
          return next;
        });
        set({ swapFrom: null, selectedId: id });
        return;
      }
      set({ selectedId: id, swapFrom: id ? swapFrom : null });
    },
    setCompare: (on) => set({ compare: on }),
    setExporting: (on) => set({ exporting: on }),
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
