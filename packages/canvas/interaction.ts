"use client";

import { type CanvasElement, zoomsInside } from "@ig-layout/core/project/types";
import { useCanvas, useCanvasApi } from "./host";

// Selection / drag rules shared by every canvas element (M8, UX-01, UX-10):
// - Touch screens: a finger on an element that is NOT selected does not grab it,
//   so swiping scrolls the slides. Tap selects; then dragging moves it.
// - Mouse: press-and-drag works immediately (desktop habit).
// - Locked elements (e.g. a background photo) never move. Tapping one while
//   something else is selected clears the selection (it acts as "empty space").

export const isTouchUI = typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches;

// After a tap, mobile browsers also fire emulated mouse events. Ignore those, or a
// tap that clears the selection would be followed by a "mousedown" that re-selects.
let lastTouch = 0;
if (typeof window !== "undefined") {
  window.addEventListener("touchstart", () => (lastTouch = Date.now()), { capture: true, passive: true });
}
const emulatedMouse = () => Date.now() - lastTouch < 800;

export function useElementInteraction(el: CanvasElement) {
  const selected = useCanvas((s) => s.selectedId === el.id);
  const select = useCanvas((s) => s.select);
  const api = useCanvasApi();
  // Locked photos still pan inside their frame (the frame itself never moves).
  const draggable = (!el.locked || zoomsInside(el)) && (selected || !isTouchUI);

  function onSelect() {
    const current = api.getState().selectedId;
    if (el.locked && current && current !== el.id) select(null);
    else select(el.id);
  }

  return {
    selected,
    draggable,
    // Konva calls preventDefault on touch by default, which would stop scrolling.
    preventDefault: draggable,
    /** For `onTap`. */
    onSelect,
    /** For `onMouseDown`: real mouse only. */
    onMouseSelect: () => {
      if (!emulatedMouse()) onSelect();
    },
  };
}
