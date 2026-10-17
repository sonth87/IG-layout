// Processes raw source images in assets/<kind>/<pack>/src/ into public/packs/<kind>/<pack>/
// according to docs/architecture/asset-catalog.md (§5, §6).
// Usage: node scripts/assets/process.mjs <kind>/<pack> [--only <id>] [--force]

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ASSETS, itemFiles, KINDS, LIMITS, PACKS } from "./common.mjs";

const SRC_EXTS = [".png", ".webp", ".jpg", ".jpeg", ".tif", ".tiff", ".svg", ".avif", ".gif"];
const MODEL_ID = "onnx-community/ormbg-ONNX";

let bgPipelinePromise = null;

async function getBgRemover() {
  if (!bgPipelinePromise) {
    bgPipelinePromise = (async () => {
      const { pipeline } = await import("@huggingface/transformers");
      return pipeline("background-removal", MODEL_ID, { dtype: "q8" });
    })();
  }
  return bgPipelinePromise;
}

function findSourceFile(srcDir, id) {
  if (!existsSync(srcDir)) return null;
  for (const ext of SRC_EXTS) {
    const p = path.join(srcDir, `${id}${ext}`);
    if (existsSync(p)) return p;
  }
  const files = readdirSync(srcDir);
  const match = files.find((f) => {
    const ext = path.extname(f).toLowerCase();
    return SRC_EXTS.includes(ext) && path.basename(f, path.extname(f)) === id;
  });
  return match ? path.join(srcDir, match) : null;
}

/** Check whether an RGBA buffer already has a meaningful transparent background. */
function hasMeaningfulAlpha(rgba, width, height) {
  const total = width * height;
  let transparentCount = 0;
  for (let i = 3; i < rgba.length; i += 4) {
    if (rgba[i] < 240) transparentCount++;
  }
  return transparentCount / total >= 0.02;
}

/**
 * Flood-fill background removal from all 4 outer edges using the dominant perimeter
 * background color(s). Preserves 100% of interior pixels (never creates holes inside stamps/tickets).
 */
function floodFillPerimeterBg(rgba, width, height, customTolerance) {
  const out = Buffer.from(rgba);

  // Sample perimeter pixels to determine if backdrop is dark, pure white, or uniform color.
  let darkCount = 0,
    whiteCount = 0,
    perimCount = 0;
  let rSum = 0,
    gSum = 0,
    bSum = 0;

  const samplePx = (x, y) => {
    const i = (y * width + x) * 4;
    const r = out[i],
      g = out[i + 1],
      b = out[i + 2];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    if (luma < 75) darkCount++;
    if (r > 246 && g > 246 && b > 242) whiteCount++;
    rSum += r;
    gSum += g;
    bSum += b;
    perimCount++;
  };

  for (let x = 0; x < width; x++) {
    samplePx(x, 0);
    samplePx(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    samplePx(0, y);
    samplePx(width - 1, y);
  }

  const isDarkBackdrop = (customTolerance && customTolerance >= 80) || darkCount / perimCount >= 0.06;
  const isWhiteBackdrop = !isDarkBackdrop && whiteCount / perimCount >= 0.25;
  const r0 = Math.round(rSum / perimCount);
  const g0 = Math.round(gSum / perimCount);
  const b0 = Math.round(bSum / perimCount);
  const tolerance = customTolerance ?? (isDarkBackdrop ? 85 : isWhiteBackdrop ? 14 : 26);

  const isBgPixel = (i) => {
    const r = out[i],
      g = out[i + 1],
      b = out[i + 2];
    if (isDarkBackdrop) {
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      return luma <= tolerance;
    }
    if (isWhiteBackdrop) {
      return r >= 255 - tolerance && g >= 255 - tolerance && b >= 252 - tolerance;
    }
    return Math.max(Math.abs(r - r0), Math.abs(g - g0), Math.abs(b - b0)) <= tolerance;
  };

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0,
    tail = 0;

  const push = (x, y) => {
    const p = y * width + x;
    if (visited[p]) return;
    if (isBgPixel(p * 4)) {
      visited[p] = 1;
      queue[tail++] = p;
    }
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (head < tail) {
    const p = queue[head++];
    out[p * 4 + 3] = 0;
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) push(x - 1, y);
    if (x + 1 < width) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y + 1 < height) push(x, y + 1);
  }

  // Soften 1px transition along the flood-filled boundary.
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      if (visited[p]) continue;
      const nTransparent =
        visited[p - 1] + visited[p + 1] + visited[p - width] + visited[p + width];
      if (nTransparent > 0) {
        out[p * 4 + 3] = Math.round(out[p * 4 + 3] * (1 - nTransparent * 0.15));
      }
    }
  }

  return { out, removedRatio: tail / (width * height), isScannerBackdrop: isDarkBackdrop || isWhiteBackdrop };
}

