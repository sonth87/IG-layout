// Sticker set (M11, S13). Our own drawings (D-66: no copied artwork), as SVG.
// `{c}` is the main colour (changeable with the Color tool); other colours are fixed.
// Rendered as images at the size they are drawn, like icons.

export interface Sticker {
  name: { en: string; vi: string };
  /** viewBox size; also the default aspect ratio. */
  w: number;
  h: number;
  color: string;
  body: string;
}

const s = (en: string, vi: string, w: number, h: number, color: string, body: string): Sticker => ({ name: { en, vi }, w, h, color, body });

export const STICKERS: Record<string, Sticker> = {
  tape: s("Washi tape", "Băng dính", 200, 60, "#f2c6a0",
    `<path d="M6 4 L194 2 L188 14 L196 26 L188 38 L195 50 L190 58 L4 58 L10 46 L3 34 L11 22 L4 10 Z" fill="{c}" fill-opacity="0.82"/>
     <g stroke="#ffffff" stroke-opacity="0.45" stroke-width="6">${[30, 70, 110, 150].map((x) => `<line x1="${x}" y1="0" x2="${x + 24}" y2="60"/>`).join("")}</g>`),
  tapeDots: s("Dotted tape", "Băng dính chấm", 200, 60, "#a9c7d8",
    `<path d="M4 6 L196 3 L190 16 L197 30 L190 44 L196 57 L5 58 L11 44 L4 30 L11 16 Z" fill="{c}" fill-opacity="0.85"/>
     <g fill="#ffffff" fill-opacity="0.7">${[22, 52, 82, 112, 142, 172].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 22 : 38}" r="6"/>`).join("")}</g>`),
  heart: s("Doodle heart", "Tim vẽ tay", 120, 110, "#e05a6f",
    `<path d="M60 100 C20 72 6 50 10 30 C14 10 40 4 58 26 C76 2 108 10 110 32 C112 54 94 74 60 100 Z" fill="{c}"/>
     <path d="M30 26 C34 18 42 16 48 20" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none" stroke-opacity="0.7"/>`),
  heartOutline: s("Heart outline", "Tim viền", 120, 110, "#1d1c1a",
    `<path d="M60 98 C22 72 8 50 12 30 C16 12 40 6 58 28 C74 4 106 12 108 32 C110 54 92 74 60 98 Z" fill="none" stroke="{c}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M57 92 C26 70 14 52 16 34" fill="none" stroke="{c}" stroke-width="3" stroke-linecap="round"/>`),
  sparkle: s("Sparkles", "Lấp lánh", 120, 120, "#f5c542",
    `<path d="M48 8 C52 38 58 44 88 48 C58 52 52 58 48 88 C44 58 38 52 8 48 C38 44 44 38 48 8 Z" fill="{c}"/>
     <path d="M94 66 C96 80 100 84 114 86 C100 88 96 92 94 106 C92 92 88 88 74 86 C88 84 92 80 94 66 Z" fill="{c}"/>
     <path d="M96 10 C97 18 100 20 108 21 C100 22 97 24 96 32 C95 24 92 22 84 21 C92 20 95 18 96 10 Z" fill="{c}"/>`),
  star: s("Star", "Ngôi sao", 120, 116, "#f2b84b",
    `<path d="M60 6 L75 40 L112 44 L84 69 L92 106 L60 87 L28 106 L36 69 L8 44 L45 40 Z" fill="{c}" stroke="#1d1c1a" stroke-width="4" stroke-linejoin="round"/>`),
  arrow: s("Doodle arrow", "Mũi tên vẽ tay", 180, 100, "#1d1c1a",
    `<path d="M10 80 C40 20 100 10 160 38" fill="none" stroke="{c}" stroke-width="6" stroke-linecap="round"/>
     <path d="M136 20 L162 38 L134 52" fill="none" stroke="{c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`),
  circle: s("Scribble circle", "Vòng khoanh", 200, 120, "#e05a6f",
    `<path d="M120 12 C60 4 10 24 12 60 C14 98 80 112 140 104 C184 98 196 70 184 44 C172 20 130 10 90 14" fill="none" stroke="{c}" stroke-width="6" stroke-linecap="round"/>`),
  squiggle: s("Squiggle", "Gạch chân", 200, 40, "#e05a6f",
    `<path d="M6 24 C22 6 34 6 46 20 C58 34 70 34 82 20 C94 6 106 6 118 20 C130 34 142 34 154 20 C166 6 180 6 194 20" fill="none" stroke="{c}" stroke-width="7" stroke-linecap="round"/>`),
  bubble: s("Speech bubble", "Bong bóng thoại", 160, 130, "#ffffff",
    `<path d="M20 10 H140 C150 10 154 16 154 26 V82 C154 92 150 98 140 98 H64 L34 124 L40 98 H20 C10 98 6 92 6 82 V26 C6 16 10 10 20 10 Z" fill="{c}" stroke="#1d1c1a" stroke-width="5" stroke-linejoin="round"/>`),
  tag: s("Label tag", "Nhãn", 180, 80, "#f3eee6",
    `<path d="M40 6 H170 C174 6 176 8 176 12 V68 C176 72 174 74 170 74 H40 L6 40 Z" fill="{c}" stroke="#1d1c1a" stroke-width="4" stroke-linejoin="round"/>
     <circle cx="34" cy="40" r="7" fill="#ffffff" stroke="#1d1c1a" stroke-width="4"/>`),
  stamp: s("Stamp", "Con tem", 130, 130, "#c94f3d",
    `<path d="${scallop(65, 65, 60, 52, 22)}" fill="{c}"/>
     <circle cx="65" cy="65" r="40" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="6 6"/>
     <path d="M48 68 L60 80 L84 52" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`),
  flower: s("Flower", "Bông hoa", 120, 120, "#f29bb2",
    `<g fill="{c}">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="60" cy="32" rx="18" ry="28" transform="rotate(${a} 60 60)"/>`).join("")}</g>
     <circle cx="60" cy="60" r="16" fill="#f5c542"/>`),
  sun: s("Sun", "Mặt trời", 130, 130, "#f5a742",
    `<circle cx="65" cy="65" r="30" fill="{c}"/>
     <g stroke="{c}" stroke-width="8" stroke-linecap="round">${Array.from({ length: 8 }, (_, i) => {
       const a = (i * Math.PI) / 4;
       return `<line x1="${65 + Math.cos(a) * 44}" y1="${65 + Math.sin(a) * 44}" x2="${65 + Math.cos(a) * 58}" y2="${65 + Math.sin(a) * 58}"/>`;
     }).join("")}</g>`),
  cloud: s("Cloud", "Mây", 180, 100, "#ffffff",
    `<path d="M40 90 C16 90 8 70 18 56 C10 36 34 22 52 32 C58 10 92 4 106 24 C122 10 152 18 152 42 C172 46 176 70 162 82 C156 88 150 90 142 90 Z" fill="{c}" stroke="#1d1c1a" stroke-width="4" stroke-linejoin="round"/>`),
  clip: s("Paper clip", "Kẹp giấy", 60, 150, "#9aa4ad",
    `<path d="M40 40 V118 C40 136 20 136 20 118 V28 C20 6 50 6 50 28 V112" fill="none" stroke="{c}" stroke-width="7" stroke-linecap="round"/>`),
  pin: s("Push pin", "Đinh ghim", 90, 120, "#e05a6f",
    `<path d="M45 70 L45 114" stroke="#7b7b7b" stroke-width="5" stroke-linecap="round"/>
     <path d="M22 70 H68 L60 52 V24 L66 12 H24 L30 24 V52 Z" fill="{c}" stroke="#1d1c1a" stroke-width="4" stroke-linejoin="round"/>`),
  ribbon: s("Ribbon banner", "Băng rôn", 220, 80, "#1d1c1a",
    `<path d="M4 22 H40 V70 H4 L16 46 Z" fill="{c}" fill-opacity="0.75"/>
     <path d="M216 22 H180 V70 H216 L204 46 Z" fill="{c}" fill-opacity="0.75"/>
     <rect x="28" y="8" width="164" height="52" rx="3" fill="{c}"/>`),
  bolt: s("Lightning", "Tia sét", 80, 130, "#f5c542",
    `<path d="M50 4 L10 72 H38 L28 126 L72 50 H44 Z" fill="{c}" stroke="#1d1c1a" stroke-width="4" stroke-linejoin="round"/>`),
  smiley: s("Smiley", "Mặt cười", 120, 120, "#f5c542",
    `<circle cx="60" cy="60" r="54" fill="{c}" stroke="#1d1c1a" stroke-width="4"/>
     <circle cx="42" cy="48" r="7" fill="#1d1c1a"/><circle cx="78" cy="48" r="7" fill="#1d1c1a"/>
     <path d="M34 72 C44 92 76 92 86 72" fill="none" stroke="#1d1c1a" stroke-width="6" stroke-linecap="round"/>`),
};

/** Scalloped circle path (stamp edge). */
function scallop(cx: number, cy: number, outer: number, inner: number, bumps: number) {
  const pts: string[] = [];
  for (let i = 0; i < bumps; i++) {
    const a0 = (i / bumps) * Math.PI * 2;
    const a1 = ((i + 0.5) / bumps) * Math.PI * 2;
    const p0 = [cx + Math.cos(a0) * inner, cy + Math.sin(a0) * inner];
    const c = [cx + Math.cos(a1) * outer * 1.08, cy + Math.sin(a1) * outer * 1.08];
    pts.push(`${i ? "" : `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}`} Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${(cx + Math.cos(((i + 1) / bumps) * Math.PI * 2) * inner).toFixed(1)} ${(cy + Math.sin(((i + 1) / bumps) * Math.PI * 2) * inner).toFixed(1)}`);
  }
  return pts.join(" ") + " Z";
}

export const STICKER_KEYS = Object.keys(STICKERS);

export function isSticker(key: string) {
  return key in STICKERS;
}

/** SVG markup for a sticker `width` px wide (height from its aspect). */
export function stickerSvg(key: string, color: string, width: number) {
  const st = STICKERS[key];
  const height = Math.round((width * st.h) / st.w);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${st.w} ${st.h}">${st.body.replaceAll("{c}", color)}</svg>`;
}
