import type Konva from "konva";
import { layerRegion } from "@/lib/export/slices";
import { applyMotion, clearMotion, hasMotion, motionDuration } from "@/lib/motion/motion";
import { slideOfElement, slideRect } from "@/lib/project/layout";
import { type ImageAsset, type ProjectDoc, slideSize } from "@/lib/project/types";
import { addMusic, VIDEO_FPS } from "./export";
import { frameOverrides } from "./frames";
import { ensureAac } from "./import";
import { defaultMedia, isAudible, sourceTime, timelineLength } from "./playback";

// The whole carousel as one vertical video (M13.4, for Reels / Story / TikTok): slides
// one after another, each as long as its video / animation (stills 2.5 s), with a swipe
// to the next one — the same strip moving sideways, so seamless carousels stay seamless.

export const REEL_WIDTH = 1080;
export const REEL_HEIGHT = 1920;
const STILL = 2.5;
const SWIPE = 0.6;
const AUDIO_RATE = 48_000;

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);

interface Plan {
  holds: number[];
  starts: number[];
  total: number;
}

/** How long each slide shows, and when it starts. */
export function reelPlan(doc: ProjectDoc, assets: Record<string, ImageAsset>): Plan {
  const holds = Array.from({ length: doc.slideCount }, () => 0);
  for (const el of doc.elements) {
    if (el.hidden) continue;
    const i = slideOfElement(doc, el);
    const asset = el.type === "image" && el.assetId ? assets[el.assetId] : undefined;
    if (asset?.video) holds[i] = Math.max(holds[i], timelineLength((el.type === "image" && el.media) || defaultMedia(asset.video.duration)));
  }
  for (let i = 0; i < holds.length; i++) {
    if (holds[i] > 0) continue;
    const animated = doc.elements.some((el) => !el.hidden && hasMotion(el) && slideOfElement(doc, el) === i);
    holds[i] = animated ? motionDuration(doc) : STILL;
  }
  const starts: number[] = [];
  let t = 0;
  for (const h of holds) {
    starts.push(t);
    t += h + SWIPE;
  }
  return { holds, starts, total: t - SWIPE };
}

/** Where the camera is at time `t`: slide index, swipe progress to the next (0 = holding). */
function at(plan: Plan, t: number) {
  let i = 0;
  while (i < plan.starts.length - 1 && t >= plan.starts[i + 1]) i++;
  const local = t - plan.starts[i];
  const swipe = i < plan.holds.length - 1 ? Math.max(0, (local - plan.holds[i]) / SWIPE) : 0;
  return { i, local: Math.min(local, plan.holds[i]), swipe: Math.min(1, swipe) };
}