/** Run local AI background removal (ormbg-ONNX) or perimeter flood-fill on an input buffer. */
async function removeBackgroundLocal(inputPath, rgba, width, height, processOpts = {}) {
  const mode = processOpts.bgMode ?? "auto";
  if (mode === "floodfill") {
    return floodFillPerimeterBg(rgba, width, height, processOpts.tolerance).out;
  }

  // Check if the image is a scan on a clean dark/white backdrop where perimeter flood-fill
  // cleanly isolates the item (e.g. postage stamps with perforated edges).
  if (mode === "auto") {
    const ff = floodFillPerimeterBg(rgba, width, height, processOpts.tolerance);
    if (ff.isScannerBackdrop && ff.removedRatio >= 0.004 && ff.removedRatio <= 0.65) {
      return ff.out;
    }
  }

  try {
    const { RawImage } = await import("@huggingface/transformers");
    const remover = await getBgRemover();
    const pngBuf = await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer();
    const blob = new Blob([pngBuf], { type: "image/png" });
    const rawImg = await RawImage.fromBlob(blob);
    const result = await remover(rawImg);
    const cut = Array.isArray(result) ? result[0] : result;
    const out = Buffer.from(cut.data);

    // Verify that the model kept a reasonable foreground (> 1% and < 98% opaque).
    let fg = 0;
    const total = width * height;
    for (let i = 3; i < out.length; i += 4) {
      if (out[i] > 32) fg++;
    }
    if (fg / total >= 0.01 && fg / total <= 0.98) {
      return out;
    }
  } catch (e) {
    console.warn(`  ! local AI model warning on ${path.basename(inputPath)}: ${e.message}; using perimeter flood-fill`);
  }
  return floodFillPerimeterBg(rgba, width, height, processOpts.tolerance).out;
}

/**
 * Clean soft alpha edges:
 * 1. Smoothstep between lo=0.12 and hi=0.88 so low-alpha noise (<30) becomes 0.
 * 2. Decontaminate semi-transparent edge pixels by pulling their RGB toward the nearest
 *    opaque interior neighbor (removes white/colored background halos).
 */
function cleanStickerEdges(rgba, width, height) {
  const out = Buffer.from(rgba);
  const lo = 0.12;
  const hi = 0.88;
  for (let i = 3; i < out.length; i += 4) {
    const a = out[i] / 255;
    if (a <= lo) {
      out[i - 3] = 0;
      out[i - 2] = 0;
      out[i - 1] = 0;
      out[i] = 0;
    } else {
      const t = Math.min(1, (a - lo) / (hi - lo));
      out[i] = Math.round(t * t * (3 - 2 * t) * 255);
    }
  }

  // Color decontamination pass for semi-transparent edge pixels (0 < alpha < 230).
  const copy = Buffer.from(out);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const a = copy[idx + 3];
      if (a === 0 || a >= 230) continue;
      let rSum = 0,
        gSum = 0,
        bSum = 0,
        count = 0;
      for (let dy = -2; dy <= 2; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          const nIdx = (ny * width + nx) * 4;
          if (copy[nIdx + 3] >= 230) {
            rSum += copy[nIdx];
            gSum += copy[nIdx + 1];
            bSum += copy[nIdx + 2];
            count++;
          }
        }
      }
      if (count > 0) {
        out[idx] = Math.round(rSum / count);
        out[idx + 1] = Math.round(gSum / count);
        out[idx + 2] = Math.round(bSum / count);
      }
    }
  }
  return out;
}

