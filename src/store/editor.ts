"use client";

import type Konva from "konva";
import { create } from "zustand";
import { migrateDoc } from "@/lib/project/migrate";
import { coverCrop, innerFrame } from "@/lib/project/geometry";
import { placeImages } from "@/lib/project/placement";
import { fillCells, fillTargets, freePhotos } from "@/lib/project/fill";
import { patchElement } from "@/lib/project/position";
import { relayout } from "@/lib/templates/blockLayout";
import { canvasSize, GRID_COLS } from "@/lib/project/layout";
import { changeRatio, deleteSlide, duplicateSlide, insertSlide, moveSlide, moveSlideTo, setGridGap, setGridRows } from "@/lib/project/slides";
import { addFrameBlock, addLayoutBlock, addLayoutSlide, applyTemplate, templateSlides } from "@/lib/templates/apply";
import { slideLayoutById } from "@/lib/templates/slideLayouts";
import { DEFAULT_OPTIONS, type Template, type TemplateOptions } from "@/lib/templates/types";
import {
  type AspectRatio,
  type CanvasElement,
  type ImageAsset,
  isImage,
  type Music,
  type ProjectDoc,
  type ProjectType,
  newId,
} from "@/lib/project/types";
import { translate, useSettings } from "./settings";
import { blockIds, cellFromFrame, copyUnit, isLayout, moveUnit, syncLayout } from "@/lib/project/blocks";
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
  /** "Fill frame" sheet open for this photo cell (M16): fill empty cells, or replace one photo. */
  fillFrame: { id: string; mode: "fill" | "replace" } | null;
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
  /** New project laid out by a designed template, photo cells empty (M10). Not an undo step. */
  createFromTemplate: (tpl: Template, name: string) => Promise<void>;
  closeProject: () => void;

  addImages: (assets: ImageAsset[], firstSlide?: number) => void;
  replaceImage: (id: string, asset: ImageAsset) => void;
  /** Same picture, new pixels (background removed, M12): keeps the framing, scales the crop. */
  swapAsset: (id: string, asset: ImageAsset) => void;
  /** Back to the photo as it was before its background was removed / cut / erased (M19). */
  restoreOriginal: (id: string) => void;
  addElement: (el: CanvasElement) => void;
  /** Background music (M13.4): set (with its new asset) or remove. One undo step. */
  setMusic: (music: Music | null, asset?: ImageAsset) => void;
  /** Freehand drawing in progress (M11): strokes in canvas pixels, not in the doc yet. */
  drawing: { color: string; size: number; strokes: number[][] } | null;
  /** Image being cropped on the canvas (D-111): the stage hands its gestures to the crop layer. */
  cropping: string | null;
  setCropping: (id: string | null) => void;
  startDrawing: () => void;
  setDrawing: (patch: Partial<{ color: string; size: number }>) => void;
  addStroke: (points: number[]) => void;
  undoStroke: () => void;
  /** Turns the strokes into one drawing element (one undo step). */
  finishDrawing: () => void;
  cancelDrawing: () => void;
  /** Adds an element that uses a new asset (generated overlay, M11). */
  addAssetElement: (asset: ImageAsset, el: CanvasElement) => void;
  /** Keeps a picture in the project without an element (a pack background, M20). */
  addAsset: (asset: ImageAsset) => void;
  /** A frame from a pack (M20 C4): its art and one empty cell per window. */
  addFrameBlock: (asset: ImageAsset, catalogId: string, windows: Parameters<typeof addFrameBlock>[3]) => void;
  /** Values derived from rendering (e.g. text height): no history step. */
  setDerived: (id: string, patch: Partial<CanvasElement>) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  duplicateElement: (id: string) => void;
  removeElement: (id: string) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;
  startSwap: (id: string | null) => void;
  openFillFrame: (id: string, mode: "fill" | "replace") => void;
  closeFillFrame: () => void;
  /** Photos into the empty cells, starting with `activeId` (editor-v2/09 §1.3): one undo step. */
  fillEmpty: (activeId: string, assets: ImageAsset[]) => void;
  applyLayout: (tpl: Template, photos: ImageAsset[], opts: TemplateOptions) => void;
  moveLayerTo: (id: string, where: "front" | "back") => void;
  toggleLock: (id: string) => void;
  toggleHidden: (id: string) => void;
  /** Layers panel drag (S8): put an element at `index` in back-to-front order. */
  moveLayerToIndex: (id: string, index: number) => void;
  /** Text element whose words are being edited (dialog), or null. */
  editingTextId: string | null;
  setEditingText: (id: string | null) => void;

  insertSlide: (after: number) => void;
  setGridRows: (rows: number) => void;
  setGridGap: (on: boolean) => void;
  deleteSlide: (index: number) => void;
  moveSlide: (index: number, direction: -1 | 1) => void;
  /** New slide at `at` (blank, or a layout block with empty cells — editor-v2/05 §5). */
  addSlide: (at: number, layoutId: string | null) => void;
  duplicateSlide: (index: number) => void;
  /** Another slide shape for the whole project (one step). */
  setRatio: (ratio: AspectRatio) => void;
  /** A layout block with empty cells on the slide in view ("+ → Grid", M19); it is selected. */
  addLayoutBlock: (layoutId: string) => void;
  /** Drag reorder (editor-v2/05 §4): one undo step. */
  moveSlideTo: (from: number, to: number) => void;

  beginDraft: () => void;
  updateDraft: (update: (doc: ProjectDoc) => ProjectDoc) => void;
  /** Changes one element of the draft; a block keeps its cells, a photo its crop (M17). */
  patchDraft: (id: string, patch: Partial<CanvasElement>) => void;
  /** Another split for the block in the draft; returns how many photos went outside it. */
  relayoutDraft: (id: string, layoutId: string) => number;
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
  fillFrame: null,
  compare: false,
  exporting: false,
  currentSlide: 0,
  canvas: null,
  drawing: null,
  cropping: null,
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
  /** After a change to `id`: if it is a layout block, its cells follow (M14). */
  function synced(d: ProjectDoc, id: string) {
    const el = d.elements.find((e) => e.id === id);
    if (isLayout(el)) return syncLayout(d, id, (a) => get().assets[a]);
    // A cell moved / resized / turned by hand (D-113): its block remembers where it is now.
    const block = el?.parentId ? d.elements.find((e) => e.id === el.parentId) : undefined;
    if (el && isLayout(block)) {
      const at = cellFromFrame(block, el);
      const cell = block.cells.find((c) => c.id === el.id);
      if (!cell) return d;
      const same = Math.abs(cell.x - at.x) < 1e-6 && Math.abs(cell.y - at.y) < 1e-6 && Math.abs(cell.w - at.w) < 1e-6 && Math.abs(cell.h - at.h) < 1e-6 && Math.abs((cell.rotation ?? 0) - (at.rotation ?? 0)) < 1e-6;
      if (same) return d;
      const cells = block.cells.map((c) => (c.id === el.id ? { id: c.id, ...at } : c));
      return updateEl(d, block.id, { cells, custom: true });
    }
    return d;
  }

  function commit(update: (doc: ProjectDoc) => ProjectDoc) {
    const { doc, past } = get();
    if (!doc) return;
    const next = update(doc);
    if (next === doc) return;
    set({ doc: next, draft: null, past: [...past, doc], future: [] });
  }

  function revokeAll() {
    Object.values(get().assets).forEach((a) => {
      URL.revokeObjectURL(a.url);
      if (a.video) URL.revokeObjectURL(a.video.posterUrl);
    });
  }

  function storeAssets(all: ImageAsset[]) {
    const projectId = get().projectId;
    const assets = all.filter((a) => !get().assets[a.id]);
    if (!projectId || assets.length === 0) return;
    set((s) => ({ assets: { ...s.assets, ...Object.fromEntries(assets.map((a) => [a.id, a])) } }));
    void saveAssets(
      assets.map(({ id, blob, width, height, name, video, audio }) => ({
        id,
        projectId,
        blob,
        width,
        height,
        name,
        ...(video && { video: { duration: video.duration, hasAudio: video.hasAudio, poster: video.poster } }),
        ...(audio && { audio }),
      })),
    );
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
      try {
        // Saving the new project must not hang or fail silently (owner, 2026-10-19): a full
        // browser storage or another tab holding the database would otherwise just do nothing.
        await Promise.race([
          createProjectRecord({ id, name, type, ratio, slideCount, createdAt: now, updatedAt: now, size: 0 }, doc),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
        ]);
      } catch (e) {
        console.error(e);
        const { locale } = useSettings.getState();
        const why = e instanceof Error && e.message === "timeout" ? translate(locale, "project.createTimeout") : e instanceof Error && /quota/i.test(e.name + e.message) ? translate(locale, "project.createQuota") : e instanceof Error ? `${e.name}: ${e.message}` : String(e);
        window.alert(`${translate(locale, "project.createFailed")}\n\n${why}`);
        throw e;
      }
      revokeAll();
      set({ ...EMPTY, projectId: id, projectName: name, doc });
      void requestPersistence();
    },

    createFromTemplate: async (tpl, name) => {
      const d = tpl.design;
      if (!d) return;
      const rows = 3;
      const base = d.type === "grid" ? rows * GRID_COLS : d.type === "story" ? 1 : 3;
      const slideCount = templateSlides(tpl, 0, base, d.type);
      await get().createProject({ type: d.type, ratio: d.ratio, slideCount, name });
      const doc = get().doc;
      if (!doc) return;
      set({ doc: applyTemplate(doc, tpl, [], DEFAULT_OPTIONS, useSettings.getState().locale) });
    },

    openProject: async (id) => {
      const loaded = await loadProject(id);
      if (!loaded) return false;
      revokeAll();
      const assets = Object.fromEntries(
        loaded.assets.map((a) => [
          a.id,
          { ...a, url: URL.createObjectURL(a.blob), video: a.video && { ...a.video, posterUrl: URL.createObjectURL(a.video.poster) } },
        ]),
      );
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
      // An empty project is laid out from the photos; otherwise they are added as free
      // photos on the slide in view, never into empty cells (Q-E2, editor-v2/09 §2).
      const added = doc.elements.length === 0 ? placeImages(doc, assets, 0) : freePhotos(doc, assets, firstSlide);
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

    setCropping: (id) => set({ cropping: id }),
    startDrawing: () => set({ drawing: { color: "#1d1c1a", size: 12, strokes: [] }, selectedId: null }),
    setDrawing: (patch) => set((s) => (s.drawing ? { drawing: { ...s.drawing, ...patch } } : {})),
    addStroke: (points) => set((s) => (s.drawing ? { drawing: { ...s.drawing, strokes: [...s.drawing.strokes, points] } } : {})),
    undoStroke: () => set((s) => (s.drawing ? { drawing: { ...s.drawing, strokes: s.drawing.strokes.slice(0, -1) } } : {})),
    cancelDrawing: () => set({ drawing: null }),
    finishDrawing: () => {
      const dr = get().drawing;
      set({ drawing: null });
      if (!dr || dr.strokes.length === 0) return;
      const pad = dr.size / 2;
      const xs = dr.strokes.flatMap((st) => st.filter((_, i) => i % 2 === 0));
      const ys = dr.strokes.flatMap((st) => st.filter((_, i) => i % 2 === 1));
      const x = Math.min(...xs) - pad;
      const y = Math.min(...ys) - pad;
      const width = Math.max(1, Math.max(...xs) + pad - x);
      const height = Math.max(1, Math.max(...ys) + pad - y);
      const el: CanvasElement = {
        id: newId(),
        type: "drawing",
        x,
        y,
        width,
        height,
        rotation: 0,
        opacity: 1,
        color: dr.color,
        strokeWidth: dr.size,
        strokes: dr.strokes.map((st) => st.map((v, i) => (i % 2 === 0 ? (v - x) / width : (v - y) / height))),
      };
      commit((d) => ({ ...d, elements: [...d.elements, el] }));
      set({ selectedId: el.id });
    },

    swapAsset: (id, asset) => {
      storeAssets([asset]);
      commit((d) => {
        const el = d.elements.find((e) => e.id === id);
        if (!isImage(el) || !el.assetId) return d;
        const old = get().assets[el.assetId];
        const k = old ? asset.width / old.width : 1;
        const crop = { x: el.crop.x * k, y: el.crop.y * k, width: el.crop.width * k, height: el.crop.height * k };
        return updateEl(d, id, { assetId: asset.id, crop, originalAssetId: el.originalAssetId ?? el.assetId });
      });
    },
    restoreOriginal: (id) =>
      commit((d) => {
        const el = d.elements.find((e) => e.id === id);
        if (!isImage(el) || !el.originalAssetId) return d;
        const old = el.assetId ? get().assets[el.assetId] : undefined;
        const orig = get().assets[el.originalAssetId];
        const k = old && orig ? orig.width / old.width : 1;
        const crop = { x: el.crop.x * k, y: el.crop.y * k, width: el.crop.width * k, height: el.crop.height * k };
        return updateEl(d, id, { assetId: el.originalAssetId, crop, originalAssetId: undefined });
      }),

    setMusic: (music, asset) => {
      if (asset) storeAssets([asset]);
      commit((d) => {
        const next = { ...d };
        if (music) next.music = music;
        else delete next.music;
        return next;
      });
    },

    addAsset: (asset) => storeAssets([asset]),
    addFrameBlock: (asset, catalogId, windows) => {
      const doc = get().doc;
      if (!doc) return;
      storeAssets([asset]);
      const r = addFrameBlock(doc, Math.min(get().currentSlide, doc.slideCount - 1), { assetId: asset.id, catalogId, width: asset.width, height: asset.height }, windows);
      commit(() => r.doc);
      set({ selectedId: r.id });
    },

    addAssetElement: (asset, el) => {
      storeAssets([asset]);
      commit((d) => ({ ...d, elements: [...d.elements, el] }));
      set({ selectedId: el.id });
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

    updateElement: (id, patch) => commit((d) => synced(updateEl(d, id, patch), id)),

    duplicateElement: (id) => {
      let copyId = newId();
      commit((d) => {
        const el = d.elements.find((e) => e.id === id);
        if (!el) return d;
        // A cell is copied as another cell of its block, a little offset (D-113).
        if (el.parentId) {
          const block = d.elements.find((e) => e.id === el.parentId);
          if (!isLayout(block)) return d;
          const copy = { ...el, id: copyId, x: el.x + 40, y: el.y + 40 } as CanvasElement;
          const at = d.elements.findIndex((e) => e.id === id);
          const elements = [...d.elements.slice(0, at + 1), copy, ...d.elements.slice(at + 1)];
          const cells = [...block.cells, { id: copyId, ...cellFromFrame(block, copy) }];
          return { ...d, elements: elements.map((e) => (e.id === block.id ? { ...block, cells, custom: true } : e)) };
        }
        const r = copyUnit(d, id, 40);
        if (!r) return d;
        copyId = r.copyId;
        return r.doc;
      });
      set({ selectedId: copyId });
    },

    removeElement: (id) => {
      commit((d) => {
        const el = d.elements.find((e) => e.id === id);
        // A photo in a cell: the cell stays, empty (M14).
        if (el?.parentId && isImage(el)) return updateEl(d, id, { assetId: null });
        const gone = new Set(blockIds(d, id));
        return { ...d, elements: d.elements.filter((e) => !gone.has(e.id)) };
      });
      const el = get().doc?.elements.find((e) => e.id === id);
      if (get().selectedId === id && !el) set({ selectedId: null });
    },

    moveLayer: (id, direction) => commit((d) => moveUnit(d, id, (from) => from + (direction === "up" ? 1 : -1))),

    startSwap: (id) => set({ swapFrom: id }),
    openFillFrame: (id, mode) => set({ fillFrame: { id, mode }, selectedId: id }),
    closeFillFrame: () => set({ fillFrame: null }),
    fillEmpty: (activeId, assets) => {
      const doc = get().doc;
      if (!doc || assets.length === 0) return;
      storeAssets(assets);
      const targets = fillTargets(doc, activeId);
      commit((d) => fillCells(d, targets, assets));
      set({ selectedId: null, fillFrame: null });
    },

    applyLayout: (tpl, photos, opts) => {
      storeAssets(photos);
      commit((d) => {
        const next = applyTemplate(d, tpl, photos, opts, useSettings.getState().locale);
        // Keep what the user added (text, shapes, icons) on top of the new layout (UX-02),
        // moved back inside the canvas if the layout has fewer slides.
        const size = canvasSize(next);
        const kept = d.elements
          .filter((e) => e.type !== "image" && e.type !== "layout" && !e.fromLayout)
          .map((e) => ({
            ...e,
            x: Math.min(e.x, size.width - e.width / 2 - Math.min(e.width / 2, 40)),
            y: Math.min(e.y, size.height - e.height / 2 - Math.min(e.height / 2, 40)),
          }));
        return { ...next, elements: [...next.elements, ...kept] };
      });
      set({ selectedId: null, swapFrom: null });
    },

    moveLayerTo: (id, where) => commit((d) => moveUnit(d, id, (_from, count) => (where === "front" ? count - 1 : 0))),

    // A block locks with its cells (everything inside stays put too).
    toggleLock: (id) =>
      commit((d) => {
        const el = d.elements.find((e) => e.id === id);
        if (!el) return d;
        const locked = !el.locked;
        return { ...d, elements: d.elements.map((e) => (e.id === id || e.parentId === id ? { ...e, locked } : e)) };
      }),

    toggleHidden: (id) => {
      commit((d) => {
        const el = d.elements.find((e) => e.id === id);
        return el ? synced(updateEl(d, id, { hidden: !el.hidden }), id) : d;
      });
      if (get().selectedId === id) set({ selectedId: null });
    },

    moveLayerToIndex: (id, index) => commit((d) => moveUnit(d, id, () => index)),

    // Typing on the canvas (M19, editor-v2/10): text and formatting go into one draft,
    // recorded as one step when typing ends; an emptied text box is removed.
    setEditingText: (id) => {
      if (id) return set((s) => ({ editingTextId: id, selectedId: id, draft: s.draft ?? s.doc }));
      const s = get();
      const cur = s.editingTextId;
      if (!cur) return;
      const el = s.draft?.elements.find((e) => e.id === cur);
      set({ editingTextId: null });
      if (el?.type === "text" && !el.text.trim()) {
        set({ draft: null, selectedId: null });
        get().removeElement(cur);
        return;
      }
      get().applyDraft();
    },

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
    addSlide: (at, layoutId) => {
      const layout = layoutId ? (slideLayoutById(layoutId) ?? null) : null;
      commit((d) => addLayoutSlide(d, at, layout));
      set({ selectedId: null });
    },
    setRatio: (ratio) => commit((d) => changeRatio(d, ratio, (a) => get().assets[a])),
    addLayoutBlock: (layoutId) => {
      const layout = slideLayoutById(layoutId);
      const doc = get().doc;
      if (!layout || !doc) return;
      const r = addLayoutBlock(doc, Math.min(get().currentSlide, doc.slideCount - 1), layout);
      commit(() => r.doc);
      set({ selectedId: r.id });
    },
    duplicateSlide: (index) => {
      commit((d) => duplicateSlide(d, index));
      set({ selectedId: null });
    },
    moveSlideTo: (from, to) => commit((d) => moveSlideTo(d, from, to)),

    beginDraft: () => set((s) => ({ draft: s.doc })),
    updateDraft: (update) => set((s) => (s.draft ? { draft: update(s.draft) } : {})),
    relayoutDraft: (id, layoutId) => {
      const s = get();
      if (!s.draft) return 0;
      // From the doc before the sheet opened: trying splits never loses photos.
      const r = relayout(s.doc!, id, layoutId, (a) => s.assets[a]);
      set({ draft: r.doc });
      return r.outside;
    },
    patchDraft: (id, patch) => set((s) => (s.draft ? { draft: patchElement(s.draft, id, patch, (a) => s.assets[a]) } : {})),
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
