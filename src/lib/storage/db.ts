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
}

interface Schema extends DBSchema {
  projects: { key: string; value: ProjectMeta; indexes: { updatedAt: number } };
  states: { key: string; value: ProjectState };
  assets: { key: string; value: StoredAsset; indexes: { projectId: string } };
}

let dbPromise: Promise<IDBPDatabase<Schema>> | null = null;

export function db() {
  dbPromise ??= openDB<Schema>("ig-layout", 1, {
    upgrade(database) {
      database.createObjectStore("projects", { keyPath: "id" }).createIndex("updatedAt", "updatedAt");
      database.createObjectStore("states", { keyPath: "id" });
      database.createObjectStore("assets", { keyPath: "id" }).createIndex("projectId", "projectId");
    },
  });
  return dbPromise;
}
