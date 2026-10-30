import type { Sticker } from "./stickers";

// Photo-booth props and occasion stickers (owner, 2026-10-30: kính, râu, bong bóng, bảng chữ,
// mũ, hoa lá, nến, bánh sinh nhật, chó mèo chim cá…, and Tết / Halloween / Noel / Trung
// thu). Our own drawings (D-66), SVG like the sticker set: flat colours, a dark ink outline,
// `{c}` the main colour (changeable). Shared by IG Layout's library and the booth. Bubbles and
// signs have a text box: the booth writes the user's words in it.

export type PropGroup = "props" | "words" | "party" | "pets" | "tet" | "halloween" | "xmas" | "midautumn";
export const PROP_GROUPS: PropGroup[] = ["props", "words", "party", "pets", "tet", "halloween", "xmas", "midautumn"];

export interface Prop extends Sticker {
  group: PropGroup;
  /** Where words go (bubbles, signs), in viewBox units, and the default words. */
  text?: { x: number; y: number; w: number; h: number; color: string; value: string };
}

const INK = "#1d1c1a";
const O = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;

const p = (group: PropGroup, en: string, vi: string, w: number, h: number, color: string, body: string, text?: Prop["text"]): Prop => ({ group, name: { en, vi }, w, h, color, body, text });

/** n petals around (cx, cy). */
const petals = (cx: number, cy: number, r: number, n: number, fill: string, len = r) =>
  Array.from({ length: n }, (_, i) => `<ellipse cx="${cx}" cy="${cy - len}" rx="${r * 0.55}" ry="${r * 0.9}" fill="${fill}" transform="rotate(${(360 / n) * i} ${cx} ${cy})"/>`).join("");

