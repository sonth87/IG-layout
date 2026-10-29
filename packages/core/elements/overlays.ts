import type { BlendMode } from "../project/types";

// Overlays & textures (M11, S13: SCRL's "overlays… texture and depth"). Generated in
// code, so there is no third-party artwork to license. Each one becomes an ordinary
// photo element (movable, resizable, opacity) drawn with a blend mode: light effects on
// black + "screen" (black disappears), paper on white + "multiply".

export const OVERLAYS = {
  lightLeak: { name: { en: "Light leak", vi: "Vệt sáng" }, blend: "screen" },
  lightLeakPink: { name: { en: "Pink leak", vi: "Vệt hồng" }, blend: "screen" },
  filmBurn: { name: { en: "Film burn", vi: "Cháy phim" }, blend: "screen" },
  prism: { name: { en: "Prism", vi: "Lăng kính" }, blend: "screen" },
  bokeh: { name: { en: "Bokeh", vi: "Bokeh" }, blend: "screen" },
  dust: { name: { en: "Dust", vi: "Bụi" }, blend: "screen" },
  scratches: { name: { en: "Scratches", vi: "Vết xước" }, blend: "screen" },
  paper: { name: { en: "Paper", vi: "Giấy" }, blend: "multiply" },
} satisfies Record<string, { name: { en: string; vi: string }; blend: BlendMode }>;

export type OverlayKind = keyof typeof OVERLAYS;
export const OVERLAY_KINDS = Object.keys(OVERLAYS) as OverlayKind[];

/** Small deterministic random generator (same overlay every time for a seed). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function glow(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha = 1) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  c.globalAlpha = alpha;
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
  c.globalAlpha = 1;
}

/** Draws an overlay on a w × h canvas. */
export function drawOverlay(c: CanvasRenderingContext2D, kind: OverlayKind, w: number, h: number, seed = 7) {
  const r = rng(seed);
  c.globalCompositeOperation = "source-over";
  c.fillStyle = kind === "paper" ? "#ffffff" : "#000000";
  c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = kind === "paper" ? "multiply" : "lighter";

  switch (kind) {
    case "lightLeak":
      glow(c, -w * 0.05, h * 0.3, w * 0.75, "rgba(255,120,40,0.95)");
      glow(c, w * 0.08, h * 0.65, w * 0.5, "rgba(255,190,80,0.8)");
      glow(c, -w * 0.1, h * 0.95, w * 0.45, "rgba(255,60,40,0.7)");
      break;
    case "lightLeakPink":
      glow(c, w * 1.05, h * 0.25, w * 0.7, "rgba(255,70,160,0.9)");
      glow(c, w * 0.95, h * 0.7, w * 0.55, "rgba(150,90,255,0.75)");
      glow(c, w * 0.7, h * 0.05, w * 0.35, "rgba(255,170,200,0.6)");
      break;
    case "filmBurn":
      glow(c, w * 0.95, h * 0.05, w * 0.9, "rgba(255,80,0,0.95)");
      glow(c, w * 1.0, h * 0.0, w * 0.45, "rgba(255,230,160,1)");
      glow(c, w * 0.75, h * 0.25, w * 0.4, "rgba(255,40,20,0.6)");
      break;
    case "prism": {
      c.save();
      c.translate(w * 0.55, h * 0.45);
      c.rotate(-0.5);
      const g = c.createLinearGradient(-w * 0.18, 0, w * 0.18, 0);
      ["rgba(255,0,0,0)", "rgba(255,60,60,0.55)", "rgba(255,200,0,0.55)", "rgba(60,255,120,0.5)", "rgba(40,140,255,0.55)", "rgba(170,60,255,0.5)", "rgba(170,60,255,0)"].forEach(
        (col, i, a) => g.addColorStop(i / (a.length - 1), col),
      );
      c.fillStyle = g;
      c.filter = `blur(${Math.round(w * 0.02)}px)`;
      c.fillRect(-w * 0.18, -h, w * 0.36, h * 2);
      c.restore();
      break;
    }
    case "bokeh":
      for (let i = 0; i < 26; i++) {
        const hue = 25 + r() * 40;
        const rad = w * (0.03 + r() * 0.08);
        c.globalAlpha = 0.25 + r() * 0.35;
        c.fillStyle = `hsl(${hue} 90% 65%)`;
        c.filter = `blur(${Math.round(rad * 0.25)}px)`;
        c.beginPath();
        c.arc(r() * w, r() * h, rad, 0, Math.PI * 2);
        c.fill();
      }
      break;
    case "dust":
      c.fillStyle = "#ffffff";
      for (let i = 0; i < 900; i++) {
        c.globalAlpha = 0.2 + r() * 0.7;
        const size = r() < 0.92 ? 1 + r() * 2.2 : 3 + r() * 4;
        c.beginPath();
        c.arc(r() * w, r() * h, size, 0, Math.PI * 2);
        c.fill();
      }
      c.strokeStyle = "#ffffff";
      for (let i = 0; i < 18; i++) {
        // Hairs / fibres.
        c.globalAlpha = 0.3 + r() * 0.4;
        c.lineWidth = 1 + r() * 1.5;
        const x = r() * w;
        const y = r() * h;
        c.beginPath();
        c.moveTo(x, y);
        c.bezierCurveTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 60, x + (r() - 0.5) * 80, y + (r() - 0.5) * 80, x + (r() - 0.5) * 90, y + (r() - 0.5) * 90);
        c.stroke();
      }
      break;
    case "scratches":
      c.strokeStyle = "#ffffff";
      for (let i = 0; i < 26; i++) {
        c.globalAlpha = 0.15 + r() * 0.45;
        c.lineWidth = 0.8 + r() * 1.8;
        const x = r() * w;
        const y0 = r() * h * 0.5;
        c.beginPath();
        c.moveTo(x, y0);
        c.lineTo(x + (r() - 0.5) * 30, y0 + h * (0.3 + r() * 0.7));
        c.stroke();
      }
      break;
    case "paper": {
      // Fine noise + fibres, light enough that "multiply" only adds texture.
      const img = c.getImageData(0, 0, w, h);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 236 + r() * 19;
        img.data[i] = v;
        img.data[i + 1] = v - 3;
        img.data[i + 2] = v - 10;
      }
      c.putImageData(img, 0, 0);
      c.strokeStyle = "#b9ad98";
      for (let i = 0; i < 120; i++) {
        c.globalAlpha = 0.08 + r() * 0.12;
        c.lineWidth = 0.6 + r();
        const x = r() * w;
        const y = r() * h;
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 40, x + (r() - 0.5) * 60, y + (r() - 0.5) * 60);
        c.stroke();
      }
      break;
    }
  }
  c.globalAlpha = 1;
  c.filter = "none";
  c.globalCompositeOperation = "source-over";
}

/** Renders an overlay to a JPEG (stored like a photo in the project). */
export async function overlayBlob(kind: OverlayKind, w: number, h: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  drawOverlay(canvas.getContext("2d")!, kind, w, h);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  canvas.width = canvas.height = 0;
  if (!blob) throw new Error("overlay");
  return blob;
}
