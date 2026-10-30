// Moving prints (D-163): every cell plays the clip around its shot, all cells together, the
// shutters lined up so everyone "clicks" at the same moment. Two ways to play:
// - loop: the clip, with the photo itself held for a moment at the shutter (like a Live Photo);
// - boomerang: forward then backward, no hold, so the end meets the start smoothly.

export type LiveMode = "loop" | "boomerang";

/** Frames a second the clips are taken at. */
export const CLIP_FPS = 12;
/** Seconds of camera kept before and after the shutter. */
export const CLIP_PRE = 1.5;
export const CLIP_POST = 1.5;
/** Clip frames the photo is held at the shutter (loop). */
export const HOLD = 6;
/** One play of a cell: a clip frame index, or STILL = the photo. */
export const STILL = -1;

/** Times the cycle repeats in a saved video. */
export const LIVE_REPEATS: Record<LiveMode, number> = { loop: 3, boomerang: 2 };

const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);

/** Each cell's steps, all the same length (`length`), shutters at the same step. Cells
 * without a clip get null (they show their photo). */
export function liveSequences(clips: ({ frames: number; shutter: number } | null | undefined)[], mode: LiveMode): { length: number; seqs: (number[] | null)[] } {
  const real = clips.filter((c): c is { frames: number; shutter: number } => !!c && c.frames > 0);
  if (!real.length) return { length: 0, seqs: clips.map(() => null) };
  const pre = Math.max(...real.map((c) => c.shutter));
  const post = Math.max(...real.map((c) => c.frames - c.shutter));
  const seqs = clips.map((c) => {
    if (!c || c.frames <= 0) return null;
    // Shorter clips wait on their first frame / stay on their last one.
    const before = [...Array<number>(pre - c.shutter).fill(0), ...range(0, c.shutter)];
    const after = range(c.shutter, c.frames);
    while (after.length < post) after.push(c.frames - 1);
    if (mode === "loop") return [...before, ...Array<number>(HOLD).fill(STILL), ...after];
    const forward = [...before, ...after];
    return [...forward, ...forward.slice(1, -1).reverse()];
  });
  return { length: seqs.find((s) => s)!.length, seqs };
}
