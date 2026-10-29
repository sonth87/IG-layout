"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useStore, type StoreApi } from "zustand";
import type { CanvasElement, ImageAsset, ProjectDoc } from "@ig-layout/core/project/types";

// What the canvas nodes need from the app that hosts them (D-150 step 2): the editor gives its
// own store; another app (the booth) gives a store with the same fields. The nodes never
// import an app's store, so they draw the same everywhere.

export interface CanvasState {
  doc: ProjectDoc | null;
  /** The doc while a tool is open (not yet committed), else null. */
  draft: ProjectDoc | null;
  assets: Record<string, ImageAsset>;
  selectedId: string | null;
  /** Show the selected photo without its colour edits (hold-to-compare). */
  compare: boolean;
  /** Drawing for export: full-resolution colour, no selection extras. */
  exporting: boolean;
  drawing: unknown | null;
  cropping: string | null;
  editingTextId: string | null;
  select: (id: string | null) => void;
  /** Commits one undo step. */
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  /** During a gesture: no undo step yet. */
  updateLive: (id: string, patch: Partial<CanvasElement>) => void;
  /** Values computed from others (text height…): no undo step. */
  setDerived: (id: string, patch: Partial<CanvasElement>) => void;
  setEditingText: (id: string | null) => void;
}

const Ctx = createContext<StoreApi<CanvasState> | null>(null);

/** Put inside the Konva <Stage>, around the layers holding the nodes. */
export function CanvasHost({ store, children }: { store: StoreApi<CanvasState>; children: ReactNode }) {
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

function useHostStore() {
  const store = useContext(Ctx);
  if (!store) throw new Error("Canvas nodes need a <CanvasHost>");
  return store;
}

/** Like the app's own store hook, for the fields in CanvasState. */
export function useCanvas<T>(selector: (s: CanvasState) => T): T {
  return useStore(useHostStore(), selector);
}

/** For reading the latest state inside handlers (getState). */
export function useCanvasApi() {
  return useHostStore();
}
