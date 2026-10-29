// Copies the onnxruntime-web WASM runtime next to the app (public/ort/) so background
// removal (M12) loads it from our own origin: the service worker can cache it and the
// feature keeps working offline. Runs before dev / build; public/ort is not committed.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

// onnxruntime-web is a dependency of @huggingface/transformers (pnpm: not hoisted).
const tf = fs.realpathSync(path.join(process.cwd(), "node_modules", "@huggingface", "transformers"));
let ort = path.dirname(createRequire(path.join(tf, "package.json")).resolve("onnxruntime-web"));
while (!fs.existsSync(path.join(ort, "package.json"))) ort = path.dirname(ort);
const out = path.join(process.cwd(), "public", "ort");
fs.mkdirSync(out, { recursive: true });
// Plain build (Safari < 26 without WebGPU) and the asyncify build (everything else).
for (const f of ["ort-wasm-simd-threaded.mjs", "ort-wasm-simd-threaded.wasm", "ort-wasm-simd-threaded.asyncify.mjs", "ort-wasm-simd-threaded.asyncify.wasm"]) {
  fs.copyFileSync(path.join(ort, "dist", f), path.join(out, f));
}
console.log("onnxruntime-web runtime copied to public/ort");