/**
 * Trim transparent borders tightly around alpha > 16 and leave a 3% margin on all sides.
 */
async function trimWithMargin(rgba, width, height, marginRatio = 0.03) {
  let minX = width,
    minY = height,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = rgba[(y * width + x) * 4 + 3];
      if (a > 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) {
    return { rgba, width, height };
  }
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const pad = Math.max(2, Math.round(Math.max(cropW, cropH) * marginRatio));
  const cropped = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    rgba: cropped.data,
    width: cropped.info.width,
    height: cropped.info.height,
  };
}

/**
 * Punch declared windows [0..1] into transparency on a frame RGBA buffer.
 */
function punchDeclaredWindows(rgba, width, height, windows) {
  const out = Buffer.from(rgba);
  for (const w of windows) {
    const wx = w.x * width;
    const wy = w.y * height;
    const ww = w.w * width;
    const wh = w.h * height;
    const cx = wx + ww / 2;
    const cy = wy + wh / 2;
    const rx = ww / 2;
    const ry = wh / 2;
    const angle = ((w.rotation ?? 0) * Math.PI) / 180;
    const cosA = Math.cos(-angle);
    const sinA = Math.sin(-angle);
    const feather = Math.max(1.5, Math.min(ww, wh) * 0.008);

    const x0 = Math.max(0, Math.floor(cx - Math.hypot(rx, ry) - 2));
    const x1 = Math.min(width - 1, Math.ceil(cx + Math.hypot(rx, ry) + 2));
    const y0 = Math.max(0, Math.floor(cy - Math.hypot(rx, ry) - 2));
    const y1 = Math.min(height - 1, Math.ceil(cy + Math.hypot(rx, ry) + 2));

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const lx = dx * cosA - dy * sinA;
        const ly = dx * sinA + dy * cosA;

        let distInside = -1;
        if (w.shape === "ellipse") {
          const norm = Math.sqrt((lx * lx) / (rx * rx) + (ly * ly) / (ry * ry));
          distInside = (1 - norm) * Math.min(rx, ry);
        } else {
          distInside = Math.min(rx - Math.abs(lx), ry - Math.abs(ly));
        }

        if (distInside > 0) {
          const idx = (y * width + x) * 4;
          if (distInside >= feather) {
            out[idx] = 0;
            out[idx + 1] = 0;
            out[idx + 2] = 0;
            out[idx + 3] = 0;
          } else {
            const keepAlpha = Math.round((1 - distInside / feather) * out[idx + 3]);
            out[idx + 3] = Math.min(out[idx + 3], keepAlpha);
          }
        }
      }
    }
  }
  return out;
}

/**
 * Detect enclosed transparent windows inside a frame RGBA buffer.
 * Returns normalized FrameWindow[] ({ x, y, w, h, shape? }).
 */
