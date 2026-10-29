import { newId, type ImageAsset, type Music } from "../project/types";
import { ensureAac } from "./import";

// Background music (M13.4): any audio file the browser can read is converted on the
// device to AAC (M4A, ≤ 5 min) — small and one known format for playback and export.

const MAX_SECONDS = 300;
export const FADE_IN = 1;
export const FADE_OUT = 1.5;

export function isAudioFile(file: File) {
  return file.type.startsWith("audio/") || /\.(mp3|m4a|aac|wav|ogg|flac)$/i.test(file.name);
}

export async function importMusic(file: File, onProgress?: (p: number) => void): Promise<ImageAsset> {
  const mb = await import("mediabunny");
  await ensureAac(mb);
  const input = new mb.Input({ source: new mb.BlobSource(file), formats: mb.ALL_FORMATS });
  if (!(await input.getPrimaryAudioTrack())) throw new Error("no audio track");
  const duration = Math.min(await input.computeDuration(), MAX_SECONDS);
  const output = new mb.Output({ format: new mb.Mp4OutputFormat({ fastStart: "in-memory" }), target: new mb.BufferTarget() });
  const conversion = await mb.Conversion.init({
    input,
    output,
    trim: { start: 0, end: duration },
    video: { discard: true },
    audio: { codec: "aac", bitrate: 160_000 },
  });
  if (!conversion.isValid) throw new Error("conversion");
  conversion.onProgress = (p) => onProgress?.(p);
  await conversion.execute();
  const blob = new Blob([output.target.buffer!], { type: "audio/mp4" });
  return { id: newId(), blob, url: URL.createObjectURL(blob), width: 0, height: 0, name: file.name, audio: { duration } };
}

export function defaultMusic(assetId: string): Music {
  return { assetId, start: 0, volume: 0.8, fadeIn: true, fadeOut: true };
}

/** Music volume at project time `t` of a piece lasting `total` seconds (fades). */
export function musicGain(m: Music, t: number, total: number) {
  let g = m.volume;
  if (m.fadeIn && t < FADE_IN) g *= Math.max(0, t / FADE_IN);
  if (m.fadeOut && t > total - FADE_OUT) g *= Math.max(0, (total - t) / FADE_OUT);
  return g;
}
