import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { AspectRatio, ProjectDoc, ProjectType } from "@/lib/project/types";

// Local storage for projects (docs/architecture/storage.md, D-20, D-23).
// Everything stays on the device.

export interface ProjectMeta {
  id: string;
  name: string;
  type: ProjectType;
  ratio: AspectRatio;
  slideCount: number;
  createdAt: number;
  updatedAt: number;
  /** Small JPEG of slide 1. */
  thumbnail?: Blob;
  /** Approximate bytes used (images + data). */
  size: number;
}

export interface ProjectState {
  id: string;
  doc: ProjectDoc;
  past: ProjectDoc[];
  future: ProjectDoc[];
}

export interface StoredAsset {
  id: string;
  projectId: string;
  blob: Blob;
  width: number;
  height: number;
  name: string;
  /** Videos (M13). */
  video?: { duration: number; hasAudio: boolean; poster: Blob };
  /** Music (M13.4). */
  audio?: { duration: number };
}

/** Things kept across projects (M19): the user's stickers, Brand Kit logos and assets. */
export interface LibraryItem {
  id: string;
  kind: "sticker" | "logo" | "asset";
  blob: Blob;
  width: number;
  height: number;
  name: string;
  createdAt: number;
}

interface Schema extends DBSchema {
  projects: { key: string; value: ProjectMeta; indexes: { updatedAt: number } };
  states: { key: string; value: ProjectState };
  assets: { key: string; value: StoredAsset; indexes: { projectId: string } };
  library: { key: string; value: LibraryItem; indexes: { kind: string } };
}

let dbPromise: Promise<IDBPDatabase<Schema>> | null = null;

/** Where opening the database got to (shown by the storage check in Settings). */
export const dbStatus: { state: "idle" | "opening" | "open" | "blocked" | "failed" | "closed"; error?: string; openMs?: number } = { state: "idle" };

export function db() {
  if (!dbPromise) {
    const t0 = performance.now();
    dbStatus.state = "opening";
    dbPromise = openDB<Schema>("ig-layout", 2, {
      upgrade(database, oldVersion) {
        if (oldVersion < 1) {
          database.createObjectStore("projects", { keyPath: "id" }).createIndex("updatedAt", "updatedAt");
          database.createObjectStore("states", { keyPath: "id" });
          database.createObjectStore("assets", { keyPath: "id" }).createIndex("projectId", "projectId");
        }
        if (oldVersion < 2) database.createObjectStore("library", { keyPath: "id" }).createIndex("kind", "kind");
      },
      // Another tab holds an older connection and stops the upgrade: say so.
      blocked() {
        dbStatus.state = "blocked";
      },
      // Another tab needs to upgrade: let it (this tab reopens on its next use).
      blocking() {
        void dbPromise?.then((d) => d.close());
        dbPromise = null;
        dbStatus.state = "closed";
      },
      // The browser closed the connection (storage cleared, crash): reopen next time.
      terminated() {
        dbPromise = null;
        dbStatus.state = "closed";
      },
    }).then(
      (d) => {
        dbStatus.state = "open";
        dbStatus.openMs = Math.round(performance.now() - t0);
        return d;
      },
      (e: unknown) => {
        dbPromise = null;
        dbStatus.state = "failed";
        dbStatus.error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
        throw e;
      },
    );
  }
  return dbPromise;
}

/** Forget a connection that seems stuck, so the next use opens a fresh one. */
export function resetDb() {
  const p = dbPromise;
  dbPromise = null;
  dbStatus.state = "closed";
  void p?.then((d) => d.close()).catch(() => {});
}