function detectFrameWindows(rgba, width, height) {
  const isTransparent = (p) => rgba[p * 4 + 3] < 32;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);

  // 1. Mark exterior transparent pixels connected to the image boundary.
  let head = 0,
    tail = 0;
  const pushExterior = (x, y) => {
    const p = y * width + x;
    if (!visited[p] && isTransparent(p)) {
      visited[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < width; x++) {
    pushExterior(x, 0);
    pushExterior(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushExterior(0, y);
    pushExterior(width - 1, y);
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) pushExterior(x - 1, y);
    if (x + 1 < width) pushExterior(x + 1, y);
    if (y > 0) pushExterior(x, y - 1);
    if (y + 1 < height) pushExterior(x, y + 1);
  }

  // 2. Find interior connected components of transparent pixels.
  const minArea = Math.round(width * height * 0.015);
  const windows = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const start = y * width + x;
      if (visited[start] || !isTransparent(start)) continue;

      head = 0;
      tail = 0;
      visited[start] = 1;
      queue[tail++] = start;

      let minX = x,
        maxX = x,
        minY = y,
        maxY = y,
        area = 0;

      while (head < tail) {
        const p = queue[head++];
        area++;
        const px = p % width;
        const py = (p - px) / width;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;

        const neighbors = [
          [px - 1, py],
          [px + 1, py],
          [px, py - 1],
          [px, py + 1],
        ];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const np = ny * width + nx;
          if (!visited[np] && isTransparent(np)) {
            visited[np] = 1;
            queue[tail++] = np;
          }
        }
      }

      if (area >= minArea) {
        const bw = maxX - minX + 1;
        const bh = maxY - minY + 1;
        const fillRatio = area / (bw * bh);
        const round4 = (v) => Math.round(v * 10000) / 10000;
        const win = {
          x: round4(minX / width),
          y: round4(minY / height),
          w: round4(bw / width),
          h: round4(bh / height),
        };
        if (fillRatio >= 0.72 && fillRatio <= 0.84) {
          win.shape = "ellipse";
        }
        windows.push(win);
      }
    }
  }

  return windows.sort((a, b) => a.y - b.y || a.x - b.x);
}

/**
 * Check left/right and top/bottom edge continuity for tileable textures.
 */
function checkTextureTileSeams(rgba, width, height, where) {
  let lrDiff = 0;
  for (let y = 0; y < height; y++) {
    const l = (y * width + 0) * 4;
    const r = (y * width + (width - 1)) * 4;
    lrDiff += (Math.abs(rgba[l] - rgba[r]) + Math.abs(rgba[l + 1] - rgba[r + 1]) + Math.abs(rgba[l + 2] - rgba[r + 2])) / 3;
  }
  lrDiff /= height;

  let tbDiff = 0;
  for (let x = 0; x < width; x++) {
    const t = (0 * width + x) * 4;
    const b = ((height - 1) * width + x) * 4;
    tbDiff += (Math.abs(rgba[t] - rgba[b]) + Math.abs(rgba[t + 1] - rgba[b + 1]) + Math.abs(rgba[t + 2] - rgba[b + 2])) / 3;
  }
  tbDiff /= width;

  if (lrDiff > 32 || tbDiff > 32) {
    console.warn(`  ! ${where}: tile=true seam difference is high (L/R=${lrDiff.toFixed(1)}, T/B=${tbDiff.toFixed(1)})`);
  }
}

/**
 * Encode RGBA buffer into WebP under the given side & byte limits, stepping down quality if needed.
 */
async function encodeWebpWithinLimit(rgba, width, height, limit) {
  let curW = width;
  let curH = height;
  if (Math.max(curW, curH) > limit.side) {
    const scale = limit.side / Math.max(curW, curH);
    curW = Math.max(1, Math.round(curW * scale));
    curH = Math.max(1, Math.round(curH * scale));
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const resized = await sharp(rgba, { raw: { width, height, channels: 4 } })
      .resize(curW, curH, { fit: "fill" })
      .raw()
      .toBuffer();

    for (const quality of [88, 82, 76, 70, 64, 58, 52, 46, 40, 34]) {
      const buf = await sharp(resized, { raw: { width: curW, height: curH, channels: 4 } })
        .webp({ quality, alphaQuality: Math.min(90, quality + 8), effort: 5 })
        .toBuffer();
      if (buf.length <= limit.bytes || (quality === 34 && attempt === 2)) {
        return { buffer: buf, width: curW, height: curH, quality };
      }
    }
    curW = Math.max(1, Math.round(curW * 0.88));
    curH = Math.max(1, Math.round(curH * 0.88));
  }
  throw new Error("Failed to encode WebP within limit");
}

