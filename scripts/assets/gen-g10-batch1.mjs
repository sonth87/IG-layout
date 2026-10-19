// Generates G10 Batch 1 sticker expansions:
// 1. sticker/tet (20 -> 50 items, +30)
// 2. sticker/vietnam-heritage (7 -> 40 items, +33)
// 3. sticker/japanese-ukiyoe (12 -> 50 items, +38, rename pack to "Japan" / "Nhật Bản")
// 4. sticker/autumn (NEW pack, 40 items, "Autumn" / "Mùa thu")

import { copyFileSync, existsSync, mkdirSync, readFileSync, utimesSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ASSETS, PACKS } from "./common.mjs";

const SCRIPT_URL = "https://github.com/sonth87/IG-layout/blob/main/scripts/assets/gen-g10-batch1.mjs";
const RETRIEVED = "2026-10-19";

function makeSource(title) {
  return {
    provider: "IG Layout",
    url: SCRIPT_URL,
    author: "IG Layout Vector Studio",
    title,
    license: "CC0-1.0",
    retrieved: RETRIEVED,
  };
}

async function renderSvgToPng(svgBody, outPath, w = 800, h = 800) {
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 200 200">${svgBody}</svg>`;
  await sharp(Buffer.from(fullSvg)).png({ compressionLevel: 6 }).toFile(outPath);
}

/** Ensure existing items in a pack have a source file with older mtime than output so process.mjs skips them. */
function preserveExistingSources(packId, items) {
  const srcDir = path.join(ASSETS, "sticker", packId, "src");
  mkdirSync(srcDir, { recursive: true });
  for (const it of items) {
    const outWebp = path.join(PACKS, "sticker", packId, `${it.id}.webp`);
    const srcWebp = path.join(srcDir, `${it.id}.webp`);
    if (existsSync(outWebp)) {
      if (!existsSync(srcWebp)) copyFileSync(outWebp, srcWebp);
      const past = new Date(Date.now() - 3600_000);
      utimesSync(srcWebp, past, past);
    }
  }
}

