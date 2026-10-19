// Paints: a solid colour ("#rrggbb") or a gradient, kept as its CSS text
// ("linear-gradient(135deg, #ff7eb3, #7ac6ff)" / "radial-gradient(circle, #a, #b)") so the
// same value shows in the UI and draws on the canvas (colour picker, owner 2026-10-20).

export interface Gradient {
  kind: "linear" | "radial";
  /** Degrees, CSS style: 0 = to top, 90 = to the right. */
  angle: number;
  stops: string[];
}

export const isGradient = (p: string | undefined | null): boolean => !!p && /^(linear|radial)-gradient\(/.test(p);

export function parseGradient(p: string): Gradient | null {
  const m = /^(linear|radial)-gradient\((.*)\)$/.exec(p.trim());
  if (!m) return null;
  const parts = m[2].split(/,(?![^(]*\))/).map((s) => s.trim());
  let angle = 180;
  if (m[1] === "linear" && /deg$/.test(parts[0])) angle = parseFloat(parts.shift()!);
  if (m[1] === "radial" && !/^#/.test(parts[0])) parts.shift();
  const stops = parts.map((s) => s.split(/\s+/)[0]).filter((s) => /^#[0-9a-f]{6}$/i.test(s));
  return stops.length >= 2 ? { kind: m[1] as Gradient["kind"], angle, stops } : null;
}

export function gradientCss(g: Gradient): string {
  return g.kind === "radial" ? `radial-gradient(circle, ${g.stops.join(", ")})` : `linear-gradient(${Math.round(g.angle)}deg, ${g.stops.join(", ")})`;
}

/** One colour standing for the paint (first stop of a gradient). */
export function mainColor(p: string): string {
  if (!isGradient(p)) return p;
  const g = parseGradient(p);
  return g ? mixAll(g.stops) : "#888888";
}

function mixAll(cs: string[]) {
  const rgb = cs.map((c) => parseInt(c.slice(1), 16)).map((n) => [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
  const avg = [0, 1, 2].map((k) => Math.round(rgb.reduce((a, v) => a + v[k], 0) / rgb.length));
  return `#${avg.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** A canvas fill for the paint over a box. */
export function canvasPaint(c: CanvasRenderingContext2D, p: string, x: number, y: number, w: number, h: number): string | CanvasGradient {
  if (!isGradient(p)) return p;
  const g = parseGradient(p);
  if (!g) return "#888888";
  let grad: CanvasGradient;
  if (g.kind === "radial") grad = c.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.hypot(w, h) / 2);
  else {
    // CSS angle: 0deg points up, clockwise.
    const a = ((g.angle - 90) * Math.PI) / 180;
    const half = (Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a))) / 2;
    const cx = x + w / 2;
    const cy = y + h / 2;
    grad = c.createLinearGradient(cx - Math.cos(a) * half, cy - Math.sin(a) * half, cx + Math.cos(a) * half, cy + Math.sin(a) * half);
  }
  g.stops.forEach((s, i) => grad.addColorStop(i / (g.stops.length - 1), s));
  return grad;
}

/** Konva gradient attributes for a box of w × h (text, rectangles). */
export function konvaPaint(p: string, w: number, h: number): Record<string, unknown> {
  if (!isGradient(p)) return { fill: p };
  const g = parseGradient(p);
  if (!g) return { fill: "#888888" };
  const stops = g.stops.flatMap((s, i) => [i / (g.stops.length - 1), s]);
  if (g.kind === "radial")
    return { fillPriority: "radial-gradient", fillRadialGradientStartPoint: { x: w / 2, y: h / 2 }, fillRadialGradientEndPoint: { x: w / 2, y: h / 2 }, fillRadialGradientStartRadius: 0, fillRadialGradientEndRadius: Math.hypot(w, h) / 2, fillRadialGradientColorStops: stops };
  const a = ((g.angle - 90) * Math.PI) / 180;
  const half = (Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a))) / 2;
  return {
    fillPriority: "linear-gradient",
    fillLinearGradientStartPoint: { x: w / 2 - Math.cos(a) * half, y: h / 2 - Math.sin(a) * half },
    fillLinearGradientEndPoint: { x: w / 2 + Math.cos(a) * half, y: h / 2 + Math.sin(a) * half },
    fillLinearGradientColorStops: stops,
  };
}

export const DEFAULT_GRADIENTS = [
  "linear-gradient(135deg, #ff7eb3, #ff758c)",
  "linear-gradient(135deg, #f6d365, #fda085)",
  "linear-gradient(135deg, #84fab0, #8fd3f4)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #30cfd0, #330867)",
  "linear-gradient(180deg, #ffecd2, #fcb69f)",
  "linear-gradient(180deg, #89f7fe, #66a6ff)",
  "linear-gradient(180deg, #fddb92, #d1fdff)",
  "linear-gradient(180deg, #0f2027, #2c5364)",
  "linear-gradient(90deg, #ee9ca7, #ffdde1)",
  "linear-gradient(90deg, #12c2e9, #c471ed, #f64f59)",
  "linear-gradient(90deg, #f12711, #f5af19)",
  "linear-gradient(90deg, #000000, #434343)",
  "radial-gradient(circle, #fff1eb, #ace0f9)",
  "radial-gradient(circle, #fbd786, #f7797d)",
];
