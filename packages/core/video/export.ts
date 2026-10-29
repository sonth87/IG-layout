import type Konva from "konva";
import { layerRegion } from "../export/slices";
import { rotatedBounds } from "../project/geometry";
import { slideRect } from "../project/layout";
import { type ImageAsset, type ImageElement, type MediaSettings, type Music, type ProjectDoc, type Rect, slideSize } from "../project/types";
import { musicGain } from "./music";
import { applyMotion, clearMotion, hasMotion, motionDuration } from "../motion/motion";
import { frameOverrides } from "./frames";
import { ensureAac } from "./import";
import { defaultMedia, isAudible, sourceTime, timelineLength } from "./playback";

// Exporting a slide that contains video (M13.1): an MP4 (H.264 + AAC), the size of the
// slide, as long as the longest video part on it (others loop). Frames are rendered
// from exactly decoded video frames (not the live players), so the file is the same on
// every device. Sound: the videos' own audio, mixed with their volumes (unless muted or
// "export without sound").

export const VIDEO_FPS = 30;
const VIDEO_BITRATE = 8_000_000;
const AUDIO_RATE = 48_000;

interface SlideVideo {
  el: ImageElement;
  asset: ImageAsset;
  media: MediaSettings;
}

const intersects = (a: Rect, b: Rect) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

/** Video elements drawn on slide `index`. */
export function slideVideos(doc: ProjectDoc, index: number, assets: Record<string, ImageAsset>): SlideVideo[] {
  const r = slideRect(doc, index);
  return doc.elements.flatMap((el) => {
    if (el.type !== "image" || el.hidden || !el.assetId) return [];
    const asset = assets[el.assetId];
    if (!asset?.video || !intersects(rotatedBounds(el), r)) return [];
    return [{ el, asset, media: el.media ?? defaultMedia(asset.video.duration) }];
  });
}

const partLength = timelineLength;

/** Places the background music on `ctx`: from `music.start`, `offset` seconds into the piece, with fades. */
export async function addMusic(mb: typeof import("mediabunny"), ctx: OfflineAudioContext, music: Music, asset: ImageAsset, offset: number, total: number) {
  const input = new mb.Input({ source: new mb.BlobSource(asset.blob), formats: mb.ALL_FORMATS });
  const track = await input.getPrimaryAudioTrack();
  if (!track) return;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  // Volume envelope (fades) sampled every 0.1 s.
  for (let t = 0; t <= ctx.length / ctx.sampleRate + 0.1; t += 0.1) gain.gain.setValueAtTime(musicGain(music, offset + t, total), t);
  const trackLen = Math.max(0.1, (asset.audio?.duration ?? 0) - music.start);
  const span = ctx.length / ctx.sampleRate;
  const chunks: { buffer: AudioBuffer; at: number }[] = [];
  for await (const { buffer, timestamp } of new mb.AudioBufferSink(track).buffers(music.start, music.start + Math.min(trackLen, span + offset + 1))) {
    chunks.push({ buffer, at: timestamp - music.start });
  }
  // Loops when the track is shorter than the piece.
  for (let loop = 0; loop * trackLen < offset + span; loop++) {
    for (const { buffer, at } of chunks) {
      const when = loop * trackLen + at - offset;
      if (when + buffer.duration <= 0 || when >= span) continue;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(gain);
      src.start(Math.max(0, when), Math.max(0, -when));
    }
  }
}

/** Mixes the sound of the slide's videos (+ music) over `duration` seconds (null if silent). */
async function mixAudio(mb: typeof import("mediabunny"), videos: SlideVideo[], duration: number, music?: { music: Music; asset: ImageAsset }) {
  const audible = videos.filter((v) => v.asset.video?.hasAudio && isAudible(v.media));
  if (audible.length === 0 && !music) return null;
  const ctx = new OfflineAudioContext(2, Math.ceil(duration * AUDIO_RATE), AUDIO_RATE);
  if (music) await addMusic(mb, ctx, music.music, music.asset, 0, duration);
  for (const v of audible) {
    const input = new mb.Input({ source: new mb.BlobSource(v.asset.blob), formats: mb.ALL_FORMATS });
    const track = await input.getPrimaryAudioTrack();
    if (!track) continue;
    const gain = ctx.createGain();
    gain.gain.value = v.media.volume;
    gain.connect(ctx.destination);
    const len = partLength(v.media);
    const chunks: { buffer: AudioBuffer; at: number }[] = [];
    for await (const { buffer, timestamp } of new mb.AudioBufferSink(track).buffers(v.media.start, v.media.end)) {
      chunks.push({ buffer, at: timestamp - v.media.start });
    }
    // Loop the part until the slide ends, like the picture (once when not looping).
    for (let offset = 0; offset < (v.media.loop === false ? Math.min(len, duration) : duration); offset += len) {
      for (const { buffer, at } of chunks) {
        const when = offset + at;
        if (when >= duration || at >= len) continue;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(gain);
        src.start(Math.max(0, when), Math.max(0, -when), Math.min(buffer.duration, len - at, duration - when));
      }
    }
  }
  return ctx.startRendering();
}