export async function exportReel(opts: {
  layer: Konva.Layer;
  doc: ProjectDoc;
  viewScale: number;
  assets: Record<string, ImageAsset>;
  withAudio: boolean;
  onProgress?: (p: number) => void;
}): Promise<Blob> {
  const { layer, doc, viewScale, assets, withAudio, onProgress } = opts;
  const mb = await import("mediabunny");
  const plan = reelPlan(doc, assets);
  const frames = Math.max(1, Math.round(plan.total * VIDEO_FPS));
  const slide = slideSize(doc.ratio);
  const scale = REEL_WIDTH / slide.width;
  const drawH = slide.height * scale;
  const top = (REEL_HEIGHT - drawH) / 2;
  const bg = doc.background.kind === "color" ? doc.background.color : doc.background.kind === "gradient" ? doc.background.from : "#111111";
  /** Local time of slide `index` at reel time t (0 before it starts, frozen after it ends). */
  const timeOf = (t: number) => (index: number) => Math.max(0, Math.min(t - plan.starts[index], plan.holds[index]));

  const canvas = document.createElement("canvas");
  canvas.width = REEL_WIDTH;
  canvas.height = REEL_HEIGHT;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";

  const output = new mb.Output({ format: new mb.Mp4OutputFormat({ fastStart: "in-memory" }), target: new mb.BufferTarget() });
  const videoSource = new mb.CanvasSource(canvas, { codec: "avc", bitrate: 10_000_000, keyFrameInterval: 2 });
  output.addVideoTrack(videoSource, { frameRate: VIDEO_FPS });

  // Sound: each slide's videos where that slide plays, plus the music over everything.
  let audio: AudioBuffer | null = null;
  if (withAudio) {
    const ac = new OfflineAudioContext(2, Math.ceil(plan.total * AUDIO_RATE), AUDIO_RATE);
    let any = false;
    for (const el of doc.elements) {
      if (el.type !== "image" || el.hidden || !el.assetId) continue;
      const asset = assets[el.assetId];
      const media = el.media ?? (asset?.video ? defaultMedia(asset.video.duration) : undefined);
      if (!asset?.video?.hasAudio || !media || !isAudible(media)) continue;
      const i = slideOfElement(doc, el);
      const input = new mb.Input({ source: new mb.BlobSource(asset.blob), formats: mb.ALL_FORMATS });
      const track = await input.getPrimaryAudioTrack();
      if (!track) continue;
      const gain = ac.createGain();
      gain.gain.value = media.volume;
      gain.connect(ac.destination);
      const len = timelineLength(media);
      for await (const { buffer, timestamp } of new mb.AudioBufferSink(track).buffers(media.start, media.end)) {
        for (let off = 0; off < plan.holds[i]; off += len) {
          const when = plan.starts[i] + off + (timestamp - media.start);
          if (when >= plan.starts[i] + plan.holds[i]) continue;
          const src = ac.createBufferSource();
          src.buffer = buffer;
          src.connect(gain);
          src.start(when, 0, Math.min(buffer.duration, plan.starts[i] + plan.holds[i] - when));
          if (media.loop === false) break;
        }
      }
      any = true;
    }
    const musicAsset = doc.music && assets[doc.music.assetId];
    if (doc.music && musicAsset?.audio) {
      await addMusic(mb, ac, doc.music, musicAsset, 0, plan.total);
      any = true;
    }
    if (any) audio = await ac.startRendering();
  }
  let audioSource: InstanceType<typeof mb.AudioBufferSource> | null = null;
  if (audio) {
    await ensureAac(mb);
    audioSource = new mb.AudioBufferSource({ codec: "aac", bitrate: 160_000 });
    output.addAudioTrack(audioSource);
  }
  await output.start();
  if (audioSource && audio) await audioSource.add(audio);

  // Decoded frames for every video, at the time its slide is at in each reel frame.
  const streams = await Promise.all(
    doc.elements.flatMap((el) => {
      if (el.type !== "image" || el.hidden || !el.assetId || !assets[el.assetId]?.video) return [];
      const asset = assets[el.assetId];
      const media = el.media ?? defaultMedia(asset.video!.duration);
      const i = slideOfElement(doc, el);
      return [
        (async () => {
          const input = new mb.Input({ source: new mb.BlobSource(asset.blob), formats: mb.ALL_FORMATS });
          const track = (await input.getPrimaryVideoTrack())!;
          const times = Array.from({ length: frames }, (_, f) => sourceTime(media, timeOf(f / VIDEO_FPS)(i)));
          return { id: el.id, it: new mb.CanvasSink(track, { poolSize: 2 }).canvasesAtTimestamps(times)[Symbol.asyncIterator]() };
        })(),
      ];
    }),
  );

  try {
    for (let f = 0; f < frames; f++) {
      const t = f / VIDEO_FPS;
      for (const s of streams) {
        const next = await s.it.next();
        if (!next.done && next.value) frameOverrides.set(s.id, next.value.canvas);
      }
      applyMotion(layer, doc, timeOf(t), (i) => plan.holds[i], slide);
      // Camera: the slide in view, sliding to the next during a swipe.
      const { i, swipe } = at(plan, t);
      const from = slideRect(doc, i);
      const to = slideRect(doc, Math.min(i + 1, doc.slideCount - 1));
      const p = ease(swipe);
      const view = { x: from.x + (to.x - from.x) * p, y: from.y + (to.y - from.y) * p, width: from.width, height: from.height };
      const rendered = layer.toCanvas({ ...layerRegion(layer, view, viewScale), pixelRatio: 1 / viewScale });
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, REEL_WIDTH, REEL_HEIGHT);
      ctx.drawImage(rendered, 0, top, REEL_WIDTH, drawH);
      rendered.width = rendered.height = 0;
      await videoSource.add(t, 1 / VIDEO_FPS);
      onProgress?.((f + 1) / frames);
    }
    videoSource.close();
    audioSource?.close();
    await output.finalize();
  } finally {
    clearMotion(layer, doc);
    for (const s of streams) {
      frameOverrides.delete(s.id);
      await s.it.return?.();
    }
    canvas.width = canvas.height = 0;
  }
  return new Blob([output.target.buffer!], { type: "video/mp4" });
}
