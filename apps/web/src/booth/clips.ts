import { CLIP_FPS, CLIP_POST, CLIP_PRE } from "@ig-layout/core/booth/live";
import type { BoothClip } from "@ig-layout/core/storage/booth";

// Clips around each shot (D-163): while shooting, the camera is copied into small JPEG frames
// all the time, the last CLIP_PRE seconds kept; a shot marks the moment and the clip is done
// CLIP_POST seconds later. Nothing for the person to do. Frames are the whole camera picture,
// not mirrored, like the shot — the print crops both the same way.

/** Long side of a clip frame. */
const SIDE = 480;
const PRE = Math.round(CLIP_PRE * CLIP_FPS);
const POST = Math.round(CLIP_POST * CLIP_FPS);

interface Waiting {
  frames: Blob[];
  shutter: number;
  done: (clip: BoothClip) => void;
}

export class ClipRecorder {
  private ring: Blob[] = [];
  private waiting: Waiting[] = [];
  private canvas = document.createElement("canvas");
  private busy = false;
  private timer: ReturnType<typeof setInterval>;

  constructor(private video: () => HTMLVideoElement | null) {
    this.timer = setInterval(() => this.tick(), 1000 / CLIP_FPS);
  }

  private tick() {
    const v = this.video();
    // Still encoding the last one (slow phone): skip a frame rather than pile up.
    if (this.busy || !v || !v.videoWidth) return;
    const k = Math.min(1, SIDE / Math.max(v.videoWidth, v.videoHeight));
    const w = Math.round(v.videoWidth * k);
    const h = Math.round(v.videoHeight * k);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.canvas.getContext("2d")!.drawImage(v, 0, 0, w, h);
    this.busy = true;
    this.canvas.toBlob(
      (b) => {
        this.busy = false;
        if (b) this.push(b);
      },
      "image/jpeg",
      0.8,
    );
  }

  private push(b: Blob) {
    this.ring.push(b);
    if (this.ring.length > PRE) this.ring.shift();
    for (const w of [...this.waiting]) {
      w.frames.push(b);
      if (w.frames.length >= w.shutter + POST) this.finish(w);
    }
  }

  private finish(w: Waiting) {
    this.waiting = this.waiting.filter((x) => x !== w);
    w.done({ fps: CLIP_FPS, frames: w.frames, shutter: w.shutter });
  }

  /** The shutter is now: the clip around it, ready CLIP_POST seconds later. */
  mark(): Promise<BoothClip> {
    return new Promise((done) => this.waiting.push({ frames: [...this.ring], shutter: this.ring.length, done }));
  }

  /** Stop recording; clips still filling end with what they have. */
  stop() {
    clearInterval(this.timer);
    for (const w of [...this.waiting]) this.finish(w);
  }
}