async function processPack(target, onlyId, force) {
  const [kind, pack] = target.split("/");
  if (!KINDS.includes(kind) || kind === "font" || !pack) {
    console.error(`Usage: node scripts/assets/process.mjs <sticker|frame|texture|overlay>/<pack> [--only <id>] [--force]`);
    process.exit(1);
  }

  const packDir = path.join(ASSETS, kind, pack);
  const manifestPath = path.join(packDir, "manifest.json");
  const srcDir = path.join(packDir, "src");
  if (!existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const outDir = path.join(PACKS, kind, pack);
  mkdirSync(outDir, { recursive: true });

  let processedCount = 0;
  let skippedCount = 0;

  for (const item of manifest.items ?? []) {
    if (onlyId && item.id !== onlyId) continue;
    const where = `${kind}/${pack}/${item.id}`;
    const srcFile = findSourceFile(srcDir, item.id);
    if (!srcFile) {
      console.error(`  ✗ ${where}: missing source file in ${srcDir}`);
      process.exitCode = 1;
      continue;
    }

    const relFiles = itemFiles(kind, pack, item.id);
    const outMain = path.join(PACKS, relFiles.file);
    const outThumb = path.join(PACKS, relFiles.thumb);

    if (!force && existsSync(outMain) && existsSync(outThumb) && item.width && item.height) {
      const srcMtime = statSync(srcFile).mtimeMs;
      const outMtime = Math.min(statSync(outMain).mtimeMs, statSync(outThumb).mtimeMs);
      if (outMtime >= srcMtime && (kind !== "frame" || item.windows?.length)) {
        skippedCount++;
        continue;
      }
    }

    // Load source image into RGBA, capped at 2048px before heavy processing for speed.
    const rawLoaded = await sharp(srcFile)
      .rotate()
      .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let rgba = rawLoaded.data;
    let width = rawLoaded.info.width;
    let height = rawLoaded.info.height;

    if (kind === "sticker") {
      const shouldRemoveBg = item.process?.removeBg !== false;
      const shouldTrim = item.process?.trim !== false;

      if (shouldRemoveBg && !hasMeaningfulAlpha(rgba, width, height)) {
        rgba = await removeBackgroundLocal(srcFile, rgba, width, height, item.process);
      }
      rgba = cleanStickerEdges(rgba, width, height);
      if (shouldTrim) {
        const trimmed = await trimWithMargin(rgba, width, height, 0.03);
        rgba = trimmed.rgba;
        width = trimmed.width;
        height = trimmed.height;
      }
    } else if (kind === "frame") {
      if (Array.isArray(item.windows) && item.windows.length > 0) {
        rgba = punchDeclaredWindows(rgba, width, height, item.windows);
      }
      if (item.process?.removeBg === true && !hasMeaningfulAlpha(rgba, width, height)) {
        rgba = floodFillPerimeterBg(rgba, width, height, item.process?.tolerance).out;
      }
      const detected = detectFrameWindows(rgba, width, height);
      if (!item.windows?.length && detected.length > 0) {
        item.windows = detected;
      } else if (!item.windows?.length) {
        console.warn(`  ! ${where}: no transparent windows detected; declare windows in manifest.json`);
      }
    } else if (kind === "texture") {
      if (item.tile) {
        checkTextureTileSeams(rgba, width, height, where);
      }
    }

    const encodedMain = await encodeWebpWithinLimit(rgba, width, height, LIMITS[kind]);
    writeFileSync(outMain, encodedMain.buffer);

    const encodedThumb = await encodeWebpWithinLimit(rgba, width, height, LIMITS.thumb);
    writeFileSync(outThumb, encodedThumb.buffer);

    item.width = encodedMain.width;
    item.height = encodedMain.height;
    processedCount++;
    console.log(
      `  ✓ ${where}: ${encodedMain.width}×${encodedMain.height} (${Math.round(encodedMain.buffer.length / 1000)} KB, thumb ${Math.round(encodedThumb.buffer.length / 1000)} KB)`
    );
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`${target}: ${processedCount} processed, ${skippedCount} up-to-date`);
}

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--"));
const force = args.includes("--force");
const onlyIdx = args.indexOf("--only");
const onlyId = onlyIdx !== -1 ? args[onlyIdx + 1] : null;

if (!target) {
  console.error("Usage: node scripts/assets/process.mjs <kind>/<pack> [--only <id>] [--force]");
  process.exit(1);
}

await processPack(target, onlyId, force);
