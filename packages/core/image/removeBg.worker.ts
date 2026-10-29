/// <reference lib="webworker" />
// Background removal (M12, S11) in a Web Worker so the page never freezes.
// Model: ormbg (Apache-2.0, general subjects: people and products), int8 ≈ 44 MB,
// downloaded once from Hugging Face and kept in the browser cache. The ONNX runtime
// is served from our own origin (/ort/, see scripts/copy-ort.mjs) so it works offline.
// The photo itself never leaves the device.

import { env, pipeline, RawImage, type BackgroundRemovalPipeline } from "@huggingface/transformers";

const MODEL = "onnx-community/ormbg-ONNX";

export type WorkerRequest = { id: number; blob: Blob };
export type WorkerMessage =
  | { type: "progress"; loaded: number; total: number }
  | { type: "status"; status: "loading" | "running" }
  | { type: "done"; id: number; blob: Blob }
  | { type: "error"; id: number; message: string };

env.allowLocalModels = false;
if (env.backends.onnx.wasm) env.backends.onnx.wasm.wasmPaths = `${self.location.origin}/ort/`;

const post = (m: WorkerMessage) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(m);

let remover: Promise<BackgroundRemovalPipeline> | null = null;
const files = new Map<string, { loaded: number; total: number }>();

function load() {
  remover ??= pipeline("background-removal", MODEL, {
    device: "wasm",
    dtype: "q8",
    progress_callback: (p: { status: string; file?: string; loaded?: number; total?: number }) => {
      if (p.status !== "progress" || !p.file) return;
      files.set(p.file, { loaded: p.loaded ?? 0, total: p.total ?? 0 });
      let loaded = 0;
      let total = 0;
      for (const f of files.values()) {
        loaded += f.loaded;
        total += f.total;
      }
      post({ type: "progress", loaded, total });
    },
  }) as Promise<BackgroundRemovalPipeline>;
  return remover;
}

/**
 * Cleans the soft matte: nearly transparent → transparent, nearly opaque → opaque, so
 * there is no faint halo of the old background, while edges stay soft (smoothstep).
 */
function cleanAlpha(data: Uint8ClampedArray | Uint8Array) {
  const lo = 0.12;
  const hi = 0.88;
  for (let i = 3; i < data.length; i += 4) {
    const a = data[i] / 255;
    const t = Math.min(1, Math.max(0, (a - lo) / (hi - lo)));
    data[i] = Math.round(t * t * (3 - 2 * t) * 255);
  }
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, blob } = e.data;
  try {
    post({ type: "status", status: "loading" });
    const run = await load();
    post({ type: "status", status: "running" });
    const image = await RawImage.fromBlob(blob);
    const out = (await run(image)) as RawImage | RawImage[];
    const cut = Array.isArray(out) ? out[0] : out;
    cleanAlpha(cut.data);
    post({ type: "done", id, blob: await cut.toBlob("image/png") });
  } catch (err) {
    post({ type: "error", id, message: err instanceof Error ? err.message : String(err) });
  }
};