// Helper SVG primitives
function flower5(cx, cy, r, fill, centerFill = "#ffcf33", stroke = "#2b1d14", sw = 3.5) {
  let petals = "";
  for (let i = 0; i < 5; i++) {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    const px = (cx + Math.cos(a) * r * 0.58).toFixed(1);
    const py = (cy + Math.sin(a) * r * 0.58).toFixed(1);
    petals += `<circle cx="${px}" cy="${py}" r="${(r * 0.48).toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  }
  return `<g>${petals}<circle cx="${cx}" cy="${cy}" r="${(r * 0.26).toFixed(1)}" fill="${centerFill}" stroke="${stroke}" stroke-width="${sw * 0.85}"/></g>`;
}

function starPolygon(cx, cy, points, rOuter, rInner, fill, stroke = "#2b1d14", sw = 3.5, rotDeg = -90) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const a = ((rotDeg + (i * 180) / points) * Math.PI) / 180;
    const r = i % 2 === 0 ? rOuter : rInner;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
}

// ============================================================================
// 1. PACK: sticker/tet (+30 items -> 50 total)
// ============================================================================
const TET_NEW = [
  {
    id: "tet-zodiac-golden-mouse",
    name: { en: "Golden Zodiac Mouse Holding Coin", vi: "Chuột vàng cầm đồng tiền may mắn" },
    tags: { en: ["mouse", "rat", "zodiac", "tet", "coin"], vi: ["con chuột", "tuổi tý", "con giáp", "tết", "đồng tiền"] },
    collections: ["tet", "vietnam", "cute"],
    svg: `
      <ellipse cx="62" cy="58" rx="26" ry="28" fill="#f5b841" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="62" cy="58" rx="15" ry="17" fill="#ff9eb5"/>
      <ellipse cx="138" cy="58" rx="26" ry="28" fill="#f5b841" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="138" cy="58" rx="15" ry="17" fill="#ff9eb5"/>
      <ellipse cx="100" cy="134" rx="44" ry="42" fill="#f5b841" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="86" r="38" fill="#ffd166" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="84" cy="82" r="5" fill="#2b1d14"/>
      <circle cx="116" cy="82" r="5" fill="#2b1d14"/>
      <ellipse cx="100" cy="94" rx="6" ry="4.5" fill="#e63946"/>
      <path d="M90 103 Q100 111 110 103" fill="none" stroke="#2b1d14" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="100" cy="136" r="22" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4"/>
      <rect x="93" y="129" width="14" height="14" fill="#d62828" stroke="#2b1d14" stroke-width="3"/>
    `,
  },
  {
    id: "tet-zodiac-water-buffalo",
    name: { en: "Vietnamese Water Buffalo Zodiac", vi: "Trâu vàng chăm chỉ mùa xuân" },
    tags: { en: ["buffalo", "ox", "zodiac", "tet", "vietnam"], vi: ["con trâu", "tuổi sửu", "con giáp", "tết", "nhà nông"] },
    collections: ["tet", "vietnam"],
    svg: `
      <path d="M36 62 Q22 30 56 42 Q66 46 72 60" fill="#5c4d42" stroke="#2b1d14" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M164 62 Q178 30 144 42 Q134 46 128 60" fill="#5c4d42" stroke="#2b1d14" stroke-width="4.5" stroke-linecap="round"/>
      <ellipse cx="100" cy="138" rx="48" ry="38" fill="#7f6a5b" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="84" rx="42" ry="34" fill="#8d7768" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="102" rx="28" ry="18" fill="#d9b99b" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="82" cy="76" r="5" fill="#2b1d14"/>
      <circle cx="118" cy="76" r="5" fill="#2b1d14"/>
      <circle cx="90" cy="100" r="4" fill="#2b1d14"/>
      <circle cx="110" cy="100" r="4" fill="#2b1d14"/>
      <circle cx="100" cy="112" r="9" fill="none" stroke="#ffbe0b" stroke-width="4"/>
    `,
  },
  {
    id: "tet-zodiac-lucky-cat",
    name: { en: "Vietnamese Zodiac Cat with Red Collar", vi: "Mèo vàng đeo lục lạc đỏ Tết Mão" },
    tags: { en: ["cat", "zodiac", "mao", "tet", "lucky"], vi: ["con mèo", "tuổi mão", "con giáp", "tết", "lục lạc"] },
    collections: ["tet", "vietnam", "cute"],
    svg: `
      <polygon points="56,74 48,34 86,56" fill="#ffbe55" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="58,68 54,44 78,58" fill="#ff9eb5"/>
      <polygon points="144,74 152,34 114,56" fill="#ffbe55" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="142,68 146,44 122,58" fill="#ff9eb5"/>
      <ellipse cx="100" cy="140" rx="42" ry="36" fill="#ffbe55" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="88" r="40" fill="#ffd166" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="82" cy="84" r="5.5" fill="#2b1d14"/>
      <circle cx="118" cy="84" r="5.5" fill="#2b1d14"/>
      <polygon points="95,94 105,94 100,101" fill="#ff758f"/>
      <path d="M88 105 Q100 112 112 105" fill="none" stroke="#2b1d14" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="68" y="118" width="64" height="12" rx="6" fill="#d62828" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="100" cy="132" r="10" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "tet-zodiac-emerald-snake",
    name: { en: "Coiled Emerald Zodiac Snake", vi: "Rắn lục ngọc cuộn mình đón xuân" },
    tags: { en: ["snake", "zodiac", "tet", "emerald", "spring"], vi: ["con rắn", "tuổi tỵ", "con giáp", "tết", "ngọc bích"] },
    collections: ["tet", "vietnam"],
    svg: `
      <path d="M52 156 Q34 128 66 116 Q134 110 146 136 Q156 162 100 164 Q48 164 44 144" fill="none" stroke="#2a9d8f" stroke-width="26" stroke-linecap="round"/>
      <path d="M52 156 Q34 128 66 116 Q134 110 146 136 Q156 162 100 164 Q48 164 44 144" fill="none" stroke="#2b1d14" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M100 120 Q100 78 100 66" fill="none" stroke="#2a9d8f" stroke-width="24" stroke-linecap="round"/>
      <ellipse cx="100" cy="60" rx="28" ry="24" fill="#52b788" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="88" cy="56" r="5" fill="#2b1d14"/>
      <circle cx="112" cy="56" r="5" fill="#2b1d14"/>
      <path d="M100 84 L100 100 L94 108 M100 100 L106 108" fill="none" stroke="#e63946" stroke-width="3.5" stroke-linecap="round"/>
      <polygon points="90,38 100,22 110,38" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "tet-zodiac-mountain-goat",
    name: { en: "Golden Horned Zodiac Goat", vi: "Dê trắng sừng vàng cát tường" },
    tags: { en: ["goat", "sheep", "zodiac", "tet", "lucky"], vi: ["con dê", "tuổi mùi", "con giáp", "tết", "cát tường"] },
    collections: ["tet", "vietnam", "cute"],
    svg: `
      <path d="M68 56 Q38 24 34 58 Q32 76 54 76" fill="none" stroke="#f4a261" stroke-width="14" stroke-linecap="round"/>
      <path d="M132 56 Q162 24 166 58 Q168 76 146 76" fill="none" stroke="#f4a261" stroke-width="14" stroke-linecap="round"/>
      <circle cx="100" cy="138" r="38" fill="#fff8eb" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="88" rx="36" ry="34" fill="#fff8eb" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="60" r="18" fill="#ffffff" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="84" cy="86" r="5" fill="#2b1d14"/>
      <circle cx="116" cy="86" r="5" fill="#2b1d14"/>
      <path d="M92 104 Q100 112 108 104" fill="none" stroke="#2b1d14" stroke-width="3.5" stroke-linecap="round"/>
      <polygon points="94,122 106,122 100,142" fill="#fff8eb" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "tet-zodiac-clever-monkey",
    name: { en: "Cheerful Zodiac Monkey Holding Peach", vi: "Khỉ con ôm đào tiên mừng thọ" },
    tags: { en: ["monkey", "zodiac", "peach", "tet", "clever"], vi: ["con khỉ", "tuổi thân", "con giáp", "đào tiên", "tết"] },
    collections: ["tet", "vietnam", "cute"],
    svg: `
      <circle cx="52" cy="82" r="18" fill="#b5651d" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="148" cy="82" r="18" fill="#b5651d" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="138" rx="38" ry="36" fill="#b5651d" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="82" r="38" fill="#b5651d" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="88" rx="28" ry="24" fill="#f7d6b5" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="86" cy="80" r="5" fill="#2b1d14"/>
      <circle cx="114" cy="80" r="5" fill="#2b1d14"/>
      <path d="M90 98 Q100 106 110 98" fill="none" stroke="#2b1d14" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M100 118 C80 118 74 142 100 160 C126 142 120 118 100 118 Z" fill="#ff758f" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "tet-zodiac-loyal-dog",
    name: { en: "Loyal Golden Zodiac Dog with Red Scarf", vi: "Chó vàng quàng khăn đỏ đón Tết" },
    tags: { en: ["dog", "puppy", "zodiac", "tet", "loyal"], vi: ["con chó", "tuổi tuất", "con giáp", "tết", "may mắn"] },
    collections: ["tet", "vietnam", "cute"],
    svg: `
      <ellipse cx="58" cy="76" rx="16" ry="28" transform="rotate(20 58 76)" fill="#d48b3b" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="142" cy="76" rx="16" ry="28" transform="rotate(-20 142 76)" fill="#d48b3b" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="142" rx="42" ry="36" fill="#f3a847" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="84" r="38" fill="#f3a847" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="96" rx="20" ry="15" fill="#fff1d6" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="84" cy="78" r="5.5" fill="#2b1d14"/>
      <circle cx="116" cy="78" r="5.5" fill="#2b1d14"/>
      <ellipse cx="100" cy="92" rx="7" ry="5" fill="#2b1d14"/>
      <polygon points="66,116 134,116 100,146" fill="#d62828" stroke="#2b1d14" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="100" cy="130" r="6" fill="#ffbe0b"/>
    `,
  },
  {
    id: "tet-zodiac-chubby-pig",
    name: { en: "Prosperous Chubby Pink Zodiac Pig", vi: "Heo hồng phú quý tròn trịa" },
    tags: { en: ["pig", "boar", "zodiac", "tet", "prosperous"], vi: ["con heo", "con lợn", "tuổi hợi", "con giáp", "phú quý"] },
    collections: ["tet", "vietnam", "cute"],
    svg: `
      <polygon points="56,64 46,36 80,50" fill="#ff9ebb" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="144,64 154,36 120,50" fill="#ff9ebb" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <ellipse cx="100" cy="112" rx="58" ry="52" fill="#ffb3c6" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="110" rx="22" ry="16" fill="#ff758f" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="92" cy="110" r="4.5" fill="#2b1d14"/>
      <circle cx="108" cy="110" r="4.5" fill="#2b1d14"/>
      <circle cx="76" cy="88" r="5.5" fill="#2b1d14"/>
      <circle cx="124" cy="88" r="5.5" fill="#2b1d14"/>
      <circle cx="100" cy="54" r="14" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>
      <rect x="95" y="49" width="10" height="10" fill="#d62828"/>
    `,
  },
  {
    id: "tet-chu-loc-diamond",
    name: { en: "Crimson Diamond Calligraphy Lộc Plaque", vi: "Liễn đỏ hình thoi chữ Lộc vàng kim" },
    tags: { en: ["loc", "calligraphy", "plaque", "tet", "prosperity"], vi: ["chữ lộc", "thư pháp", "liễn đỏ", "tài lộc", "tết"] },
    collections: ["tet", "vietnam"],
    svg: `
      <polygon points="100,14 182,96 100,178 18,96" fill="#d62828" stroke="#ffbe0b" stroke-width="6" stroke-linejoin="round"/>
      <polygon points="100,26 170,96 100,166 30,96" fill="none" stroke="#ffdf70" stroke-width="2.5"/>
      <path d="M74 78 Q100 58 124 72 Q106 96 82 116 Q104 126 126 112" fill="none" stroke="#ffbe0b" stroke-width="9" stroke-linecap="round"/>
      <circle cx="92" cy="96" r="5" fill="#ffbe0b"/>
      <line x1="100" y1="178" x2="100" y2="196" stroke="#d62828" stroke-width="6" stroke-linecap="round"/>
      <line x1="92" y1="180" x2="88" y2="196" stroke="#ffbe0b" stroke-width="4" stroke-linecap="round"/>
      <line x1="108" y1="180" x2="112" y2="196" stroke="#ffbe0b" stroke-width="4" stroke-linecap="round"/>
    `,
  },
  {
    id: "tet-chu-tho-medallion",
    name: { en: "Golden Longevity Thọ Round Medallion", vi: "Khánh tròn chữ Thọ trường sinh vàng đỏ" },
    tags: { en: ["longevity", "tho", "medallion", "tet", "emblem"], vi: ["chữ thọ", "trường thọ", "khánh tròn", "tết", "vàng đỏ"] },
    collections: ["tet", "vietnam"],
    svg: `
      <circle cx="100" cy="100" r="76" fill="#d62828" stroke="#2b1d14" stroke-width="5"/>
      <circle cx="100" cy="100" r="66" fill="none" stroke="#ffbe0b" stroke-width="5" stroke-dasharray="12 6"/>
      <circle cx="100" cy="100" r="52" fill="#b81d13" stroke="#ffbe0b" stroke-width="3.5"/>
      <path d="M76 72 H124 M100 60 V140 M72 96 H128 M78 120 H122 M82 138 H118" stroke="#ffbe0b" stroke-width="7" stroke-linecap="round"/>
    `,
  },
  {
    id: "tet-chu-an-scroll",
    name: { en: "Hanging Red Scroll with Peace Ornament", vi: "Tranh treo dọc chữ An bình yên" },
    tags: { en: ["scroll", "peace", "an", "tet", "hanging"], vi: ["chữ an", "bình an", "tranh liễn", "tết", "mùa xuân"] },
    collections: ["tet", "vietnam"],
    svg: `
      <line x1="60" y1="28" x2="100" y2="12" stroke="#ffbe0b" stroke-width="4"/>
      <line x1="140" y1="28" x2="100" y2="12" stroke="#ffbe0b" stroke-width="4"/>
      <rect x="52" y="28" width="96" height="136" rx="4" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="42" y="24" width="116" height="12" rx="6" fill="#8b4513" stroke="#2b1d14" stroke-width="4"/>
      <rect x="42" y="158" width="116" height="12" rx="6" fill="#8b4513" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="100" cy="96" r="34" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>
      <path d="M84 84 H116 M100 72 V116 M82 104 Q100 120 118 104" fill="none" stroke="#b81d13" stroke-width="6" stroke-linecap="round"/>
    `,
  },
  {
    id: "tet-chu-tai-gold-coin",
    name: { en: "Ancient Bronze Coin with Red Ribbon", vi: "Đồng tiền cổ buộc dây đỏ chiêu tài" },
    tags: { en: ["coin", "bronze", "wealth", "tet", "lucky"], vi: ["đồng tiền cổ", "chiêu tài", "dây đỏ", "may mắn", "tết"] },
    collections: ["tet", "vietnam"],
    svg: `
      <path d="M100 18 Q76 42 100 76 Q124 42 100 18 Z" fill="#e63946" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="100" cy="112" r="64" fill="#ffbe0b" stroke="#2b1d14" stroke-width="5"/>
      <circle cx="100" cy="112" r="52" fill="#f4a261" stroke="#2b1d14" stroke-width="3"/>
      <rect x="82" y="94" width="36" height="36" fill="#ffffff" fill-opacity="0.01" stroke="#2b1d14" stroke-width="5"/>
      <circle cx="100" cy="68" r="6" fill="#2b1d14"/>
      <circle cx="100" cy="156" r="6" fill="#2b1d14"/>
      <circle cx="56" cy="112" r="6" fill="#2b1d14"/>
      <circle cx="144" cy="112" r="6" fill="#2b1d14"/>
    `,
  },
  {
    id: "tet-spring-red-banner",
    name: { en: "Festive Horizontal Spring Ribbon Banner", vi: "Hoành phi đỏ viền vàng mừng xuân" },
    tags: { en: ["banner", "ribbon", "spring", "tet", "festive"], vi: ["hoành phi", "băng rôn", "mừng xuân", "đỏ vàng", "tết"] },
    collections: ["tet", "vietnam"],
    svg: `
      <path d="M16 76 Q100 54 184 76 L172 128 Q100 108 28 128 Z" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M26 84 Q100 64 174 84 L164 118 Q100 100 36 118 Z" fill="none" stroke="#ffbe0b" stroke-width="3.5"/>
      <circle cx="64" cy="96" r="10" fill="#ffbe0b"/>
      <circle cx="100" cy="92" r="12" fill="#ffbe0b"/>
      <circle cx="136" cy="96" r="10" fill="#ffbe0b"/>
    `,
  },
  {
    id: "tet-apricot-bonsai-pot",
    name: { en: "Blooming Yellow Apricot Bonsai Tree", vi: "Chậu mai vàng thế rồng nở rộ" },
    tags: { en: ["apricot", "mai", "bonsai", "tet", "yellow flower"], vi: ["cây mai", "chậu mai vàng", "bonsai", "tết miền nam", "hoa mai"] },
    collections: ["tet", "vietnam", "floral"],
    svg: `
      <polygon points="56,144 144,144 130,184 70,184" fill="#c1121f" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <rect x="48" y="134" width="104" height="14" rx="6" fill="#e63946" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M100 134 Q72 108 88 82 Q114 58 76 42 M88 82 Q128 74 144 48" fill="none" stroke="#6c462f" stroke-width="11" stroke-linecap="round"/>
      ${flower5(66, 46, 22, "#ffbe0b", "#fb8500")}
      ${flower5(108, 42, 24, "#ffd166", "#fb8500")}
      ${flower5(142, 58, 22, "#ffbe0b", "#fb8500")}
      ${flower5(72, 86, 20, "#ffd166", "#fb8500")}
      ${flower5(122, 88, 22, "#ffbe0b", "#fb8500")}
    `,
  },
  {
    id: "tet-peach-blossom-vase",
    name: { en: "Blue Porcelain Vase with Pink Peach Blossoms", vi: "Bình gốm xanh cắm cành đào bích" },
    tags: { en: ["peach blossom", "vase", "porcelain", "tet", "floral"], vi: ["bình hoa đào", "đào bích", "gốm sứ", "tết miền bắc", "hoa xuân"] },
    collections: ["tet", "vietnam", "floral"],
    svg: `
      <path d="M84 114 Q58 134 64 166 Q70 184 100 184 Q130 184 136 166 Q142 134 116 114 Z" fill="#457b9d" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="80" y="102" width="40" height="14" rx="4" fill="#a8dadc" stroke="#2b1d14" stroke-width="4"/>
      <path d="M96 102 Q76 66 56 42 M104 102 Q118 62 142 38" fill="none" stroke="#5c3a21" stroke-width="7" stroke-linecap="round"/>
      ${flower5(58, 44, 22, "#ff758f", "#c9184a")}
      ${flower5(94, 52, 24, "#ff8fa3", "#c9184a")}
      ${flower5(138, 44, 22, "#ff758f", "#c9184a")}
      ${flower5(116, 78, 19, "#ffb3c6", "#c9184a")}
    `,
  },
  {
    id: "tet-marigold-pot-pair",
    name: { en: "Festive Yellow Chrysanthemum Pot", vi: "Chậu cúc mâm xôi vàng rực ngày Tết" },
    tags: { en: ["chrysanthemum", "marigold", "flower pot", "tet", "yellow"], vi: ["cúc mâm xôi", "chậu cúc vàng", "hoa tết", "mùa xuân", "tết"] },
    collections: ["tet", "vietnam", "floral"],
    svg: `
      <polygon points="58,136 142,136 128,182 72,182" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <ellipse cx="100" cy="96" rx="64" ry="44" fill="#2a9d8f" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="64" cy="96" r="16" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="100" cy="80" r="18" fill="#ffd166" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="136" cy="96" r="16" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="82" cy="112" r="15" fill="#ffd166" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="118" cy="112" r="15" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="100" cy="62" r="14" fill="#ff9f1c" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "tet-pussy-willow-vase",
    name: { en: "Red Vase of Red Pussy Willow Branches", vi: "Bình nụ tầm xuân đỏ may mắn" },
    tags: { en: ["pussy willow", "vase", "branches", "tet", "red"], vi: ["nụ tầm xuân", "bình hoa tết", "lộc xuân", "đỏ thắm", "tết"] },
    collections: ["tet", "vietnam", "floral"],
    svg: `
      <path d="M78 118 L68 182 H132 L122 118 Z" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M92 118 Q74 72 54 28 M100 118 V22 M108 118 Q126 72 146 28" fill="none" stroke="#5c3a21" stroke-width="5.5" stroke-linecap="round"/>
      <ellipse cx="64" cy="52" rx="7" ry="10" fill="#ff4d6d" stroke="#2b1d14" stroke-width="3"/>
      <ellipse cx="78" cy="78" rx="7" ry="10" fill="#ff758f" stroke="#2b1d14" stroke-width="3"/>
      <ellipse cx="100" cy="42" rx="7" ry="10" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3"/>
      <ellipse cx="100" cy="72" rx="7" ry="10" fill="#ff4d6d" stroke="#2b1d14" stroke-width="3"/>
      <ellipse cx="136" cy="52" rx="7" ry="10" fill="#ff758f" stroke="#2b1d14" stroke-width="3"/>
      <ellipse cx="122" cy="78" rx="7" ry="10" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3"/>
    `,
  },
  {
    id: "tet-orchid-purple-branch",
    name: { en: "Purple Phalaenopsis Orchid Spray", vi: "Cành hoa lan hồ điệp tím sang trọng" },
    tags: { en: ["orchid", "phalaenopsis", "purple", "tet", "flower"], vi: ["lan hồ điệp", "hoa lan tím", "hoa tết", "sang trọng", "mùa xuân"] },
    collections: ["tet", "vietnam", "floral"],
    svg: `
      <path d="M36 164 Q82 110 156 36" fill="none" stroke="#386641" stroke-width="7" stroke-linecap="round"/>
      ${flower5(74, 122, 28, "#c77dff", "#ffbe0b")}
      ${flower5(112, 84, 30, "#9d4edd", "#ffbe0b")}
      ${flower5(148, 48, 24, "#e0aaff", "#ffbe0b")}
    `,
  },
  {
    id: "tet-narcissus-porcelain-bowl",
    name: { en: "White Narcissus Bulbs in Ceramic Bowl", vi: "Bát hoa thuỷ tiên trắng thanh tao" },
    tags: { en: ["narcissus", "daffodil", "bowl", "tet", "flower"], vi: ["hoa thuỷ tiên", "bát sứ", "thanh tao", "tết hà nội", "hoa xuân"] },
    collections: ["tet", "vietnam", "floral"],
    svg: `
      <path d="M38 132 H162 Q154 176 100 176 Q46 176 38 132 Z" fill="#a8dadc" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M74 132 Q62 82 54 44 M100 132 V36 M126 132 Q138 82 146 44" fill="none" stroke="#2a9d8f" stroke-width="7" stroke-linecap="round"/>
      ${flower5(62, 54, 22, "#ffffff", "#ffbe0b")}
      ${flower5(100, 42, 24, "#ffffff", "#ffbe0b")}
      ${flower5(138, 54, 22, "#ffffff", "#ffbe0b")}
    `,
  },
  {
    id: "tet-mut-tet-hex-box",
    name: { en: "Hexagonal Candied Fruit Mứt Tết Tray", vi: "Khay mứt Tết lục giác sáu ngăn" },
    tags: { en: ["candied fruit", "mut tet", "tray", "snacks", "tet"], vi: ["khay mứt tết", "mứt dừa", "mứt sen", "bánh mứt", "tết"] },
    collections: ["tet", "vietnam", "food"],
    svg: `
      <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="#d62828" stroke="#2b1d14" stroke-width="5" stroke-linejoin="round"/>
      <line x1="100" y1="20" x2="100" y2="180" stroke="#ffbe0b" stroke-width="4"/>
      <line x1="30" y1="60" x2="170" y2="140" stroke="#ffbe0b" stroke-width="4"/>
      <line x1="170" y1="60" x2="30" y2="140" stroke="#ffbe0b" stroke-width="4"/>
      <circle cx="100" cy="100" r="24" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="100" cy="54" r="10" fill="#80ed99"/>
      <circle cx="138" cy="78" r="10" fill="#ff9f1c"/>
      <circle cx="138" cy="122" r="10" fill="#fff3b0"/>
      <circle cx="100" cy="146" r="10" fill="#ff758f"/>
      <circle cx="62" cy="122" r="10" fill="#ffd166"/>
      <circle cx="62" cy="78" r="10" fill="#a8dadc"/>
    `,
  },
  {
    id: "tet-roasted-watermelon-seeds",
    name: { en: "Bowl of Red Roasted Watermelon Seeds", vi: "Đĩa hạt dưa đỏ cắn ngày xuân" },
    tags: { en: ["watermelon seeds", "hat dua", "snack", "tet", "red"], vi: ["hạt dưa", "đĩa hạt dưa", "nhâm nhi", "ngày tết", "đỏ may mắn"] },
    collections: ["tet", "vietnam", "food"],
    svg: `
      <ellipse cx="100" cy="120" rx="72" ry="44" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="116" rx="58" ry="32" fill="#fff3b0" stroke="#2b1d14" stroke-width="3"/>
      <ellipse cx="80" cy="112" rx="9" ry="14" transform="rotate(-25 80 112)" fill="#d62828" stroke="#2b1d14" stroke-width="3"/>
      <ellipse cx="102" cy="106" rx="9" ry="14" transform="rotate(15 102 106)" fill="#e63946" stroke="#2b1d14" stroke-width="3"/>
      <ellipse cx="122" cy="116" rx="9" ry="14" transform="rotate(40 122 116)" fill="#d62828" stroke="#2b1d14" stroke-width="3"/>
      <ellipse cx="92" cy="124" rx="9" ry="14" transform="rotate(-10 92 124)" fill="#e63946" stroke="#2b1d14" stroke-width="3"/>
    `,
  },
  {
    id: "tet-thit-kho-tau-bowl",
    name: { en: "Braised Pork Belly & Eggs Tết Bowl", vi: "Tô thịt kho tàu trứng vịt nước dừa" },
    tags: { en: ["braised pork", "thit kho tau", "eggs", "tet food", "vietnam"], vi: ["thịt kho tàu", "thịt kho hột vịt", "món ăn tết", "ẩm thực", "tết"] },
    collections: ["tet", "vietnam", "food"],
    svg: `
      <path d="M26 106 H174 Q166 172 100 172 Q34 172 26 106 Z" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="106" rx="74" ry="26" fill="#bc6c25" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="60" y="88" width="32" height="24" rx="5" fill="#9c4110" stroke="#2b1d14" stroke-width="3.5"/>
      <rect x="98" y="92" width="32" height="24" rx="5" fill="#7f3209" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="80" cy="112" r="14" fill="#fff8eb" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="80" cy="112" r="7" fill="#ff9f1c"/>
      <circle cx="126" cy="104" r="14" fill="#fff8eb" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="126" cy="104" r="7" fill="#ff9f1c"/>
    `,
  },
  {
    id: "tet-pickled-scallion-dish",
    name: { en: "Pickled Scallions & Dried Shrimp Dish", vi: "Đĩa củ kiệu tôm khô ngày Tết" },
    tags: { en: ["pickled scallions", "cu kieu", "dried shrimp", "tet", "food"], vi: ["củ kiệu", "tôm khô", "dưa hành", "món tết", "ẩm thực"] },
    collections: ["tet", "vietnam", "food"],
    svg: `
      <ellipse cx="100" cy="124" rx="74" ry="40" fill="#a8dadc" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="78" cy="118" rx="18" ry="8" transform="rotate(-20 78 118)" fill="#ffffff" stroke="#2b1d14" stroke-width="3.5"/>
      <ellipse cx="98" cy="128" rx="18" ry="8" transform="rotate(15 98 128)" fill="#ffffff" stroke="#2b1d14" stroke-width="3.5"/>
      <ellipse cx="118" cy="114" rx="18" ry="8" transform="rotate(-10 118 114)" fill="#ffffff" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="94" cy="110" r="8" fill="#fb8500" stroke="#2b1d14" stroke-width="3"/>
      <circle cx="112" cy="126" r="8" fill="#fb8500" stroke="#2b1d14" stroke-width="3"/>
    `,
  },
  {
    id: "tet-carved-watermelon-pair",
    name: { en: "Green Tết Watermelon with Lucky Red Sticker", vi: "Quả dưa hấu xanh dán giấy đỏ Tết" },
    tags: { en: ["watermelon", "dua hau", "fruit", "tet", "lucky"], vi: ["dưa hấu tết", "dưa hấu đỏ", "mâm ngũ quả", "trái cây", "tết"] },
    collections: ["tet", "vietnam", "food"],
    svg: `
      <path d="M98 34 Q112 18 124 28" fill="none" stroke="#386641" stroke-width="6" stroke-linecap="round"/>
      <circle cx="100" cy="108" r="68" fill="#2d6a4f" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M68 48 Q52 108 68 168 M100 40 V176 M132 48 Q148 108 132 168" fill="none" stroke="#1b4332" stroke-width="6"/>
      <polygon points="100,72 134,106 100,140 66,106" fill="#d62828" stroke="#ffbe0b" stroke-width="4"/>
      <circle cx="100" cy="106" r="10" fill="#ffbe0b"/>
    `,
  },
  {
    id: "tet-red-folding-fan",
    name: { en: "Crimson Folding Paper Fan with Apricot Blossoms", vi: "Quạt giấy đỏ vẽ hoa mai vàng" },
    tags: { en: ["folding fan", "red fan", "apricot", "tet", "decor"], vi: ["quạt giấy đỏ", "quạt xếp", "hoa mai", "trang trí tết", "mùa xuân"] },
    collections: ["tet", "vietnam"],
    svg: `
      <path d="M22 126 A84 84 0 0 1 178 126 L100 162 Z" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <line x1="100" y1="162" x2="48" y2="74" stroke="#ffbe0b" stroke-width="3"/>
      <line x1="100" y1="162" x2="100" y2="56" stroke="#ffbe0b" stroke-width="3"/>
      <line x1="100" y1="162" x2="152" y2="74" stroke="#ffbe0b" stroke-width="3"/>
      ${flower5(78, 96, 18, "#ffbe0b", "#fb8500")}
      ${flower5(122, 96, 18, "#ffd166", "#fb8500")}
    `,
  },
  {
    id: "tet-gold-pouch-lucky",
    name: { en: "Embroidered Red Silk Drawstring Money Pouch", vi: "Túi gấm đỏ đựng vàng tài lộc" },
    tags: { en: ["money pouch", "lucky bag", "gold", "tet", "wealth"], vi: ["túi gấm", "túi tiền", "tài lộc", "đỏ vàng", "tết"] },
    collections: ["tet", "vietnam"],
    svg: `
      <path d="M68 54 L82 78 H118 L132 54 Z" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <ellipse cx="100" cy="126" rx="54" ry="48" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="74" y="72" width="52" height="12" rx="6" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="100" cy="128" r="24" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4"/>
      <rect x="92" y="120" width="16" height="16" fill="#d62828"/>
    `,
  },
  {
    id: "tet-gold-ingot-sycee",
    name: { en: "Golden Boat Ingot Kim Nguyên Bảo", vi: "Thỏi vàng Kim Nguyên Bảo phát tài" },
    tags: { en: ["gold ingot", "sycee", "wealth", "prosperity", "tet"], vi: ["thỏi vàng", "kim nguyên bảo", "phát tài", "tài lộc", "tết"] },
    collections: ["tet", "vietnam"],
    svg: `
      <ellipse cx="100" cy="96" rx="44" ry="28" fill="#ffd166" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M24 94 Q100 124 176 94 L152 152 Q100 172 48 152 Z" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M46 98 Q100 72 154 98" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
    `,
  },
  {
    id: "tet-festive-dragon-mask",
    name: { en: "Golden & Red Festive Dragon Dance Head", vi: "Đầu rồng vàng múa hội xuân" },
    tags: { en: ["dragon dance", "festival", "mask", "tet", "golden"], vi: ["múa rồng", "đầu rồng", "lễ hội xuân", "tết", "vàng đỏ"] },
    collections: ["tet", "vietnam"],
    svg: `
      <polygon points="48,54 34,20 72,42" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4"/>
      <polygon points="152,54 166,20 128,42" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4"/>
      <rect x="44" y="50" width="112" height="96" rx="28" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="74" cy="88" r="16" fill="#ffffff" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="74" cy="88" r="7" fill="#2b1d14"/>
      <circle cx="126" cy="88" r="16" fill="#ffffff" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="126" cy="88" r="7" fill="#2b1d14"/>
      <rect x="58" y="120" width="84" height="22" rx="8" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="100" cy="54" r="12" fill="#2a9d8f" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "tet-red-festival-drum",
    name: { en: "Ceremonial Red Tết Drum on Stand", vi: "Trống hội xuân sơn son thếp vàng" },
    tags: { en: ["drum", "festival", "ceremonial", "tet", "red"], vi: ["trống hội", "trống xuân", "lễ hội tết", "sơn son", "tết"] },
    collections: ["tet", "vietnam"],
    svg: `
      <line x1="64" y1="142" x2="48" y2="182" stroke="#6c462f" stroke-width="9" stroke-linecap="round"/>
      <line x1="136" y1="142" x2="152" y2="182" stroke="#6c462f" stroke-width="9" stroke-linecap="round"/>
      <circle cx="100" cy="96" r="58" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="96" r="44" fill="#fff3b0" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="100" cy="96" r="18" fill="#d62828" stroke="#ffbe0b" stroke-width="4"/>
    `,
  },
  {
    id: "tet-jade-chime-tassel",
    name: { en: "Auspicious Mystic Knot & Red Tassel", vi: "Nút thắt cát tường tua rua đỏ" },
    tags: { en: ["mystic knot", "tassel", "lucky charm", "tet", "red"], vi: ["dây cát tường", "nút thắt đỏ", "tua rua", "bình an", "tết"] },
    collections: ["tet", "vietnam"],
    svg: `
      <line x1="100" y1="16" x2="100" y2="44" stroke="#d62828" stroke-width="6" stroke-linecap="round"/>
      <polygon points="100,40 144,84 100,128 56,84" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="100,56 128,84 100,112 72,84" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>
      <rect x="90" y="128" width="20" height="12" rx="4" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>
      <path d="M92 140 L82 184 M100 140 V186 M108 140 L118 184" stroke="#d62828" stroke-width="6" stroke-linecap="round"/>
    `,
  },
];

// ============================================================================
// 2. PACK: sticker/vietnam-heritage (+33 items -> 40 total)
// ============================================================================
const VN_NEW = [
  {
    id: "vn-one-pillar-pagoda",
    name: { en: "Hanoi One Pillar Pagoda Illustration", vi: "Chùa Một Cột Hà Nội trên hồ sen" },
    tags: { en: ["one pillar pagoda", "hanoi", "temple", "vietnam", "landmark"], vi: ["chùa một cột", "hà nội", "di sản", "kiến trúc cổ", "việt nam"] },
    collections: ["vietnam", "travel"],
    svg: `
      <ellipse cx="100" cy="172" rx="74" ry="14" fill="#48cae4" stroke="#2b1d14" stroke-width="4"/>
      <rect x="86" y="106" width="28" height="62" fill="#adb5bd" stroke="#2b1d14" stroke-width="4.5"/>
      <line x1="70" y1="106" x2="86" y2="132" stroke="#6c462f" stroke-width="5"/>
      <line x1="130" y1="106" x2="114" y2="132" stroke="#6c462f" stroke-width="5"/>
      <rect x="52" y="72" width="96" height="36" fill="#bc6c25" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M24 76 Q100 26 176 76 Z" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: "vn-khue-van-cac-pavilion",
    name: { en: "Khue Van Cac Temple of Literature Emblem", vi: "Khuê Văn Các Văn Miếu Quốc Tử Giám" },
    tags: { en: ["khue van cac", "temple of literature", "hanoi", "vietnam", "pavilion"], vi: ["khuê văn các", "văn miếu", "hà nội", "biểu tượng", "di sản"] },
    collections: ["vietnam", "travel"],
    svg: `
      <rect x="34" y="138" width="132" height="40" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="50" y="76" width="100" height="62" fill="#bc4749" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="107" r="22" fill="#fff3b0" stroke="#ffbe0b" stroke-width="5"/>
      <path d="M26 80 L100 42 L174 80 Z" fill="#9e2a2b" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M38 56 L100 24 L162 56 Z" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: "vn-hoi-an-bridge-pagoda",
    name: { en: "Hoi An Covered Bridge Pagoda", vi: "Chùa Cầu Hội An phố cổ" },
    tags: { en: ["hoi an", "covered bridge", "pagoda", "vietnam", "heritage"], vi: ["chùa cầu", "hội an", "phố cổ", "di sản", "du lịch"] },
    collections: ["vietnam", "travel"],
    svg: `
      <path d="M18 158 Q100 128 182 158 L182 176 H18 Z" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="64" cy="172" r="16" fill="#457b9d" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="136" cy="172" r="16" fill="#457b9d" stroke="#2b1d14" stroke-width="4"/>
      <rect x="34" y="92" width="132" height="52" fill="#f4a261" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M16 96 L100 48 L184 96 Z" fill="#9e2a2b" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: "vn-turtle-tower-hanoi",
    name: { en: "Hoan Kiem Lake Turtle Tower", vi: "Tháp Rùa Hồ Gươm cổ kính" },
    tags: { en: ["turtle tower", "hoan kiem", "hanoi", "vietnam", "landmark"], vi: ["tháp rùa", "hồ gươm", "hồ hoàn kiếm", "hà nội", "cổ kính"] },
    collections: ["vietnam", "travel"],
    svg: `
      <ellipse cx="100" cy="168" rx="76" ry="18" fill="#52b788" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="52" y="118" width="96" height="44" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="64" y="80" width="72" height="38" fill="#f4a261" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="78" y="48" width="44" height="32" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5"/>
      <polygon points="70,48 100,24 130,48" fill="#d62828" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "vn-ngo-mon-hue-gate",
    name: { en: "Hue Imperial Citadel Ngo Mon Gate", vi: "Ngọ Môn Kinh thành Huế" },
    tags: { en: ["hue", "imperial gate", "ngo mon", "vietnam", "heritage"], vi: ["ngọ môn", "cố đô huế", "kinh thành huế", "di sản", "kiến trúc"] },
    collections: ["vietnam", "travel"],
    svg: `
      <rect x="20" y="118" width="160" height="58" fill="#bc4749" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M84 176 V142 A16 16 0 0 1 116 142 V176 Z" fill="#2b1d14"/>
      <rect x="48" y="76" width="104" height="42" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M30 80 L100 40 L170 80 Z" fill="#f4a261" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: "vn-communal-temple-roof",
    name: { en: "Curved Blade Vietnamese Village Temple Roof", vi: "Mái đình làng Việt mũi hài uốn cong" },
    tags: { en: ["temple roof", "village", "architecture", "vietnam", "heritage"], vi: ["mái đình", "đình làng", "mũi hài", "cổ truyền", "việt nam"] },
    collections: ["vietnam", "vintage"],
    svg: `
      <rect x="44" y="108" width="112" height="64" fill="#fff3b0" stroke="#2b1d14" stroke-width="4.5"/>
      <line x1="72" y1="108" x2="72" y2="172" stroke="#6c462f" stroke-width="7"/>
      <line x1="128" y1="108" x2="128" y2="172" stroke="#6c462f" stroke-width="7"/>
      <path d="M14 96 Q30 116 48 112 H152 Q170 116 186 96 Q146 66 100 42 Q54 66 14 96 Z" fill="#c1121f" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: "vn-ha-long-kissing-rocks",
    name: { en: "Ha Long Bay Fighting Cock Limestone Islets", vi: "Hòn Trống Mái vịnh Hạ Long" },
    tags: { en: ["ha long bay", "islets", "limestone", "vietnam", "travel"], vi: ["hạ long", "hòn trống mái", "kỳ quan", "du lịch", "việt nam"] },
    collections: ["vietnam", "travel", "nature"],
    svg: `
      <ellipse cx="100" cy="164" rx="78" ry="18" fill="#00b4d8" stroke="#2b1d14" stroke-width="4.5"/>
      <polygon points="44,160 28,74 82,52 94,160" fill="#6c757d" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="108,160 118,64 172,82 154,160" fill="#495057" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="58" cy="64" r="14" fill="#52b788"/>
      <circle cx="142" cy="76" r="14" fill="#52b788"/>
    `,
  },
  {
    id: "vn-golden-hands-bridge",
    name: { en: "Da Nang Golden Bridge Curved Walkway", vi: "Cầu Vàng Đà Nẵng nâng trên đôi bàn tay đá" },
    tags: { en: ["golden bridge", "da nang", "landmark", "vietnam", "travel"], vi: ["cầu vàng", "đà nẵng", "du lịch", "danh thắng", "việt nam"] },
    collections: ["vietnam", "travel"],
    svg: `
      <path d="M18 116 Q100 62 182 116" fill="none" stroke="#ffbe0b" stroke-width="18" stroke-linecap="round"/>
      <path d="M18 116 Q100 62 182 116" fill="none" stroke="#2b1d14" stroke-width="4.5" stroke-linecap="round"/>
      <rect x="52" y="102" width="28" height="58" rx="10" fill="#adb5bd" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="120" y="102" width="28" height="58" rx="10" fill="#adb5bd" stroke="#2b1d14" stroke-width="4.5"/>
    `,
  },
  {
    id: "vn-non-la-conical-hat",
    name: { en: "Vietnamese Bamboo Conical Hat Nón Lá", vi: "Chiếc nón lá tre quai lụa hồng" },
    tags: { en: ["non la", "conical hat", "bamboo", "vietnam", "traditional"], vi: ["nón lá", "quai lụa", "truyền thống", "duyên dáng", "việt nam"] },
    collections: ["vietnam", "travel"],
    svg: `
      <path d="M52 126 Q100 184 148 126" fill="none" stroke="#ff758f" stroke-width="6" stroke-linecap="round"/>
      <polygon points="100,36 18,128 182,128" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <line x1="68" y1="72" x2="132" y2="72" stroke="#bc6c25" stroke-width="3"/>
      <line x1="44" y1="98" x2="156" y2="98" stroke="#bc6c25" stroke-width="3"/>
    `,
  },
  {
    id: "vn-ao-dai-white-lotus",
    name: { en: "Traditional White Silk Áo Dài Dress", vi: "Tà áo dài lụa trắng điểm hoa sen" },
    tags: { en: ["ao dai", "silk dress", "traditional", "vietnam", "fashion"], vi: ["áo dài", "tà áo dài", "hoa sen", "truyền thống", "việt nam"] },
    collections: ["vietnam"],
    svg: `
      <path d="M74 28 H126 L142 64 L124 72 L118 56 V100 L136 178 H104 L100 116 L96 178 H64 L82 100 V56 L76 72 L58 64 Z" fill="#fff8eb" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      ${flower5(100, 78, 16, "#ff758f", "#ffbe0b")}
    `,
  },
  {
    id: "vn-ao-tu-than-hat",
    name: { en: "Northern Quai Thao Flat Hat & Silk Ribbon", vi: "Nón quai thao Kinh Bắc quan họ" },
    tags: { en: ["quai thao", "quan ho", "hat", "vietnam", "folklore"], vi: ["nón quai thao", "quan họ", "bắc ninh", "dân ca", "việt nam"] },
    collections: ["vietnam", "vintage"],
    svg: `
      <path d="M46 112 Q100 176 154 112" fill="none" stroke="#ff758f" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="100" cy="94" rx="78" ry="24" fill="#bc6c25" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="84" rx="78" ry="24" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="84" r="22" fill="#bc6c25" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "vn-dong-son-bronze-drum",
    name: { en: "Dong Son Bronze Drum Sunburst Face", vi: "Mặt trống đồng Đông Sơn ngôi sao 14 cánh" },
    tags: { en: ["dong son", "bronze drum", "lac bird", "vietnam", "ancient"], vi: ["trống đồng", "đông sơn", "ngọc lũ", "di sản", "việt nam"] },
    collections: ["vietnam", "vintage"],
    svg: `
      <circle cx="100" cy="100" r="80" fill="#b08968" stroke="#2b1d14" stroke-width="5"/>
      <circle cx="100" cy="100" r="64" fill="none" stroke="#ffbe0b" stroke-width="4" stroke-dasharray="10 6"/>
      <circle cx="100" cy="100" r="46" fill="none" stroke="#2b1d14" stroke-width="3.5"/>
      ${starPolygon(100, 100, 12, 34, 14, "#ffbe0b", "#2b1d14", 3)}
    `,
  },
  {
    id: "vn-lac-bird-totem",
    name: { en: "Golden Dong Son Flying Lạc Bird Totem", vi: "Chim Lạc vàng tung cánh bay" },
    tags: { en: ["lac bird", "dong son", "totem", "vietnam", "golden"], vi: ["chim lạc", "văn lang", "trống đồng", "biểu tượng", "việt nam"] },
    collections: ["vietnam", "vintage"],
    svg: `
      <path d="M18 96 L86 88 L64 42 L114 82 L182 64 L132 104 L168 148 L102 114 L34 142 Z" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="44" cy="92" r="4" fill="#2b1d14"/>
    `,
  },
  {
    id: "vn-dan-bau-monochord",
    name: { en: "Traditional Vietnamese Đàn Bầu Monochord", vi: "Cây đàn bầu độc huyền cầm" },
    tags: { en: ["dan bau", "monochord", "instrument", "music", "vietnam"], vi: ["đàn bầu", "độc huyền cầm", "nhạc cụ dân tộc", "âm nhạc", "việt nam"] },
    collections: ["vietnam", "music"],
    svg: `
      <polygon points="24,142 176,126 176,154 24,162" fill="#8b4513" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M42 142 Q34 66 56 44" fill="none" stroke="#e9c46a" stroke-width="7" stroke-linecap="round"/>
      <circle cx="52" cy="76" r="14" fill="#f4a261" stroke="#2b1d14" stroke-width="4"/>
      <line x1="56" y1="48" x2="168" y2="132" stroke="#2b1d14" stroke-width="3"/>
    `,
  },
  {
    id: "vn-dan-nguyet-moon-lute",
    name: { en: "Vietnamese Moon-Shaped Lute Đàn Nguyệt", vi: "Đàn nguyệt cổ truyền dáng trăng tròn" },
    tags: { en: ["dan nguyet", "moon lute", "instrument", "music", "vietnam"], vi: ["đàn nguyệt", "đàn kìm", "nhạc cụ", "cổ truyền", "việt nam"] },
    collections: ["vietnam", "music"],
    svg: `
      <rect x="92" y="18" width="16" height="92" rx="4" fill="#6c462f" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="134" r="48" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="86" y="142" width="28" height="10" rx="3" fill="#6c462f" stroke="#2b1d14" stroke-width="3.5"/>
      <line x1="97" y1="24" x2="97" y2="142" stroke="#2b1d14" stroke-width="2.5"/>
      <line x1="103" y1="24" x2="103" y2="142" stroke="#2b1d14" stroke-width="2.5"/>
    `,
  },
  {
    id: "vn-woven-bamboo-fan",
    name: { en: "Hand-Woven Bamboo Heart Leaf Fan", vi: "Quạt nan tre đan tay mộc mạc" },
    tags: { en: ["bamboo fan", "woven", "craft", "vietnam", "summer"], vi: ["quạt nan", "quạt tre", "mộc mạc", "làng nghề", "việt nam"] },
    collections: ["vietnam", "summer"],
    svg: `
      <path d="M100 32 C156 32 174 92 100 144 C26 92 44 32 100 32 Z" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M72 68 L128 112 M128 68 L72 112" stroke="#bc6c25" stroke-width="4"/>
      <rect x="93" y="136" width="14" height="44" rx="5" fill="#8b4513" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "vn-bamboo-shoulder-pole",
    name: { en: "Street Vendor Bamboo Shoulder Pole & Baskets", vi: "Đôi quang gánh thúng tre hàng rong" },
    tags: { en: ["shoulder pole", "street vendor", "baskets", "vietnam", "heritage"], vi: ["quang gánh", "hàng rong", "thúng tre", "thôn quê", "việt nam"] },
    collections: ["vietnam", "vintage"],
    svg: `
      <path d="M22 68 Q100 38 178 68" fill="none" stroke="#bc6c25" stroke-width="10" stroke-linecap="round"/>
      <line x1="48" y1="60" x2="32" y2="132" stroke="#2b1d14" stroke-width="3"/>
      <line x1="48" y1="60" x2="64" y2="132" stroke="#2b1d14" stroke-width="3"/>
      <line x1="152" y1="60" x2="136" y2="132" stroke="#2b1d14" stroke-width="3"/>
      <line x1="152" y1="60" x2="168" y2="132" stroke="#2b1d14" stroke-width="3"/>
      <path d="M22 132 H74 Q68 164 48 164 Q28 164 22 132 Z" fill="#e9c46a" stroke="#2b1d14" stroke-width="4"/>
      <path d="M126 132 H178 Q172 164 152 164 Q132 164 126 132 Z" fill="#e9c46a" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "vn-cyclo-pedicab",
    name: { en: "Old Quarter Red Cushion Cyclo Pedicab", vi: "Xe xích lô dạo phố cổ Hà Nội" },
    tags: { en: ["cyclo", "pedicab", "old quarter", "hanoi", "vietnam"], vi: ["xích lô", "phố cổ", "hà nội", "du lịch", "việt nam"] },
    collections: ["vietnam", "travel"],
    svg: `
      <path d="M36 96 Q36 52 88 52 L98 96 Z" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <rect x="44" y="96" width="64" height="32" rx="8" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <line x1="108" y1="112" x2="152" y2="136" stroke="#2b1d14" stroke-width="6"/>
      <circle cx="66" cy="142" r="26" fill="#ffffff" fill-opacity="0.1" stroke="#2b1d14" stroke-width="6"/>
      <circle cx="154" cy="146" r="22" fill="#ffffff" fill-opacity="0.1" stroke="#2b1d14" stroke-width="6"/>
    `,
  },
  {
    id: "vn-round-basket-boat",
    name: { en: "Coastal Woven Round Bamboo Basket Boat", vi: "Thuyền thúng tre làng chài miền biển" },
    tags: { en: ["basket boat", "thuyen thung", "coastal", "vietnam", "beach"], vi: ["thuyền thúng", "làng chài", "miền biển", "ngư dân", "việt nam"] },
    collections: ["vietnam", "beach", "travel"],
    svg: `
      <path d="M22 104 H178 Q168 168 100 168 Q32 168 22 104 Z" fill="#bc6c25" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="104" rx="78" ry="24" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5"/>
      <line x1="56" y1="146" x2="156" y2="62" stroke="#6c462f" stroke-width="8" stroke-linecap="round"/>
    `,
  },
  {
    id: "vn-mekong-wooden-sampan",
    name: { en: "Mekong River Wooden Painted Eyes Boat", vi: "Ghe gỗ miền Tây vẽ mắt thuyền" },
    tags: { en: ["sampan", "mekong", "wooden boat", "vietnam", "river"], vi: ["ghe bầu", "thuyền gỗ", "miền tây", "sông nước", "việt nam"] },
    collections: ["vietnam", "travel"],
    svg: `
      <path d="M14 102 Q100 124 186 92 L162 148 Q100 162 38 148 Z" fill="#9c4110" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M68 112 Q100 68 134 110 Z" fill="#e9c46a" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="44" cy="122" rx="10" ry="6" fill="#ffffff" stroke="#2b1d14" stroke-width="3"/>
      <circle cx="44" cy="122" r="3" fill="#2b1d14"/>
    `,
  },
  {
    id: "vn-hoi-an-silk-lanterns",
    name: { en: "Trio of Glowing Hoi An Silk Lanterns", vi: "Chùm đèn lồng lụa Hội An rực rỡ" },
    tags: { en: ["hoi an", "silk lanterns", "glowing", "vietnam", "festive"], vi: ["đèn lồng hội an", "đèn lụa", "phố cổ", "lung linh", "việt nam"] },
    collections: ["vietnam", "tet", "midAutumn"],
    svg: `
      <ellipse cx="56" cy="96" rx="28" ry="36" fill="#e63946" stroke="#2b1d14" stroke-width="4"/>
      <polygon points="100,28 134,74 100,120 66,74" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="144" cy="104" rx="28" ry="32" fill="#2a9d8f" stroke="#2b1d14" stroke-width="4"/>
      <line x1="56" y1="132" x2="56" y2="162" stroke="#d62828" stroke-width="5"/>
      <line x1="100" y1="120" x2="100" y2="154" stroke="#fb8500" stroke-width="5"/>
      <line x1="144" y1="136" x2="144" y2="166" stroke="#2a9d8f" stroke-width="5"/>
    `,
  },
  {
    id: "vn-water-puppet-teu",
    name: { en: "Chú Tễu Vietnamese Water Puppet Figure", vi: "Chú Tễu múa rối nước truyền thống" },
    tags: { en: ["water puppet", "chu teu", "folklore", "vietnam", "theater"], vi: ["chú tễu", "múa rối nước", "dân gian", "nghệ thuật", "việt nam"] },
    collections: ["vietnam", "cute"],
    svg: `
      <circle cx="72" cy="44" r="12" fill="#2b1d14"/>
      <circle cx="128" cy="44" r="12" fill="#2b1d14"/>
      <circle cx="100" cy="74" r="34" fill="#fcd5ce" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="88" cy="68" r="4.5" fill="#2b1d14"/>
      <circle cx="112" cy="68" r="4.5" fill="#2b1d14"/>
      <path d="M86 84 Q100 96 114 84" fill="none" stroke="#d62828" stroke-width="4" stroke-linecap="round"/>
      <path d="M58 108 H142 L152 168 H48 Z" fill="#e63946" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="100" cy="138" r="14" fill="#ffbe0b"/>
    `,
  },
  {
    id: "vn-bat-trang-ceramic-vase",
    name: { en: "Blue & White Bát Tràng Lotus Ceramic Vase", vi: "Bình gốm Bát Tràng men lam vẽ hoa sen" },
    tags: { en: ["bat trang", "ceramics", "porcelain", "lotus", "vietnam"], vi: ["gốm bát tràng", "men lam", "bình gốm", "hoa sen", "việt nam"] },
    collections: ["vietnam", "vintage"],
    svg: `
      <path d="M76 32 H124 L116 64 C154 88 152 156 124 178 H76 C48 156 46 88 84 64 Z" fill="#f8f9fa" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <rect x="74" y="32" width="52" height="12" fill="#1d3557" stroke="#2b1d14" stroke-width="3.5"/>
      ${flower5(100, 120, 28, "#457b9d", "#1d3557")}
    `,
  },
  {
    id: "vn-pink-lotus-bloom",
    name: { en: "Blooming Pink Vietnamese Lotus Flower", vi: "Đoá hoa sen hồng quốc hoa Việt Nam" },
    tags: { en: ["lotus", "pink flower", "national flower", "vietnam", "floral"], vi: ["hoa sen", "sen hồng", "quốc hoa", "thanh khiết", "việt nam"] },
    collections: ["vietnam", "floral", "nature"],
    svg: `
      <ellipse cx="64" cy="128" rx="34" ry="18" transform="rotate(-30 64 128)" fill="#ff8fa3" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="136" cy="128" rx="34" ry="18" transform="rotate(30 136 128)" fill="#ff8fa3" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="76" cy="98" rx="24" ry="42" transform="rotate(-20 76 98)" fill="#ff758f" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="124" cy="98" rx="24" ry="42" transform="rotate(20 124 98)" fill="#ff758f" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="100" cy="88" rx="26" ry="48" fill="#ffb3c6" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="122" rx="18" ry="10" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "vn-lotus-leaf-dew",
    name: { en: "Green Lotus Leaf Pad with Morning Dewdrops", vi: "Lá sen xanh đọng giọt sương mai" },
    tags: { en: ["lotus leaf", "dewdrop", "pond", "nature", "vietnam"], vi: ["lá sen", "giọt sương", "đầm sen", "thiên nhiên", "việt nam"] },
    collections: ["vietnam", "nature"],
    svg: `
      <ellipse cx="100" cy="104" rx="76" ry="62" fill="#40916c" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="104" r="10" fill="#95d5b2" stroke="#2b1d14" stroke-width="3"/>
      <path d="M100 94 V42 M100 114 V166 M90 104 H24 M110 104 H176 M92 96 L44 58 M108 96 L156 58 M92 112 L44 150 M108 112 L156 150" stroke="#1b4332" stroke-width="3"/>
      <circle cx="128" cy="82" r="9" fill="#caf0f8" stroke="#2b1d14" stroke-width="3"/>
    `,
  },
  {
    id: "vn-pho-bo-noodle-bowl",
    name: { en: "Steaming Bowl of Vietnamese Beef Phở", vi: "Tô phở bò Hà Nội nóng hổi" },
    tags: { en: ["pho", "beef noodle", "soup", "vietnam", "food"], vi: ["phở bò", "tô phở", "ẩm thực việt", "hà nội", "món ngon"] },
    collections: ["vietnam", "food"],
    svg: `
      <path d="M22 104 H178 Q166 174 100 174 Q34 174 22 104 Z" fill="#457b9d" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="104" rx="78" ry="28" fill="#f4a261" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M52 104 Q82 88 116 106 M64 114 Q98 98 134 112" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="78" cy="96" rx="18" ry="10" fill="#9e2a2b" stroke="#2b1d14" stroke-width="3"/>
      <ellipse cx="122" cy="98" rx="16" ry="9" fill="#9e2a2b" stroke="#2b1d14" stroke-width="3"/>
      <circle cx="100" cy="112" r="8" fill="#2a9d8f"/>
      <line x1="56" y1="62" x2="178" y2="42" stroke="#6c462f" stroke-width="6" stroke-linecap="round"/>
      <line x1="56" y1="74" x2="178" y2="56" stroke="#6c462f" stroke-width="6" stroke-linecap="round"/>
    `,
  },
  {
    id: "vn-banh-mi-baguette",
    name: { en: "Crispy Saigon Bánh Mì Sandwich", vi: "Ổ bánh mì thịt nguội Sài Gòn giòn rụm" },
    tags: { en: ["banh mi", "baguette", "sandwich", "saigon", "food"], vi: ["bánh mì", "bánh mì sài gòn", "ẩm thực đường phố", "món việt", "ăn sáng"] },
    collections: ["vietnam", "food"],
    svg: `
      <ellipse cx="100" cy="106" rx="78" ry="38" transform="rotate(-14 100 106)" fill="#e07a5f" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M36 108 Q100 84 164 98" fill="none" stroke="#52b788" stroke-width="14" stroke-linecap="round"/>
      <path d="M46 114 Q100 94 154 104" fill="none" stroke="#e63946" stroke-width="10" stroke-linecap="round"/>
      <path d="M58 84 L76 96 M92 76 L110 88 M126 70 L144 82" stroke="#fff3b0" stroke-width="5" stroke-linecap="round"/>
    `,
  },
  {
    id: "vn-ca-phe-phin-drip",
    name: { en: "Vietnamese Iced Milk Coffee with Metal Phin Filter", vi: "Ly cà phê phin sữa đá đậm đà" },
    tags: { en: ["ca phe phin", "iced coffee", "condensed milk", "vietnam", "coffee"], vi: ["cà phê phin", "cà phê sữa đá", "bạc xỉu", "sài gòn", "đồ uống"] },
    collections: ["vietnam", "coffee", "food"],
    svg: `
      <polygon points="62,92 138,92 128,180 72,180" fill="#fff8eb" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="64,96 136,96 130,152 70,152" fill="#5c3a21"/>
      <rect x="48" y="84" width="104" height="10" rx="5" fill="#adb5bd" stroke="#2b1d14" stroke-width="4"/>
      <rect x="68" y="40" width="64" height="44" fill="#ced4da" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="60" y="32" width="80" height="10" rx="5" fill="#adb5bd" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="100" cy="26" r="6" fill="#adb5bd" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "vn-goi-cuon-spring-rolls",
    name: { en: "Fresh Shrimp & Herb Rice Paper Spring Rolls", vi: "Cặp gỏi cuốn tôm thịt chấm tương" },
    tags: { en: ["spring rolls", "goi cuon", "shrimp", "vietnam", "food"], vi: ["gỏi cuốn", "tôm thịt", "ẩm thực việt", "món ngon", "việt nam"] },
    collections: ["vietnam", "food"],
    svg: `
      <rect x="34" y="64" width="116" height="36" rx="18" transform="rotate(-15 92 82)" fill="#fff8eb" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="68" cy="86" r="10" fill="#fb8500"/>
      <circle cx="96" cy="78" r="10" fill="#fb8500"/>
      <circle cx="122" cy="72" r="9" fill="#52b788"/>
      <rect x="48" y="112" width="116" height="36" rx="18" transform="rotate(-15 106 130)" fill="#fff8eb" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="82" cy="134" r="10" fill="#fb8500"/>
      <circle cx="110" cy="126" r="10" fill="#fb8500"/>
      <circle cx="136" cy="120" r="9" fill="#52b788"/>
    `,
  },
  {
    id: "vn-banh-xeo-crispy-crepe",
    name: { en: "Golden Crispy Vietnamese Bánh Xèo Crepe", vi: "Bánh xèo vàng giòn nhân tôm giá" },
    tags: { en: ["banh xeo", "crispy crepe", "turmeric", "vietnam", "food"], vi: ["bánh xèo", "vàng giòn", "đặc sản", "ẩm thực", "việt nam"] },
    collections: ["vietnam", "food"],
    svg: `
      <path d="M24 128 A78 68 0 0 1 176 92 L100 156 Z" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="128" cy="126" r="14" fill="#fb8500" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="98" cy="138" r="12" fill="#52b788" stroke="#2b1d14" stroke-width="3.5"/>
      <path d="M44 124 Q100 72 162 96" fill="#ffd166" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "vn-bun-dau-bamboo-tray",
    name: { en: "Bamboo Tray of Bún Đậu Mắm Tôm", vi: "Mẹt bún đậu mắm tôm lót lá chuối" },
    tags: { en: ["bun dau", "bamboo tray", "tofu", "vietnam", "food"], vi: ["bún đậu mắm tôm", "mẹt tre", "lá chuối", "hà nội", "ẩm thực"] },
    collections: ["vietnam", "food"],
    svg: `
      <circle cx="100" cy="100" r="78" fill="#e9c46a" stroke="#2b1d14" stroke-width="5"/>
      <circle cx="100" cy="100" r="64" fill="#40916c" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="100" cy="100" r="20" fill="#9d4edd" stroke="#ffffff" stroke-width="5"/>
      <rect x="52" y="64" width="24" height="20" rx="4" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3"/>
      <rect x="124" y="64" width="24" height="20" rx="4" fill="#ffffff" stroke="#2b1d14" stroke-width="3"/>
      <rect x="64" y="124" width="28" height="20" rx="4" fill="#f4a261" stroke="#2b1d14" stroke-width="3"/>
      <circle cx="128" cy="132" r="12" fill="#80ed99" stroke="#2b1d14" stroke-width="3"/>
    `,
  },
  {
    id: "vn-che-ba-mau-glass",
    name: { en: "Three-Color Vietnamese Dessert Glass Chè Ba Màu", vi: "Ly chè ba màu đậu đỏ cốt dừa" },
    tags: { en: ["che ba mau", "dessert", "sweet soup", "vietnam", "food"], vi: ["chè ba màu", "cốt dừa", "món tráng miệng", "mùa hè", "việt nam"] },
    collections: ["vietnam", "food", "summer"],
    svg: `
      <polygon points="56,52 144,52 130,176 70,176" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <rect x="68" y="138" width="64" height="34" fill="#9e2a2b"/>
      <rect x="64" y="102" width="72" height="36" fill="#ffbe0b"/>
      <rect x="60" y="68" width="80" height="34" fill="#52b788"/>
      <line x1="122" y1="24" x2="104" y2="148" stroke="#ff758f" stroke-width="8" stroke-linecap="round"/>
    `,
  },
  {
    id: "vn-fresh-green-coconut",
    name: { en: "Fresh Bến Tre Green Coconut with Straw", vi: "Trái dừa xiêm xanh cắm ống hút" },
    tags: { en: ["coconut", "dua xiem", "drink", "summer", "vietnam"], vi: ["dừa tươi", "dừa xiêm", "bến tre", "giải khát", "việt nam"] },
    collections: ["vietnam", "summer", "beach", "food"],
    svg: `
      <line x1="112" y1="68" x2="142" y2="22" stroke="#e63946" stroke-width="8" stroke-linecap="round"/>
      <circle cx="100" cy="118" r="58" fill="#52b788" stroke="#2b1d14" stroke-width="4.5"/>
      <polygon points="56,74 100,52 144,74 128,88 72,88" fill="#fff8eb" stroke="#2b1d14" stroke-width="4" stroke-linejoin="round"/>
    `,
  },
];

// ============================================================================
// 3. PACK: sticker/japanese-ukiyoe -> rename "Japan" / "Nhật Bản" (+38 items -> 50 total)
// ============================================================================
const JP_NEW = [
  {
    id: "jp-kamon-chrysanthemum",
    name: { en: "Imperial Sixteen-Petal Chrysanthemum Kamon Crest", vi: "Gia huy Kamon hoa cúc mười sáu cánh" },
    tags: { en: ["kamon", "chrysanthemum", "crest", "japan", "monochrome"], vi: ["gia huy", "kamon", "hoa cúc", "nhật bản", "cổ điển"] },
    collections: ["japan", "vintage", "minimal"],
    svg: `
      <circle cx="100" cy="100" r="80" fill="#1f1f1f"/>
      ${Array.from({ length: 16 }, (_, i) => {
        const a = (i * 22.5 * Math.PI) / 180;
        const x = (100 + Math.cos(a) * 44).toFixed(1);
        const y = (100 + Math.sin(a) * 44).toFixed(1);
        return `<ellipse cx="${x}" cy="${y}" rx="28" ry="10" transform="rotate(${i * 22.5} ${x} ${y})" fill="#f8f5ee" stroke="#1f1f1f" stroke-width="3"/>`;
      }).join("")}
      <circle cx="100" cy="100" r="18" fill="#f8f5ee" stroke="#1f1f1f" stroke-width="4"/>
    `,
  },
  {
    id: "jp-kamon-hollyhock-tokugawa",
    name: { en: "Three Hollyhock Leaves Kamon Crest", vi: "Gia huy Kamon ba lá thục quỳ tròn" },
    tags: { en: ["kamon", "hollyhock", "crest", "japan", "emblem"], vi: ["gia huy", "kamon", "lá thục quỳ", "nhật bản", "đơn sắc"] },
    collections: ["japan", "vintage", "minimal"],
    svg: `
      <circle cx="100" cy="100" r="80" fill="none" stroke="#1f1f1f" stroke-width="12"/>
      <circle cx="100" cy="62" r="24" fill="#1f1f1f"/>
      <circle cx="67" cy="118" r="24" fill="#1f1f1f"/>
      <circle cx="133" cy="118" r="24" fill="#1f1f1f"/>
      <circle cx="100" cy="100" r="10" fill="#f8f5ee"/>
    `,
  },
  {
    id: "jp-kamon-sakura-crest",
    name: { en: "Monochrome Sakura Blossom Kamon Crest", vi: "Gia huy Kamon hoa anh đào năm cánh" },
    tags: { en: ["kamon", "sakura", "cherry blossom", "japan", "crest"], vi: ["gia huy", "kamon", "hoa anh đào", "nhật bản", "tối giản"] },
    collections: ["japan", "floral", "minimal"],
    svg: `
      <circle cx="100" cy="100" r="80" fill="none" stroke="#1f1f1f" stroke-width="10"/>
      ${flower5(100, 100, 62, "#1f1f1f", "#f8f5ee", "#f8f5ee", 3)}
    `,
  },
  {
    id: "jp-kamon-crane-circle",
    name: { en: "Circular Folding Wings Tsuru Crane Kamon", vi: "Gia huy Kamon cánh hạc vòng tròn" },
    tags: { en: ["kamon", "crane", "tsuru", "japan", "crest"], vi: ["gia huy", "kamon", "chim hạc", "nhật bản", "truyền thống"] },
    collections: ["japan", "vintage", "minimal"],
    svg: `
      <circle cx="100" cy="100" r="80" fill="#1f1f1f"/>
      <path d="M36 96 Q100 28 164 96 Q132 156 100 156 Q68 156 36 96 Z" fill="#f8f5ee"/>
      <circle cx="100" cy="76" r="12" fill="#1f1f1f"/>
      <path d="M56 106 H144 M68 124 H132" stroke="#1f1f1f" stroke-width="6"/>
    `,
  },
  {
    id: "jp-kamon-mitsudomoe",
    name: { en: "Traditional Three Swirling Comma Mitsudomoe Crest", vi: "Gia huy Kamon xoáy tam thái cực Mitsudomoe" },
    tags: { en: ["kamon", "mitsudomoe", "swirl", "japan", "crest"], vi: ["gia huy", "mitsudomoe", "xoáy tròn", "nhật bản", "cổ truyền"] },
    collections: ["japan", "vintage", "minimal"],
    svg: `
      <circle cx="100" cy="100" r="80" fill="none" stroke="#1f1f1f" stroke-width="11"/>
      <circle cx="100" cy="64" r="22" fill="#1f1f1f"/>
      <circle cx="69" cy="118" r="22" fill="#1f1f1f"/>
      <circle cx="131" cy="118" r="22" fill="#1f1f1f"/>
    `,
  },
  {
    id: "jp-kamon-plum-blossom",
    name: { en: "Geometric Ume Plum Blossom Kamon Emblem", vi: "Gia huy Kamon hoa mơ Ume cổ điển" },
    tags: { en: ["kamon", "ume", "plum blossom", "japan", "crest"], vi: ["gia huy", "hoa mơ", "ume", "nhật bản", "đơn sắc"] },
    collections: ["japan", "floral", "minimal"],
    svg: `
      ${flower5(100, 100, 78, "#1f1f1f", "#f8f5ee", "#f8f5ee", 4)}
      <circle cx="100" cy="100" r="16" fill="#1f1f1f"/>
    `,
  },
  {
    id: "jp-kamon-bamboo-crest",
    name: { en: "Ringed Bamboo Stalk & Leaves Kamon", vi: "Gia huy Kamon vòng trúc xanh" },
    tags: { en: ["kamon", "bamboo", "take", "japan", "crest"], vi: ["gia huy", "tre trúc", "kamon", "nhật bản", "tối giản"] },
    collections: ["japan", "nature", "minimal"],
    svg: `
      <circle cx="100" cy="100" r="78" fill="none" stroke="#1f1f1f" stroke-width="12" stroke-dasharray="36 8"/>
      <polygon points="100,44 76,96 100,88 124,96" fill="#1f1f1f"/>
      <polygon points="72,96 52,144 88,128" fill="#1f1f1f"/>
      <polygon points="128,96 148,144 112,128" fill="#1f1f1f"/>
    `,
  },
  {
    id: "jp-kamon-seigaiha-wave",
    name: { en: "Seigaiha Blue Ocean Wave Pattern Medallion", vi: "Huy hiệu hoạ tiết sóng biển Seigaiha" },
    tags: { en: ["seigaiha", "wave pattern", "kamon", "japan", "ocean"], vi: ["sóng biển", "seigaiha", "hoạ tiết nhật", "nhật bản", "cổ điển"] },
    collections: ["japan", "vintage"],
    svg: `
      <circle cx="100" cy="100" r="80" fill="#1d3557" stroke="#2b1d14" stroke-width="5"/>
      <circle cx="100" cy="116" r="54" fill="none" stroke="#f8f5ee" stroke-width="6"/>
      <circle cx="100" cy="116" r="38" fill="none" stroke="#f8f5ee" stroke-width="6"/>
      <circle cx="100" cy="116" r="22" fill="none" stroke="#f8f5ee" stroke-width="6"/>
    `,
  },
  {
    id: "jp-kamon-folding-fan",
    name: { en: "Monochrome Sensu Folding Fan Kamon Crest", vi: "Gia huy Kamon quạt xếp Sensu" },
    tags: { en: ["kamon", "fan", "sensu", "japan", "crest"], vi: ["gia huy", "quạt xếp", "kamon", "nhật bản", "tối giản"] },
    collections: ["japan", "minimal", "vintage"],
    svg: `
      <circle cx="100" cy="100" r="80" fill="none" stroke="#1f1f1f" stroke-width="10"/>
      <path d="M40 112 A68 68 0 0 1 160 112 L100 148 Z" fill="#1f1f1f"/>
      <line x1="100" y1="148" x2="66" y2="66" stroke="#f8f5ee" stroke-width="4"/>
      <line x1="100" y1="148" x2="100" y2="56" stroke="#f8f5ee" stroke-width="4"/>
      <line x1="100" y1="148" x2="134" y2="66" stroke="#f8f5ee" stroke-width="4"/>
    `,
  },
  {
    id: "jp-kamon-maple-triple",
    name: { en: "Triple Momiji Maple Leaf Kamon Emblem", vi: "Gia huy Kamon ba chiếc lá phong" },
    tags: { en: ["kamon", "maple", "momiji", "japan", "crest"], vi: ["gia huy", "lá phong", "momiji", "nhật bản", "cổ truyền"] },
    collections: ["japan", "autumn", "minimal"],
    svg: `
      <circle cx="100" cy="100" r="80" fill="none" stroke="#1f1f1f" stroke-width="10"/>
      ${starPolygon(100, 66, 5, 28, 12, "#1f1f1f", "#1f1f1f", 2)}
      ${starPolygon(70, 120, 5, 28, 12, "#1f1f1f", "#1f1f1f", 2, 30)}
      ${starPolygon(130, 120, 5, 28, 12, "#1f1f1f", "#1f1f1f", 2, -30)}
    `,
  },
  {
    id: "jp-daruma-red-doll",
    name: { en: "Red Lucky Wishing Daruma Doll", vi: "Búp bê Daruma đỏ cầu may Nhật Bản" },
    tags: { en: ["daruma", "lucky doll", "red", "japan", "wish"], vi: ["búp bê daruma", "cầu may", "nhật bản", "đỏ may mắn", "truyền thống"] },
    collections: ["japan", "cute"],
    svg: `
      <ellipse cx="100" cy="106" rx="68" ry="74" fill="#d62828" stroke="#2b1d14" stroke-width="5"/>
      <ellipse cx="100" cy="82" rx="48" ry="34" fill="#fff3b0" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="80" cy="80" r="12" fill="#ffffff" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="80" cy="80" r="6" fill="#2b1d14"/>
      <circle cx="120" cy="80" r="12" fill="#ffffff" stroke="#2b1d14" stroke-width="4"/>
      <path d="M66 64 Q80 54 92 64 M108 64 Q120 54 134 64" fill="none" stroke="#2b1d14" stroke-width="5" stroke-linecap="round"/>
      <path d="M72 136 V164 M100 132 V168 M128 136 V164" stroke="#ffbe0b" stroke-width="6" stroke-linecap="round"/>
    `,
  },
  {
    id: "jp-maneki-neko-lucky-cat",
    name: { en: "White Beckoning Maneki-Neko Lucky Cat", vi: "Mèo thần tài Maneki-neko vẫy tay chiêu lộc" },
    tags: { en: ["maneki neko", "lucky cat", "beckoning", "japan", "kobans"], vi: ["mèo thần tài", "maneki neko", "chiêu tài", "nhật bản", "dễ thương"] },
    collections: ["japan", "cute"],
    svg: `
      <polygon points="56,68 48,30 84,52" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5"/>
      <polygon points="58,62 54,40 76,54" fill="#e63946"/>
      <polygon points="144,68 152,30 116,52" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5"/>
      <polygon points="142,62 146,40 124,54" fill="#e63946"/>
      <ellipse cx="100" cy="138" rx="46" ry="40" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="84" r="40" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="52" cy="96" rx="14" ry="24" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="84" cy="80" r="5" fill="#2b1d14"/>
      <circle cx="116" cy="80" r="5" fill="#2b1d14"/>
      <rect x="68" y="114" width="64" height="10" rx="5" fill="#d62828" stroke="#2b1d14" stroke-width="3.5"/>
      <ellipse cx="100" cy="148" rx="18" ry="26" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "jp-red-torii-shrine-gate",
    name: { en: "Vermilion Shinto Shrine Torii Gate", vi: "Cổng thần đạo Torii đỏ son" },
    tags: { en: ["torii", "shrine gate", "shinto", "japan", "landmark"], vi: ["cổng torii", "đền thần đạo", "nhật bản", "du lịch", "biểu tượng"] },
    collections: ["japan", "travel"],
    svg: `
      <rect x="52" y="54" width="16" height="128" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="132" y="54" width="16" height="128" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="30" y="72" width="140" height="14" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M16 38 Q100 54 184 38 L176 58 H24 Z" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <rect x="48" y="168" width="24" height="16" fill="#2b1d14"/>
      <rect x="128" y="168" width="24" height="16" fill="#2b1d14"/>
    `,
  },
  {
    id: "jp-mount-fuji-red-sun",
    name: { en: "Snow-Capped Mount Fuji & Crimson Rising Sun", vi: "Núi Phú Sĩ phủ tuyết trắng và mặt trời đỏ" },
    tags: { en: ["mount fuji", "rising sun", "mountain", "japan", "ukiyoe"], vi: ["núi phú sĩ", "mặt trời mọc", "nhật bản", "biểu tượng", "du lịch"] },
    collections: ["japan", "travel", "nature"],
    svg: `
      <circle cx="100" cy="78" r="46" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <polygon points="100,56 18,168 182,168" fill="#457b9d" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="100,56 68,100 84,94 100,106 116,94 132,100" fill="#ffffff" stroke="#2b1d14" stroke-width="4" stroke-linejoin="round"/>
    `,
  },
  {
    id: "jp-great-wave-crest",
    name: { en: "Stylized Indigo Ukiyo-e Ocean Wave Crest", vi: "Ngọn sóng thần Ukiyo-e màu chàm bọt trắng" },
    tags: { en: ["great wave", "ukiyoe", "ocean", "indigo", "japan"], vi: ["sóng thần", "ukiyoe", "biển xanh", "nhật bản", "nghệ thuật"] },
    collections: ["japan", "vintage", "beach"],
    svg: `
      <path d="M18 156 Q44 52 132 52 Q168 52 156 88 Q120 76 106 114 Q148 112 182 156 Z" fill="#1d3557" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="136" cy="52" r="14" fill="#ffffff" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="158" cy="68" r="12" fill="#ffffff" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="148" cy="90" r="10" fill="#ffffff" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "jp-golden-cloud-scroll",
    name: { en: "Traditional Golden Japanese Cloud Kumo Motif", vi: "Đám mây vàng Kumo uốn lượn cổ điển" },
    tags: { en: ["cloud", "kumo", "golden", "japan", "motif"], vi: ["đám mây vàng", "mây ngũ sắc", "hoạ tiết", "nhật bản", "cổ điển"] },
    collections: ["japan", "vintage"],
    svg: `
      <path d="M24 122 H176 A22 22 0 0 0 156 82 A28 28 0 0 0 104 68 A26 26 0 0 0 54 84 A20 20 0 0 0 24 122 Z" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M48 106 Q74 88 104 106 Q134 124 156 102" fill="none" stroke="#2b1d14" stroke-width="4" stroke-linecap="round"/>
    `,
  },
  {
    id: "jp-sakura-pink-blossom",
    name: { en: "Notched Five-Petal Pink Sakura Flower", vi: "Bông hoa anh đào Sakura hồng phấn" },
    tags: { en: ["sakura", "cherry blossom", "pink flower", "japan", "spring"], vi: ["hoa anh đào", "sakura", "hồng phấn", "mùa xuân", "nhật bản"] },
    collections: ["japan", "floral", "cute"],
    svg: `
      ${flower5(100, 100, 74, "#ffb3c6", "#ff4d6d", "#2b1d14", 4.5)}
    `,
  },
  {
    id: "jp-sakura-flowering-branch",
    name: { en: "Flowering Pink Sakura Cherry Blossom Branch", vi: "Cành hoa anh đào nở rộ mùa xuân" },
    tags: { en: ["sakura branch", "cherry blossom", "spring", "japan", "floral"], vi: ["cành anh đào", "sakura", "mùa xuân", "nhật bản", "hoa lá"] },
    collections: ["japan", "floral"],
    svg: `
      <path d="M22 152 Q88 108 176 48" fill="none" stroke="#5c3a21" stroke-width="9" stroke-linecap="round"/>
      ${flower5(68, 118, 28, "#ffb3c6", "#ff4d6d")}
      ${flower5(116, 86, 30, "#ff8fa3", "#ff4d6d")}
      ${flower5(156, 56, 24, "#ffb3c6", "#ff4d6d")}
    `,
  },
  {
    id: "jp-sensu-folding-fan",
    name: { en: "Painted Sakura Sensu Folding Hand Fan", vi: "Quạt xếp Sensu vẽ hoa anh đào" },
    tags: { en: ["sensu", "folding fan", "sakura", "japan", "traditional"], vi: ["quạt xếp", "sensu", "hoa anh đào", "nhật bản", "truyền thống"] },
    collections: ["japan", "vintage"],
    svg: `
      <path d="M20 124 A84 84 0 0 1 180 124 L100 164 Z" fill="#fff3b0" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="100" cy="96" r="22" fill="#d62828"/>
      ${flower5(64, 102, 16, "#ff8fa3", "#ffbe0b")}
      ${flower5(136, 102, 16, "#ff8fa3", "#ffbe0b")}
    `,
  },
  {
    id: "jp-uchiwa-festival-fan",
    name: { en: "Round Red Festival Uchiwa Paddle Fan", vi: "Quạt tròn Uchiwa lễ hội mùa hè" },
    tags: { en: ["uchiwa", "paddle fan", "festival", "matsuri", "japan"], vi: ["quạt tròn", "uchiwa", "lễ hội hè", "nhật bản", "truyền thống"] },
    collections: ["japan", "summer"],
    svg: `
      <rect x="93" y="132" width="14" height="52" rx="5" fill="#e9c46a" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="100" cy="86" r="62" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M44 106 Q100 78 156 106" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
      <circle cx="100" cy="68" r="18" fill="#ffbe0b"/>
    `,
  },
  {
    id: "jp-red-chochin-lantern",
    name: { en: "Tall Red Paper Chochin Izakaya Lantern", vi: "Đèn lồng giấy đỏ Chochin phố đêm" },
    tags: { en: ["chochin", "paper lantern", "izakaya", "red", "japan"], vi: ["đèn lồng đỏ", "chochin", "phố đêm", "nhật bản", "lễ hội"] },
    collections: ["japan", "travel"],
    svg: `
      <rect x="76" y="20" width="48" height="14" rx="4" fill="#2b1d14"/>
      <rect x="76" y="156" width="48" height="14" rx="4" fill="#2b1d14"/>
      <ellipse cx="100" cy="95" rx="48" ry="64" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <line x1="56" y1="74" x2="144" y2="74" stroke="#2b1d14" stroke-width="3.5"/>
      <line x1="56" y1="116" x2="144" y2="116" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="100" cy="95" r="16" fill="#fff3b0" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "jp-origami-red-crane",
    name: { en: "Folded Red Paper Origami Peace Crane", vi: "Hạc giấy Origami đỏ xếp tay" },
    tags: { en: ["origami", "paper crane", "tsuru", "japan", "craft"], vi: ["hạc giấy", "origami", "cầu ước", "nhật bản", "thủ công"] },
    collections: ["japan", "cute"],
    svg: `
      <polygon points="100,92 32,48 76,120" fill="#e63946" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="100,92 172,56 126,120" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="76,120 126,120 100,82" fill="#ff758f" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="76,120 42,64 24,72 52,78" fill="#ffb3c6" stroke="#2b1d14" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="126,120 162,42 142,128" fill="#ffb3c6" stroke="#2b1d14" stroke-width="4" stroke-linejoin="round"/>
    `,
  },
  {
    id: "jp-kitsune-fox-mask",
    name: { en: "White & Vermilion Kitsune Festival Fox Mask", vi: "Mặt nạ cáo Kitsune trắng vẽ vệt đỏ" },
    tags: { en: ["kitsune", "fox mask", "festival", "shrine", "japan"], vi: ["mặt nạ cáo", "kitsune", "lễ hội", "nhật bản", "truyền thống"] },
    collections: ["japan", "cute"],
    svg: `
      <polygon points="52,72 38,22 86,52" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="56,64 46,32 78,52" fill="#d62828"/>
      <polygon points="148,72 162,22 114,52" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="144,64 154,32 122,52" fill="#d62828"/>
      <polygon points="44,66 156,66 100,168" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M64 88 L88 96 M136 88 L112 96" stroke="#2b1d14" stroke-width="5" stroke-linecap="round"/>
      <path d="M56 106 Q72 116 84 108 M144 106 Q128 116 116 108" fill="none" stroke="#d62828" stroke-width="5" stroke-linecap="round"/>
      <polygon points="92,146 108,146 100,162" fill="#2b1d14"/>
    `,
  },
  {
    id: "jp-glass-furin-windchime",
    name: { en: "Summer Glass Furin Wind Chime with Paper Strip", vi: "Chuông gió thuỷ tinh Furin mùa hè" },
    tags: { en: ["furin", "wind chime", "summer", "glass", "japan"], vi: ["chuông gió", "furin", "mùa hè", "thuỷ tinh", "nhật bản"] },
    collections: ["japan", "summer", "cute"],
    svg: `
      <circle cx="100" cy="64" r="44" fill="#a8dadc" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="96" rx="34" ry="10" fill="#457b9d" stroke="#2b1d14" stroke-width="4"/>
      <line x1="100" y1="96" x2="100" y2="126" stroke="#d62828" stroke-width="4"/>
      <rect x="84" y="124" width="32" height="58" rx="4" fill="#ff758f" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "jp-pine-bonsai-tray",
    name: { en: "Sculpted Green Pine Bonsai in Ceramic Tray", vi: "Chậu tùng Bonsai dáng cổ thụ" },
    tags: { en: ["bonsai", "pine tree", "zen", "garden", "japan"], vi: ["cây bonsai", "tùng la hán", "thiền", "nhật bản", "cây cảnh"] },
    collections: ["japan", "nature"],
    svg: `
      <polygon points="42,144 158,144 146,174 54,174" fill="#457b9d" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M96 144 Q68 112 96 84 Q126 62 88 46" fill="none" stroke="#6c462f" stroke-width="14" stroke-linecap="round"/>
      <ellipse cx="64" cy="86" rx="32" ry="18" fill="#2d6a4f" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="128" cy="74" rx="36" ry="20" fill="#40916c" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="88" cy="44" rx="38" ry="20" fill="#52b788" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "jp-kohaku-koi-fish",
    name: { en: "Red & White Kohaku Koi Carp Swimming", vi: "Cá chép Koi đỏ trắng bơi lượn" },
    tags: { en: ["koi fish", "carp", "kohaku", "pond", "japan"], vi: ["cá koi", "cá chép nhật", "đỏ trắng", "may mắn", "nhật bản"] },
    collections: ["japan", "nature"],
    svg: `
      <path d="M44 136 Q38 64 116 42 Q152 68 116 136 Q84 162 44 136 Z" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="96" cy="76" r="22" fill="#d62828"/>
      <circle cx="76" cy="116" r="18" fill="#d62828"/>
      <polygon points="44,136 18,162 56,174" fill="#ff758f" stroke="#2b1d14" stroke-width="4" stroke-linejoin="round"/>
    `,
  },
  {
    id: "jp-wagasa-paper-umbrella",
    name: { en: "Red Oiled Paper Wagasa Parasol Umbrella", vi: "Chiếc ô giấy dầu đỏ Wagasa" },
    tags: { en: ["wagasa", "paper umbrella", "parasol", "red", "japan"], vi: ["ô giấy dầu", "wagasa", "dù đỏ", "cổ truyền", "nhật bản"] },
    collections: ["japan", "travel"],
    svg: `
      <line x1="100" y1="32" x2="100" y2="180" stroke="#6c462f" stroke-width="8" stroke-linecap="round"/>
      <path d="M18 106 Q100 28 182 106 Z" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="100" cy="78" r="24" fill="none" stroke="#ffffff" stroke-width="5"/>
    `,
  },
  {
    id: "jp-omamori-lucky-charm",
    name: { en: "Brocade Silk Omamori Shrine Amulet", vi: "Bùa hộ mệnh Omamori gấm đỏ" },
    tags: { en: ["omamori", "amulet", "lucky charm", "shrine", "japan"], vi: ["bùa omamori", "bùa may mắn", "cầu an", "nhật bản", "dễ thương"] },
    collections: ["japan", "cute"],
    svg: `
      <polygon points="78,44 122,44 142,72 142,168 58,168 58,72" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <rect x="82" y="88" width="36" height="58" rx="3" fill="#fff8eb" stroke="#ffbe0b" stroke-width="3.5"/>
      <circle cx="100" cy="64" r="8" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3"/>
      <path d="M84 44 L100 22 L116 44" fill="none" stroke="#ffbe0b" stroke-width="5" stroke-linecap="round"/>
    `,
  },
  {
    id: "jp-kokeshi-wooden-doll",
    name: { en: "Painted Wooden Kokeshi Folk Doll", vi: "Búp bê gỗ Kokeshi kimono hoa" },
    tags: { en: ["kokeshi", "wooden doll", "folk art", "kimono", "japan"], vi: ["búp bê kokeshi", "búp bê gỗ", "kimono", "dân gian", "nhật bản"] },
    collections: ["japan", "cute", "vintage"],
    svg: `
      <rect x="68" y="96" width="64" height="82" rx="22" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="62" r="36" fill="#2b1d14"/>
      <circle cx="100" cy="68" r="28" fill="#fff1d6" stroke="#2b1d14" stroke-width="4"/>
      <path d="M86 66 Q92 60 96 66 M104 66 Q108 60 114 66" fill="none" stroke="#2b1d14" stroke-width="3.5" stroke-linecap="round"/>
      ${flower5(100, 142, 22, "#ffbe0b", "#ffffff")}
    `,
  },
  {
    id: "jp-shiba-inu-portrait",
    name: { en: "Smiling Shiba Inu Dog with Karakusa Scarf", vi: "Chú chó Shiba Inu cười tươi quàng khăn xanh" },
    tags: { en: ["shiba inu", "dog", "akita", "cute", "japan"], vi: ["chó shiba", "shiba inu", "thú cưng", "dễ thương", "nhật bản"] },
    collections: ["japan", "pets", "cute"],
    svg: `
      <polygon points="52,72 44,28 84,52" fill="#f4a261" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <polygon points="148,72 156,28 116,52" fill="#f4a261" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="100" cy="92" r="46" fill="#f4a261" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="106" rx="34" ry="26" fill="#ffffff"/>
      <circle cx="82" cy="84" r="5.5" fill="#2b1d14"/>
      <circle cx="118" cy="84" r="5.5" fill="#2b1d14"/>
      <ellipse cx="100" cy="96" rx="7" ry="5" fill="#2b1d14"/>
      <polygon points="62,130 138,130 100,166" fill="#2a9d8f" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: "jp-wooden-geta-sandals",
    name: { en: "Pair of Traditional Wooden Geta Sandals", vi: "Đôi guốc gỗ Geta quai đỏ truyền thống" },
    tags: { en: ["geta", "wooden sandals", "footwear", "kimono", "japan"], vi: ["guốc gỗ", "geta", "quai đỏ", "truyền thống", "nhật bản"] },
    collections: ["japan", "vintage"],
    svg: `
      <rect x="34" y="42" width="56" height="116" rx="14" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M44 126 L62 66 L80 126" fill="none" stroke="#d62828" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="110" y="42" width="56" height="116" rx="14" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M120 126 L138 66 L156 126" fill="none" stroke="#d62828" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    `,
  },
  {
    id: "jp-ramen-noodle-bowl",
    name: { en: "Hot Ramen Noodle Bowl with Narutomaki & Egg", vi: "Tô mì Ramen nóng hổi kèm trứng và chả cá" },
    tags: { en: ["ramen", "noodle bowl", "narutomaki", "food", "japan"], vi: ["mì ramen", "tô mì nhật", "trứng lòng đào", "ẩm thực nhật", "nhật bản"] },
    collections: ["japan", "food"],
    svg: `
      <path d="M22 104 H178 Q166 174 100 174 Q34 174 22 104 Z" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="104" rx="78" ry="28" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="72" cy="102" r="16" fill="#ffffff" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="72" cy="102" r="8" fill="#fb8500"/>
      <circle cx="122" cy="104" r="15" fill="#ffffff" stroke="#ff758f" stroke-width="3.5"/>
      <rect x="134" y="72" width="24" height="28" transform="rotate(15 146 86)" fill="#1d3557" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "jp-nigiri-sushi-pair",
    name: { en: "Salmon & Tuna Nigiri Sushi Pair", vi: "Cặp sushi cá hồi và cá ngừ tươi" },
    tags: { en: ["sushi", "nigiri", "salmon", "tuna", "japan"], vi: ["sushi", "cá hồi", "cá ngừ", "ẩm thực nhật", "nhật bản"] },
    collections: ["japan", "food"],
    svg: `
      <rect x="28" y="106" width="64" height="34" rx="14" fill="#ffffff" stroke="#2b1d14" stroke-width="4"/>
      <rect x="22" y="86" width="76" height="28" rx="12" fill="#fb8500" stroke="#2b1d14" stroke-width="4"/>
      <rect x="108" y="106" width="64" height="34" rx="14" fill="#ffffff" stroke="#2b1d14" stroke-width="4"/>
      <rect x="102" y="86" width="76" height="28" rx="12" fill="#e63946" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "jp-onigiri-rice-ball",
    name: { en: "Triangular Nori Seaweed Onigiri Rice Ball", vi: "Cơm nắm tam giác Onigiri bọc rong biển" },
    tags: { en: ["onigiri", "rice ball", "nori", "snack", "japan"], vi: ["cơm nắm", "onigiri", "rong biển", "dễ thương", "nhật bản"] },
    collections: ["japan", "food", "cute"],
    svg: `
      <path d="M100 32 L172 156 Q176 168 162 168 H38 Q24 168 28 156 Z" fill="#ffffff" stroke="#2b1d14" stroke-width="5" stroke-linejoin="round"/>
      <rect x="74" y="118" width="52" height="50" fill="#1b4332" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="84" cy="96" r="4.5" fill="#2b1d14"/>
      <circle cx="116" cy="96" r="4.5" fill="#2b1d14"/>
    `,
  },
  {
    id: "jp-hanami-dango-skewer",
    name: { en: "Tri-Color Pink White Green Hanami Dango Skewer", vi: "Xiên bánh trôi Dango ba màu hồng trắng xanh" },
    tags: { en: ["dango", "hanami", "mochi", "sweet", "japan"], vi: ["bánh dango", "xiên bánh", "ba màu", "hoa anh đào", "nhật bản"] },
    collections: ["japan", "food", "cute"],
    svg: `
      <line x1="32" y1="168" x2="168" y2="32" stroke="#bc6c25" stroke-width="8" stroke-linecap="round"/>
      <circle cx="72" cy="128" r="24" fill="#80ed99" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="106" cy="94" r="24" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="140" cy="60" r="24" fill="#ff8fa3" stroke="#2b1d14" stroke-width="4.5"/>
    `,
  },
  {
    id: "jp-taiyaki-fish-waffle",
    name: { en: "Golden Baked Fish-Shaped Taiyaki Cake", vi: "Bánh nướng hình cá Taiyaki vàng ươm" },
    tags: { en: ["taiyaki", "fish cake", "waffle", "street food", "japan"], vi: ["bánh cá", "taiyaki", "bánh nướng", "ẩm thực nhật", "dễ thương"] },
    collections: ["japan", "food", "cute"],
    svg: `
      <path d="M24 100 Q64 44 134 68 L176 48 L168 100 L176 152 L134 132 Q64 156 24 100 Z" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="56" cy="92" r="5.5" fill="#2b1d14"/>
      <path d="M84 82 Q96 100 84 118 M108 82 Q120 100 108 118" fill="none" stroke="#bc6c25" stroke-width="5" stroke-linecap="round"/>
    `,
  },
  {
    id: "jp-matcha-tea-bowl",
    name: { en: "Ceramic Chawan Matcha Green Tea Bowl & Whisk", vi: "Bát trà xanh Matcha và chổi tre đánh trà" },
    tags: { en: ["matcha", "green tea", "chawan", "tea ceremony", "japan"], vi: ["trà matcha", "trà đạo", "trà xanh", "chổi tre", "nhật bản"] },
    collections: ["japan", "coffee", "food"],
    svg: `
      <path d="M26 108 H134 Q128 172 80 172 Q32 172 26 108 Z" fill="#495057" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="80" cy="108" rx="54" ry="18" fill="#52b788" stroke="#2b1d14" stroke-width="4.5"/>
      <polygon points="142,102 178,102 168,142 152,142" fill="#e9c46a" stroke="#2b1d14" stroke-width="4"/>
      <rect x="152" y="142" width="16" height="30" rx="4" fill="#bc6c25" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "jp-sake-flask-cup",
    name: { en: "Ceramic Tokkuri Sake Bottle & Ochoko Cup", vi: "Bình rượu Sake gốm trắng và chén nhỏ" },
    tags: { en: ["sake", "tokkuri", "ceramic", "drink", "japan"], vi: ["rượu sake", "bình gốm", "chén rượu", "ẩm thực nhật", "nhật bản"] },
    collections: ["japan", "food"],
    svg: `
      <path d="M62 36 H98 L90 74 C122 96 120 156 98 176 H62 C40 156 38 96 70 74 Z" fill="#f8f9fa" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="80" cy="126" r="18" fill="#457b9d"/>
      <polygon points="132,134 176,134 168,176 140,176" fill="#f8f9fa" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <line x1="136" y1="148" x2="172" y2="148" stroke="#457b9d" stroke-width="5"/>
    `,
  },
];

// ============================================================================
// 4. PACK: sticker/autumn (NEW pack, 40 items)
// ============================================================================
const AUTUMN_ITEMS = [
  {
    id: "aut-red-maple-leaf",
    name: { en: "Crimson Five-Pointed Autumn Maple Leaf", vi: "Chiếc lá phong đỏ thẫm mùa thu" },
    tags: { en: ["maple leaf", "crimson", "red", "autumn", "foliage"], vi: ["lá phong đỏ", "mùa thu", "lá rụng", "thiên nhiên", "lãng mạn"] },
    collections: ["autumn", "nature"],
    svg: `
      <line x1="100" y1="142" x2="100" y2="184" stroke="#6c462f" stroke-width="6" stroke-linecap="round"/>
      ${starPolygon(100, 96, 5, 72, 34, "#d62828", "#2b1d14", 4.5)}
      <path d="M100 142 V44 M100 112 L52 76 M100 112 L148 76" stroke="#ffbe0b" stroke-width="3" stroke-linecap="round"/>
    `,
  },
  {
    id: "aut-orange-sugar-maple",
    name: { en: "Warm Orange Sugar Maple Leaf", vi: "Lá phong cam vàng nắng thu" },
    tags: { en: ["sugar maple", "orange leaf", "autumn", "fall", "nature"], vi: ["lá phong cam", "nắng thu", "lá vàng", "mùa thu", "thiên nhiên"] },
    collections: ["autumn", "nature"],
    svg: `
      <line x1="100" y1="142" x2="112" y2="184" stroke="#6c462f" stroke-width="6" stroke-linecap="round"/>
      ${starPolygon(100, 96, 7, 70, 38, "#fb8500", "#2b1d14", 4.5)}
      <line x1="100" y1="136" x2="100" y2="48" stroke="#fff3b0" stroke-width="3.5" stroke-linecap="round"/>
    `,
  },
  {
    id: "aut-golden-ginkgo-leaf",
    name: { en: "Golden Fan-Shaped Ginkgo Biloba Leaf", vi: "Lá ngân hạnh Ginkgo hình quạt vàng óng" },
    tags: { en: ["ginkgo", "golden leaf", "fan leaf", "autumn", "japan"], vi: ["lá ngân hạnh", "ginkgo", "lá rẻ quạt", "vàng thu", "mùa thu"] },
    collections: ["autumn", "nature", "japan"],
    svg: `
      <line x1="100" y1="128" x2="88" y2="182" stroke="#bc6c25" stroke-width="6" stroke-linecap="round"/>
      <path d="M100 132 L26 84 A76 76 0 0 1 94 34 L100 58 L106 34 A76 76 0 0 1 174 84 Z" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: "aut-brown-oak-leaf",
    name: { en: "Lobed Russet Brown Autumn Oak Leaf", vi: "Lá sồi nâu đỏ viền lượn sóng" },
    tags: { en: ["oak leaf", "brown", "russet", "autumn", "woodland"], vi: ["lá sồi", "nâu đỏ", "lá khô", "rừng thu", "mùa thu"] },
    collections: ["autumn", "nature"],
    svg: `
      <path d="M100 24 C128 24 134 52 118 62 C146 66 148 96 122 104 C144 114 138 142 100 156 C62 142 56 114 78 104 C52 96 54 66 82 62 C66 52 72 24 100 24 Z" fill="#bc6c25" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <line x1="100" y1="42" x2="100" y2="182" stroke="#5c3a21" stroke-width="5" stroke-linecap="round"/>
    `,
  },
  {
    id: "aut-yellow-birch-leaf",
    name: { en: "Bright Yellow Pointed Birch Leaf", vi: "Chiếc lá bạch dương vàng tươi" },
    tags: { en: ["birch leaf", "yellow", "foliage", "autumn", "nature"], vi: ["lá bạch dương", "lá vàng", "mùa thu", "rừng cây", "thiên nhiên"] },
    collections: ["autumn", "nature"],
    svg: `
      <path d="M100 24 C152 68 156 126 100 156 C44 126 48 68 100 24 Z" fill="#ffd166" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M100 182 V42 M100 124 L126 102 M100 96 L74 74" stroke="#bc6c25" stroke-width="4.5" stroke-linecap="round"/>
    `,
  },
  {
    id: "aut-copper-beech-leaf",
    name: { en: "Copper Amber Veined Beech Leaf", vi: "Lá dẻ gai màu đồng ánh hổ phách" },
    tags: { en: ["beech leaf", "copper", "amber", "autumn", "leaf"], vi: ["lá dẻ gai", "màu đồng", "lá thu", "mùa thu", "cổ điển"] },
    collections: ["autumn", "nature"],
    svg: `
      <ellipse cx="100" cy="96" rx="46" ry="64" transform="rotate(18 100 96)" fill="#d45d27" stroke="#2b1d14" stroke-width="4.5"/>
      <line x1="78" y1="168" x2="120" y2="38" stroke="#fff3b0" stroke-width="4" stroke-linecap="round"/>
    `,
  },
  {
    id: "aut-falling-leaves-branch",
    name: { en: "Branch of Red, Orange & Gold Autumn Leaves", vi: "Cành lá thu ba màu đỏ cam vàng" },
    tags: { en: ["autumn branch", "colorful leaves", "fall", "nature", "foliage"], vi: ["cành lá thu", "lá đổi màu", "đỏ cam vàng", "mùa thu", "thiên nhiên"] },
    collections: ["autumn", "nature"],
    svg: `
      <path d="M24 148 Q96 104 176 52" fill="none" stroke="#6c462f" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="66" cy="98" rx="22" ry="14" transform="rotate(-35 66 98)" fill="#d62828" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="114" cy="118" rx="22" ry="14" transform="rotate(25 114 118)" fill="#fb8500" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="136" cy="64" rx="22" ry="14" transform="rotate(-25 136 64)" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "aut-autumn-leaf-wreath",
    name: { en: "Harvest Wreath of Autumn Leaves & Berries", vi: "Vòng nguyệt quế lá thu và quả mọng" },
    tags: { en: ["autumn wreath", "harvest", "berries", "fall decor", "leaves"], vi: ["vòng lá thu", "quả mọng", "trang trí", "mùa thu", "ấm áp"] },
    collections: ["autumn", "nature"],
    svg: `
      <circle cx="100" cy="100" r="62" fill="none" stroke="#8b4513" stroke-width="10"/>
      <circle cx="100" cy="38" r="16" fill="#d62828" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="162" cy="100" r="16" fill="#fb8500" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="100" cy="162" r="16" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="38" cy="100" r="16" fill="#bc6c25" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="144" cy="56" r="12" fill="#e9c46a" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="56" cy="144" r="12" fill="#e63946" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "aut-red-berry-twig",
    name: { en: "Woodland Red Rosehip Berry Twig", vi: "Nhánh quả tầm xuân đỏ mùa thu" },
    tags: { en: ["rosehip", "red berries", "twig", "autumn", "botanical"], vi: ["quả mọng đỏ", "nhánh cây", "tầm xuân", "mùa thu", "hoa lá"] },
    collections: ["autumn", "nature", "floral"],
    svg: `
      <path d="M36 164 Q88 106 156 38" fill="none" stroke="#5c3a21" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="64" cy="96" rx="10" ry="14" fill="#d62828" stroke="#2b1d14" stroke-width="3.5"/>
      <ellipse cx="108" cy="112" rx="10" ry="14" fill="#e63946" stroke="#2b1d14" stroke-width="3.5"/>
      <ellipse cx="116" cy="56" rx="10" ry="14" fill="#d62828" stroke="#2b1d14" stroke-width="3.5"/>
      <ellipse cx="154" cy="68" rx="10" ry="14" fill="#e63946" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "aut-vintage-bare-twig",
    name: { en: "Botanical Dry Woodland Branch", vi: "Cành cây khô dáng cổ điển" },
    tags: { en: ["dry branch", "twig", "woodland", "autumn", "vintage"], vi: ["cành khô", "nhánh cây", "tối giản", "mùa thu", "cổ điển"] },
    collections: ["autumn", "vintage", "nature"],
    svg: `
      <path d="M28 168 Q84 114 168 34 M86 112 L52 62 M122 78 L168 92" fill="none" stroke="#6c462f" stroke-width="9" stroke-linecap="round"/>
    `,
  },
  {
    id: "aut-acorn-oak-nut",
    name: { en: "Woodland Acorn with Textured Cap", vi: "Quả sồi rừng đội mũ nâu" },
    tags: { en: ["acorn", "oak nut", "woodland", "autumn", "forest"], vi: ["quả sồi", "hạt sồi", "rừng thu", "mùa thu", "dễ thương"] },
    collections: ["autumn", "nature", "cute"],
    svg: `
      <path d="M56 84 H144 Q142 168 100 174 Q58 168 56 84 Z" fill="#d48b3b" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M44 88 Q44 42 100 42 Q156 42 156 88 Z" fill="#6c462f" stroke="#2b1d14" stroke-width="4.5"/>
      <line x1="100" y1="22" x2="100" y2="42" stroke="#5c3a21" stroke-width="8" stroke-linecap="round"/>
    `,
  },
  {
    id: "aut-twin-acorns-twig",
    name: { en: "Pair of Acorns & Oak Leaf on Branch", vi: "Chùm đôi quả sồi và chiếc lá xanh" },
    tags: { en: ["acorns", "oak leaf", "branch", "autumn", "botanical"], vi: ["chùm quả sồi", "lá sồi", "cành cây", "mùa thu", "thiên nhiên"] },
    collections: ["autumn", "nature"],
    svg: `
      <path d="M32 64 Q100 44 168 72" fill="none" stroke="#5c3a21" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="72" cy="126" rx="22" ry="30" fill="#d48b3b" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="72" cy="98" rx="26" ry="14" fill="#6c462f" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="132" cy="126" rx="22" ry="30" fill="#d48b3b" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="132" cy="98" rx="26" ry="14" fill="#6c462f" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "aut-red-spotted-mushroom",
    name: { en: "Red Polka-Dot Woodland Toadstool Mushroom", vi: "Cây nấm đỏ chấm trắng trong rừng thu" },
    tags: { en: ["mushroom", "toadstool", "red spotted", "autumn", "forest"], vi: ["cây nấm", "nấm đỏ", "rừng thu", "dễ thương", "mùa thu"] },
    collections: ["autumn", "nature", "cute"],
    svg: `
      <path d="M78 96 H122 L130 172 Q100 180 70 172 Z" fill="#fff8eb" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M26 102 Q26 32 100 32 Q174 32 174 102 Z" fill="#d62828" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="68" cy="72" r="10" fill="#ffffff"/>
      <circle cx="104" cy="56" r="12" fill="#ffffff"/>
      <circle cx="136" cy="78" r="9" fill="#ffffff"/>
    `,
  },
  {
    id: "aut-chanterelle-mushroom-cluster",
    name: { en: "Golden Chanterelle Forest Mushroom Trio", vi: "Cụm ba cây nấm rừng màu vàng nghệ" },
    tags: { en: ["chanterelle", "mushrooms", "golden", "forest", "autumn"], vi: ["nấm rừng", "nấm vàng", "thiên nhiên", "mùa thu", "ẩm thực"] },
    collections: ["autumn", "nature"],
    svg: `
      <rect x="86" y="88" width="28" height="84" rx="10" fill="#fff3b0" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="78" rx="46" ry="24" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="46" y="116" width="22" height="56" rx="8" fill="#fff3b0" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="57" cy="110" rx="30" ry="16" fill="#fb8500" stroke="#2b1d14" stroke-width="4"/>
      <rect x="132" y="116" width="22" height="56" rx="8" fill="#fff3b0" stroke="#2b1d14" stroke-width="4"/>
      <ellipse cx="143" cy="110" rx="30" ry="16" fill="#fb8500" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "aut-porcini-boletus-mushroom",
    name: { en: "Plump Brown Cap Porcini Mushroom", vi: "Nấm thông mũ nâu tròn mập" },
    tags: { en: ["porcini", "boletus", "mushroom", "brown", "autumn"], vi: ["nấm thông", "mũ nâu", "rừng thu", "mùa thu", "thiên nhiên"] },
    collections: ["autumn", "nature"],
    svg: `
      <ellipse cx="100" cy="134" rx="36" ry="44" fill="#f4e4c1" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M28 96 Q28 34 100 34 Q172 34 172 96 Z" fill="#8b4513" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: "aut-brown-pine-cone",
    name: { en: "Layered Brown Woodland Pine Cone", vi: "Quả thông khô xếp vảy nâu trầm" },
    tags: { en: ["pine cone", "conifer", "woodland", "brown", "autumn"], vi: ["quả thông", "trái thông khô", "đà lạt", "rừng thông", "mùa thu"] },
    collections: ["autumn", "nature", "christmas"],
    svg: `
      <ellipse cx="100" cy="138" rx="48" ry="32" fill="#6c462f" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="102" rx="42" ry="28" fill="#8b4513" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="68" rx="32" ry="24" fill="#9c4110" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="100" cy="42" r="16" fill="#bc6c25" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "aut-roasted-chestnut",
    name: { en: "Glossy Brown Autumn Sweet Chestnut", vi: "Hạt dẻ rừng nâu bóng mùa thu" },
    tags: { en: ["chestnut", "nut", "roasted", "autumn", "harvest"], vi: ["hạt dẻ", "hạt dẻ nướng", "mùa thu", "ấm áp", "ăn vặt"] },
    collections: ["autumn", "food", "nature"],
    svg: `
      <path d="M100 28 C164 68 172 156 100 168 C28 156 36 68 100 28 Z" fill="#7f3209" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M52 142 Q100 124 148 142 Q132 168 100 168 Q68 168 52 142 Z" fill="#e9c46a" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "aut-walnut-half-shell",
    name: { en: "Textured Golden Walnut Shell", vi: "Quả óc chó vỏ vân gỗ tự nhiên" },
    tags: { en: ["walnut", "nut", "harvest", "autumn", "food"], vi: ["quả óc chó", "hạt dinh dưỡng", "mùa thu", "thu hoạch", "thiên nhiên"] },
    collections: ["autumn", "food"],
    svg: `
      <ellipse cx="100" cy="100" rx="58" ry="68" fill="#d48b3b" stroke="#2b1d14" stroke-width="4.5"/>
      <line x1="100" y1="32" x2="100" y2="168" stroke="#5c3a21" stroke-width="5"/>
      <path d="M68 68 Q84 82 68 98 M132 68 Q116 82 132 98" fill="none" stroke="#5c3a21" stroke-width="4" stroke-linecap="round"/>
    `,
  },
  {
    id: "aut-harvest-golden-corn",
    name: { en: "Ear of Golden Harvest Corn with Husk", vi: "Bắp ngô vàng óng mùa thu hoạch" },
    tags: { en: ["corn", "maize", "harvest", "golden", "autumn"], vi: ["bắp ngô", "ngô vàng", "mùa gặt", "thu hoạch", "mùa thu"] },
    collections: ["autumn", "food", "nature"],
    svg: `
      <ellipse cx="100" cy="92" rx="34" ry="62" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M100 168 Q44 148 48 84 Q78 122 100 154 Z" fill="#52b788" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M100 168 Q156 148 152 84 Q122 122 100 154 Z" fill="#40916c" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: "aut-golden-wheat-sheaf",
    name: { en: "Tied Bundle of Golden Harvest Wheat", vi: "Bó lúa mì vàng óng thắt nơ đỏ" },
    tags: { en: ["wheat sheaf", "harvest", "grain", "golden", "autumn"], vi: ["bó lúa mì", "mùa gặt", "vàng óng", "no ấm", "mùa thu"] },
    collections: ["autumn", "nature"],
    svg: `
      <path d="M64 32 L116 172 M100 28 V174 M136 32 L84 172" stroke="#ffbe0b" stroke-width="12" stroke-linecap="round"/>
      <path d="M64 32 L116 172 M100 28 V174 M136 32 L84 172" stroke="#2b1d14" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="74" y="102" width="52" height="16" rx="6" fill="#d62828" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "aut-orange-harvest-pumpkin",
    name: { en: "Plump Ribbed Orange Harvest Pumpkin", vi: "Quả bí ngô cam tròn đầy đặn" },
    tags: { en: ["pumpkin", "orange", "harvest", "autumn", "halloween"], vi: ["bí ngô", "bí đỏ", "mùa thu", "thu hoạch", "halloween"] },
    collections: ["autumn", "halloween", "food"],
    svg: `
      <path d="M96 52 Q104 22 122 30" fill="none" stroke="#386641" stroke-width="10" stroke-linecap="round"/>
      <ellipse cx="64" cy="116" rx="38" ry="52" fill="#e76f51" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="136" cy="116" rx="38" ry="52" fill="#e76f51" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="118" rx="42" ry="56" fill="#f4a261" stroke="#2b1d14" stroke-width="4.5"/>
    `,
  },
  {
    id: "aut-white-ghost-pumpkin",
    name: { en: "Cream White Decorative Autumn Pumpkin", vi: "Quả bí ngô trắng kem trang trí bàn tiệc" },
    tags: { en: ["white pumpkin", "cream", "decor", "autumn", "minimal"], vi: ["bí ngô trắng", "trang trí thu", "nhã nhặn", "mùa thu", "cổ điển"] },
    collections: ["autumn", "minimal"],
    svg: `
      <path d="M96 58 Q104 30 118 38" fill="none" stroke="#bc6c25" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="66" cy="118" rx="36" ry="46" fill="#edede9" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="134" cy="118" rx="36" ry="46" fill="#edede9" stroke="#2b1d14" stroke-width="4.5"/>
      <ellipse cx="100" cy="120" rx="38" ry="50" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5"/>
    `,
  },
  {
    id: "aut-butternut-squash",
    name: { en: "Golden Pear-Shaped Butternut Squash", vi: "Quả bí hồ lô vàng ngọt bùi" },
    tags: { en: ["butternut squash", "gourd", "harvest", "autumn", "food"], vi: ["bí hồ lô", "bí bơ", "nông sản", "mùa thu", "ẩm thực"] },
    collections: ["autumn", "food"],
    svg: `
      <path d="M100 22 V38" stroke="#6c462f" stroke-width="8" stroke-linecap="round"/>
      <path d="M76 38 H124 L132 96 C158 118 152 174 100 174 C48 174 42 118 68 96 Z" fill="#f4a261" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: "aut-ripe-persimmon-fruit",
    name: { en: "Ripe Orange Autumn Persimmon with Calyx", vi: "Quả hồng chín đỏ mọng Đà Lạt" },
    tags: { en: ["persimmon", "hong da lat", "fruit", "autumn", "orange"], vi: ["quả hồng", "hồng chín", "hồng đà lạt", "mùa thu", "trái cây"] },
    collections: ["autumn", "food", "vietnam"],
    svg: `
      <ellipse cx="100" cy="116" rx="62" ry="52" fill="#f77f00" stroke="#2b1d14" stroke-width="4.5"/>
      ${starPolygon(100, 64, 4, 34, 14, "#386641", "#2b1d14", 4, 45)}
    `,
  },
  {
    id: "aut-crisp-red-apple",
    name: { en: "Orchard Red Autumn Apple with Green Leaf", vi: "Quả táo đỏ vườn thu đính lá xanh" },
    tags: { en: ["red apple", "orchard", "fruit", "autumn", "harvest"], vi: ["quả táo đỏ", "táo thu", "trái cây", "mùa thu", "tươi ngon"] },
    collections: ["autumn", "food"],
    svg: `
      <line x1="100" y1="56" x2="100" y2="28" stroke="#6c462f" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="122" cy="40" rx="18" ry="10" transform="rotate(-20 122 40)" fill="#52b788" stroke="#2b1d14" stroke-width="3.5"/>
      <path d="M100 56 C144 42 168 88 152 138 C138 176 112 174 100 162 C88 174 62 176 48 138 C32 88 56 42 100 56 Z" fill="#d62828" stroke="#2b1d14" stroke-width="4.5"/>
    `,
  },
  {
    id: "aut-golden-autumn-pear",
    name: { en: "Golden Honey Autumn Pear", vi: "Quả lê vàng mật ngọt thanh" },
    tags: { en: ["pear", "golden fruit", "orchard", "autumn", "food"], vi: ["quả lê", "lê vàng", "ngọt thanh", "mùa thu", "trái cây"] },
    collections: ["autumn", "food"],
    svg: `
      <line x1="100" y1="42" x2="108" y2="20" stroke="#6c462f" stroke-width="6" stroke-linecap="round"/>
      <path d="M82 42 H118 L128 92 C158 116 152 174 100 174 C48 174 42 116 72 92 Z" fill="#ffd166" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: "aut-ruby-pomegranate",
    name: { en: "Ruby Red Autumn Pomegranate with Crown", vi: "Quả lựu đỏ vương miện mùa thu" },
    tags: { en: ["pomegranate", "ruby fruit", "harvest", "autumn", "food"], vi: ["quả lựu", "lựu đỏ", "trái cây mùa thu", "mùa thu", "ẩm thực"] },
    collections: ["autumn", "food"],
    svg: `
      <polygon points="82,48 88,24 100,38 112,24 118,48" fill="#c1121f" stroke="#2b1d14" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="100" cy="112" r="62" fill="#c1121f" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="118" cy="118" r="24" fill="#fff0f3" stroke="#2b1d14" stroke-width="3.5"/>
      <circle cx="112" cy="112" r="5" fill="#d62828"/>
      <circle cx="126" cy="114" r="5" fill="#d62828"/>
      <circle cx="118" cy="126" r="5" fill="#d62828"/>
    `,
  },
  {
    id: "aut-purple-autumn-grapes",
    name: { en: "Cluster of Ripe Purple Vineyard Grapes", vi: "Chùm nho tím chín mọng mùa thu" },
    tags: { en: ["grapes", "vineyard", "purple fruit", "autumn", "harvest"], vi: ["chùm nho", "nho tím", "vườn nho", "mùa thu", "trái cây"] },
    collections: ["autumn", "food"],
    svg: `
      <line x1="100" y1="22" x2="100" y2="48" stroke="#6c462f" stroke-width="7" stroke-linecap="round"/>
      <circle cx="74" cy="68" r="20" fill="#7209b7" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="100" cy="68" r="20" fill="#9d4edd" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="126" cy="68" r="20" fill="#7209b7" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="86" cy="104" r="20" fill="#7209b7" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="114" cy="104" r="20" fill="#9d4edd" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="100" cy="142" r="20" fill="#7209b7" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "aut-golden-chrysanthemum",
    name: { en: "Blooming Golden Autumn Chrysanthemum Flower", vi: "Đoá hoa cúc vàng nở rộ tiết thu" },
    tags: { en: ["chrysanthemum", "golden flower", "autumn", "floral", "vietnam"], vi: ["hoa cúc thu", "cúc vàng", "hà nội mùa thu", "hoa lá", "mùa thu"] },
    collections: ["autumn", "floral", "vietnam"],
    svg: `
      ${Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x = (100 + Math.cos(a) * 40).toFixed(1);
        const y = (100 + Math.sin(a) * 40).toFixed(1);
        return `<ellipse cx="${x}" cy="${y}" rx="32" ry="12" transform="rotate(${i * 30} ${x} ${y})" fill="#ffbe0b" stroke="#2b1d14" stroke-width="3.5"/>`;
      }).join("")}
      <circle cx="100" cy="100" r="22" fill="#fb8500" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "aut-terracotta-cosmos-flower",
    name: { en: "Terracotta Orange Autumn Cosmos Blossom", vi: "Bông hoa cúc cánh bướm màu cam đất" },
    tags: { en: ["cosmos", "terracotta", "flower", "autumn", "floral"], vi: ["hoa cánh bướm", "cam đất", "hoa dại", "mùa thu", "lãng mạn"] },
    collections: ["autumn", "floral"],
    svg: `
      <path d="M100 108 Q92 152 84 182" fill="none" stroke="#386641" stroke-width="6" stroke-linecap="round"/>
      ${flower5(100, 88, 56, "#e07a5f", "#ffbe0b", "#2b1d14", 4)}
    `,
  },
  {
    id: "aut-autumn-sunflower",
    name: { en: "Warm Golden Harvest Sunflower", vi: "Bông hoa hướng dương vàng rực nắng thu" },
    tags: { en: ["sunflower", "golden", "harvest", "autumn", "floral"], vi: ["hoa hướng dương", "nắng thu", "vàng rực", "hoa lá", "mùa thu"] },
    collections: ["autumn", "floral", "summer"],
    svg: `
      ${starPolygon(100, 100, 14, 78, 48, "#ffbe0b", "#2b1d14", 4)}
      <circle cx="100" cy="100" r="38" fill="#5c3a21" stroke="#2b1d14" stroke-width="4.5"/>
    `,
  },
  {
    id: "aut-pampas-grass-plume",
    name: { en: "Fluffy Cream Pampas Reed Grass Plume", vi: "Bông cỏ lau trắng kem mềm mại" },
    tags: { en: ["pampas grass", "reed", "plume", "autumn", "minimal"], vi: ["cỏ lau", "bông lau", "mùa thu", "dịu dàng", "thiên nhiên"] },
    collections: ["autumn", "nature", "minimal"],
    svg: `
      <line x1="68" y1="180" x2="128" y2="44" stroke="#bc6c25" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="114" cy="76" rx="26" ry="54" transform="rotate(24 114 76)" fill="#f5ebe0" stroke="#2b1d14" stroke-width="4.5"/>
    `,
  },
  {
    id: "aut-squirrel-holding-acorn",
    name: { en: "Woodland Red Squirrel Holding Acorn", vi: "Chú sóc nâu đuôi xù ôm hạt dẻ" },
    tags: { en: ["squirrel", "acorn", "woodland", "animal", "autumn"], vi: ["con sóc", "sóc nâu", "hạt dẻ", "rừng thu", "dễ thương"] },
    collections: ["autumn", "cute", "nature"],
    svg: `
      <path d="M124 152 Q182 142 168 68 Q154 24 122 58 Q142 98 114 134 Z" fill="#d45d27" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <ellipse cx="90" cy="132" rx="34" ry="38" fill="#bc6c25" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="82" cy="78" r="28" fill="#bc6c25" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="72" cy="74" r="4.5" fill="#2b1d14"/>
      <circle cx="54" cy="118" r="14" fill="#6c462f" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
  {
    id: "aut-hedgehog-autumn-leaf",
    name: { en: "Cute Woodland Hedgehog Carrying Red Leaf", vi: "Nhím nhỏ cõng chiếc lá phong đỏ" },
    tags: { en: ["hedgehog", "woodland", "cute animal", "leaf", "autumn"], vi: ["con nhím", "nhím nhỏ", "lá phong", "dễ thương", "mùa thu"] },
    collections: ["autumn", "cute", "nature"],
    svg: `
      <ellipse cx="108" cy="116" rx="58" ry="44" fill="#6c462f" stroke="#2b1d14" stroke-width="4.5"/>
      <polygon points="56,96 22,124 64,144" fill="#f4e4c1" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <circle cx="24" cy="124" r="6" fill="#2b1d14"/>
      <circle cx="48" cy="116" r="4.5" fill="#2b1d14"/>
      ${starPolygon(118, 76, 5, 26, 12, "#d62828", "#2b1d14", 3.5)}
    `,
  },
  {
    id: "aut-sleeping-red-fox",
    name: { en: "Curled Sleeping Autumn Red Fox", vi: "Cáo đỏ cuộn tròn ngủ ấm áp" },
    tags: { en: ["red fox", "sleeping", "woodland", "cute", "autumn"], vi: ["cáo đỏ", "con cáo", "cuộn tròn", "ấm áp", "mùa thu"] },
    collections: ["autumn", "cute", "nature"],
    svg: `
      <ellipse cx="100" cy="122" rx="64" ry="44" fill="#e76f51" stroke="#2b1d14" stroke-width="4.5"/>
      <path d="M52 138 Q112 168 164 118 Q138 96 96 122 Z" fill="#f4a261" stroke="#2b1d14" stroke-width="4"/>
      <circle cx="144" cy="122" r="18" fill="#ffffff"/>
      <polygon points="54,96 42,60 76,78" fill="#e76f51" stroke="#2b1d14" stroke-width="4"/>
      <polygon points="88,92 98,58 108,86" fill="#e76f51" stroke="#2b1d14" stroke-width="4"/>
    `,
  },
  {
    id: "aut-spiced-cinnamon-tea",
    name: { en: "Warm Mug of Cinnamon Orange Spiced Tea", vi: "Cốc trà cam quế hồi ấm áp ngày thu" },
    tags: { en: ["cinnamon tea", "spiced tea", "mug", "cozy", "autumn"], vi: ["trà cam quế", "cốc trà nóng", "ấm áp", "mùa thu", "đồ uống"] },
    collections: ["autumn", "coffee", "food"],
    svg: `
      <path d="M138 92 H162 A22 22 0 0 1 162 144 H138" fill="none" stroke="#e07a5f" stroke-width="12" stroke-linecap="round"/>
      <rect x="44" y="72" width="96" height="92" rx="16" fill="#e07a5f" stroke="#2b1d14" stroke-width="4.5"/>
      <circle cx="76" cy="68" r="20" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4"/>
      <line x1="112" y1="42" x2="100" y2="82" stroke="#6c462f" stroke-width="10" stroke-linecap="round"/>
    `,
  },
  {
    id: "aut-pumpkin-spice-latte",
    name: { en: "Whipped Cream Pumpkin Spice Latte Cup", vi: "Ly Latte bí ngô phủ kem tươi rắc quế" },
    tags: { en: ["pumpkin spice", "latte", "coffee", "whipped cream", "autumn"], vi: ["latte bí ngô", "cà phê thu", "kem tươi", "mùa thu", "đồ uống"] },
    collections: ["autumn", "coffee", "food"],
    svg: `
      <polygon points="56,78 144,78 130,176 70,176" fill="#f4a261" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <rect x="60" y="108" width="80" height="34" fill="#fff8eb" stroke="#2b1d14" stroke-width="3.5"/>
      <path d="M52 78 Q66 36 100 36 Q134 36 148 78 Z" fill="#ffffff" stroke="#2b1d14" stroke-width="4.5"/>
    `,
  },
  {
    id: "aut-plaid-woolen-scarf",
    name: { en: "Warm Mustard & Rust Plaid Woolen Scarf", vi: "Khăn choàng len kẻ caro màu vàng đất" },
    tags: { en: ["woolen scarf", "plaid", "cozy", "fashion", "autumn"], vi: ["khăn choàng len", "khăn caro", "ấm áp", "thời trang thu", "mùa thu"] },
    collections: ["autumn", "cute"],
    svg: `
      <rect x="34" y="52" width="132" height="44" rx="20" fill="#e9c46a" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="112" y="84" width="40" height="78" rx="8" fill="#e76f51" stroke="#2b1d14" stroke-width="4.5"/>
      <line x1="68" y1="52" x2="68" y2="96" stroke="#bc6c25" stroke-width="6"/>
      <line x1="108" y1="52" x2="108" y2="96" stroke="#bc6c25" stroke-width="6"/>
      <path d="M118 162 V178 M132 162 V178 M146 162 V178" stroke="#2b1d14" stroke-width="4" stroke-linecap="round"/>
    `,
  },
  {
    id: "aut-cozy-knit-sweater",
    name: { en: "Terracotta Cable-Knit Autumn Sweater", vi: "Chiếc áo len đan vặn thừng màu cam đất" },
    tags: { en: ["knit sweater", "cardigan", "cozy", "terracotta", "autumn"], vi: ["áo len", "đan len", "cam đất", "ấm áp", "mùa thu"] },
    collections: ["autumn", "cute"],
    svg: `
      <polygon points="68,42 132,42 178,86 158,108 136,84 136,168 64,168 64,84 42,108 22,86" fill="#d45d27" stroke="#2b1d14" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M92 54 V160 M108 54 V160" stroke="#fff3b0" stroke-width="4" stroke-dasharray="10 6"/>
    `,
  },
  {
    id: "aut-amber-scented-candle",
    name: { en: "Glowing Amber Glass Jar Scented Candle", vi: "Hũ nến thơm thuỷ tinh màu hổ phách" },
    tags: { en: ["scented candle", "amber jar", "cozy", "flame", "autumn"], vi: ["nến thơm", "hũ nến", "hổ phách", "thư giãn", "mùa thu"] },
    collections: ["autumn", "minimal"],
    svg: `
      <path d="M100 28 C116 48 114 68 100 68 C86 68 84 48 100 28 Z" fill="#ffbe0b" stroke="#2b1d14" stroke-width="4"/>
      <rect x="58" y="76" width="84" height="96" rx="12" fill="#bc6c25" stroke="#2b1d14" stroke-width="4.5"/>
      <rect x="70" y="106" width="60" height="38" rx="4" fill="#fff8eb" stroke="#2b1d14" stroke-width="3.5"/>
    `,
  },
];

async function updateOrCreatePack(packId, newSpecs, packPatch = {}) {
  const packDir = path.join(ASSETS, "sticker", packId);
  const srcDir = path.join(packDir, "src");
  mkdirSync(srcDir, { recursive: true });
  const manifestPath = path.join(packDir, "manifest.json");

  let manifest;
  if (existsSync(manifestPath)) {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    Object.assign(manifest, packPatch);
  } else {
    manifest = {
      id: packId,
      kind: "sticker",
      ...packPatch,
      items: [],
    };
  }

  preserveExistingSources(packId, manifest.items);
  const existingIds = new Set(manifest.items.map((it) => it.id));

  for (const spec of newSpecs) {
    if (existingIds.has(spec.id)) continue;
    const outPng = path.join(srcDir, `${spec.id}.png`);
    await renderSvgToPng(spec.svg, outPng);
    manifest.items.push({
      id: spec.id,
      name: spec.name,
      tags: spec.tags,
      collections: spec.collections,
      process: { removeBg: false, trim: true },
      source: makeSource(spec.name.en),
    });
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Updated sticker/${packId}: total ${manifest.items.length} items.`);
}

await updateOrCreatePack("tet", TET_NEW);
await updateOrCreatePack("vietnam-heritage", VN_NEW);
await updateOrCreatePack("japanese-ukiyoe", JP_NEW, {
  name: { en: "Japan", vi: "Nhật Bản" },
});
await updateOrCreatePack("autumn", AUTUMN_ITEMS, {
  name: { en: "Autumn", vi: "Mùa thu" },
  collections: ["autumn", "nature"],
  order: 45,
});
