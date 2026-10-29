import { zipSync } from "fflate";

// Ways to hand exported images to the user (docs/user/features.md, mục 13).
// Mobile: OS share sheet ("Save N images"). Desktop / fallback: ZIP or one by one.

export function canShareFiles(files: File[]) {
  return typeof navigator !== "undefined" && !!navigator.canShare?.({ files });
}

/** Returns false if the user cancelled the share sheet. */
export async function shareFiles(files: File[]) {
  try {
    await navigator.share({ files });
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return false;
    throw err;
  }
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function downloadZip(files: File[], zipName: string) {
  const entries: Record<string, Uint8Array> = {};
  for (const f of files) entries[f.name] = new Uint8Array(await f.arrayBuffer());
  // JPEGs are already compressed: store without deflate.
  const zipped = zipSync(entries, { level: 0 });
  download(new Blob([zipped.buffer as ArrayBuffer], { type: "application/zip" }), zipName);
}

export async function downloadEach(files: File[]) {
  for (const f of files) {
    download(f, f.name);
    // Browsers may block rapid consecutive downloads.
    await new Promise((r) => setTimeout(r, 400));
  }
}
