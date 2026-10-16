import { newId, type ImageAsset } from "@/lib/project/types";

// Video import (M13.1, D-80): every video is re-encoded on the device to at most 1080p,
// 30 fps, 60 s (Instagram's carousel video limit), H.264 + AAC — keeps IndexedDB small
// and gives one known format for playback and export. Mediabunny (MPL-2.0) is loaded
// only when a video is chosen.

export const MAX_VIDEO_SECONDS = 60;
const MAX_SIDE = 1920;
const FPS = 30;
const VIDEO_BITRATE = 4_000_000;
const AUDIO_BITRATE = 128_000;

export function isVideoFile(file: File) {
  return file.type.startsWith("video/") || /\.(mov|mp4|m4v|webm|3gp)$/i.test(file.name);
}

type Mediabunny = typeof import("mediabunny");
let aacReady: Promise<void> | null = null;

/** AAC encoding: the browser's own encoder, else the WASM fallback (@mediabunny/aac-encoder). */
export function ensureAac(mb: Mediabunny) {
  aacReady ??= (async () => {
    if (await mb.canEncodeAudio("aac")) return;
    const { registerAacEncoder } = await import("@mediabunny/aac-encoder");
    registerAacEncoder();
  })();
  return aacReady;
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

/** First frame as a JPEG (thumbnails, crop tool, previews). */
async function poster(mb: Mediabunny, blob: Blob) {
  const input = new mb.Input({ source: new mb.BlobSource(blob), formats: mb.ALL_FORMATS });
  const track = await input.getPrimaryVideoTrack();
  const frame = track ? await new mb.CanvasSink(track).getCanvas(await track.getFirstTimestamp()) : null;
  if (!frame) throw new Error("poster");
  const canvas = frame.canvas;
  if ("convertToBlob" in canvas) return canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
  return new Promise<Blob>((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error("poster"))), "image/jpeg", 0.85));
}

/**
 * Compresses `file` and returns it as an asset (kind video). `onProgress` gets 0..1.
 * Throws when the browser cannot read the file.
 */
export async function importVideo(file: File, onProgress?: (p: number) => void): Promise<ImageAsset> {
  const mb = await import("mediabunny");
  const input = new mb.Input({ source: new mb.BlobSource(file), formats: mb.ALL_FORMATS });
  const vt = await input.getPrimaryVideoTrack();
  if (!vt) throw new Error("no video track");
  const at = await input.getPrimaryAudioTrack();
  if (at) await ensureAac(mb);
  const duration = Math.min(await input.computeDuration(), MAX_VIDEO_SECONDS);
  const k = Math.min(1, MAX_SIDE / Math.max(vt.displayWidth, vt.displayHeight));
  const width = even(vt.displayWidth * k);
  const height = even(vt.displayHeight * k);

  const output = new mb.Output({ format: new mb.Mp4OutputFormat({ fastStart: "in-memory" }), target: new mb.BufferTarget() });
  const conversion = await mb.Conversion.init({
    input,
    output,
    trim: { start: 0, end: duration },
    video: { width, height, fit: "fill", frameRate: FPS, codec: "avc", bitrate: VIDEO_BITRATE, forceTranscode: true },
    audio: { codec: "aac", bitrate: AUDIO_BITRATE },
  });
  if (!conversion.isValid) throw new Error(conversion.discardedTracks.map((d) => d.reason).join(", ") || "conversion");
  conversion.onProgress = (p) => onProgress?.(p);
  await conversion.execute();
  const hasAudio = !!at && !conversion.discardedTracks.some((d) => d.track.type === "audio");

  const blob = new Blob([output.target.buffer!], { type: "video/mp4" });
  const cover = await poster(mb, blob);
  return {
    id: newId(),
    blob,
    url: URL.createObjectURL(blob),
    width,
    height,
    name: file.name,
    video: { duration, hasAudio, poster: cover, posterUrl: URL.createObjectURL(cover) },
  };
}
