import { rotatedBounds } from "./geometry";
import { canvasSize, slideRect } from "./layout";
import type { ProjectDoc, Rect } from "./types";

// Snapping while dragging (docs/architecture/editor-model.md, mục 4).

export interface SnapResult {
  dx: number;
  dy: number;
  /** Guide lines to draw (canvas coordinates). */
  guidesX: number[];
  guidesY: number[];
}

export function snapTargets(doc: ProjectDoc, movingId: string) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < doc.slideCount; i++) {
    const r = slideRect(doc, i);
    xs.push(r.x, r.x + r.width / 2, r.x + r.width);
    ys.push(r.y, r.y + r.height / 2, r.y + r.height);
  }
  const size = canvasSize(doc);
  xs.push(0, size.width / 2, size.width);
  ys.push(0, size.height / 2, size.height);
  for (const el of doc.elements) {
    // The cells of a moving block move with it.
    if (el.id === movingId || el.parentId === movingId || el.hidden) continue;
    const b = rotatedBounds(el);
    xs.push(b.x, b.x + b.width / 2, b.x + b.width);
    ys.push(b.y, b.y + b.height / 2, b.y + b.height);
  }
  return { xs, ys };
}

function best(lines: number[], targets: number[], threshold: number) {
  let delta = 0;
  let found: number | null = null;
  for (const line of lines) {
    for (const t of targets) {
      const d = t - line;
      if (Math.abs(d) <= threshold && (found === null || Math.abs(d) < Math.abs(delta))) {
        delta = d;
        found = t;
      }
    }
  }
  return { delta, found };
}

export function snap(bounds: Rect, targets: { xs: number[]; ys: number[] }, threshold: number): SnapResult {
  const x = best([bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width], targets.xs, threshold);
  const y = best([bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height], targets.ys, threshold);
  return {
    dx: x.delta,
    dy: y.delta,
    guidesX: x.found === null ? [] : [x.found],
    guidesY: y.found === null ? [] : [y.found],
  };
}
