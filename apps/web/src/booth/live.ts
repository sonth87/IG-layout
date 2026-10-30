import { useEffect, useMemo, useRef } from "react";
import { LIVE_REPEATS, STILL, liveSequences, type LiveMode } from "@ig-layout/core/booth/live";
import { renderFrame, type RenderOptions, type ShotImage } from "@ig-layout/core/booth/render";
import type { BoothFrame } from "@ig-layout/core/booth/frames";
import { filterById } from "@ig-layout/core/color/filters";
import { NO_ADJUST, shaderParams } from "@ig-layout/core/color/params";
import { processFrame } from "@ig-layout/core/color/processor";
import type { BoothClip, BoothRoll } from "@ig-layout/core/storage/booth";
import { backdropCanvas, drawOnSheet, loadThemeFonts, rollFilter, rollRender, type Format } from "./look";

// Moving prints (D-163): the print with each cell playing the clip around its shot — on the
// result screen, and saved as an MP4 (loop with the photo held at the shutter, or boomerang).
// Clip frames are decoded as they're needed, a handful at a time, never the whole roll at
// once (a phone's memory); the roll's filter is applied to each the way IG Layout does video.

/** Output frames a second; each clip frame shows for two. */
const VIDEO_FPS = 24;
const BITRATE = 6_000_000;

/** The roll has clips to play. */
export const hasClips = (roll: Pick<BoothRoll, "clips">) => !!roll.clips?.some((c) => c && c.frames.length);

/** Draws one step of the moving print: decodes the cells' frames for `step`, filtered. */
function painter(roll: BoothRoll, mode: LiveMode) {
  const clips = roll.clips ?? [];
  const { length, seqs } = liveSequences(
    clips.map((c) => (c ? { frames: c.frames.length, shutter: c.shutter } : null)),
    mode,
  );
  const f = rollFilter(roll);
  const preset = f ? filterById(f)?.preset : undefined;
  const params = preset ? shaderParams(NO_ADJUST, preset, 100) : null;
  // One canvas per cell for the decoded frame, one for its filtered copy (reused every step).
  const raw = clips.map(() => document.createElement("canvas"));
  const out = clips.map(() => document.createElement("canvas"));

  async function frameAt(clip: BoothClip, i: number, cell: number): Promise<ShotImage | null> {
    const bmp = await createImageBitmap(clip.frames[i]).catch(() => null);
    if (!bmp) return null;
    const c = raw[cell];
    c.width = bmp.width;
    c.height = bmp.height;
    c.getContext("2d")!.drawImage(bmp, 0, 0);
    bmp.close();
    const done = params ? processFrame(c, params, 2048, out[cell]) : null;
    const src = done ?? c;
    return { source: src, width: src.width, height: src.height };
  }

  /** Shot `cell` at `step` (its still where it has no clip, or holds its photo). */
  async function one(still: ShotImage | null, cell: number, step: number) {
    const seq = seqs[cell];
    const clip = clips[cell];
    if (!seq || !clip) return still;
    const i = seq[step % length];
    return i === STILL ? still : ((await frameAt(clip, i, cell)) ?? still);
  }

  /** The shots for `step`. */
  const shots = (stills: (ShotImage | null)[], step: number) => Promise.all(stills.map((still, cell) => one(still, cell, step)));

  const fps = clips.find((c) => c)?.fps ?? 12;
  return { length, fps, shots, one };
}

/** Plays the moving print on `canvas` (null: not playing). */
export function useLivePlayer(canvas: React.RefObject<HTMLCanvasElement | null>, opts: { roll: BoothRoll; frame: BoothFrame; stills: (ShotImage | null)[] | null; look: RenderOptions; scale: number; mode: LiveMode; on: boolean }) {
  const { roll, frame, stills, look, scale, mode, on } = opts;
  const paint = useMemo(() => (on ? painter(roll, mode) : null), [on, roll, mode]);
  const latest = useRef({ frame, stills, look, scale });
  useEffect(() => {
    latest.current = { frame, stills, look, scale };
  });
  useEffect(() => {
    const el = canvas.current;
    if (!paint || !el || !paint.length) return;
    let gone = false;
    let step = 0;
    void loadThemeFonts(roll.theme);
    (async () => {
      while (!gone) {
        const t0 = performance.now();
        const { frame, stills, look, scale } = latest.current;
        if (stills) {
          const shots = await paint.shots(stills, step);
          if (gone) break;
          renderFrame(el, frame, shots, { ...look, scale });
        }
        step = (step + 1) % paint.length;
        await new Promise((r) => setTimeout(r, Math.max(0, 1000 / paint.fps - (performance.now() - t0))));
      }
    })();
    return () => {
      gone = true;
    };
  }, [paint, canvas, roll.theme]);
}

/** Draws the moving print step by step onto one canvas in `format` (the print, or on an
 * Instagram-sized sheet), its long side at most `maxSide`. */
async function stepper(roll: BoothRoll, format: Format, mode: LiveMode, maxSide = Infinity) {
  const { frame, images, opts } = await rollRender(roll);
  await loadThemeFonts(roll.theme);
  const paint = painter(roll, mode);
  const print = document.createElement("canvas");
  const sheet = format === "print" ? null : backdropCanvas(opts.theme!, format);
  const W = sheet?.width ?? frame.width;
  const H = sheet?.height ?? frame.height;
  const k = Math.min(1, maxSide / Math.max(W, H));
  // Even sizes (H.264 wants them).
  const out = document.createElement("canvas");
  out.width = Math.round((W * k) / 2) * 2;
  out.height = Math.round((H * k) / 2) * 2;
  const c = out.getContext("2d", { willReadFrequently: maxSide < Infinity })!;
  return {
    out,
    length: paint.length,
    fps: paint.fps,
    async draw(step: number) {
      renderFrame(print, frame, await paint.shots(images, step), opts);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, out.width, out.height);
      if (!sheet) c.drawImage(print, 0, 0, out.width, out.height);
      else {
        c.scale(out.width / W, out.height / H);
        c.drawImage(sheet, 0, 0);
        drawOnSheet(c, print, format as "post" | "story");
      }
    },
    dispose() {
      print.width = print.height = out.width = out.height = 0;
    },
  };
}

