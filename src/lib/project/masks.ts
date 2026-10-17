import type { MaskShape } from "./types";

// Mask outlines, drawn in a w×h box starting at (inset, inset).
// Used for clipping the photo, drawing its border and its shadow.

type Ctx = Pick<
  CanvasRenderingContext2D,
  "beginPath" | "moveTo" | "lineTo" | "arc" | "arcTo" | "bezierCurveTo" | "closePath" | "rect" | "ellipse"
>;

/** Rounded rectangle; `r` is one radius or four (top-left, top-right, bottom-right, bottom-left). */
function roundedRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number | readonly number[], inset = 0) {
  const fit = (v: number) => Math.max(0, Math.min(v - inset, w / 2, h / 2));
  const [tl, tr, br, bl] = (typeof r === "number" ? [r, r, r, r] : r).map(fit);
  ctx.moveTo(x + tl, y);
  ctx.arcTo(x + w, y, x + w, y + h, tr);
  ctx.arcTo(x + w, y + h, x, y + h, br);
  ctx.arcTo(x, y + h, x, y, bl);
  ctx.arcTo(x, y, x + w, y, tl);
  ctx.closePath();
}

function polygon(ctx: Ctx, points: [number, number][]) {
  points.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.closePath();
}

export function traceMask(ctx: Ctx, shape: MaskShape, width: number, height: number, cornerRadius: number | readonly number[] = 0, inset = 0) {
  const x = inset;
  const y = inset;
  const w = Math.max(0, width - inset * 2);
  const h = Math.max(0, height - inset * 2);
  ctx.beginPath();
  switch (shape) {
    case "none":
      ctx.rect(x, y, w, h);
      break;
    case "rounded":
      roundedRect(ctx, x, y, w, h, cornerRadius, inset);
      break;
    case "circle":
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    case "arch": {
      const r = w / 2;
      const top = y + Math.min(r, h);
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, top);
      ctx.ellipse(x + r, top, r, Math.min(r, h), 0, Math.PI, 0);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      break;
    }
    case "heart": {
      const cx = x + w / 2;
      ctx.moveTo(cx, y + h);
      ctx.bezierCurveTo(x - w * 0.05, y + h * 0.62, x, y + h * 0.05, cx - w * 0.25, y + h * 0.04);
      ctx.bezierCurveTo(cx - w * 0.1, y + h * 0.03, cx, y + h * 0.14, cx, y + h * 0.24);
      ctx.bezierCurveTo(cx, y + h * 0.14, cx + w * 0.1, y + h * 0.03, cx + w * 0.25, y + h * 0.04);
      ctx.bezierCurveTo(x + w, y + h * 0.05, x + w * 1.05, y + h * 0.62, cx, y + h);
      ctx.closePath();
      break;
    }
    case "star": {
      const pts: [number, number][] = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 === 0 ? 0.5 : 0.21;
        pts.push([x + w / 2 + Math.cos(a) * w * r, y + h * 0.53 + Math.sin(a) * h * r * 1.05]);
      }
      polygon(ctx, pts);
      break;
    }
    case "hexagon":
      polygon(ctx, [
        [x + w * 0.25, y],
        [x + w * 0.75, y],
        [x + w, y + h / 2],
        [x + w * 0.75, y + h],
        [x + w * 0.25, y + h],
        [x, y + h / 2],
      ]);
      break;
    case "blob":
      ctx.moveTo(x + w * 0.73, y + h * 0.06);
      ctx.bezierCurveTo(x + w * 0.95, y + h * 0.14, x + w * 1.0, y + h * 0.5, x + w * 0.9, y + h * 0.72);
      ctx.bezierCurveTo(x + w * 0.79, y + h * 0.95, x + w * 0.45, y + h * 1.0, x + w * 0.22, y + h * 0.9);
      ctx.bezierCurveTo(x + w * 0.0, y + h * 0.8, x - w * 0.02, y + h * 0.45, x + w * 0.1, y + h * 0.24);
      ctx.bezierCurveTo(x + w * 0.24, y + h * 0.02, x + w * 0.5, y - h * 0.02, x + w * 0.73, y + h * 0.06);
      ctx.closePath();
      break;
  }
}
