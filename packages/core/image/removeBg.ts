import type { ImageAsset } from "../project/types";
import { newId } from "../project/types";
import type { WorkerMessage } from "./removeBg.worker";

// Main-thread side of background removal (M12): one worker for the session, one photo
// at a time. See removeBg.worker.ts for the model and licences.

/** Longest side sent to the model: enough for posts, keeps memory sane on phones. */
const MAX_SIDE = 2048;
const MODEL_KEY = "ig-layout:bg-model-ready";

export type RemoveBgProgress = { phase: "download"; loaded: number; total: number } | { phase: "loading" | "running" };

let worker: Worker | null = null;
let nextId = 1;

function getWorker() {
  worker ??= new Worker(new URL("./removeBg.worker.ts", import.meta.url), { type: "module" });
  return worker;
}

/** Has the model been downloaded on this device before (no big download this time)? */
export function modelReady() {
  try {
    return localStorage.getItem(MODEL_KEY) === "1";
  } catch {
    return false;
  }
}

async function downscale(asset: ImageAsset): Promise<{ blob: Blob; width: number; height: number }> {
  const long = Math.max(asset.width, asset.height);
  if (long <= MAX_SIDE) return { blob: asset.blob, width: asset.width, height: asset.height };
  const k = MAX_SIDE / long;
  const width = Math.round(asset.width * k);
  const height = Math.round(asset.height * k);
  const bitmap = await createImageBitmap(asset.blob, { resizeWidth: width, resizeHeight: height, resizeQuality: "high" });
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob>((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error("resize"))), "image/png"));
  canvas.width = canvas.height = 0;
  return { blob, width, height };
}

/** Returns a new asset: the photo with a transparent background (PNG). */
export async function removeBackground(asset: ImageAsset, onProgress: (p: RemoveBgProgress) => void): Promise<ImageAsset> {
  const input = await downscale(asset);
  const w = getWorker();
  const id = nextId++;
  const blob = await new Promise<Blob>((resolve, reject) => {
    const onMessage = (e: MessageEvent<WorkerMessage>) => {
      const m = e.data;
      if (m.type === "progress") onProgress({ phase: "download", loaded: m.loaded, total: m.total });
      else if (m.type === "status") onProgress({ phase: m.status });
      else if (m.id === id) {
        w.removeEventListener("message", onMessage);
        if (m.type === "done") resolve(m.blob);
        else reject(new Error(m.message));
      }
    };
    w.addEventListener("message", onMessage);
    w.postMessage({ id, blob: input.blob });
  });
  try {
    localStorage.setItem(MODEL_KEY, "1");
  } catch {
    // ignore
  }
  return {
    id: newId(),
    blob,
    url: URL.createObjectURL(blob),
    width: input.width,
    height: input.height,
    name: asset.name.replace(/\.\w+$/, "") + "-cutout.png",
  };
}