/** Encodes `canvas` as an MP4: `steps` pictures at the clips' rate, `repeats` times, each
 * drawn by `draw(step)` just before it's needed. */
async function encode(canvas: HTMLCanvasElement, steps: number, fps: number, repeats: number, draw: (step: number) => Promise<void>, onProgress?: (p: number) => void, container: "mp4" | "mov" = "mp4") {
  const mb = await import("mediabunny");
  // MOV (Live Photo trial): the movie box last, so metadata can be added without moving data.
  const format = container === "mov" ? new mb.MovOutputFormat({ fastStart: false }) : new mb.Mp4OutputFormat({ fastStart: "in-memory" });
  const output = new mb.Output({ format, target: new mb.BufferTarget() });
  const source = new mb.CanvasSource(canvas, { codec: "avc", bitrate: BITRATE, keyFrameInterval: 2 });
  output.addVideoTrack(source, { frameRate: VIDEO_FPS });
  await output.start();
  const per = VIDEO_FPS / fps;
  const total = Math.round(steps * repeats * per);
  let drawn = -1;
  for (let k = 0; k < total; k++) {
    const step = Math.floor(k / per) % steps;
    if (step !== drawn) await draw((drawn = step));
    await source.add(k / VIDEO_FPS, 1 / VIDEO_FPS);
    onProgress?.((k + 1) / total);
  }
  source.close();
  await output.finalize();
  return { blob: new Blob([output.target.buffer!], { type: container === "mov" ? "video/quicktime" : "video/mp4" }), duration: total / VIDEO_FPS };
}

/** The moving print as an MP4. */
export async function liveVideo(roll: BoothRoll, format: Format, mode: LiveMode, onProgress?: (p: number) => void, repeats = LIVE_REPEATS[mode]): Promise<Blob> {
  const st = await stepper(roll, format, mode);
  const { blob } = await encode(st.out, st.length, st.fps, repeats, st.draw, onProgress);
  st.dispose();
  return blob;
}

/** The moving print alone, one cycle, as an MP4 with its length (for IG Layout, which loops it). */
export async function printVideo(roll: BoothRoll, mode: LiveMode, container: "mp4" | "mov" = "mp4") {
  const st = await stepper(roll, "print", mode);
  const res = await encode(st.out, st.length, st.fps, 1, st.draw, undefined, container);
  const size = { width: st.out.width, height: st.out.height };
  st.dispose();
  return { ...res, ...size };
}

/** Seconds into a cycle where the shutter is (the photo of a Live / Motion Photo). */
export function shutterSeconds(roll: BoothRoll, mode: LiveMode) {
  const clips = roll.clips ?? [];
  const { seqs } = liveSequences(
    clips.map((c) => (c ? { frames: c.frames.length, shutter: c.shutter } : null)),
    mode,
  );
  const seq = seqs.find((x) => x);
  const fps = clips.find((c) => c)?.fps ?? 12;
  return seq ? Math.max(0, seq.indexOf(STILL)) / fps : 0;
}

/** One shot's clip as an MP4 the size of the shot (long side ≤ 1080), filtered and flipped
 * like the print; one cycle (IG Layout loops it). */
export async function clipVideo(roll: BoothRoll, cell: number, mode: LiveMode, container: "mp4" | "mov" = "mp4") {
  const { images } = await rollRender(roll);
  const still = images[cell];
  if (!still) throw new Error("no shot");
  const paint = painter(roll, mode);
  const k = Math.min(1, 1080 / Math.max(still.width, still.height));
  const out = document.createElement("canvas");
  out.width = Math.round((still.width * k) / 2) * 2;
  out.height = Math.round((still.height * k) / 2) * 2;
  const c = out.getContext("2d")!;
  const res = await encode(out, paint.length, paint.fps, 1, async (step) => {
    const img = (await paint.one(still, cell, step)) ?? still;
    c.save();
    if (roll.flip) {
      c.translate(out.width, 0);
      c.scale(-1, 1);
    }
    c.drawImage(img.source, 0, 0, out.width, out.height);
    c.restore();
  }, undefined, container);
  const size = { width: out.width, height: out.height };
  out.width = out.height = 0;
  return { ...res, ...size };
}

/** Long side of a GIF: small enough to send in a chat. */
const GIF_SIDE = 720;

/** The moving print as a looping GIF (one cycle, it loops by itself). */
export async function liveGif(roll: BoothRoll, format: Format, mode: LiveMode, onProgress?: (p: number) => void): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const st = await stepper(roll, format, mode, GIF_SIDE);
  const gif = GIFEncoder();
  const { width, height } = st.out;
  const c = st.out.getContext("2d")!;
  // GIF delays are in hundredths of a second.
  const delay = Math.round(1000 / st.fps / 10) * 10;
  for (let step = 0; step < st.length; step++) {
    await st.draw(step);
    const rgba = c.getImageData(0, 0, width, height).data;
    const palette = quantize(rgba, 256);
    gif.writeFrame(applyPalette(rgba, palette), width, height, { palette, delay });
    onProgress?.((step + 1) / st.length);
    // Let the page breathe (the progress shows).
    await new Promise((r) => setTimeout(r, 0));
  }
  gif.finish();
  st.dispose();
  return new Blob([gif.bytes()], { type: "image/gif" });
}
