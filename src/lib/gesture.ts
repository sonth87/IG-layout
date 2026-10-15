import Konva from "konva";

// Is a finger (or the mouse button) down right now? Background work that redraws the
// canvas — slide thumbnails, the autosave thumbnail — waits until it is lifted, so it
// never steals frames from a drag or pinch (F-01, "occasional lag").

let fingers = 0;
let mouse = false;

if (typeof window !== "undefined") {
  const touches = (e: TouchEvent) => (fingers = e.touches.length);
  window.addEventListener("touchstart", touches, { capture: true, passive: true });
  window.addEventListener("touchend", touches, { capture: true, passive: true });
  window.addEventListener("touchcancel", touches, { capture: true, passive: true });
  window.addEventListener("mousedown", () => (mouse = true), { capture: true });
  window.addEventListener("mouseup", () => (mouse = false), { capture: true });
}

export function isGestureActive() {
  return fingers > 0 || mouse || Konva.isDragging();
}

/**
 * Runs `fn` when the browser is idle and no gesture is in progress.
 * Returns a cancel function.
 */
export function whenIdle(fn: () => void): () => void {
  let handle = 0;
  let cancelled = false;
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 50));
  const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
  const attempt = () => {
    if (cancelled) return;
    if (isGestureActive()) handle = window.setTimeout(attempt, 200) as unknown as number;
    else fn();
  };
  handle = idle(attempt, { timeout: 1000 });
  return () => {
    cancelled = true;
    cancelIdle(handle);
    window.clearTimeout(handle);
  };
}
