// Drawing kit of the card widgets (D-114): palette, text, shapes. Shared by every kind.
import type { WidgetTheme } from "./widgets";

export type C = CanvasRenderingContext2D;
export type F = Record<string, string>;
export interface Pal {
  bg: string;
  fg: string;
  sub: string;
  line: string;
  soft: string;
  /** Accent on this background (white on a coloured card). */
  ac: string;
  /** The chosen colour itself. */
  color: string;
  /** Text on an accent fill. */
  onAc: string;
  theme: WidgetTheme;
}

export const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
export const SERIF = 'Georgia, "Times New Roman", "Noto Serif", serif';
export const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, "Courier New", monospace';
export const P = 36;

export function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0.3;
  const n = parseInt(m[1], 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

export function palette(theme: WidgetTheme, color: string): Pal {
  const onAc = luminance(color) > 0.65 ? "#111111" : "#ffffff";
  if (theme === "dark") return { bg: "#1c1c1e", fg: "#ffffff", sub: "#98989d", line: "#3a3a3c", soft: "#2c2c2e", ac: color, color, onAc, theme };
  if (theme === "color") {
    const lightCard = onAc === "#111111";
    return {
      bg: color,
      fg: onAc,
      sub: lightCard ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.78)",
      line: lightCard ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.3)",
      soft: lightCard ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.2)",
      ac: onAc,
      color,
      onAc: lightCard ? "#ffffff" : color,
      theme,
    };
  }
  return { bg: "#ffffff", fg: "#111111", sub: "#8e8e93", line: "#e5e5ea", soft: "#f2f2f7", ac: color, color, onAc, theme };
}

export interface TextOpts {
  size: number;
  weight?: number;
  color: string;
  family?: string;
  italic?: boolean;
  align?: CanvasTextAlign;
  /** Line height, times the size. */
  lh?: number;
  strike?: boolean;
}

export function setFont(c: C, o: TextOpts) {
  c.font = `${o.italic ? "italic " : ""}${o.weight ?? 400} ${o.size}px ${o.family ?? SANS}`;
}

/** Cut to `max` px with an ellipsis. */
export function clip(c: C, s: string, max: number) {
  if (c.measureText(s).width <= max) return s;
  const chars = Array.from(s);
  while (chars.length && c.measureText(chars.join("") + "…").width > max) chars.pop();
  return chars.join("").trimEnd() + "…";
}

/** Word-wrapped lines (long words break anywhere), at most `maxLines` (the last ends in "…"). */
export function wrap(c: C, s: string, o: TextOpts, max: number, maxLines = 4): string[] {
  setFont(c, o);
  const out: string[] = [];
  for (const para of (s ?? "").split("\n")) {
    let cur = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = cur ? `${cur} ${word}` : word;
      if (c.measureText(next).width <= max) cur = next;
      else if (!cur) {
        // A word wider than the line: break it by characters.
        let part = "";
        for (const ch of Array.from(word)) {
          if (c.measureText(part + ch).width > max && part) {
            out.push(part);
            part = ch;
          } else part += ch;
        }
        cur = part;
      } else {
        out.push(cur);
        cur = word;
      }
    }
    out.push(cur);
  }
  const lines = out.length > 1 && out.every((l) => !l) ? [""] : out;
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = clip(c, `${kept[maxLines - 1]} ${lines[maxLines]}`, max);
  return kept;
}

/** Height of wrapped lines. */
export const linesH = (n: number, o: TextOpts) => n * o.size * (o.lh ?? 1.3);

/** Draws lines from the top `y`; returns the height used. */
export function drawLines(c: C, lines: string[], x: number, y: number, o: TextOpts) {
  setFont(c, o);
  c.fillStyle = o.color;
  c.textAlign = o.align ?? "left";
  c.textBaseline = "middle";
  const lh = o.size * (o.lh ?? 1.3);
  lines.forEach((l, i) => {
    const cy = y + lh * i + lh / 2;
    c.fillText(l, x, cy);
    if (o.strike) {
      const w = c.measureText(l).width;
      const x0 = o.align === "center" ? x - w / 2 : o.align === "right" ? x - w : x;
      c.fillRect(x0, cy - o.size * 0.06, w, Math.max(2, o.size * 0.07));
    }
  });
  return lh * lines.length;
}

/** One line cut to `max`; returns its height. */
export function text(c: C, s: string, x: number, y: number, o: TextOpts, max = 10000) {
  setFont(c, o);
  return drawLines(c, [clip(c, s ?? "", max)], x, y, o);
}

export function textW(c: C, s: string, o: TextOpts) {
  setFont(c, o);
  return c.measureText(s ?? "").width;
}

export function rr(c: C, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
}

export function fillRR(c: C, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  rr(c, x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
}

/** The card, with a soft shadow on light themes. */
export function card(c: C, w: number, h: number, pal: Pal, r = 36, bg = pal.bg) {
  c.save();
  c.shadowColor = pal.theme === "dark" ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.16)";
  c.shadowBlur = 28;
  c.shadowOffsetY = 8;
  fillRR(c, 0, 0, w, h, r, bg);
  c.restore();
}

export function dashed(c: C, x0: number, y: number, x1: number, color: string, width = 2, dash = [10, 8]) {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = width;
  c.setLineDash(dash);
  c.beginPath();
  c.moveTo(x0, y);
  c.lineTo(x1, y);
  c.stroke();
  c.restore();
}

export function star(c: C, cx: number, cy: number, r: number) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    c.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  c.closePath();
}

/** Stars out of 5: the slider's value, else the ★ typed in the first widgets. */
export function rating(f: F) {
  const r = parseFloat(f.rating ?? "");
  if (Number.isFinite(r)) return Math.max(0, Math.min(5, r));
  const full = (f.stars?.match(/★/g) ?? []).length;
  return Math.min(5, full || 5);
}

export const pct = (s: string | undefined) => {
  const n = parseFloat((s ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n / 100)) : 0;
};

export const seconds = (s: string | undefined) => {
  const parts = (s ?? "").split(":").map((p) => parseInt(p, 10));
  return parts.every(Number.isFinite) ? parts.reduce((a, b) => a * 60 + b, 0) : 0;
};