/**
 * Renders slide `index` to an MP4. `onProgress` gets 0..1.
 * The caller has drawn the layer at full quality (exporting mode).
 */
export async function exportVideoSlide(opts: {
  layer: Konva.Layer;
  doc: ProjectDoc;
  index: number;
  viewScale: number;
  assets: Record<string, ImageAsset>;
  withAudio: boolean;
  onProgress?: (p: number) => void;
}): Promise<Blob> {
  const { layer, doc, index, viewScale, assets, withAudio, onProgress } = opts;
  const mb = await import("mediabunny");
  const videos = slideVideos(doc, index, assets);
  // Video slides last as long as their longest video; animation-only slides: the animation length.
  const duration = videos.length ? Math.max(...videos.map((v) => partLength(v.media))) : motionDuration(doc);
  const animated = doc.elements.some(hasMotion);
  const frames = Math.max(1, Math.round(duration * VIDEO_FPS));
  const r = slideRect(doc, index);
  const width = Math.round(r.width);
  const height = Math.round(r.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";

  const output = new mb.Output({ format: new mb.Mp4OutputFormat({ fastStart: "in-memory" }), target: new mb.BufferTarget() });
  const videoSource = new mb.CanvasSource(canvas, { codec: "avc", bitrate: VIDEO_BITRATE, keyFrameInterval: 2 });
  output.addVideoTrack(videoSource, { frameRate: VIDEO_FPS });
  const musicAsset = doc.music && assets[doc.music.assetId];
  const music = doc.music && musicAsset?.audio ? { music: doc.music, asset: musicAsset } : undefined;
  const audio = withAudio ? await mixAudio(mb, videos, duration, music) : null;
  let audioSource: InstanceType<typeof mb.AudioBufferSource> | null = null;
  if (audio) {
    await ensureAac(mb);
    audioSource = new mb.AudioBufferSource({ codec: "aac", bitrate: 160_000 });
    output.addAudioTrack(audioSource);
  }
  await output.start();
  if (audioSource && audio) await audioSource.add(audio);

  // One decoder per video, asked for the frame of each output timestamp (loops inside its part).
  const streams = await Promise.all(
    videos.map(async (v) => {
      const input = new mb.Input({ source: new mb.BlobSource(v.asset.blob), formats: mb.ALL_FORMATS });
      const track = (await input.getPrimaryVideoTrack())!;
      const times = Array.from({ length: frames }, (_, i) => sourceTime(v.media, i / VIDEO_FPS));
      return { id: v.el.id, it: new mb.CanvasSink(track, { poolSize: 2 }).canvasesAtTimestamps(times)[Symbol.asyncIterator]() };
    }),
  );

  try {
    for (let i = 0; i < frames; i++) {
      for (const s of streams) {
        const next = await s.it.next();
        if (!next.done && next.value) frameOverrides.set(s.id, next.value.canvas);
      }
      if (animated) applyMotion(layer, doc, i / VIDEO_FPS, () => duration, slideSize(doc.ratio));
      const rendered = layer.toCanvas({ ...layerRegion(layer, r, viewScale), pixelRatio: 1 / viewScale });
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(rendered, 0, 0, width, height);
      rendered.width = rendered.height = 0;
      await videoSource.add(i / VIDEO_FPS, 1 / VIDEO_FPS);
      onProgress?.((i + 1) / frames);
    }
    videoSource.close();
    audioSource?.close();
    await output.finalize();
  } finally {
    if (animated) clearMotion(layer, doc);
    for (const s of streams) {
      frameOverrides.delete(s.id);
      await s.it.return?.();
    }
    canvas.width = canvas.height = 0;
  }
  return new Blob([output.target.buffer!], { type: "video/mp4" });
}
