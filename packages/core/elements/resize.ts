import type { CanvasElement } from "../project/types";

/**
 * Extra changes when an element is scaled by `k` (transformer or pinch).
 * Text grows by its font size (its height follows the text); others by their frame.
 */
export function scaleExtras(el: CanvasElement, k: number): Partial<CanvasElement> {
  if (el.type !== "text") return {};
  return {
    fontSize: Math.max(8, el.fontSize * k),
    letterSpacing: el.letterSpacing * k,
    background: el.background ? { ...el.background, padding: el.background.padding * k, radius: el.background.radius * k } : null,
    stroke: el.stroke ? { ...el.stroke, width: el.stroke.width * k } : null,
  };
}
