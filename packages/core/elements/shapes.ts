import { canvasPaint } from "../color/paint";
import type { ShapeKind } from "../project/types";
import { type LibraryShape, SHAPE_PATHS } from "./shapeLibrary";

const paths = new Map<string, Path2D>();

/** Shapes of the library: an SVG path scaled to the box (M19). */
function drawPath(c: CanvasRenderingContext2D, shape: LibraryShape, key: string, w: number, h: number, fill: string) {
  let p = paths.get(key);
  if (!p) paths.set(key, (p = new Path2D(shape.path)));
  c.save();
  c.scale(w / 100, h / 100);
  // Already scaled to a 100 × 100 box.
  c.fillStyle = canvasPaint(c, fill, 0, 0, 100, 100);
  c.fill(p, shape.evenOdd ? "evenodd" : "nonzero");
  c.restore();
}

/** Label of a shape: built-in ones are translated, library ones carry their name. */
export function libraryShape(kind: string): LibraryShape | undefined {
  return (SHAPE_PATHS as Record<string, LibraryShape>)[kind];
}

// Shape outlines drawn in a w×h box (M5). "film" is a film strip band with
// sprocket holes (also used by the film strip layout).

export function drawShape(c: CanvasRenderingContext2D, kind: ShapeKind, w: number, h: number, fill: string) {
  const lib = libraryShape(kind);
  if (lib) return drawPath(c, lib, kind, w, h, fill);
  c.fillStyle = canvasPaint(c, fill, 0, 0, w, h);
  c.beginPath();
  switch (kind) {
    case "rect":
      c.rect(0, 0, w, h);
      break;
    case "roundRect": {
      const r = Math.min(w, h) * 0.18;
      c.roundRect(0, 0, w, h, r);
      break;
    }
    case "circle":
      c.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    case "triangle":
      c.moveTo(w / 2, 0);
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.closePath();
      break;
    case "line":
      c.roundRect(0, 0, w, h, h / 2);
      break;
    case "arrow": {
      const head = Math.min(w * 0.4, h * 1.2);
      const shaft = h * 0.34;
      c.moveTo(0, h / 2 - shaft / 2);
      c.lineTo(w - head, h / 2 - shaft / 2);
      c.lineTo(w - head, 0);
      c.lineTo(w, h / 2);
      c.lineTo(w - head, h);
      c.lineTo(w - head, h / 2 + shaft / 2);
      c.lineTo(0, h / 2 + shaft / 2);
      c.closePath();
      break;
    }
    case "film": {
      c.rect(0, 0, w, h);
      c.fill();
      // Sprocket holes along the top and bottom edges.
      const hole = h * 0.06;
      const gap = hole * 1.6;
      c.fillStyle = "rgba(255,255,255,0.88)";
      c.beginPath();
      for (let x = gap / 2; x + hole <= w; x += hole + gap) {
        c.roundRect(x, h * 0.035, hole, hole * 0.75, hole * 0.15);
        c.roundRect(x, h - h * 0.035 - hole * 0.75, hole, hole * 0.75, hole * 0.15);
      }
      break;
    }
  }
  c.fill();
}

/** Default size (export px) when adding a shape. */
export function defaultShapeSize(kind: ShapeKind, slideWidth: number) {
  if (kind === "line") return { width: slideWidth * 0.5, height: slideWidth * 0.012 };
  if (kind === "arrow") return { width: slideWidth * 0.4, height: slideWidth * 0.12 };
  if (kind === "film") return { width: slideWidth, height: slideWidth * 0.45 };
  const aspect = libraryShape(kind)?.aspect ?? 1;
  const w = slideWidth * (aspect > 2 ? 0.5 : 0.3);
  return { width: w, height: w / aspect };
}

/** Smooth freehand stroke through points (flat x, y list) with round caps. */
export function strokePath(c: CanvasRenderingContext2D, pts: number[]) {
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  if (pts.length === 2) c.lineTo(pts[0] + 0.01, pts[1]); // a dot
  for (let i = 2; i < pts.length - 2; i += 2) {
    // Quadratic curves through midpoints: smooth without overshoot.
    c.quadraticCurveTo(pts[i], pts[i + 1], (pts[i] + pts[i + 2]) / 2, (pts[i + 1] + pts[i + 3]) / 2);
  }
  if (pts.length > 2) c.lineTo(pts[pts.length - 2], pts[pts.length - 1]);
}
