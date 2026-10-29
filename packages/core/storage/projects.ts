import type { ProjectDoc } from "../project/types";
import { db, type ProjectMeta, type ProjectState, type StoredAsset } from "./db";

export type { ProjectMeta, ProjectState, StoredAsset };

export async function listProjects(): Promise<ProjectMeta[]> {
  const all = await (await db()).getAllFromIndex("projects", "updatedAt");
  return all.reverse();
}

export async function createProjectRecord(meta: ProjectMeta, doc: ProjectDoc) {
  const tx = (await db()).transaction(["projects", "states"], "readwrite");
  await Promise.all([
    tx.objectStore("projects").put(meta),
    tx.objectStore("states").put({ id: meta.id, doc, past: [], future: [] }),
    tx.done,
  ]);
}

export async function loadProject(id: string) {
  const d = await db();
  const [meta, state, assets] = await Promise.all([
    d.get("projects", id),
    d.get("states", id),
    d.getAllFromIndex("assets", "projectId", id),
  ]);
  if (!meta || !state) return null;
  return { meta, state, assets };
}

/** Rough size of a history entry list, so the storage figure stays honest. */
function stateSize(state: ProjectState) {
  return new Blob([JSON.stringify(state)]).size;
}

async function assetsSize(projectId: string) {
  const assets = await (await db()).getAllFromIndex("assets", "projectId", projectId);
  return assets.reduce((sum, a) => sum + a.blob.size, 0);
}

export async function saveState(state: ProjectState, patch: Partial<ProjectMeta> = {}) {
  const d = await db();
  const meta = await d.get("projects", state.id);
  if (!meta) return;
  const thumbnail = patch.thumbnail ?? meta.thumbnail;
  const size = (await assetsSize(state.id)) + stateSize(state) + (thumbnail?.size ?? 0);
  const tx = d.transaction(["projects", "states"], "readwrite");
  await Promise.all([
    tx.objectStore("states").put(state),
    tx.objectStore("projects").put({
      ...meta,
      ...patch,
      slideCount: state.doc.slideCount,
      ratio: state.doc.ratio,
      updatedAt: Date.now(),
      size,
    }),
    tx.done,
  ]);
}

export async function saveAssets(assets: StoredAsset[]) {
  const tx = (await db()).transaction("assets", "readwrite");
  await Promise.all([...assets.map((a) => tx.store.put(a)), tx.done]);
}

export async function renameProject(id: string, name: string) {
  const d = await db();
  const meta = await d.get("projects", id);
  if (meta) await d.put("projects", { ...meta, name });
}

export async function deleteProject(id: string) {
  const d = await db();
  const assetKeys = await d.getAllKeysFromIndex("assets", "projectId", id);
  const tx = d.transaction(["projects", "states", "assets"], "readwrite");
  await Promise.all([
    tx.objectStore("projects").delete(id),
    tx.objectStore("states").delete(id),
    ...assetKeys.map((k) => tx.objectStore("assets").delete(k)),
    tx.done,
  ]);
}

export async function deleteAllProjects() {
  const tx = (await db()).transaction(["projects", "states", "assets"], "readwrite");
  await Promise.all([
    tx.objectStore("projects").clear(),
    tx.objectStore("states").clear(),
    tx.objectStore("assets").clear(),
    tx.done,
  ]);
}

/** Asks the browser not to evict our data (Safari may otherwise clear it after ~7 days unused). */
export async function requestPersistence() {
  try {
    if (await navigator.storage?.persisted?.()) return true;
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

export async function storageEstimate() {
  try {
    const { usage = 0, quota = 0 } = (await navigator.storage?.estimate?.()) ?? {};
    const persisted = (await navigator.storage?.persisted?.()) ?? false;
    return { usage, quota, persisted };
  } catch {
    return { usage: 0, quota: 0, persisted: false };
  }
}