export const PROPS: Record<string, Prop> = {
  // ── Props ────────────────────────────────────────────────────────────────
  partyShades: p("props", "Party shades", "Kính lưới", 240, 90, "#46d36a",
    `<path d="M10 20 Q12 10 24 10 H104 Q114 10 114 22 V58 Q114 80 88 80 H40 Q12 80 10 56 Z" fill="{c}" ${O}/>
     <path d="M230 20 Q228 10 216 10 H136 Q126 10 126 22 V58 Q126 80 152 80 H200 Q228 80 230 56 Z" fill="{c}" ${O}/>
     <path d="M114 28 Q120 22 126 28" fill="none" ${O}/>
     <g stroke="${INK}" stroke-width="4" stroke-opacity="0.55">${[24, 36, 48, 60, 72].map((y) => `<line x1="20" y1="${y}" x2="106" y2="${y}"/><line x1="134" y1="${y}" x2="220" y2="${y}"/>`).join("")}</g>`),
  heartGlasses: p("props", "Heart glasses", "Kính tim", 240, 100, "#ff4f8b",
    `<path d="M62 92 C22 66 8 46 12 28 C16 10 42 6 60 26 C76 4 106 10 108 30 C110 50 96 68 62 92 Z" fill="{c}" ${O}/>
     <path d="M178 92 C138 66 124 46 128 28 C132 10 158 6 176 26 C192 4 222 10 224 30 C226 50 212 68 178 92 Z" fill="{c}" ${O}/>
     <path d="M106 34 Q120 26 132 34" fill="none" ${O}/>
     <path d="M34 30 Q40 22 50 24 M150 30 Q156 22 166 24" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-opacity="0.7"/>`),
  starGlasses: p("props", "Star glasses", "Kính sao", 240, 100, "#ffcf3a",
    `<path d="M60 6 L73 36 L106 38 L80 58 L89 92 L60 74 L31 92 L40 58 L14 38 L47 36 Z" fill="{c}" ${O}/>
     <path d="M180 6 L193 36 L226 38 L200 58 L209 92 L180 74 L151 92 L160 58 L134 38 L167 36 Z" fill="{c}" ${O}/>
     <path d="M100 44 Q120 34 140 44" fill="none" ${O}/>`),
  nerdGlasses: p("props", "Round glasses", "Kính tròn", 240, 90, "#1d1c1a",
    `<circle cx="62" cy="46" r="38" fill="#ffffff" fill-opacity="0.25" stroke="{c}" stroke-width="9"/>
     <circle cx="178" cy="46" r="38" fill="#ffffff" fill-opacity="0.25" stroke="{c}" stroke-width="9"/>
     <path d="M100 42 Q120 30 140 42" fill="none" stroke="{c}" stroke-width="8" stroke-linecap="round"/>
     <path d="M40 30 Q48 20 60 20" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>`),
  aviators: p("props", "Aviators", "Kính phi công", 240, 96, "#2d3a4a",
    `<path d="M14 18 H106 Q110 18 108 30 Q100 86 58 86 Q16 86 12 32 Q12 18 14 18 Z" fill="{c}" stroke="#c9a54a" stroke-width="6"/>
     <path d="M226 18 H134 Q130 18 132 30 Q140 86 182 86 Q224 86 228 32 Q228 18 226 18 Z" fill="{c}" stroke="#c9a54a" stroke-width="6"/>
     <path d="M106 24 Q120 16 134 24" fill="none" stroke="#c9a54a" stroke-width="6"/>
     <path d="M30 32 Q50 26 70 30 M150 32 Q170 26 190 30" fill="none" stroke="#ffffff" stroke-width="5" stroke-opacity="0.5" stroke-linecap="round"/>`),
  mustache: p("props", "Mustache", "Râu", 220, 80, "#3a2a20",
    `<path d="M110 26 C96 8 70 12 54 30 C40 46 20 50 6 38 C10 62 34 74 60 64 C82 56 98 46 110 40 C122 46 138 56 160 64 C186 74 210 62 214 38 C200 50 180 46 166 30 C150 12 124 8 110 26 Z" fill="{c}" ${O}/>`),
  curlyMustache: p("props", "Curly mustache", "Râu xoắn", 240, 90, "#1d1c1a",
    `<path d="M120 30 C104 16 82 22 70 36 C58 50 40 62 22 52 C10 44 12 26 26 26 C36 26 38 38 30 40 C40 60 70 70 96 58 C108 52 116 44 120 40 C124 44 132 52 144 58 C170 70 200 60 210 40 C202 38 204 26 214 26 C228 26 230 44 218 52 C200 62 182 50 170 36 C158 22 136 16 120 30 Z" fill="{c}"/>`),
  lips: p("props", "Lips", "Môi", 180, 100, "#e2283f",
    `<path d="M6 46 C30 18 62 6 90 28 C118 6 150 18 174 46 C150 84 120 96 90 96 C60 96 30 84 6 46 Z" fill="{c}" ${O}/>
     <path d="M12 47 C40 54 70 56 90 52 C110 56 140 54 168 47" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
     <path d="M54 72 Q70 80 84 78" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-opacity="0.55"/>`),
  bowtie: p("props", "Bow tie", "Nơ cổ", 200, 100, "#d8394f",
    `<path d="M100 50 L14 10 Q4 50 14 90 Z M100 50 L186 10 Q196 50 186 90 Z" fill="{c}" ${O}/>
     <rect x="84" y="34" width="32" height="32" rx="8" fill="{c}" ${O}/>
     <g fill="#ffffff" fill-opacity="0.75">${[[40, 40], [36, 64], [160, 40], [164, 64], [60, 52], [140, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join("")}</g>`),
  partyHat: p("props", "Party hat", "Mũ sinh nhật", 140, 180, "#7b61ff",
    `<path d="M70 18 L128 168 Q70 184 12 168 Z" fill="{c}" ${O}/>
     <path d="M40 92 L104 110 M28 126 L116 146 M56 56 L88 66" stroke="#ffd36e" stroke-width="10" stroke-linecap="round"/>
     <circle cx="70" cy="16" r="14" fill="#ff6b9a" ${O}/>`),
  topHat: p("props", "Top hat", "Mũ chóp", 200, 160, "#1d1c1a",
    `<rect x="44" y="10" width="112" height="118" rx="10" fill="{c}" ${O}/>
     <rect x="44" y="92" width="112" height="22" fill="#d8394f"/>
     <ellipse cx="100" cy="134" rx="94" ry="20" fill="{c}" ${O}/>`),
  crown: p("props", "Crown", "Vương miện", 200, 130, "#f5c542",
    `<path d="M14 120 L8 30 L56 70 L100 10 L144 70 L192 30 L186 120 Z" fill="{c}" ${O}/>
     <circle cx="8" cy="30" r="9" fill="{c}" ${O}/><circle cx="100" cy="10" r="9" fill="{c}" ${O}/><circle cx="192" cy="30" r="9" fill="{c}" ${O}/>
     <circle cx="60" cy="96" r="10" fill="#e2283f" ${O}/><circle cx="100" cy="92" r="12" fill="#3aa0ff" ${O}/><circle cx="140" cy="96" r="10" fill="#46d36a" ${O}/>`),
  flowerCrown: p("props", "Flower crown", "Vòng hoa đội đầu", 240, 90, "#f29bb4",
    `<path d="M8 70 Q120 10 232 70" fill="none" stroke="#5c9a45" stroke-width="7"/>
     ${[[30, 62, "{c}"], [70, 42, "#ffd36e"], [120, 32, "{c}"], [170, 42, "#ffffff"], [210, 62, "{c}"]].map(([x, y, c]) => `<g>${petals(+x, +y, 13, 5, String(c), 13)}<circle cx="${x}" cy="${y}" r="8" fill="#ffcf3a"/></g>`).join("")}
     ${[[50, 56, -40], [96, 40, -20], [146, 38, 20], [192, 54, 40]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="6" fill="#5c9a45" transform="rotate(${a} ${x} ${y})"/>`).join("")}`),
  catEars: p("props", "Cat ears", "Tai mèo", 240, 110, "#1d1c1a",
    `<path d="M20 104 L40 10 L104 76 Z M220 104 L200 10 L136 76 Z" fill="{c}" ${O}/>
     <path d="M42 34 L52 82 L84 76 Z M198 34 L188 82 L156 76 Z" fill="#ff9fb8"/>`),
  bunnyEars: p("props", "Bunny ears", "Tai thỏ", 200, 200, "#ffffff",
    `<path d="M60 196 C30 140 28 40 54 12 C80 40 84 140 84 196 Z" fill="{c}" ${O}/>
     <path d="M140 196 C140 140 144 40 170 14 C190 50 170 140 116 196 Z" fill="{c}" ${O}/>
     <path d="M56 40 C46 80 50 140 64 180 M162 44 C160 90 150 140 132 180" fill="none" stroke="#ff9fb8" stroke-width="14" stroke-linecap="round"/>`),
  dogEars: p("props", "Puppy ears & nose", "Tai & mũi cún", 260, 200, "#a0673f",
    `<path d="M30 20 C4 40 0 120 30 150 C50 130 62 80 64 30 Z M230 20 C256 40 260 120 230 150 C210 130 198 80 196 30 Z" fill="{c}" ${O}/>
     <ellipse cx="130" cy="170" rx="30" ry="20" fill="${INK}"/>
     <path d="M118 162 Q126 156 134 160" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none" stroke-opacity="0.6"/>`),
  devilHorns: p("props", "Devil horns", "Sừng quỷ", 220, 100, "#e2283f",
    `<path d="M40 96 C34 60 20 30 10 8 C46 22 70 52 74 92 Z M180 96 C186 60 200 30 210 8 C174 22 150 52 146 92 Z" fill="{c}" ${O}/>`),
  halo: p("props", "Halo", "Hào quang", 220, 70, "#ffd84d",
    `<ellipse cx="110" cy="35" rx="96" ry="24" fill="none" stroke="{c}" stroke-width="14"/>
     <ellipse cx="110" cy="35" rx="96" ry="24" fill="none" stroke="#fff6c2" stroke-width="4"/>`),
  lei: p("props", "Flower lei", "Vòng hoa cổ", 240, 170, "#ff6b9a",
    `${Array.from({ length: 13 }, (_, i) => {
      const a = Math.PI * (0.05 + (0.9 * i) / 12);
      const x = 120 - Math.cos(a) * 104;
      const y = 20 + Math.sin(a) * 130;
      const c = ["{c}", "#ffd36e", "#3aa0ff", "#46d36a", "#ffffff"][i % 5];
      return `<g>${petals(x, y, 13, 5, c, 12)}<circle cx="${x}" cy="${y}" r="6" fill="#ffcf3a"/></g>`;
    }).join("")}`),

  // ── Words: bubbles and signs ─────────────────────────────────────────────
  bubbleRound: p("words", "Speech bubble", "Bong bóng thoại", 220, 170, "#ffffff",
    `<path d="M110 10 C170 10 212 40 212 78 C212 116 170 146 110 146 C96 146 84 144 72 140 L28 164 L42 124 C20 112 8 96 8 78 C8 40 50 10 110 10 Z" fill="{c}" ${O}/>`,
    { x: 30, y: 30, w: 160, h: 96, color: INK, value: "OMG!" }),
  bubbleCloud: p("words", "Thought cloud", "Bong bóng nghĩ", 230, 180, "#c7b8ff",
    `<path d="M50 120 C14 120 8 76 40 68 C30 30 76 14 98 34 C112 4 168 8 172 44 C210 40 228 82 204 102 C220 132 180 150 160 132 C140 156 96 154 86 132 C76 140 60 136 50 120 Z" fill="{c}" ${O}/>
     <circle cx="44" cy="146" r="11" fill="{c}" ${O}/><circle cx="24" cy="168" r="7" fill="{c}" ${O}/>`,
    { x: 44, y: 40, w: 150, h: 80, color: INK, value: "Everyday I'm hustlin'" }),
  bubbleShout: p("words", "Shout burst", "Bong bóng hét", 220, 200, "#ffd23f",
    `<path d="M110 6 L128 46 L170 18 L162 64 L212 64 L176 96 L214 128 L164 132 L174 182 L132 150 L110 196 L90 150 L44 180 L56 132 L6 128 L44 96 L8 64 L58 64 L50 18 L92 46 Z" fill="{c}" ${O}/>`,
    { x: 56, y: 72, w: 108, h: 60, color: "#e2283f", value: "WOW!" }),
  signBoss: p("words", "Sign on a stick", "Bảng cầm tay", 220, 220, "#ff6b9a",
    `<rect x="102" y="120" width="16" height="96" rx="6" fill="#c9a06a" ${O}/>
     <rect x="10" y="10" width="200" height="120" rx="16" fill="#fff4e2" ${O}/>
     <rect x="22" y="22" width="176" height="96" rx="10" fill="none" stroke="{c}" stroke-width="6" stroke-dasharray="2 12" stroke-linecap="round"/>`,
    { x: 30, y: 30, w: 160, h: 80, color: "#e2283f", value: "BOSS" }),
  signHeart: p("words", "Heart sign", "Bảng tim", 200, 220, "#e2283f",
    `<rect x="92" y="130" width="16" height="86" rx="6" fill="#c9a06a" ${O}/>
     <path d="M100 160 C40 120 8 88 12 54 C16 20 60 10 100 46 C140 10 184 20 188 54 C192 88 160 120 100 160 Z" fill="{c}" ${O}/>`,
    { x: 40, y: 50, w: 120, h: 60, color: "#ffffff", value: "LOVE" }),
  signArrow: p("words", "Arrow sign", "Bảng mũi tên", 240, 120, "#ffd23f",
    `<path d="M8 22 H184 L232 60 L184 98 H8 Z" fill="{c}" ${O}/>`,
    { x: 20, y: 34, w: 160, h: 52, color: INK, value: "BESTIE" }),
  hashtag: p("words", "Hashtag tag", "Thẻ hashtag", 240, 90, "#3aa0ff",
    `<rect x="6" y="8" width="228" height="74" rx="37" fill="{c}" ${O}/>`,
    { x: 24, y: 18, w: 192, h: 54, color: "#ffffff", value: "#squad" }),

  // ── Party ────────────────────────────────────────────────────────────────
  cake: p("party", "Birthday cake", "Bánh sinh nhật", 200, 200, "#ff9fb8",
    `<rect x="24" y="98" width="152" height="90" rx="12" fill="#fff4e2" ${O}/>
     <path d="M24 112 Q44 134 62 112 Q82 134 100 112 Q118 134 138 112 Q158 134 176 112 V100 Q176 92 168 92 H32 Q24 92 24 100 Z" fill="{c}" ${O}/>
     <rect x="8" y="182" width="184" height="12" rx="6" fill="#c9d8e8" ${O}/>
     ${[60, 100, 140].map((x) => `<rect x="${x - 6}" y="50" width="12" height="44" rx="4" fill="#7b61ff" ${O}/><path d="M${x} 20 C${x + 12} 34 ${x + 8} 46 ${x} 46 C${x - 8} 46 ${x - 12} 34 ${x} 20 Z" fill="#ffb02e"/>`).join("")}
     <g fill="#e2283f">${[[50, 150], [90, 162], [130, 148], [160, 166], [70, 172]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join("")}</g>`),
  candle: p("party", "Candle", "Nến", 80, 200, "#7b61ff",
    `<rect x="22" y="70" width="36" height="124" rx="8" fill="{c}" ${O}/>
     <path d="M22 100 L58 84 M22 136 L58 120 M22 172 L58 156" stroke="#ffffff" stroke-width="7" stroke-opacity="0.6"/>
     <path d="M40 10 C60 34 56 60 40 60 C24 60 20 34 40 10 Z" fill="#ffb02e" ${O}/>
     <path d="M40 30 C48 42 46 52 40 52 C34 52 32 42 40 30 Z" fill="#fff3c4"/>`),
  balloon: p("party", "Balloon", "Bóng bay", 120, 220, "#e2283f",
    `<path d="M60 8 C100 8 112 46 108 72 C102 112 76 134 60 136 C44 134 18 112 12 72 C8 46 20 8 60 8 Z" fill="{c}" ${O}/>
     <path d="M52 136 L60 148 L68 136 Z" fill="{c}" ${O}/>
     <path d="M60 148 C46 168 74 188 60 214" fill="none" stroke="${INK}" stroke-width="3"/>
     <path d="M34 40 Q40 24 56 20" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-opacity="0.6"/>`),
  gift: p("party", "Gift", "Hộp quà", 180, 180, "#3aa0ff",
    `<rect x="16" y="70" width="148" height="104" rx="8" fill="{c}" ${O}/>
     <rect x="8" y="48" width="164" height="32" rx="8" fill="{c}" ${O}/>
     <rect x="78" y="48" width="24" height="126" fill="#ffd23f" ${O}/>
     <path d="M90 48 C70 10 30 20 46 44 Z M90 48 C110 10 150 20 134 44 Z" fill="#ffd23f" ${O}/>`),
  popper: p("party", "Party popper", "Pháo giấy", 200, 200, "#ffd23f",
    `<path d="M20 186 L70 66 L134 130 Z" fill="{c}" ${O}/>
     <path d="M36 148 L96 92 M50 116 L82 86" stroke="#e2283f" stroke-width="8" stroke-linecap="round"/>
     ${[[120, 40, "#e2283f"], [160, 70, "#3aa0ff"], [150, 20, "#46d36a"], [182, 110, "#ff6b9a"], [100, 14, "#7b61ff"]].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="16" height="8" rx="3" fill="${c}" transform="rotate(${+x % 60} ${x} ${y})"/>`).join("")}
     <path d="M110 70 C120 50 140 52 150 40 M128 96 C150 92 160 104 182 96" fill="none" stroke="#7b61ff" stroke-width="5" stroke-linecap="round"/>`),

  // ── Pets ─────────────────────────────────────────────────────────────────
  cat: p("pets", "Cat", "Mèo", 200, 180, "#f2a24b",
    `<path d="M30 70 L36 10 L80 44 Q100 38 120 44 L164 10 L170 70 C186 100 176 168 100 170 C24 168 14 100 30 70 Z" fill="{c}" ${O}/>
     <ellipse cx="72" cy="100" rx="9" ry="13" fill="${INK}"/><ellipse cx="128" cy="100" rx="9" ry="13" fill="${INK}"/>
     <path d="M92 126 L100 134 L108 126 Z" fill="#ff8fa8"/>
     <path d="M100 134 Q90 146 80 140 M100 134 Q110 146 120 140 M40 120 H72 M44 132 L72 128 M160 120 H128 M156 132 L128 128" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`),
  dog: p("pets", "Dog", "Cún", 200, 190, "#c98a52",
    `<ellipse cx="100" cy="104" rx="70" ry="74" fill="{c}" ${O}/>
     <path d="M34 50 C6 60 4 130 26 140 C42 130 46 90 48 60 Z M166 50 C194 60 196 130 174 140 C158 130 154 90 152 60 Z" fill="#7a4e2b" ${O}/>
     <ellipse cx="100" cy="140" rx="36" ry="28" fill="#f3dcc2"/>
     <circle cx="74" cy="96" r="9" fill="${INK}"/><circle cx="126" cy="96" r="9" fill="${INK}"/>
     <ellipse cx="100" cy="126" rx="14" ry="10" fill="${INK}"/>
     <path d="M100 136 V150 M100 150 Q90 160 82 152 M100 150 Q110 160 118 152" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
     <path d="M92 156 Q100 176 108 156 Z" fill="#ff8fa8" ${O}/>`),
  bird: p("pets", "Bird", "Chim", 200, 150, "#3aa0ff",
    `<path d="M40 90 C40 40 90 20 130 40 C150 20 176 22 186 34 C166 40 160 52 160 70 C160 120 110 140 70 130 C50 126 30 120 10 130 C20 112 30 100 40 90 Z" fill="{c}" ${O}/>
     <path d="M70 84 C90 70 120 74 132 96 C110 108 84 106 70 84 Z" fill="#ffffff" fill-opacity="0.7"/>
     <circle cx="150" cy="52" r="6" fill="${INK}"/>
     <path d="M184 34 L200 44 L184 50 Z" fill="#ffb02e" ${O}/>`),
  fish: p("pets", "Fish", "Cá", 220, 130, "#ff8a3d",
    `<path d="M150 64 C130 20 70 14 30 40 C14 52 10 64 10 64 C10 64 14 76 30 88 C70 114 130 108 150 64 Z" fill="{c}" ${O}/>
     <path d="M146 64 L210 18 Q198 64 210 110 Z" fill="{c}" ${O}/>
     <circle cx="44" cy="56" r="7" fill="${INK}"/>
     <path d="M80 34 Q96 64 80 94 M108 38 Q122 64 108 90" fill="none" stroke="#ffffff" stroke-width="5" stroke-opacity="0.55" stroke-linecap="round"/>`),
  paw: p("pets", "Paw", "Dấu chân", 160, 160, "#1d1c1a",
    `<ellipse cx="80" cy="106" rx="40" ry="34" fill="{c}"/>
     <ellipse cx="34" cy="64" rx="15" ry="20" fill="{c}"/><ellipse cx="62" cy="34" rx="15" ry="20" fill="{c}"/><ellipse cx="98" cy="34" rx="15" ry="20" fill="{c}"/><ellipse cx="126" cy="64" rx="15" ry="20" fill="{c}"/>`),

  // ── Tết ──────────────────────────────────────────────────────────────────
  liXi: p("tet", "Lucky envelope", "Bao lì xì", 140, 200, "#d8262f",
    `<rect x="10" y="10" width="120" height="180" rx="10" fill="{c}" ${O}/>
     <path d="M10 20 L70 70 L130 20" fill="none" stroke="#f5c542" stroke-width="5"/>
     <circle cx="70" cy="118" r="34" fill="#f5c542" ${O}/>
     <text x="70" y="132" text-anchor="middle" font-family="serif" font-weight="700" font-size="40" fill="#d8262f">福</text>`),
  maiBranch: p("tet", "Apricot blossom", "Cành mai", 240, 160, "#ffcf3a",
    `<path d="M10 150 C60 120 90 120 120 90 C150 60 190 60 230 20 M120 90 C130 120 160 130 190 130 M80 128 C84 100 70 80 74 60" fill="none" stroke="#5a3a22" stroke-width="7" stroke-linecap="round"/>
     ${[[74, 60], [120, 90], [190, 130], [230, 20], [170, 54], [40, 140], [150, 112], [100, 110]].map(([x, y], i) => `<g>${petals(x, y, 12, 5, i % 3 ? "{c}" : "#ffe17a", 11)}<circle cx="${x}" cy="${y}" r="5" fill="#d8762a"/></g>`).join("")}`),
  lantern: p("tet", "Red lantern", "Đèn lồng đỏ", 140, 220, "#d8262f",
    `<path d="M70 2 V22" stroke="${INK}" stroke-width="4"/>
     <rect x="40" y="20" width="60" height="16" rx="4" fill="#f5c542" ${O}/>
     <ellipse cx="70" cy="100" rx="62" ry="66" fill="{c}" ${O}/>
     <path d="M70 34 C40 60 40 140 70 166 M70 34 C100 60 100 140 70 166 M70 34 V166" fill="none" stroke="#f5c542" stroke-width="4"/>
     <rect x="40" y="162" width="60" height="16" rx="4" fill="#f5c542" ${O}/>
     <path d="M56 178 V214 M70 178 V218 M84 178 V214" stroke="#f5c542" stroke-width="6" stroke-linecap="round"/>`),
  firecrackers: p("tet", "Firecrackers", "Dây pháo", 120, 230, "#d8262f",
    `<path d="M60 4 V220" stroke="#5a3a22" stroke-width="4"/>
     ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${i % 2 ? 62 : 22}" y="${20 + i * 34}" width="36" height="28" rx="6" fill="{c}" ${O} transform="rotate(${i % 2 ? 14 : -14} ${i % 2 ? 80 : 40} ${34 + i * 34})"/>`).join("")}`),

  // ── Halloween ────────────────────────────────────────────────────────────
  pumpkin: p("halloween", "Pumpkin", "Bí ngô", 200, 180, "#ff8a1f",
    `<path d="M100 30 C96 18 100 8 110 4" fill="none" stroke="#3e6b3a" stroke-width="10" stroke-linecap="round"/>
     <ellipse cx="60" cy="104" rx="52" ry="70" fill="{c}" ${O}/><ellipse cx="140" cy="104" rx="52" ry="70" fill="{c}" ${O}/><ellipse cx="100" cy="104" rx="48" ry="74" fill="{c}" ${O}/>
     <path d="M66 82 L84 96 L62 104 Z M134 82 L116 96 L138 104 Z" fill="${INK}"/>
     <path d="M56 130 Q100 168 144 130 L130 136 L120 128 L108 140 L96 128 L84 140 L74 128 Z" fill="${INK}"/>`),
  bat: p("halloween", "Bat", "Dơi", 240, 120, "#2b2140",
    `<path d="M120 40 C110 30 112 18 120 14 C128 18 130 30 120 40 Z M120 40 C96 40 70 10 30 14 C40 30 30 44 8 48 C30 54 40 70 34 90 C56 76 80 82 96 98 C104 78 112 70 120 70 C128 70 136 78 144 98 C160 82 184 76 206 90 C200 70 210 54 232 48 C210 44 200 30 210 14 C170 10 144 40 120 40 Z" fill="{c}" ${O}/>
     <circle cx="112" cy="50" r="4" fill="#ffd23f"/><circle cx="128" cy="50" r="4" fill="#ffd23f"/>`),
  ghost: p("halloween", "Ghost", "Ma", 160, 200, "#ffffff",
    `<path d="M20 190 V80 C20 30 50 8 80 8 C110 8 140 30 140 80 V190 L120 172 L100 190 L80 172 L60 190 L40 172 Z" fill="{c}" ${O}/>
     <ellipse cx="60" cy="80" rx="10" ry="16" fill="${INK}"/><ellipse cx="100" cy="80" rx="10" ry="16" fill="${INK}"/>
     <ellipse cx="80" cy="120" rx="12" ry="16" fill="${INK}"/>`),
  witchHat: p("halloween", "Witch hat", "Mũ phù thuỷ", 220, 180, "#4a2b6b",
    `<path d="M120 6 C100 30 92 60 80 130 H170 C158 80 150 40 176 26 Z" fill="{c}" ${O}/>
     <ellipse cx="110" cy="146" rx="104" ry="26" fill="{c}" ${O}/>
     <path d="M82 122 H168 L170 138 H80 Z" fill="#ff8a1f" ${O}/>
     <rect x="114" y="120" width="20" height="20" fill="none" stroke="#ffd23f" stroke-width="5"/>`),

  // ── Christmas ────────────────────────────────────────────────────────────
  santaHat: p("xmas", "Santa hat", "Mũ Noel", 220, 180, "#e2283f",
    `<path d="M30 130 C40 60 90 20 150 30 C190 36 206 80 196 120 L170 112 C176 80 160 60 140 64 C100 72 90 110 96 130 Z" fill="{c}" ${O}/>
     <rect x="14" y="120" width="196" height="40" rx="20" fill="#ffffff" ${O}/>
     <circle cx="190" cy="126" r="22" fill="#ffffff" ${O}/>`),
  antlers: p("xmas", "Reindeer antlers", "Gạc tuần lộc", 240, 140, "#8a5a32",
    `<path d="M60 136 C56 100 44 80 30 60 M40 74 C26 66 18 52 18 36 M48 90 C60 70 64 50 58 30 M30 60 C30 40 40 20 50 10 M180 136 C184 100 196 80 210 60 M200 74 C214 66 222 52 222 36 M192 90 C180 70 176 50 182 30 M210 60 C210 40 200 20 190 10" fill="none" stroke="{c}" stroke-width="12" stroke-linecap="round"/>
     <path d="M30 136 H210" stroke="#e2283f" stroke-width="10" stroke-linecap="round"/>`),
  xmasTree: p("xmas", "Christmas tree", "Cây thông", 180, 220, "#2f8a4a",
    `<path d="M90 20 L150 100 H118 L166 160 H124 L170 196 H10 L56 160 H14 L62 100 H30 Z" fill="{c}" ${O}/>
     <rect x="76" y="196" width="28" height="20" fill="#8a5a32" ${O}/>
     <path d="M90 2 L96 16 L110 16 L99 25 L103 39 L90 31 L77 39 L81 25 L70 16 L84 16 Z" fill="#ffd23f" ${O}/>
     <g>${[[70, 80, "#e2283f"], [110, 110, "#ffd23f"], [60, 140, "#3aa0ff"], [120, 150, "#e2283f"], [90, 176, "#ffffff"], [50, 182, "#ffd23f"], [134, 184, "#3aa0ff"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="7" fill="${c}" ${O}/>`).join("")}</g>`),
  snowman: p("xmas", "Snowman", "Người tuyết", 160, 220, "#ffffff",
    `<circle cx="80" cy="160" r="54" fill="{c}" ${O}/><circle cx="80" cy="74" r="40" fill="{c}" ${O}/>
     <rect x="50" y="14" width="60" height="30" rx="4" fill="${INK}"/><rect x="36" y="40" width="88" height="10" rx="4" fill="${INK}"/>
     <circle cx="66" cy="68" r="5" fill="${INK}"/><circle cx="94" cy="68" r="5" fill="${INK}"/>
     <path d="M80 80 L108 88 L80 92 Z" fill="#ff8a1f"/>
     <path d="M44 108 Q80 124 116 108" fill="none" stroke="#e2283f" stroke-width="12" stroke-linecap="round"/>
     <circle cx="80" cy="140" r="5" fill="${INK}"/><circle cx="80" cy="164" r="5" fill="${INK}"/>`),

  // ── Mid-Autumn ───────────────────────────────────────────────────────────
  starLantern: p("midautumn", "Star lantern", "Đèn ông sao", 200, 230, "#e2283f",
    `<path d="M100 220 V160" stroke="#8a5a32" stroke-width="7" stroke-linecap="round"/>
     <path d="M100 8 L124 66 L188 70 L138 108 L156 170 L100 136 L44 170 L62 108 L12 70 L76 66 Z" fill="{c}" ${O}/>
     <path d="M100 8 L100 136 M12 70 L138 108 M188 70 L62 108 M44 170 L124 66 M156 170 L76 66" stroke="#ffd23f" stroke-width="3" stroke-opacity="0.8"/>
     <path d="M80 160 V200 M100 162 V206 M120 160 V200" stroke="#ffd23f" stroke-width="5" stroke-linecap="round"/>`),
  mooncake: p("midautumn", "Mooncake", "Bánh trung thu", 180, 180, "#d99a4e",
    `<path d="${Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      const r = i % 2 ? 76 : 86;
      return `${i ? "L" : "M"}${90 + Math.cos(a) * r} ${90 + Math.sin(a) * r}`;
    }).join(" ")} Z" fill="{c}" ${O}/>
     <circle cx="90" cy="90" r="50" fill="none" stroke="#a8692c" stroke-width="5"/>
     <text x="90" y="104" text-anchor="middle" font-family="serif" font-weight="700" font-size="40" fill="#a8692c">月</text>`),
  rabbit: p("midautumn", "Moon rabbit", "Thỏ ngọc", 180, 200, "#ffffff",
    `<path d="M60 70 C40 20 50 4 64 6 C78 10 80 40 76 70 Z M110 70 C112 30 122 6 136 8 C150 12 140 46 124 74 Z" fill="{c}" ${O}/>
     <ellipse cx="94" cy="140" rx="74" ry="56" fill="{c}" ${O}/><circle cx="92" cy="96" r="42" fill="{c}" ${O}/>
     <circle cx="78" cy="92" r="5" fill="${INK}"/><circle cx="108" cy="92" r="5" fill="${INK}"/>
     <ellipse cx="66" cy="106" rx="9" ry="5" fill="#ff9fb8"/><ellipse cx="120" cy="106" rx="9" ry="5" fill="#ff9fb8"/>
     <path d="M92 104 L88 110 H96 Z" fill="#ff8fa8"/>`),
  fullMoon: p("midautumn", "Full moon", "Trăng rằm", 180, 180, "#ffe08a",
    `<circle cx="90" cy="90" r="80" fill="{c}" ${O}/>
     <circle cx="60" cy="70" r="14" fill="#f2c45a"/><circle cx="110" cy="110" r="20" fill="#f2c45a"/><circle cx="118" cy="56" r="9" fill="#f2c45a"/>`),
};

export const PROP_KEYS = Object.keys(PROPS);

export function propsIn(group: PropGroup) {
  return PROP_KEYS.filter((k) => PROPS[k].group === group);
}
