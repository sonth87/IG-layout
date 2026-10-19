#!/usr/bin/env node
/**
 * G10 Batch 2 Generator:
 * 5. sticker/christmas (21 -> 50, +29 items)
 * 6. sticker/celebrations (26 -> 60, +34 items including number candles 0-9 & Happy Birthday banner)
 * 7. sticker/birds-animals -> rename "Vintage Birds" / "Chim cổ" (18 -> 50, +32 items)
 * 8. sticker/butterflies-insects -> rename "Animals & Insects" / "Động vật" (6 -> 60, +54 items)
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const RETRIEVED = '2026-10-19';

async function saveSvgSticker(kind, pack, id, body, vb = '0 0 400 400') {
  const dir = path.join(ROOT, 'assets', kind, pack, 'src');
  fs.mkdirSync(dir, { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="900" height="900">
  <defs>
    <filter id="ds" x="-12%" y="-12%" width="124%" height="128%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#1a120b" flood-opacity="0.22"/>
    </filter>
    <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe57f"/>
      <stop offset="50%" stop-color="#f6b93b"/>
      <stop offset="100%" stop-color="#c88a14"/>
    </linearGradient>
    <linearGradient id="redG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff5252"/>
      <stop offset="55%" stop-color="#d62828"/>
      <stop offset="100%" stop-color="#8f1111"/>
    </linearGradient>
    <linearGradient id="greenG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#52b788"/>
      <stop offset="55%" stop-color="#2d6a4f"/>
      <stop offset="100%" stop-color="#1b4332"/>
    </linearGradient>
  </defs>
  <g filter="url(#ds)">
    ${body}
  </g>
</svg>`;
  const out = path.join(dir, `${id}.png`);
  await sharp(Buffer.from(svg)).png().toFile(out);
}

function preserveExistingSources(kind, packId, items) {
  const srcDir = path.join(ROOT, 'assets', kind, packId, 'src');
  const pubDir = path.join(ROOT, 'public', 'packs', kind, packId);
  fs.mkdirSync(srcDir, { recursive: true });
  const past = new Date(1000000000000);
  for (const it of items) {
    for (const ext of ['.png', '.webp', '.jpg', '.jpeg', '.svg']) {
      const candidate = path.join(srcDir, `${it.id}${ext}`);
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    }
    const pubWebp = path.join(pubDir, `${it.id}.webp`);
    const dstWebp = path.join(srcDir, `${it.id}.webp`);
    if (fs.existsSync(pubWebp)) {
      fs.copyFileSync(pubWebp, dstWebp);
      fs.utimesSync(dstWebp, past, past);
    }
  }
}

function makeItemMeta(id, en, vi, tagsEn, tagsVi, collections, packId) {
  return {
    id,
    name: { en, vi },
    tags: { en: tagsEn, vi: tagsVi },
    collections,
    process: { removeBg: false, trim: true },
    source: {
      provider: 'IG Layout',
      url: `https://github.com/sonth87/IG-layout/blob/main/assets/sticker/${packId}#${id}`,
      author: 'IG Layout Illustration',
      title: en,
      license: 'CC0-1.0',
      retrieved: RETRIEVED,
    },
  };
}

// ============================================================================
// 5. CHRISTMAS (+29 items -> 50 total)
// ============================================================================
async function buildChristmas() {
  const manifestPath = path.join(ROOT, 'assets/sticker/christmas/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  preserveExistingSources('sticker', 'christmas', manifest.items);

  const items = [
    {
      id: 'xmas-gingerbread-house',
      en: 'Frosted Gingerbread House with Candy Roof',
      vi: 'Ngôi nhà bánh gừng phủ kem tuyết và kẹo ngọt',
      tagsEn: ['gingerbread house', 'cookie', 'christmas', 'sweet'],
      tagsVi: ['nhà bánh gừng', 'bánh quy', 'giáng sinh', 'ngọt ngào'],
      cols: ['christmas', 'cute'],
      svg: `
        <path d="M90 190 L200 95 L310 190 L310 330 L90 330 Z" fill="#b5652a" stroke="#5c2c0c" stroke-width="6"/>
        <path d="M70 198 L200 85 L330 198" fill="none" stroke="#ffffff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M85 202 Q105 222 125 202 Q145 222 165 202 Q185 222 205 202 Q225 222 245 202 Q265 222 285 202 Q305 222 315 202" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/>
        <rect x="172" y="238" width="56" height="92" rx="28" fill="#7f3812" stroke="#ffffff" stroke-width="6"/>
        <circle cx="215" cy="285" r="5" fill="#ffd166"/>
        <rect x="112" y="228" width="40" height="40" rx="6" fill="#ffd166" stroke="#ffffff" stroke-width="5"/>
        <rect x="248" y="228" width="40" height="40" rx="6" fill="#ffd166" stroke="#ffffff" stroke-width="5"/>
        <circle cx="200" cy="155" r="18" fill="#e63946" stroke="#ffffff" stroke-width="5"/>
        <circle cx="150" cy="145" r="9" fill="#52b788"/><circle cx="250" cy="145" r="9" fill="#4cc9f0"/>
        <circle cx="125" cy="170" r="9" fill="#ffb703"/><circle cx="275" cy="170" r="9" fill="#f72585"/>
        <rect x="75" y="324" width="250" height="18" rx="9" fill="#ffffff"/>
      `
    },
    {
      id: 'xmas-snow-globe-cottage',
      en: 'Winter Glass Snow Globe with Pine Tree',
      vi: 'Quả cầu tuyết thuỷ tinh cây thông mùa đông',
      tagsEn: ['snow globe', 'crystal ball', 'winter', 'christmas'],
      tagsVi: ['quả cầu tuyết', 'cây thông', 'mùa đông', 'giáng sinh'],
      cols: ['christmas', 'cute'],
      svg: `
        <circle cx="200" cy="185" r="118" fill="#dff6ff" fill-opacity="0.88" stroke="#7bdff2" stroke-width="7"/>
        <path d="M98 242 Q200 220 302 242 A118 118 0 0 1 98 242 Z" fill="#ffffff"/>
        <polygon points="200,105 152,185 248,185" fill="#2d6a4f"/>
        <polygon points="200,140 140,225 260,225" fill="#1b4332"/>
        <rect x="190" y="225" width="20" height="22" fill="#6f4518"/>
        <circle cx="200" cy="102" r="10" fill="#ffd166"/>
        <circle cx="145" cy="135" r="5" fill="#ffffff"/><circle cx="255" cy="140" r="6" fill="#ffffff"/>
        <circle cx="135" cy="185" r="4" fill="#ffffff"/><circle cx="262" cy="190" r="5" fill="#ffffff"/>
        <circle cx="175" cy="120" r="4" fill="#ffffff"/><circle cx="228" cy="122" r="4" fill="#ffffff"/>
        <path d="M115 278 L285 278 L305 335 L95 335 Z" fill="#8d4925" stroke="#4a2410" stroke-width="6"/>
        <rect x="145" y="295" width="110" height="22" rx="6" fill="url(#goldG)" stroke="#7f5512" stroke-width="3"/>
      `
    },
    {
      id: 'xmas-santa-red-hat',
      en: 'Fluffy Red Velvet Santa Hat with White Pom-Pom',
      vi: 'Mũ ông già Noel nhung đỏ viền bông trắng',
      tagsEn: ['santa hat', 'red hat', 'christmas', 'fur'],
      tagsVi: ['mũ noel', 'mũ ông già noel', 'giáng sinh', 'mũ đỏ'],
      cols: ['christmas', 'cute'],
      svg: `
        <path d="M85 275 C95 145 195 85 310 175 C325 188 330 212 315 225 C270 185 215 190 295 275 Z" fill="url(#redG)" stroke="#6a040f" stroke-width="6"/>
        <rect x="65" y="255" width="245" height="58" rx="29" fill="#ffffff" stroke="#d8e2dc" stroke-width="5"/>
        <circle cx="322" cy="212" r="34" fill="#ffffff" stroke="#d8e2dc" stroke-width="5"/>
      `
    },
    {
      id: 'xmas-santa-sleigh-gifts',
      en: 'Red Golden Santa Sleigh Loaded with Gifts',
      vi: 'Xe trượt tuyết đỏ viền vàng chở đầy quà Noel',
      tagsEn: ['santa sleigh', 'sled', 'gifts', 'christmas'],
      tagsVi: ['xe trượt tuyết', 'quà noel', 'ông già noel', 'giáng sinh'],
      cols: ['christmas'],
      svg: `
        <rect x="125" y="135" width="62" height="55" rx="6" fill="#2d6a4f" stroke="#1b4332" stroke-width="4"/>
        <line x1="156" y1="135" x2="156" y2="190" stroke="#ffd166" stroke-width="8"/>
        <rect x="195" y="120" width="70" height="70" rx="6" fill="#3a86ff" stroke="#1d3557" stroke-width="4"/>
        <line x1="230" y1="120" x2="230" y2="190" stroke="#ffbe0b" stroke-width="8"/>
        <path d="M75 175 Q110 175 125 205 L275 205 Q305 160 335 165 Q340 250 285 275 L105 275 Q70 255 75 175 Z" fill="url(#redG)" stroke="#6a040f" stroke-width="6"/>
        <path d="M90 220 Q195 245 305 205" fill="none" stroke="url(#goldG)" stroke-width="8" stroke-linecap="round"/>
        <path d="M60 310 L325 310 C355 310 365 275 340 265" fill="none" stroke="url(#goldG)" stroke-width="10" stroke-linecap="round"/>
        <line x1="135" y1="275" x2="135" y2="310" stroke="url(#goldG)" stroke-width="8"/>
        <line x1="255" y1="275" x2="255" y2="310" stroke="url(#goldG)" stroke-width="8"/>
      `
    },
    {
      id: 'xmas-poinsettia-flower',
      en: 'Crimson Holiday Poinsettia Blossom',
      vi: 'Hoa trạng nguyên đỏ thắm mùa Giáng sinh',
      tagsEn: ['poinsettia', 'christmas flower', 'red flower', 'botanical'],
      tagsVi: ['hoa trạng nguyên', 'hoa giáng sinh', 'hoa đỏ', 'noel'],
      cols: ['christmas', 'nature'],
      svg: `
        <g transform="translate(200,200)">
          <ellipse cx="0" cy="-95" rx="34" ry="72" transform="rotate(30)" fill="#2d6a4f" stroke="#1b4332" stroke-width="4"/>
          <ellipse cx="0" cy="-95" rx="34" ry="72" transform="rotate(150)" fill="#2d6a4f" stroke="#1b4332" stroke-width="4"/>
          <ellipse cx="0" cy="-95" rx="34" ry="72" transform="rotate(270)" fill="#2d6a4f" stroke="#1b4332" stroke-width="4"/>
          ${[0, 60, 120, 180, 240, 300].map(a => `<path d="M0 0 C-36 -45 -32 -110 0 -138 C32 -110 36 -45 0 0 Z" transform="rotate(${a})" fill="#d62828" stroke="#780000" stroke-width="4"/>`).join('')}
          ${[30, 90, 150, 210, 270, 330].map(a => `<path d="M0 0 C-26 -35 -24 -82 0 -104 C24 -82 26 -35 0 0 Z" transform="rotate(${a})" fill="#f94144" stroke="#9b0000" stroke-width="3.5"/>`).join('')}
          <circle cx="-10" cy="-8" r="9" fill="#ffd166" stroke="#9c6615" stroke-width="3"/>
          <circle cx="10" cy="-8" r="9" fill="#ffd166" stroke="#9c6615" stroke-width="3"/>
          <circle cx="0" cy="10" r="9" fill="#ffd166" stroke="#9c6615" stroke-width="3"/>
          <circle cx="0" cy="-2" r="7" fill="#52b788"/>
        </g>
      `
    },
    {
      id: 'xmas-mistletoe-sprig',
      en: 'Hanging Mistletoe Sprig with White Berries & Red Bow',
      vi: 'Nhành tầm gửi quả trắng buộc nơ đỏ Giáng sinh',
      tagsEn: ['mistletoe', 'berries', 'red bow', 'christmas'],
      tagsVi: ['nhành tầm gửi', 'nơ đỏ', 'quả trắng', 'giáng sinh'],
      cols: ['christmas', 'love'],
      svg: `
        <path d="M200 65 L200 185 M200 140 L140 245 M200 140 L260 245" stroke="#386641" stroke-width="8" stroke-linecap="round"/>
        <ellipse cx="145" cy="195" rx="22" ry="48" transform="rotate(35 145 195)" fill="#6a994e" stroke="#386641" stroke-width="4"/>
        <ellipse cx="255" cy="195" rx="22" ry="48" transform="rotate(-35 255 195)" fill="#6a994e" stroke="#386641" stroke-width="4"/>
        <ellipse cx="120" cy="275" rx="22" ry="48" transform="rotate(25 120 275)" fill="#6a994e" stroke="#386641" stroke-width="4"/>
        <ellipse cx="175" cy="278" rx="22" ry="48" transform="rotate(-15 175 278)" fill="#6a994e" stroke="#386641" stroke-width="4"/>
        <ellipse cx="225" cy="278" rx="22" ry="48" transform="rotate(15 225 278)" fill="#6a994e" stroke="#386641" stroke-width="4"/>
        <ellipse cx="280" cy="275" rx="22" ry="48" transform="rotate(-25 280 275)" fill="#6a994e" stroke="#386641" stroke-width="4"/>
        <circle cx="192" cy="195" r="13" fill="#ffffff" stroke="#adb5bd" stroke-width="3"/>
        <circle cx="212" cy="202" r="12" fill="#ffffff" stroke="#adb5bd" stroke-width="3"/>
        <circle cx="150" cy="245" r="12" fill="#ffffff" stroke="#adb5bd" stroke-width="3"/>
        <circle cx="250" cy="245" r="12" fill="#ffffff" stroke="#adb5bd" stroke-width="3"/>
        <path d="M200 105 C150 65 130 125 200 115 C270 125 250 65 200 105 Z" fill="#e63946" stroke="#800f2f" stroke-width="4"/>
        <circle cx="200" cy="108" r="12" fill="#c1121f"/>
      `
    },
    {
      id: 'xmas-string-lights-garland',
      en: 'Glowing Colorful Christmas Fairy String Lights',
      vi: 'Dây đèn nhấp nháy nhiều màu trang trí Noel',
      tagsEn: ['string lights', 'fairy lights', 'bulbs', 'christmas'],
      tagsVi: ['dây đèn', 'đèn nhấp nháy', 'đèn màu', 'giáng sinh'],
      cols: ['christmas'],
      svg: `
        <path d="M40 155 Q120 225 200 165 Q280 105 360 175" fill="none" stroke="#1b4332" stroke-width="7" stroke-linecap="round"/>
        ${[
          { x: 80, y: 185, c: '#ff595e', a: 15 },
          { x: 140, y: 192, c: '#ffca3a', a: -10 },
          { x: 200, y: 165, c: '#8ac926', a: 12 },
          { x: 260, y: 142, c: '#1982c4', a: -15 },
          { x: 320, y: 158, c: '#ff595e', a: 10 },
        ].map(b => `
          <g transform="translate(${b.x},${b.y}) rotate(${b.a})">
            <circle cx="0" cy="28" r="28" fill="${b.c}" fill-opacity="0.28"/>
            <rect x="-8" y="0" width="16" height="12" rx="3" fill="#495057"/>
            <ellipse cx="0" cy="30" rx="14" ry="22" fill="${b.c}" stroke="#ffffff" stroke-width="2.5"/>
          </g>
        `).join('')}
      `
    },
    {
      id: 'xmas-cozy-fireplace-hearth',
      en: 'Cozy Brick Fireplace with Crackling Holiday Fire',
      vi: 'Lò sưởi gạch đỏ rực lửa ấm áp đêm Giáng sinh',
      tagsEn: ['fireplace', 'hearth', 'cozy', 'christmas'],
      tagsVi: ['lò sưởi', 'đêm đông', 'ấm áp', 'giáng sinh'],
      cols: ['christmas'],
      svg: `
        <rect x="70" y="110" width="260" height="220" rx="8" fill="#bc4749" stroke="#6a040f" stroke-width="6"/>
        <rect x="52" y="92" width="296" height="28" rx="6" fill="#6f4518" stroke="#3d230a" stroke-width="5"/>
        <path d="M120 330 L120 205 A80 80 0 0 1 280 205 L280 330 Z" fill="#2b2d42" stroke="#141522" stroke-width="6"/>
        <path d="M160 315 C150 265 185 235 200 195 C218 235 250 265 240 315 Z" fill="#ff7b00"/>
        <path d="M175 315 C170 280 190 255 200 230 C212 255 230 280 225 315 Z" fill="#ffd166"/>
        <rect x="145" y="305" width="110" height="18" rx="9" fill="#582f0e"/>
        <rect x="50" y="325" width="300" height="20" rx="5" fill="#adb5bd" stroke="#495057" stroke-width="5"/>
      `
    },
    {
      id: 'xmas-yule-log-cake',
      en: 'Chocolate Bûche de Noël Yule Log Cake with Holly',
      vi: 'Bánh khúc cây sô cô la Giáng sinh phủ kem tuyết',
      tagsEn: ['yule log', 'buche de noel', 'chocolate cake', 'christmas'],
      tagsVi: ['bánh khúc cây', 'sô cô la', 'bánh giáng sinh', 'noel'],
      cols: ['christmas', 'cute'],
      svg: `
        <rect x="75" y="175" width="230" height="110" rx="55" fill="#582f0e" stroke="#3d1e05" stroke-width="6"/>
        <ellipse cx="295" cy="230" rx="34" ry="55" fill="#ddb892" stroke="#582f0e" stroke-width="6"/>
        <path d="M295 205 A18 28 0 1 1 294 205" fill="none" stroke="#7f4f24" stroke-width="6"/>
        <path d="M95 178 Q125 205 150 182 Q180 210 210 182 Q245 205 275 178 Q250 162 185 162 Q120 162 95 178 Z" fill="#ffffff"/>
        <ellipse cx="165" cy="155" rx="14" ry="26" transform="rotate(-40 165 155)" fill="#2d6a4f"/>
        <ellipse cx="205" cy="155" rx="14" ry="26" transform="rotate(40 205 155)" fill="#2d6a4f"/>
        <circle cx="185" cy="162" r="10" fill="#e63946"/>
        <circle cx="174" cy="170" r="8" fill="#d62828"/><circle cx="196" cy="170" r="8" fill="#d62828"/>
      `
    },
    {
      id: 'xmas-nutcracker-soldier',
      en: 'Wooden Holiday Nutcracker Toy Soldier',
      vi: 'Chú lính chì kẹp hạt dẻ gỗ mùa Giáng sinh',
      tagsEn: ['nutcracker', 'toy soldier', 'christmas', 'vintage'],
      tagsVi: ['lính chì', 'kẹp hạt dẻ', 'đồ chơi gỗ', 'giáng sinh'],
      cols: ['christmas', 'vintage'],
      svg: `
        <rect x="145" y="55" width="110" height="75" rx="10" fill="#212529" stroke="#000" stroke-width="5"/>
        <circle cx="200" cy="92" r="12" fill="url(#goldG)"/>
        <rect x="152" y="130" width="96" height="68" rx="12" fill="#fcd5ce" stroke="#6c584c" stroke-width="5"/>
        <circle cx="178" cy="155" r="6" fill="#212529"/><circle cx="222" cy="155" r="6" fill="#212529"/>
        <path d="M165 176 Q200 165 235 176" fill="none" stroke="#212529" stroke-width="5" stroke-linecap="round"/>
        <rect x="182" y="182" width="36" height="35" rx="4" fill="#ffffff"/>
        <rect x="135" y="198" width="130" height="105" rx="10" fill="url(#redG)" stroke="#6a040f" stroke-width="5"/>
        <line x1="165" y1="215" x2="235" y2="215" stroke="url(#goldG)" stroke-width="7"/>
        <line x1="165" y1="245" x2="235" y2="245" stroke="url(#goldG)" stroke-width="7"/>
        <rect x="135" y="275" width="130" height="18" fill="#212529"/>
        <rect x="186" y="272" width="28" height="24" fill="url(#goldG)"/>
        <rect x="155" y="303" width="36" height="55" rx="6" fill="#1d3557"/>
        <rect x="209" y="303" width="36" height="55" rx="6" fill="#1d3557"/>
      `
    },
    {
      id: 'xmas-ice-skates-pair',
      en: 'White Winter Figure Ice Skates with Red Laces',
      vi: 'Đôi giày trượt băng trắng thắt dây đỏ mùa đông',
      tagsEn: ['ice skates', 'winter', 'skating', 'christmas'],
      tagsVi: ['giày trượt băng', 'mùa đông', 'dây đỏ', 'giáng sinh'],
      cols: ['christmas', 'cute'],
      svg: `
        <path d="M115 110 L185 110 L192 225 L268 242 C288 248 292 280 265 280 L115 280 Z" fill="#ffffff" stroke="#adb5bd" stroke-width="6"/>
        <rect x="108" y="95" width="84" height="26" rx="13" fill="#e63946"/>
        <line x1="182" y1="145" x2="155" y2="145" stroke="#e63946" stroke-width="6" stroke-linecap="round"/>
        <line x1="185" y1="172" x2="155" y2="172" stroke="#e63946" stroke-width="6" stroke-linecap="round"/>
        <line x1="188" y1="199" x2="155" y2="199" stroke="#e63946" stroke-width="6" stroke-linecap="round"/>
        <path d="M95 315 L285 315 C312 315 318 288 298 282" fill="none" stroke="#adb5bd" stroke-width="10" stroke-linecap="round"/>
        <line x1="140" y1="280" x2="140" y2="315" stroke="#adb5bd" stroke-width="8"/>
        <line x1="240" y1="280" x2="240" y2="315" stroke="#adb5bd" stroke-width="8"/>
      `
    },
    {
      id: 'xmas-red-gift-sack',
      en: 'Santa Red Velvet Gift Bag Tied with Gold Rope',
      vi: 'Túi quà nhung đỏ của ông già Noel buộc dây vàng',
      tagsEn: ['gift sack', 'santa bag', 'presents', 'christmas'],
      tagsVi: ['túi quà', 'túi ông già noel', 'quà tặng', 'giáng sinh'],
      cols: ['christmas'],
      svg: `
        <rect x="155" y="75" width="48" height="45" rx="6" fill="#2d6a4f" stroke="#1b4332" stroke-width="4"/>
        <rect x="205" y="85" width="45" height="45" rx="6" fill="#ffd166" stroke="#b5830e" stroke-width="4"/>
        <path d="M135 115 L265 115 L245 155 C310 190 325 320 265 340 L135 340 C75 320 90 190 155 155 Z" fill="url(#redG)" stroke="#6a040f" stroke-width="6"/>
        <rect x="142" y="145" width="116" height="18" rx="9" fill="url(#goldG)" stroke="#7f5512" stroke-width="4"/>
        <circle cx="240" cy="175" r="10" fill="url(#goldG)"/>
      `
    },
    {
      id: 'xmas-double-bells-bow',
      en: 'Pair of Golden Jingle Bells with Red Holly Bow',
      vi: 'Đôi chuông vàng Giáng sinh đính nơ đỏ và lá thông',
      tagsEn: ['double bells', 'jingle bells', 'bow', 'christmas'],
      tagsVi: ['đôi chuông vàng', 'chuông noel', 'nơ đỏ', 'giáng sinh'],
      cols: ['christmas'],
      svg: `
        <g transform="translate(150,225) rotate(18)">
          <path d="M-55 45 L55 45 L42 -35 A42 42 0 0 0 -42 -35 Z" fill="url(#goldG)" stroke="#8c5a08" stroke-width="5"/>
          <circle cx="0" cy="52" r="14" fill="#b57c1e"/>
        </g>
        <g transform="translate(250,225) rotate(-18)">
          <path d="M-55 45 L55 45 L42 -35 A42 42 0 0 0 -42 -35 Z" fill="url(#goldG)" stroke="#8c5a08" stroke-width="5"/>
          <circle cx="0" cy="52" r="14" fill="#b57c1e"/>
        </g>
        <ellipse cx="160" cy="135" rx="18" ry="38" transform="rotate(-45 160 135)" fill="#2d6a4f"/>
        <ellipse cx="240" cy="135" rx="18" ry="38" transform="rotate(45 240 135)" fill="#2d6a4f"/>
        <path d="M200 150 C135 100 120 185 200 165 C280 185 265 100 200 150 Z" fill="#e63946" stroke="#800f2f" stroke-width="5"/>
        <circle cx="200" cy="155" r="16" fill="#c1121f"/>
      `
    },
    {
      id: 'xmas-peppermint-lollipop',
      en: 'Red & White Swirl Peppermint Candy Lollipop',
      vi: 'Kẹo mút bạc hà xoáy đỏ trắng ngọt ngào',
      tagsEn: ['peppermint', 'lollipop', 'swirl candy', 'christmas'],
      tagsVi: ['kẹo mút', 'kẹo bạc hà', 'xoáy đỏ trắng', 'giáng sinh'],
      cols: ['christmas', 'cute'],
      svg: `
        <rect x="192" y="210" width="16" height="140" rx="8" fill="#f8f9fa" stroke="#adb5bd" stroke-width="4"/>
        <circle cx="200" cy="155" r="88" fill="#ffffff" stroke="#d62828" stroke-width="6"/>
        ${[0, 60, 120, 180, 240, 300].map(a => `<path d="M200 155 Q235 110 200 67 A88 88 0 0 1 244 79 Q235 125 200 155 Z" transform="rotate(${a} 200 155)" fill="#e63946"/>`).join('')}
        <path d="M200 248 C155 220 145 275 200 262 C255 275 245 220 200 248 Z" fill="#2d6a4f"/>
      `
    },
    {
      id: 'xmas-pinecone-holly-cluster',
      en: 'Winter Pinecone with Evergreen Needles & Red Berries',
      vi: 'Quả thông nâu cùng nhành lá tùng và quả đỏ',
      tagsEn: ['pinecone', 'holly', 'evergreen', 'christmas'],
      tagsVi: ['quả thông', 'lá thông', 'quả đỏ', 'giáng sinh'],
      cols: ['christmas', 'nature'],
      svg: `
        <path d="M90 210 L200 165 L310 210" stroke="#2d6a4f" stroke-width="18" stroke-linecap="round"/>
        <path d="M110 175 L200 155 L290 175" stroke="#40916c" stroke-width="14" stroke-linecap="round"/>
        <ellipse cx="200" cy="235" rx="62" ry="82" fill="#7f4f24" stroke="#432818" stroke-width="6"/>
        <path d="M150 200 Q200 230 250 200 M142 235 Q200 265 258 235 M152 270 Q200 298 248 270" fill="none" stroke="#ddb892" stroke-width="6" stroke-linecap="round"/>
        <circle cx="182" cy="155" r="14" fill="#e63946" stroke="#780000" stroke-width="3"/>
        <circle cx="218" cy="155" r="14" fill="#e63946" stroke="#780000" stroke-width="3"/>
        <circle cx="200" cy="138" r="14" fill="#d62828" stroke="#780000" stroke-width="3"/>
      `
    },
    {
      id: 'xmas-vintage-lantern-snow',
      en: 'Glowing Vintage Black Lantern Topped with Snow',
      vi: 'Đèn bão cổ điển thắp nến vàng phủ tuyết trắng',
      tagsEn: ['lantern', 'candlelight', 'snow', 'christmas'],
      tagsVi: ['đèn bão', 'đèn lồng cổ', 'ánh nến', 'giáng sinh'],
      cols: ['christmas', 'vintage'],
      svg: `
        <circle cx="200" cy="72" r="18" fill="none" stroke="#2b2d42" stroke-width="7"/>
        <polygon points="200,88 125,145 275,145" fill="#2b2d42" stroke="#141522" stroke-width="5"/>
        <path d="M132 142 Q200 120 268 142" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
        <polygon points="140,145 260,145 245,295 155,295" fill="#fff3b0" stroke="#2b2d42" stroke-width="7"/>
        <rect x="184" y="218" width="32" height="72" rx="4" fill="#f8f9fa"/>
        <path d="M200 175 C185 198 188 215 200 218 C212 215 215 198 200 175 Z" fill="#ff9f1c"/>
        <rect x="130" y="295" width="140" height="28" rx="8" fill="#2b2d42"/>
      `
    },
    {
      id: 'xmas-snowman-blue-beanie',
      en: 'Cheerful Snowman Wearing Blue Knit Beanie',
      vi: 'Người tuyết tươi cười đội mũ len xanh ấm áp',
      tagsEn: ['snowman', 'beanie', 'winter', 'cute'],
      tagsVi: ['người tuyết', 'mũ len xanh', 'dễ thương', 'giáng sinh'],
      cols: ['christmas', 'cute'],
      svg: `
        <circle cx="200" cy="265" r="78" fill="#ffffff" stroke="#caf0f8" stroke-width="6"/>
        <circle cx="200" cy="158" r="56" fill="#ffffff" stroke="#caf0f8" stroke-width="6"/>
        <path d="M142 142 A58 52 0 0 1 258 142 Z" fill="#1982c4" stroke="#1d3557" stroke-width="5"/>
        <rect x="136" y="132" width="128" height="22" rx="11" fill="#4cc9f0" stroke="#1d3557" stroke-width="4"/>
        <circle cx="200" cy="82" r="18" fill="#ffffff" stroke="#1d3557" stroke-width="4"/>
        <circle cx="182" cy="162" r="6" fill="#212529"/><circle cx="218" cy="162" r="6" fill="#212529"/>
        <polygon points="200,168 238,176 200,182" fill="#fb8500"/>
        <rect x="148" y="198" width="104" height="22" rx="11" fill="#e63946"/>
        <rect x="218" y="205" width="22" height="52" rx="10" fill="#e63946"/>
        <circle cx="200" cy="248" r="7" fill="#212529"/><circle cx="200" cy="278" r="7" fill="#212529"/>
      `
    },
    {
      id: 'xmas-reindeer-red-nose',
      en: 'Cute Rudolph Reindeer with Glowing Red Nose',
      vi: 'Chú tuần lộc mũi đỏ đáng yêu mùa Giáng sinh',
      tagsEn: ['rudolph', 'reindeer', 'red nose', 'christmas'],
      tagsVi: ['tuần lộc', 'mũi đỏ', 'dễ thương', 'giáng sinh'],
      cols: ['christmas', 'cute'],
      svg: `
        <path d="M145 145 L115 75 M130 110 L95 105 M255 145 L285 75 M270 110 L305 105" stroke="#582f0e" stroke-width="12" stroke-linecap="round"/>
        <ellipse cx="122" cy="165" rx="28" ry="16" transform="rotate(-25 122 165)" fill="#9c6644"/>
        <ellipse cx="278" cy="165" rx="28" ry="16" transform="rotate(25 278 165)" fill="#9c6644"/>
        <ellipse cx="200" cy="220" rx="78" ry="86" fill="#b07d62" stroke="#582f0e" stroke-width="6"/>
        <ellipse cx="200" cy="252" rx="52" ry="42" fill="#ede0d4"/>
        <circle cx="170" cy="195" r="9" fill="#212529"/><circle cx="230" cy="195" r="9" fill="#212529"/>
        <circle cx="200" cy="238" r="22" fill="#e63946" stroke="#800f2f" stroke-width="4"/>
        <circle cx="193" cy="231" r="6" fill="#ffffff" fill-opacity="0.8"/>
      `
    },
    {
      id: 'xmas-christmas-pudding',
      en: 'Traditional Figgy Christmas Pudding with Icing & Holly',
      vi: 'Bánh pudding Giáng sinh phủ kem trắng và lá thông',
      tagsEn: ['christmas pudding', 'figgy pudding', 'dessert', 'christmas'],
      tagsVi: ['bánh pudding', 'tráng miệng', 'lá thông', 'giáng sinh'],
      cols: ['christmas'],
      svg: `
        <path d="M90 275 A110 110 0 0 1 310 275 Z" fill="#582f0e" stroke="#3d1e05" stroke-width="6"/>
        <path d="M102 225 A105 95 0 0 1 298 225 Q275 248 250 225 Q225 252 200 225 Q175 252 150 225 Q125 248 102 225 Z" fill="#ffffff"/>
        <rect x="65" y="272" width="270" height="22" rx="11" fill="#e9ecef" stroke="#adb5bd" stroke-width="5"/>
        <ellipse cx="182" cy="152" rx="12" ry="24" transform="rotate(-40 182 152)" fill="#2d6a4f"/>
        <ellipse cx="218" cy="152" rx="12" ry="24" transform="rotate(40 218 152)" fill="#2d6a4f"/>
        <circle cx="200" cy="160" r="10" fill="#e63946"/>
      `
    },
    {
      id: 'xmas-cinnamon-star-anise',
      en: 'Holiday Cinnamon Sticks, Dried Orange & Star Anise',
      vi: 'Thanh quế, cam sấy và hoa hồi thơm ấm mùa lễ hội',
      tagsEn: ['cinnamon', 'star anise', 'dried orange', 'christmas'],
      tagsVi: ['thanh quế', 'hoa hồi', 'cam sấy', 'giáng sinh'],
      cols: ['christmas', 'autumn'],
      svg: `
        <rect x="85" y="185" width="220" height="26" rx="13" transform="rotate(-22 195 198)" fill="#9c6644" stroke="#582f0e" stroke-width="5"/>
        <rect x="85" y="212" width="220" height="26" rx="13" transform="rotate(-10 195 225)" fill="#7f4f24" stroke="#3d1e05" stroke-width="5"/>
        <circle cx="215" cy="195" r="58" fill="#fb8500" stroke="#bc6c25" stroke-width="6"/>
        <circle cx="215" cy="195" r="46" fill="#ffb703"/>
        ${[0, 60, 120, 180, 240, 300].map(a => `<line x1="215" y1="195" x2="215" y2="149" transform="rotate(${a} 215 195)" stroke="#fff3b0" stroke-width="4"/>`).join('')}
        <g transform="translate(148,235)">
          ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<ellipse cx="0" cy="-22" rx="7" ry="18" transform="rotate(${a})" fill="#582f0e"/>`).join('')}
          <circle cx="0" cy="0" r="8" fill="#ddb892"/>
        </g>
      `
    },
    {
      id: 'xmas-green-gold-gift-box',
      en: 'Emerald Green Present Box with Golden Ribbon Bow',
      vi: 'Hộp quà xanh ngọc lục bảo thắt nơ ruy băng vàng',
      tagsEn: ['gift box', 'emerald', 'gold bow', 'christmas'],
      tagsVi: ['hộp quà', 'nơ vàng', 'quà giáng sinh', 'noel'],
      cols: ['christmas', 'birthday'],
      svg: `
        <rect x="100" y="155" width="200" height="175" rx="12" fill="url(#greenG)" stroke="#1b4332" stroke-width="6"/>
        <rect x="88" y="125" width="224" height="42" rx="10" fill="#2d6a4f" stroke="#1b4332" stroke-width="6"/>
        <rect x="182" y="125" width="36" height="205" fill="url(#goldG)"/>
        <rect x="100" y="225" width="200" height="32" fill="url(#goldG)"/>
        <path d="M200 125 C135 65 115 135 200 125 C285 135 265 65 200 125 Z" fill="url(#goldG)" stroke="#8c5a08" stroke-width="5"/>
      `
    },
    {
      id: 'xmas-blue-silver-bauble',
      en: 'Royal Blue Christmas Bauble with Silver Snowflake',
      vi: 'Quả châu xanh coban hoạ tiết bông tuyết bạc',
      tagsEn: ['blue bauble', 'ornament', 'snowflake', 'christmas'],
      tagsVi: ['quả châu xanh', 'bông tuyết', 'trang trí cây thông', 'giáng sinh'],
      cols: ['christmas'],
      svg: `
        <circle cx="200" cy="72" r="16" fill="none" stroke="#adb5bd" stroke-width="6"/>
        <rect x="176" y="85" width="48" height="28" rx="6" fill="#ced4da" stroke="#6c757d" stroke-width="4"/>
        <circle cx="200" cy="215" r="108" fill="#1d3557" stroke="#0b132b" stroke-width="6"/>
        <circle cx="165" cy="175" r="24" fill="#4cc9f0" fill-opacity="0.28"/>
        <g transform="translate(200,215)" stroke="#ffffff" stroke-width="5" stroke-linecap="round">
          ${[0, 60, 120, 180, 240, 300].map(a => `<line x1="0" y1="-58" x2="0" y2="58" transform="rotate(${a})"/>`).join('')}
        </g>
      `
    },
    {
      id: 'xmas-gold-drop-ornament',
      en: 'Vintage Finial Drop Golden Tree Ornament',
      vi: 'Quả châu giọt nước ánh vàng cổ điển treo cây thông',
      tagsEn: ['finial ornament', 'gold ornament', 'vintage', 'christmas'],
      tagsVi: ['châu giọt nước', 'trang trí vàng', 'cổ điển', 'giáng sinh'],
      cols: ['christmas', 'vintage'],
      svg: `
        <circle cx="200" cy="62" r="14" fill="none" stroke="#8c5a08" stroke-width="5"/>
        <rect x="182" y="75" width="36" height="22" rx="4" fill="url(#goldG)"/>
        <path d="M200 95 C265 135 280 205 200 345 C120 205 135 135 200 95 Z" fill="url(#goldG)" stroke="#8c5a08" stroke-width="6"/>
        <path d="M142 185 L258 185 M148 215 L252 215" stroke="#e63946" stroke-width="8"/>
      `
    },
    {
      id: 'xmas-wooden-rocking-horse',
      en: 'Classic White & Red Holiday Wooden Rocking Horse',
      vi: 'Ngựa gỗ bập bênh trắng yên đỏ quà Giáng sinh',
      tagsEn: ['rocking horse', 'wooden toy', 'christmas', 'vintage'],
      tagsVi: ['ngựa gỗ', 'ngựa bập bênh', 'đồ chơi cổ', 'giáng sinh'],
      cols: ['christmas', 'vintage', 'cute'],
      svg: `
        <path d="M115 295 L145 215 L125 145 L165 105 L195 135 L182 185 L265 185 L285 295" fill="#f8f9fa" stroke="#6c757d" stroke-width="6" stroke-linejoin="round"/>
        <path d="M180 185 Q220 220 250 185 Z" fill="#e63946" stroke="#800f2f" stroke-width="4"/>
        <path d="M265 185 Q315 195 305 245" fill="none" stroke="#adb5bd" stroke-width="12" stroke-linecap="round"/>
        <path d="M65 285 Q200 345 335 285" fill="none" stroke="#bc6c25" stroke-width="14" stroke-linecap="round"/>
      `
    },
    {
      id: 'xmas-polar-bear-scarf',
      en: 'Cute White Polar Bear Wearing Red Winter Scarf',
      vi: 'Gấu Bắc Cực trắng quàng khăn len đỏ mùa đông',
      tagsEn: ['polar bear', 'winter', 'scarf', 'christmas'],
      tagsVi: ['gấu bắc cực', 'khăn đỏ', 'mùa đông', 'giáng sinh'],
      cols: ['christmas', 'cute'],
      svg: `
        <circle cx="140" cy="115" r="24" fill="#ffffff" stroke="#adb5bd" stroke-width="5"/>
        <circle cx="260" cy="115" r="24" fill="#ffffff" stroke="#adb5bd" stroke-width="5"/>
        <ellipse cx="200" cy="275" rx="78" ry="68" fill="#ffffff" stroke="#adb5bd" stroke-width="6"/>
        <circle cx="200" cy="168" r="64" fill="#ffffff" stroke="#adb5bd" stroke-width="6"/>
        <ellipse cx="200" cy="182" rx="28" ry="22" fill="#e9ecef"/>
        <circle cx="176" cy="155" r="6" fill="#212529"/><circle cx="224" cy="155" r="6" fill="#212529"/>
        <circle cx="200" cy="176" r="9" fill="#212529"/>
        <rect x="138" y="212" width="124" height="26" rx="13" fill="#e63946" stroke="#800f2f" stroke-width="4"/>
        <rect x="218" y="222" width="26" height="58" rx="10" fill="#e63946" stroke="#800f2f" stroke-width="4"/>
      `
    },
    {
      id: 'xmas-penguin-earmuffs',
      en: 'Chubby Winter Penguin Wearing Red Cozy Earmuffs',
      vi: 'Chim cánh cụt mũm mĩm đeo chụp tai ấm mùa đông',
      tagsEn: ['penguin', 'earmuffs', 'winter', 'christmas'],
      tagsVi: ['chim cánh cụt', 'mùa đông', 'dễ thương', 'giáng sinh'],
      cols: ['christmas', 'cute'],
      svg: `
        <ellipse cx="145" cy="330" rx="24" ry="12" fill="#fb8500"/>
        <ellipse cx="255" cy="330" rx="24" ry="12" fill="#fb8500"/>
        <ellipse cx="200" cy="225" rx="82" ry="105" fill="#2b2d42" stroke="#141522" stroke-width="6"/>
        <ellipse cx="200" cy="242" rx="56" ry="78" fill="#ffffff"/>
        <path d="M122 185 A78 78 0 0 1 278 185" fill="none" stroke="#e63946" stroke-width="10"/>
        <circle cx="118" cy="185" r="22" fill="#e63946" stroke="#ffffff" stroke-width="5"/>
        <circle cx="282" cy="185" r="22" fill="#e63946" stroke="#ffffff" stroke-width="5"/>
        <circle cx="176" cy="175" r="7" fill="#ffffff"/><circle cx="224" cy="175" r="7" fill="#ffffff"/>
        <polygon points="200,185 184,205 216,205" fill="#ffb703"/>
      `
    },
    {
      id: 'xmas-advent-wreath-candles',
      en: 'Evergreen Advent Wreath with Four Lit Red Candles',
      vi: 'Vòng lá thông Mùa Vọng cắm bốn ngọn nến đỏ cháy sáng',
      tagsEn: ['advent wreath', 'four candles', 'evergreen', 'christmas'],
      tagsVi: ['vòng mùa vọng', 'bốn ngọn nến', 'lá thông', 'giáng sinh'],
      cols: ['christmas'],
      svg: `
        <ellipse cx="200" cy="265" rx="125" ry="52" fill="none" stroke="#2d6a4f" stroke-width="38"/>
        <ellipse cx="200" cy="265" rx="125" ry="52" fill="none" stroke="#40916c" stroke-width="16" stroke-dasharray="18 14"/>
        ${[115, 172, 228, 285].map(x => `
          <rect x="${x - 14}" y="135" width="28" height="115" rx="6" fill="url(#redG)" stroke="#6a040f" stroke-width="4"/>
          <path d="M${x} 95 C${x - 14} 118 ${x - 10} 132 ${x} 135 C${x + 10} 132 ${x + 14} 118 ${x} 95 Z" fill="#ffb703"/>
        `).join('')}
      `
    },
    {
      id: 'xmas-mulled-wine-goblet',
      en: 'Spiced Mulled Wine Glass with Orange Slice & Cinnamon',
      vi: 'Ly rượu vang nóng thảo mộc lát cam và thanh quế',
      tagsEn: ['mulled wine', 'gluhwein', 'spiced drink', 'christmas'],
      tagsVi: ['rượu vang nóng', 'đồ uống mùa đông', 'cam quế', 'giáng sinh'],
      cols: ['christmas'],
      svg: `
        <path d="M265 185 C315 185 315 255 265 255" fill="none" stroke="#adb5bd" stroke-width="14" stroke-linecap="round"/>
        <path d="M125 145 L275 145 L255 285 A55 45 0 0 1 145 285 Z" fill="#e9ecef" fill-opacity="0.7" stroke="#adb5bd" stroke-width="6"/>
        <path d="M132 175 L268 175 L252 280 A50 38 0 0 1 148 280 Z" fill="#800f2f"/>
        <rect x="175" y="105" width="16" height="115" rx="8" transform="rotate(-18 183 162)" fill="#7f4f24"/>
        <circle cx="235" cy="168" r="32" fill="#fb8500" stroke="#ffb703" stroke-width="5"/>
        <rect x="155" y="315" width="90" height="16" rx="8" fill="#adb5bd"/>
      `
    },
    {
      id: 'xmas-merry-christmas-ribbon',
      en: 'Festive Red & Gold Merry Christmas Banner Scroll',
      vi: 'Dải băng rôn đỏ viền vàng chữ Merry Christmas',
      tagsEn: ['merry christmas', 'banner', 'ribbon', 'holiday'],
      tagsVi: ['chúc mừng giáng sinh', 'băng rôn', 'ruy băng đỏ', 'noel'],
      cols: ['christmas'],
      svg: `
        <path d="M35 215 L85 175 L85 255 L35 245 L58 215 Z" fill="#9b0000"/>
        <path d="M365 215 L315 175 L315 255 L365 245 L342 215 Z" fill="#9b0000"/>
        <path d="M65 155 Q200 125 335 155 L335 235 Q200 205 65 235 Z" fill="url(#redG)" stroke="url(#goldG)" stroke-width="7"/>
        <text x="200" y="186" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#ffe57f" letter-spacing="2">MERRY</text>
        <text x="200" y="214" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#ffffff" letter-spacing="1.5">CHRISTMAS</text>
      `
    },
  ];

  for (const item of items) {
    await saveSvgSticker('sticker', 'christmas', item.id, item.svg);
    if (!manifest.items.some(x => x.id === item.id)) {
      manifest.items.push(makeItemMeta(item.id, item.en, item.vi, item.tagsEn, item.tagsVi, item.cols, 'christmas'));
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`christmas: ${manifest.items.length} items`);
}

// ============================================================================
// 6. CELEBRATIONS (+34 items -> 60 total)
// ============================================================================
async function buildCelebrations() {
  const manifestPath = path.join(ROOT, 'assets/sticker/celebrations/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  preserveExistingSources('sticker', 'celebrations', manifest.items);

  const items = [];

  // 10 Number Candles (0 - 9)
  const candleColors = [
    { d: '0', c1: '#ff595e', c2: '#ffd166', vi: 'không' },
    { d: '1', c1: '#4cc9f0', c2: '#ffffff', vi: 'một' },
    { d: '2', c1: '#ff99c8', c2: '#fcf6bd', vi: 'hai' },
    { d: '3', c1: '#8ac926', c2: '#ffffff', vi: 'ba' },
    { d: '4', c1: '#9b5de5', c2: '#fee440', vi: 'bốn' },
    { d: '5', c1: '#fb8500', c2: '#ffffff', vi: 'năm' },
    { d: '6', c1: '#00bbf9', c2: '#f15bb5', vi: 'sáu' },
    { d: '7', c1: '#f72585', c2: '#ffd166', vi: 'bảy' },
    { d: '8', c1: '#52b788', c2: '#fff3b0', vi: 'tám' },
    { d: '9', c1: '#e63946', c2: '#ffd166', vi: 'chín' },
  ];

  for (const cc of candleColors) {
    items.push({
      id: `cel-candle-number-${cc.d}`,
      en: `Lit Birthday Number ${cc.d} Cake Candle`,
      vi: `Nến sinh nhật hình số ${cc.d} (${cc.vi}) đang cháy`,
      tagsEn: [`number ${cc.d}`, 'number candle', 'birthday candle', 'age'],
      tagsVi: [`nến số ${cc.d}`, 'nến sinh nhật', 'tuổi', 'sinh nhật'],
      cols: ['birthday'],
      svg: `
        <rect x="188" y="305" width="24" height="48" rx="6" fill="#f8f9fa" stroke="#adb5bd" stroke-width="4"/>
        <line x1="200" y1="95" x2="200" y2="122" stroke="#212529" stroke-width="5"/>
        <path d="M200 42 C178 72 182 96 200 100 C218 96 222 72 200 42 Z" fill="#ff9f1c"/>
        <path d="M200 58 C188 76 190 92 200 95 C210 92 212 76 200 58 Z" fill="#fff3b0"/>
        <text x="200" y="295" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="215" font-weight="900" fill="${cc.c1}" stroke="#ffffff" stroke-width="14" paint-order="stroke">${cc.d}</text>
        <text x="200" y="295" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="215" font-weight="900" fill="none" stroke="${cc.c2}" stroke-width="5" stroke-dasharray="14 10">${cc.d}</text>
      `
    });
  }

  // Happy Birthday Banner + 23 other Celebration items
  items.push(
    {
      id: 'cel-happy-birthday-banner',
      en: 'Hand-Drawn Festive Happy Birthday Ribbon Banner',
      vi: 'Dải băng rôn chữ Happy Birthday trang trí tiệc sinh nhật',
      tagsEn: ['happy birthday', 'banner', 'bunting', 'birthday'],
      tagsVi: ['chúc mừng sinh nhật', 'dây chữ', 'happy birthday', 'sinh nhật'],
      cols: ['birthday', 'cute'],
      svg: `
        <path d="M35 150 Q200 195 365 150" fill="none" stroke="#8c5a08" stroke-width="4"/>
        ${['H','A','P','P','Y'].map((ch, i) => {
          const x = 85 + i * 58;
          const y = 145 + (i === 2 ? 14 : i === 1 || i === 3 ? 10 : 0);
          const cols = ['#ff595e','#ffca3a','#8ac926','#1982c4','#9b5de5'];
          return `<polygon points="${x-24},${y-20} ${x+24},${y-20} ${x+24},${y+32} ${x},${y+48} ${x-24},${y+32}" fill="${cols[i]}" stroke="#ffffff" stroke-width="3"/>
                  <text x="${x}" y="${y+18}" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#ffffff">${ch}</text>`;
        }).join('')}
        <path d="M45 245 Q200 220 355 245 L342 302 Q200 278 58 302 Z" fill="#f72585" stroke="#ffffff" stroke-width="5"/>
        <text x="200" y="280" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="#fff3b0" letter-spacing="3">BIRTHDAY</text>
      `
    },
    {
      id: 'cel-cone-party-hat',
      en: 'Polka-Dot Birthday Cone Hat with Pom-Pom',
      vi: 'Mũ chóp sinh nhật chấm bi đính quả bông tròn',
      tagsEn: ['party hat', 'cone hat', 'polka dot', 'birthday'],
      tagsVi: ['mũ sinh nhật', 'mũ chóp', 'bữa tiệc', 'sinh nhật'],
      cols: ['birthday', 'cute'],
      svg: `
        <polygon points="200,82 105,315 295,315" fill="#4cc9f0" stroke="#1d3557" stroke-width="6"/>
        <circle cx="185" cy="165" r="14" fill="#ffd166"/><circle cx="222" cy="215" r="14" fill="#ff595e"/>
        <circle cx="155" cy="245" r="14" fill="#8ac926"/><circle cx="205" cy="278" r="14" fill="#f72585"/>
        <circle cx="255" cy="282" r="14" fill="#ffd166"/>
        <path d="M98 315 Q200 335 302 315" fill="none" stroke="#ff595e" stroke-width="18" stroke-linecap="round"/>
        <circle cx="200" cy="72" r="24" fill="#ff595e" stroke="#ffffff" stroke-width="4"/>
      `
    },
    {
      id: 'cel-party-horn-blower',
      en: 'Festive Striped Party Horn Noisemaker with Confetti',
      vi: 'Kèn giấy thổi tiệc sinh nhật sọc màu và hoa giấy',
      tagsEn: ['party horn', 'noisemaker', 'blower', 'birthday'],
      tagsVi: ['kèn sinh nhật', 'kèn giấy', 'bữa tiệc', 'sinh nhật'],
      cols: ['birthday'],
      svg: `
        <polygon points="85,295 255,135 295,175" fill="#ffca3a" stroke="#b5830e" stroke-width="5"/>
        <path d="M275 155 C315 115 355 155 320 185 C295 205 280 175 305 165" fill="none" stroke="#f72585" stroke-width="14" stroke-linecap="round"/>
        <circle cx="225" cy="95" r="8" fill="#4cc9f0"/><circle cx="325" cy="98" r="9" fill="#8ac926"/>
        <circle cx="345" cy="225" r="8" fill="#ff595e"/>
      `
    },
    {
      id: 'cel-chocolate-birthday-cake',
      en: 'Rich Chocolate Drip Birthday Cake with Cherries',
      vi: 'Bánh sinh nhật phủ sô cô la chảy và quả anh đào đỏ',
      tagsEn: ['chocolate cake', 'birthday cake', 'cherries', 'sweet'],
      tagsVi: ['bánh sô cô la', 'bánh sinh nhật', 'anh đào', 'sinh nhật'],
      cols: ['birthday'],
      svg: `
        <rect x="95" y="185" width="210" height="125" rx="14" fill="#7f4f24" stroke="#3d1e05" stroke-width="6"/>
        <path d="M95 195 Q120 245 142 205 Q165 255 190 205 Q215 248 242 205 Q275 252 305 195 L305 182 L95 182 Z" fill="#3d1e05"/>
        <circle cx="135" cy="172" r="14" fill="#e63946"/><circle cx="200" cy="172" r="14" fill="#e63946"/><circle cx="265" cy="172" r="14" fill="#e63946"/>
        <rect x="192" y="110" width="16" height="58" rx="4" fill="#ffd166"/>
        <path d="M200 78 C188 95 190 108 200 110 C210 108 212 95 200 78 Z" fill="#ff9f1c"/>
        <rect x="75" y="310" width="250" height="18" rx="9" fill="#e9ecef" stroke="#adb5bd" stroke-width="4"/>
      `
    },
    {
      id: 'cel-colorful-macaron-tower',
      en: 'Pastel French Macaron Cookie Stack with Bow',
      vi: 'Tháp bánh macaron Pháp màu pastel ngọt ngào',
      tagsEn: ['macarons', 'pastel', 'dessert', 'wedding'],
      tagsVi: ['bánh macaron', 'bánh ngọt', 'pastel', 'đám cưới'],
      cols: ['birthday', 'wedding', 'cute'],
      svg: `
        ${[
          { y: 265, w: 180, c: '#ff99c8' },
          { y: 205, w: 150, c: '#a9def9' },
          { y: 145, w: 120, c: '#fcf6bd' },
          { y: 92,  w: 90,  c: '#d0f4de' },
        ].map(m => `
          <rect x="${200 - m.w/2}" y="${m.y}" width="${m.w}" height="46" rx="23" fill="${m.c}" stroke="#6c757d" stroke-width="4"/>
          <line x1="${208 - m.w/2}" y1="${m.y + 23}" x2="${192 + m.w/2}" y2="${m.y + 23}" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        `).join('')}
      `
    },
    {
      id: 'cel-pastel-donut-sprinkles',
      en: 'Strawberry Frosted Party Donut with Rainbow Sprinkles',
      vi: 'Bánh vòng donut phủ kem dâu hồng rắc cốm nhiều màu',
      tagsEn: ['donut', 'sprinkles', 'sweet', 'birthday'],
      tagsVi: ['bánh donut', 'bánh vòng', 'kem dâu', 'sinh nhật'],
      cols: ['birthday', 'cute'],
      svg: `
        <circle cx="200" cy="200" r="112" fill="#ddb892" stroke="#7f4f24" stroke-width="6"/>
        <circle cx="200" cy="200" r="96" fill="#ff70a6" stroke="#c9184a" stroke-width="4"/>
        <circle cx="200" cy="200" r="38" fill="#ddb892" stroke="#7f4f24" stroke-width="5"/>
        <circle cx="200" cy="200" r="28" fill="#212529" fill-opacity="0.18"/>
        <rect x="145" y="135" width="22" height="8" rx="4" transform="rotate(-25 145 135)" fill="#ffd166"/>
        <rect x="235" y="138" width="22" height="8" rx="4" transform="rotate(30 235 138)" fill="#4cc9f0"/>
        <rect x="130" y="215" width="22" height="8" rx="4" transform="rotate(40 130 215)" fill="#ffffff"/>
        <rect x="248" y="220" width="22" height="8" rx="4" transform="rotate(-20 248 220)" fill="#8ac926"/>
        <rect x="190" y="268" width="22" height="8" rx="4" fill="#ffd166"/>
      `
    },
    {
      id: 'cel-star-foil-balloon',
      en: 'Shiny Golden Star Foil Party Balloon',
      vi: 'Bóng bay tráng gương ngôi sao vàng lấp lánh',
      tagsEn: ['star balloon', 'foil balloon', 'gold star', 'birthday'],
      tagsVi: ['bóng ngôi sao', 'bóng tráng gương', 'sao vàng', 'sinh nhật'],
      cols: ['birthday', 'graduation'],
      svg: `
        <path d="M200 265 Q185 315 210 355" fill="none" stroke="#adb5bd" stroke-width="4"/>
        <polygon points="200,55 234,132 318,142 255,198 272,280 200,238 128,280 145,198 82,142 166,132" fill="url(#goldG)" stroke="#9c6615" stroke-width="6" stroke-linejoin="round"/>
        <circle cx="178" cy="145" r="14" fill="#ffffff" fill-opacity="0.45"/>
      `
    },
    {
      id: 'cel-heart-foil-balloon',
      en: 'Glossy Pink Heart Party Balloon on String',
      vi: 'Bóng bay trái tim màu hồng bóng buộc dây',
      tagsEn: ['heart balloon', 'pink balloon', 'love', 'wedding'],
      tagsVi: ['bóng trái tim', 'bóng hồng', 'tình yêu', 'đám cưới'],
      cols: ['birthday', 'wedding', 'love'],
      svg: `
        <path d="M200 285 Q218 325 192 360" fill="none" stroke="#adb5bd" stroke-width="4"/>
        <path d="M200 282 C110 220 75 155 115 102 C145 65 188 85 200 118 C212 85 255 65 285 102 C325 155 290 220 200 282 Z" fill="#ff4d6d" stroke="#a4133c" stroke-width="6"/>
        <ellipse cx="145" cy="128" rx="14" ry="26" transform="rotate(-30 145 128)" fill="#ffffff" fill-opacity="0.45"/>
      `
    },
    {
      id: 'cel-wrapped-birthday-gift',
      en: 'Polka-Dot Birthday Present Box with Big Pink Bow',
      vi: 'Hộp quà sinh nhật chấm bi thắt nơ hồng lớn',
      tagsEn: ['birthday gift', 'present', 'pink bow', 'party'],
      tagsVi: ['hộp quà sinh nhật', 'quà tặng', 'nơ hồng', 'sinh nhật'],
      cols: ['birthday', 'cute'],
      svg: `
        <rect x="98" y="150" width="204" height="180" rx="12" fill="#fcf6bd" stroke="#b5830e" stroke-width="6"/>
        <circle cx="140" cy="200" r="10" fill="#ff99c8"/><circle cx="260" cy="200" r="10" fill="#4cc9f0"/>
        <circle cx="140" cy="280" r="10" fill="#4cc9f0"/><circle cx="260" cy="280" r="10" fill="#ff99c8"/>
        <rect x="182" y="150" width="36" height="180" fill="#f72585"/>
        <rect x="98" y="222" width="204" height="34" fill="#f72585"/>
        <path d="M200 150 C130 85 115 155 200 145 C285 155 270 85 200 150 Z" fill="#f72585" stroke="#a4133c" stroke-width="5"/>
      `
    },
    {
      id: 'cel-sparkler-wand-glow',
      en: 'Glowing Golden Party Sparkler Stick',
      vi: 'Que pháo bông cầm tay toả tia sáng vàng lấp lánh',
      tagsEn: ['sparkler', 'fireworks', 'celebration', 'birthday'],
      tagsVi: ['pháo bông cầm tay', 'pháo sáng', 'chúc mừng', 'sinh nhật'],
      cols: ['birthday', 'wedding'],
      svg: `
        <line x1="200" y1="165" x2="200" y2="355" stroke="#6c757d" stroke-width="8" stroke-linecap="round"/>
        <g transform="translate(200,155)" stroke="#ffd166" stroke-width="6" stroke-linecap="round">
          ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => `<line x1="0" y1="0" x2="0" y2="${i % 2 === 0 ? -92 : -62}" transform="rotate(${a})" stroke="${i % 2 === 0 ? '#ffd166' : '#ff595e'}"/>`).join('')}
          <circle cx="0" cy="0" r="24" fill="#ffffff"/>
        </g>
      `
    },
    {
      id: 'cel-confetti-streamer-burst',
      en: 'Swirling Party Ribbons & Colorful Confetti Stars',
      vi: 'Hoa giấy ngôi sao và dây ruy băng xoắn chúc mừng',
      tagsEn: ['confetti', 'streamers', 'ribbons', 'party'],
      tagsVi: ['hoa giấy', 'ruy băng xoắn', 'tung hoa', 'sinh nhật'],
      cols: ['birthday', 'graduation'],
      svg: `
        <path d="M95 315 C75 235 155 185 115 95" fill="none" stroke="#ff595e" stroke-width="12" stroke-linecap="round"/>
        <path d="M200 325 C225 225 165 165 215 75" fill="none" stroke="#4cc9f0" stroke-width="12" stroke-linecap="round"/>
        <path d="M305 315 C325 235 255 185 295 95" fill="none" stroke="#ffca3a" stroke-width="12" stroke-linecap="round"/>
        <circle cx="155" cy="145" r="10" fill="#8ac926"/><circle cx="255" cy="135" r="10" fill="#f72585"/>
        <circle cx="145" cy="255" r="10" fill="#9b5de5"/><circle cx="265" cy="245" r="10" fill="#ff595e"/>
      `
    },
    {
      id: 'cel-three-tier-wedding-cake',
      en: 'Elegant Three-Tier White Wedding Cake with Roses',
      vi: 'Bánh cưới ba tầng kem trắng điểm hoa hồng lãng mạn',
      tagsEn: ['wedding cake', 'three tier', 'bridal', 'wedding'],
      tagsVi: ['bánh cưới', 'bánh ba tầng', 'hoa hồng', 'đám cưới'],
      cols: ['wedding'],
      svg: `
        <rect x="85" y="250" width="230" height="75" rx="10" fill="#ffffff" stroke="#ced4da" stroke-width="5"/>
        <rect x="115" y="180" width="170" height="70" rx="10" fill="#ffffff" stroke="#ced4da" stroke-width="5"/>
        <rect x="145" y="115" width="110" height="65" rx="10" fill="#ffffff" stroke="#ced4da" stroke-width="5"/>
        <path d="M85 275 Q142 300 200 275 Q258 300 315 275" fill="none" stroke="url(#goldG)" stroke-width="5"/>
        <path d="M115 205 Q158 228 200 205 Q242 228 285 205" fill="none" stroke="url(#goldG)" stroke-width="5"/>
        <circle cx="185" cy="112" r="14" fill="#ff70a6"/><circle cx="215" cy="112" r="14" fill="#ff4d6d"/>
        <circle cx="142" cy="180" r="12" fill="#ff70a6"/><circle cx="258" cy="250" r="14" fill="#ff4d6d"/>
        <rect x="65" y="325" width="270" height="16" rx="8" fill="url(#goldG)"/>
      `
    },
    {
      id: 'cel-pair-white-doves',
      en: 'Pair of White Wedding Doves with Pink Heart',
      vi: 'Đôi chim bồ câu trắng nâng trái tim hồng ngày cưới',
      tagsEn: ['white doves', 'lovebirds', 'wedding', 'love'],
      tagsVi: ['chim bồ câu', 'đôi chim trắng', 'hạnh phúc', 'đám cưới'],
      cols: ['wedding', 'love'],
      svg: `
        <path d="M200 155 C175 125 142 145 162 178 L200 212 L238 178 C258 145 225 125 200 155 Z" fill="#ff4d6d"/>
        <path d="M155 215 C115 215 75 185 65 135 C95 142 125 160 140 185 C135 155 158 145 168 172 C175 192 172 215 155 215 Z" fill="#ffffff" stroke="#adb5bd" stroke-width="5"/>
        <path d="M245 215 C285 215 325 185 335 135 C305 142 275 160 260 185 C265 155 242 145 232 172 C225 192 228 215 245 215 Z" fill="#ffffff" stroke="#adb5bd" stroke-width="5"/>
      `
    },
    {
      id: 'cel-just-married-banner',
      en: 'Floral Just Married Wedding Garland Sign',
      vi: 'Biển chữ Just Married kết hoa lá trang trí tiệc cưới',
      tagsEn: ['just married', 'wedding sign', 'bride groom', 'wedding'],
      tagsVi: ['just married', 'biển đám cưới', 'tân hôn', 'đám cưới'],
      cols: ['wedding', 'love'],
      svg: `
        <rect x="55" y="135" width="290" height="130" rx="18" fill="#fffdf7" stroke="url(#goldG)" stroke-width="8"/>
        <circle cx="80" cy="155" r="16" fill="#ff70a6"/><circle cx="320" cy="245" r="16" fill="#ff70a6"/>
        <text x="200" y="190" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-style="italic" font-weight="bold" fill="#9c6615">Just</text>
        <text x="200" y="232" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="bold" fill="#c9184a" letter-spacing="2">MARRIED</text>
      `
    },
    {
      id: 'cel-wedding-arch-roses',
      en: 'Romantic Floral Wedding Archway with White Drapes',
      vi: 'Cổng hoa hồng đám cưới phủ lụa trắng lãng mạn',
      tagsEn: ['wedding arch', 'floral arch', 'ceremony', 'wedding'],
      tagsVi: ['cổng hoa cưới', 'lễ cưới', 'hoa hồng', 'đám cưới'],
      cols: ['wedding'],
      svg: `
        <path d="M95 340 L95 185 A105 105 0 0 1 305 185 L305 340" fill="none" stroke="url(#goldG)" stroke-width="14" stroke-linecap="round"/>
        <circle cx="135" cy="105" r="22" fill="#ff70a6"/><circle cx="175" cy="82" r="24" fill="#ff4d6d"/>
        <circle cx="222" cy="82" r="22" fill="#ff99c8"/><circle cx="262" cy="105" r="20" fill="#ff4d6d"/>
        <circle cx="95" cy="185" r="20" fill="#ff70a6"/><circle cx="305" cy="185" r="20" fill="#ff70a6"/>
      `
    },
    {
      id: 'cel-bride-groom-toast',
      en: 'Tuxedo & Bridal Gown Wedding Couple Badge',
      vi: 'Biểu tượng vest chú rể và váy cô dâu hạnh phúc',
      tagsEn: ['bride and groom', 'tuxedo', 'wedding dress', 'wedding'],
      tagsVi: ['cô dâu chú rể', 'váy cưới', 'áo vest', 'đám cưới'],
      cols: ['wedding', 'love'],
      svg: `
        <rect x="85" y="125" width="105" height="195" rx="14" fill="#212529" stroke="#000" stroke-width="5"/>
        <polygon points="115,125 160,125 138,195" fill="#ffffff"/>
        <polygon points="122,145 154,145 138,158" fill="#e63946"/>
        <path d="M225 145 L285 145 L325 320 L185 320 Z" fill="#ffffff" stroke="#ced4da" stroke-width="5"/>
        <path d="M235 145 Q255 175 275 145" fill="none" stroke="#ff70a6" stroke-width="6"/>
      `
    },
    {
      id: 'cel-pink-peony-corsage',
      en: 'Blush Pink Peony Wedding Boutonniere with Gold Ribbon',
      vi: 'Hoa mẫu đơn hồng cài áo cưới buộc ruy băng vàng',
      tagsEn: ['peony', 'corsage', 'wedding flower', 'wedding'],
      tagsVi: ['hoa mẫu đơn', 'hoa cài áo', 'hoa cưới', 'đám cưới'],
      cols: ['wedding', 'nature'],
      svg: `
        <ellipse cx="165" cy="235" rx="22" ry="52" transform="rotate(-35 165 235)" fill="#52b788"/>
        <ellipse cx="235" cy="235" rx="22" ry="52" transform="rotate(35 235 235)" fill="#52b788"/>
        <circle cx="200" cy="175" r="68" fill="#ff99c8" stroke="#c9184a" stroke-width="5"/>
        <circle cx="200" cy="175" r="46" fill="#ff70a6"/>
        <circle cx="200" cy="175" r="22" fill="#ffd166"/>
        <path d="M200 255 L175 335 M200 255 L225 335" stroke="url(#goldG)" stroke-width="10" stroke-linecap="round"/>
      `
    },
    {
      id: 'cel-wedding-bells-ribbon',
      en: 'Pair of Silver & White Wedding Bells with Bow',
      vi: 'Đôi chuông ngân đám cưới thắt nơ lụa trắng',
      tagsEn: ['wedding bells', 'silver bells', 'marriage', 'wedding'],
      tagsVi: ['chuông đám cưới', 'hôn lễ', 'nơ trắng', 'đám cưới'],
      cols: ['wedding'],
      svg: `
        <g transform="translate(150,225) rotate(16)">
          <path d="M-52 45 L52 45 L40 -32 A40 40 0 0 0 -40 -32 Z" fill="#f8f9fa" stroke="#adb5bd" stroke-width="5"/>
          <circle cx="0" cy="52" r="12" fill="url(#goldG)"/>
        </g>
        <g transform="translate(250,225) rotate(-16)">
          <path d="M-52 45 L52 45 L40 -32 A40 40 0 0 0 -40 -32 Z" fill="#f8f9fa" stroke="#adb5bd" stroke-width="5"/>
          <circle cx="0" cy="52" r="12" fill="url(#goldG)"/>
        </g>
        <path d="M200 148 C140 100 125 180 200 162 C275 180 260 100 200 148 Z" fill="#ff70a6" stroke="#c9184a" stroke-width="4"/>
      `
    },
    {
      id: 'cel-graduation-owl-cap',
      en: 'Wise Scholar Owl Wearing Graduation Cap',
      vi: 'Chim cú mèo thông thái đội mũ cử nhân tốt nghiệp',
      tagsEn: ['owl', 'graduation', 'scholar', 'school'],
      tagsVi: ['cú mèo', 'tốt nghiệp', 'cử nhân', 'học tập'],
      cols: ['graduation', 'school', 'cute'],
      svg: `
        <ellipse cx="200" cy="235" rx="78" ry="88" fill="#7f4f24" stroke="#3d1e05" stroke-width="6"/>
        <ellipse cx="200" cy="255" rx="52" ry="58" fill="#ede0d4"/>
        <circle cx="172" cy="188" r="26" fill="#ffffff" stroke="#3d1e05" stroke-width="5"/>
        <circle cx="228" cy="188" r="26" fill="#ffffff" stroke="#3d1e05" stroke-width="5"/>
        <circle cx="172" cy="188" r="12" fill="#212529"/><circle cx="228" cy="188" r="12" fill="#212529"/>
        <polygon points="200,198 188,218 212,218" fill="#ffb703"/>
        <polygon points="200,72 95,112 200,148 305,112" fill="#212529" stroke="#000" stroke-width="5"/>
        <line x1="285" y1="118" x2="295" y2="175" stroke="#ffd166" stroke-width="6" stroke-linecap="round"/>
      `
    },
    {
      id: 'cel-stack-books-apple',
      en: 'Stack of Hardcover Study Books with Red Apple',
      vi: 'Chồng sách học tập và quả táo đỏ tri thức',
      tagsEn: ['books', 'apple', 'study', 'graduation'],
      tagsVi: ['chồng sách', 'quả táo', 'học tập', 'tốt nghiệp'],
      cols: ['graduation', 'school'],
      svg: `
        <rect x="85" y="275" width="230" height="44" rx="8" fill="#1d3557" stroke="#0b132b" stroke-width="5"/>
        <rect x="95" y="283" width="205" height="28" fill="#f8f9fa"/>
        <rect x="95" y="230" width="210" height="44" rx="8" fill="#2d6a4f" stroke="#1b4332" stroke-width="5"/>
        <rect x="105" y="238" width="185" height="28" fill="#f8f9fa"/>
        <rect x="105" y="185" width="190" height="44" rx="8" fill="#e63946" stroke="#800f2f" stroke-width="5"/>
        <rect x="115" y="193" width="165" height="28" fill="#f8f9fa"/>
        <circle cx="200" cy="138" r="42" fill="#d62828" stroke="#780000" stroke-width="5"/>
        <ellipse cx="218" cy="92" rx="10" ry="18" transform="rotate(35 218 92)" fill="#52b788"/>
      `
    },
    {
      id: 'cel-honor-rosette-badge',
      en: 'First Place Blue & Gold Honor Rosette Ribbon',
      vi: 'Huy hiệu hoa ruy băng xanh vàng vinh danh hạng nhất',
      tagsEn: ['rosette', 'first place', 'award ribbon', 'graduation'],
      tagsVi: ['huy hiệu', 'vinh danh', 'hạng nhất', 'tốt nghiệp'],
      cols: ['graduation'],
      svg: `
        <polygon points="155,220 130,345 168,322 195,348 195,220" fill="#1d3557" stroke="#0b132b" stroke-width="5"/>
        <polygon points="245,220 270,345 232,322 205,348 205,220" fill="#1d3557" stroke="#0b132b" stroke-width="5"/>
        <circle cx="200" cy="165" r="82" fill="#1982c4" stroke="#1d3557" stroke-width="6" stroke-dasharray="16 8"/>
        <circle cx="200" cy="165" r="56" fill="url(#goldG)" stroke="#8c5a08" stroke-width="5"/>
        <text x="200" y="185" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="#7f5512">#1</text>
      `
    },
    {
      id: 'cel-congrats-grad-banner',
      en: 'Black & Gold Congrats Grad Celebration Banner',
      vi: 'Băng rôn đen viền vàng chữ Congrats Grad chúc mừng tốt nghiệp',
      tagsEn: ['congrats grad', 'graduation banner', 'class of', 'graduation'],
      tagsVi: ['chúc mừng tốt nghiệp', 'congrats grad', 'băng rôn', 'tốt nghiệp'],
      cols: ['graduation', 'school'],
      svg: `
        <path d="M50 140 Q200 115 350 140 L338 250 Q200 225 62 250 Z" fill="#212529" stroke="url(#goldG)" stroke-width="8"/>
        <text x="200" y="180" text-anchor="middle" font-family="Georgia, serif" font-size="26" font-weight="bold" fill="#ffe57f" letter-spacing="2">CONGRATS</text>
        <text x="200" y="218" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="bold" fill="#ffffff" letter-spacing="4">GRAD!</text>
      `
    },
    {
      id: 'cel-graduation-stole-sash',
      en: 'Golden Satin Graduation Honor Stole Sash',
      vi: 'Dải khăn choàng vai danh dự màu vàng tốt nghiệp',
      tagsEn: ['graduation stole', 'sash', 'honor', 'graduation'],
      tagsVi: ['khăn tốt nghiệp', 'dải danh dự', 'cử nhân', 'tốt nghiệp'],
      cols: ['graduation', 'school'],
      svg: `
        <path d="M140 75 Q200 55 260 75 L295 315 L250 345 L222 145 Q200 135 178 145 L150 345 L105 315 Z" fill="url(#goldG)" stroke="#8c5a08" stroke-width="6"/>
        <line x1="115" y1="285" x2="156" y2="305" stroke="#800f2f" stroke-width="8"/>
        <line x1="285" y1="285" x2="244" y2="305" stroke="#800f2f" stroke-width="8"/>
      `
    },
    {
      id: 'cel-gold-laurel-wreath',
      en: 'Golden Victory & Graduation Laurel Wreath Crown',
      vi: 'Vòng nguyệt quế vàng chiến thắng và vinh danh tốt nghiệp',
      tagsEn: ['laurel wreath', 'victory', 'gold crown', 'graduation'],
      tagsVi: ['vòng nguyệt quế', 'chiến thắng', 'vinh quang', 'tốt nghiệp'],
      cols: ['graduation'],
      svg: `
        <path d="M200 315 C95 295 75 165 145 95" fill="none" stroke="url(#goldG)" stroke-width="10" stroke-linecap="round"/>
        <path d="M200 315 C305 295 325 165 255 95" fill="none" stroke="url(#goldG)" stroke-width="10" stroke-linecap="round"/>
        ${[0, 1, 2, 3, 4].map(i => {
          const y = 275 - i * 40;
          const xOff = 88 + (i === 1 || i === 2 ? 18 : 0);
          return `
            <ellipse cx="${200 - xOff}" cy="${y}" rx="12" ry="26" transform="rotate(-35 ${200 - xOff} ${y})" fill="url(#goldG)"/>
            <ellipse cx="${200 + xOff}" cy="${y}" rx="12" ry="26" transform="rotate(35 ${200 + xOff} ${y})" fill="url(#goldG)"/>
          `;
        }).join('')}
        <polygon points="200,62 208,82 230,84 213,98 218,118 200,106 182,118 187,98 170,84 192,82" fill="url(#goldG)"/>
      `
    },
  );

  for (const item of items) {
    await saveSvgSticker('sticker', 'celebrations', item.id, item.svg);
    if (!manifest.items.some(x => x.id === item.id)) {
      manifest.items.push(makeItemMeta(item.id, item.en, item.vi, item.tagsEn, item.tagsVi, item.cols, 'celebrations'));
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`celebrations: ${manifest.items.length} items`);
}

// ============================================================================
// 7. BIRDS-ANIMALS -> "Vintage Birds" / "Chim cổ" (+32 items -> 50 total)
// ============================================================================
function renderVintageBirdSvg(spec) {
  const { body, wing, belly, head, beak, tail, crest, legs = '#6c584c', perch = true, pose = 'perched' } = spec;
  if (pose === 'flight') {
    return `
      <path d="M200 195 C140 120 75 95 45 135 C85 165 135 190 175 205 Z" fill="${wing}" stroke="#2b2d42" stroke-width="4.5"/>
      <path d="M205 195 C265 115 330 90 360 130 C320 165 265 190 225 205 Z" fill="${wing}" stroke="#2b2d42" stroke-width="4.5"/>
      <ellipse cx="200" cy="215" rx="68" ry="34" transform="rotate(-12 200 215)" fill="${body}" stroke="#2b2d42" stroke-width="5"/>
      <ellipse cx="212" cy="224" rx="46" ry="22" transform="rotate(-12 212 224)" fill="${belly}"/>
      <polygon points="135,222 65,255 85,205" fill="${tail}" stroke="#2b2d42" stroke-width="4"/>
      <circle cx="262" cy="188" r="26" fill="${head}" stroke="#2b2d42" stroke-width="4.5"/>
      ${crest ? `<path d="M250 165 Q235 135 268 152" fill="${crest}" stroke="#2b2d42" stroke-width="3.5"/>` : ''}
      <polygon points="285,182 325,190 285,198" fill="${beak}" stroke="#2b2d42" stroke-width="3.5"/>
      <circle cx="268" cy="184" r="5" fill="#141522"/><circle cx="269" cy="182" r="1.8" fill="#ffffff"/>
    `;
  }
  if (pose === 'tall') {
    return `
      <ellipse cx="200" cy="332" rx="95" ry="18" fill="#a3b18a" fill-opacity="0.55"/>
      <line x1="188" y1="225" x2="182" y2="330" stroke="${legs}" stroke-width="6" stroke-linecap="round"/>
      <line x1="212" y1="225" x2="225" y2="305" stroke="${legs}" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="195" cy="205" rx="64" ry="42" fill="${body}" stroke="#2b2d42" stroke-width="5"/>
      <path d="M145 195 Q195 168 238 205 Q190 232 145 195 Z" fill="${wing}" stroke="#2b2d42" stroke-width="4"/>
      <path d="M235 192 C262 155 245 105 262 82" fill="none" stroke="${head}" stroke-width="22" stroke-linecap="round"/>
      <circle cx="266" cy="78" r="20" fill="${head}" stroke="#2b2d42" stroke-width="4"/>
      <polygon points="282,74 335,84 282,88" fill="${beak}" stroke="#2b2d42" stroke-width="3.5"/>
      <circle cx="270" cy="74" r="4.5" fill="#141522"/>
    `;
  }
  if (pose === 'owl') {
    return `
      <path d="M75 305 Q200 285 325 312" fill="none" stroke="#582f0e" stroke-width="14" stroke-linecap="round"/>
      <ellipse cx="200" cy="210" rx="68" ry="88" fill="${body}" stroke="#3d1e05" stroke-width="5"/>
      <ellipse cx="200" cy="228" rx="46" ry="62" fill="${belly}"/>
      <path d="M175 205 L185 215 M215 205 L225 215 M185 235 L195 245 M205 235 L215 245 M192 265 L202 275" stroke="#582f0e" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="142" cy="215" rx="18" ry="56" transform="rotate(10 142 215)" fill="${wing}" stroke="#3d1e05" stroke-width="4"/>
      <ellipse cx="258" cy="215" rx="18" ry="56" transform="rotate(-10 258 215)" fill="${wing}" stroke="#3d1e05" stroke-width="4"/>
      <circle cx="176" cy="148" r="24" fill="#fdf0d5" stroke="#3d1e05" stroke-width="4"/>
      <circle cx="224" cy="148" r="24" fill="#fdf0d5" stroke="#3d1e05" stroke-width="4"/>
      <circle cx="176" cy="148" r="11" fill="#141522"/><circle cx="224" cy="148" r="11" fill="#141522"/>
      <polygon points="200,156 190,175 210,175" fill="${beak}"/>
    `;
  }
  if (pose === 'swim') {
    return `
      <path d="M65 292 Q135 275 200 292 Q265 308 335 292" fill="none" stroke="#4cc9f0" stroke-width="10" stroke-linecap="round"/>
      <path d="M110 265 C105 215 165 205 245 225 C275 232 285 275 240 282 L125 282 Z" fill="${body}" stroke="#2b2d42" stroke-width="5"/>
      <path d="M140 245 Q195 222 238 252 Q190 272 140 245 Z" fill="${wing}" stroke="#2b2d42" stroke-width="4"/>
      <path d="M242 232 C265 185 245 135 268 115" fill="none" stroke="${head}" stroke-width="24" stroke-linecap="round"/>
      <circle cx="272" cy="112" r="22" fill="${head}" stroke="#2b2d42" stroke-width="4.5"/>
      <polygon points="290,108 330,116 290,124" fill="${beak}" stroke="#2b2d42" stroke-width="3.5"/>
      <circle cx="276" cy="108" r="4.5" fill="#141522"/>
    `;
  }
  if (pose === 'peacock') {
    return `
      <ellipse cx="200" cy="185" rx="135" ry="110" fill="#2a9d8f" stroke="#1b4332" stroke-width="5"/>
      ${[-60, -30, 0, 30, 60].map(a => `
        <g transform="translate(200,220) rotate(${a})">
          <line x1="0" y1="0" x2="0" y2="-115" stroke="#52b788" stroke-width="4"/>
          <ellipse cx="0" cy="-115" rx="16" ry="22" fill="#ffd166" stroke="#1b4332" stroke-width="3"/>
          <circle cx="0" cy="-115" r="9" fill="#1d3557"/>
        </g>
      `).join('')}
      <ellipse cx="200" cy="245" rx="36" ry="52" fill="#1d3557" stroke="#0b132b" stroke-width="5"/>
      <circle cx="200" cy="168" r="24" fill="#1982c4" stroke="#0b132b" stroke-width="4.5"/>
      <path d="M192 144 L186 122 M200 142 L200 118 M208 144 L214 122" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/>
      <polygon points="200,168 222,175 200,182" fill="#ffd166"/>
      <circle cx="194" cy="164" r="4.5" fill="#ffffff"/>
    `;
  }
  if (pose === 'toucan') {
    return `
      <path d="M65 298 Q200 272 335 305" fill="none" stroke="#582f0e" stroke-width="12" stroke-linecap="round"/>
      <polygon points="130,222 72,278 102,295 152,240" fill="#212529"/>
      <ellipse cx="182" cy="205" rx="62" ry="48" transform="rotate(-22 182 205)" fill="#212529" stroke="#000000" stroke-width="5"/>
      <circle cx="226" cy="154" r="32" fill="#212529" stroke="#000000" stroke-width="5"/>
      <ellipse cx="234" cy="162" rx="18" ry="20" fill="#ffd166"/>
      <path d="M252 132 C315 130 348 152 342 178 C312 182 275 178 252 172 Z" fill="#fb8500" stroke="#212529" stroke-width="5"/>
      <path d="M325 145 A28 24 0 0 1 342 178 L322 178 Z" fill="#212529"/>
      <circle cx="236" cy="152" r="6" fill="#1982c4"/><circle cx="236" cy="152" r="3" fill="#000000"/>
    `;
  }
  // Default botanical perched bird
  return `
    ${perch ? `
      <path d="M65 298 Q200 272 335 305" fill="none" stroke="#582f0e" stroke-width="12" stroke-linecap="round"/>
      <ellipse cx="105" cy="275" rx="12" ry="24" transform="rotate(-45 105 275)" fill="#52b788" stroke="#1b4332" stroke-width="3"/>
      <ellipse cx="305" cy="285" rx="12" ry="24" transform="rotate(40 305 285)" fill="#52b788" stroke="#1b4332" stroke-width="3"/>
    ` : ''}
    <line x1="185" y1="248" x2="178" y2="288" stroke="${legs}" stroke-width="5" stroke-linecap="round"/>
    <line x1="212" y1="248" x2="218" y2="288" stroke="${legs}" stroke-width="5" stroke-linecap="round"/>
    <polygon points="145,222 68,268 92,292 162,240" fill="${tail}" stroke="#2b2d42" stroke-width="4.5"/>
    <ellipse cx="198" cy="205" rx="64" ry="46" transform="rotate(-18 198 205)" fill="${body}" stroke="#2b2d42" stroke-width="5"/>
    <ellipse cx="212" cy="218" rx="46" ry="30" transform="rotate(-15 212 218)" fill="${belly}"/>
    <path d="M148 195 C175 162 225 172 238 208 C205 228 165 222 148 195 Z" fill="${wing}" stroke="#2b2d42" stroke-width="4.5"/>
    <circle cx="248" cy="154" r="30" fill="${head}" stroke="#2b2d42" stroke-width="5"/>
    ${crest ? `<path d="M235 128 L215 95 L245 118 L255 92 L262 126 Z" fill="${crest}" stroke="#2b2d42" stroke-width="3.5"/>` : ''}
    <polygon points="274,146 318,156 274,166" fill="${beak}" stroke="#2b2d42" stroke-width="4"/>
    <circle cx="256" cy="148" r="5.5" fill="#141522"/><circle cx="258" cy="146" r="2" fill="#ffffff"/>
  `;
}

async function buildBirdsAnimals() {
  const manifestPath = path.join(ROOT, 'assets/sticker/birds-animals/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.name = { en: 'Vintage Birds', vi: 'Chim cổ' };
  preserveExistingSources('sticker', 'birds-animals', manifest.items);

  const birdSpecs = [
    { id: 'bird-barn-owl-perched', en: 'Vintage Barn Owl Perched on Oak Branch', vi: 'Chim cú lợn cổ điển đậu trên cành sồi', tagsEn: ['barn owl', 'owl', 'bird', 'vintage'], tagsVi: ['cú lợn', 'cú mèo', 'chim cổ', 'thiên nhiên'], spec: { body: '#bc6c25', wing: '#9c6644', belly: '#fefae0', head: '#dda15e', beak: '#ffb703', tail: '#7f4f24', pose: 'owl' } },
    { id: 'bird-snowy-owl-flight', en: 'Arctic Snowy Owl Gliding with Spread Wings', vi: 'Cú tuyết Bắc Cực sải cánh trắng bay lượn', tagsEn: ['snowy owl', 'white owl', 'flight', 'bird'], tagsVi: ['cú tuyết', 'chim cú', 'sải cánh', 'chim cổ'], spec: { body: '#f8f9fa', wing: '#e9ecef', belly: '#ffffff', head: '#ffffff', beak: '#495057', tail: '#dee2e6', pose: 'flight' } },
    { id: 'bird-scarlet-macaw-parrot', en: 'Tropical Scarlet Macaw Parrot Illustration', vi: 'Vẹt đỏ Nam Mỹ lông vũ rực rỡ đậu cành', tagsEn: ['macaw', 'parrot', 'scarlet', 'tropical bird'], tagsVi: ['chim vẹt', 'vẹt đỏ', 'nhiệt đới', 'chim cổ'], spec: { body: '#e63946', wing: '#1982c4', belly: '#d62828', head: '#e63946', beak: '#ffd166', tail: '#e63946' } },
    { id: 'bird-cockatoo-crest', en: 'White Sulphur-Crested Cockatoo Parrot', vi: 'Vẹt mào vàng lông trắng thanh nhã', tagsEn: ['cockatoo', 'crested bird', 'parrot', 'vintage'], tagsVi: ['vẹt mào vàng', 'chim vẹt', 'lông trắng', 'chim cổ'], spec: { body: '#ffffff', wing: '#f8f9fa', belly: '#fffdf7', head: '#ffffff', beak: '#495057', tail: '#e9ecef', crest: '#ffd166' } },
    { id: 'bird-pink-flamingo-standing', en: 'Graceful Coral Pink Flamingo Standing in Lagoon', vi: 'Chim hồng hạc đứng duyên dáng bên hồ nước', tagsEn: ['flamingo', 'pink bird', 'tropical', 'vintage'], tagsVi: ['hồng hạc', 'chim hồng hạc', 'duyên dáng', 'chim cổ'], spec: { body: '#ff70a6', wing: '#ff4d6d', belly: '#ff99c8', head: '#ff70a6', beak: '#212529', tail: '#ff4d6d', legs: '#ff4d6d', pose: 'tall' } },
    { id: 'bird-indian-peacock-plume', en: 'Regal Blue Peacock with Emerald Train Feathers', vi: 'Chim công xanh vương giả xoè đuôi ngọc bích', tagsEn: ['peacock', 'feathers', 'emerald', 'bird'], tagsVi: ['chim công', 'khổng tước', 'lông công', 'chim cổ'], spec: { body: '#1d3557', wing: '#2a9d8f', belly: '#1982c4', head: '#1d3557', beak: '#ffd166', tail: '#2a9d8f', crest: '#1982c4', pose: 'peacock' } },
    { id: 'bird-red-crowned-crane', en: 'Japanese Red-Crowned Crane Standing Tall', vi: 'Sếu đầu đỏ đứng thanh tao bên đầm nước', tagsEn: ['crane', 'red-crowned crane', 'bird', 'vintage'], tagsVi: ['chim sếu', 'sếu đầu đỏ', 'thanh tao', 'chim cổ'], spec: { body: '#ffffff', wing: '#212529', belly: '#ffffff', head: '#e63946', beak: '#6c757d', tail: '#212529', legs: '#212529', pose: 'tall' } },
    { id: 'bird-mute-swan-gliding', en: 'White Mute Swan Gliding on Calm Water', vi: 'Thiên nga trắng bơi lướt nhẹ trên mặt hồ', tagsEn: ['swan', 'white swan', 'waterbird', 'vintage'], tagsVi: ['thiên nga', 'thiên nga trắng', 'mặt hồ', 'chim cổ'], spec: { body: '#ffffff', wing: '#f8f9fa', belly: '#ffffff', head: '#ffffff', beak: '#fb8500', tail: '#ffffff', pose: 'swim' } },
    { id: 'bird-common-kingfisher', en: 'Turquoise & Orange River Kingfisher on Reed', vi: 'Chim bói cá lưng xanh bụng cam đậu cành lau', tagsEn: ['kingfisher', 'turquoise', 'river bird', 'vintage'], tagsVi: ['chim bói cá', 'xanh ngọc', 'bờ sông', 'chim cổ'], spec: { body: '#0096c7', wing: '#0077b6', belly: '#fb8500', head: '#0096c7', beak: '#212529', tail: '#023e8a' } },
    { id: 'bird-barn-swallow-flight', en: 'Spring Barn Swallow Soaring in Flight', vi: 'Chim én mùa xuân chao liệng giữa bầu trời', tagsEn: ['swallow', 'spring bird', 'flight', 'vintage'], tagsVi: ['chim én', 'mùa xuân', 'bay lượn', 'chim cổ'], spec: { body: '#1d3557', wing: '#1d3557', belly: '#f8f9fa', head: '#d62828', beak: '#212529', tail: '#1d3557', pose: 'flight' } },
    { id: 'bird-european-robin-berry', en: 'Red-Breasted European Robin on Winter Branch', vi: 'Chim cổ đỏ châu Âu đậu trên nhánh cây', tagsEn: ['robin', 'redbreast', 'songbird', 'vintage'], tagsVi: ['chim cổ đỏ', 'chim nhỏ', 'cành cây', 'chim cổ'], spec: { body: '#8d6e63', wing: '#6d4c41', belly: '#f8f9fa', head: '#fb8500', beak: '#3e2723', tail: '#5d4037' } },
    { id: 'bird-blue-jay-oak', en: 'Crested Blue Jay Perched on Woodland Bough', vi: 'Chim giẻ cùi xanh có mào đậu cành rừng', tagsEn: ['blue jay', 'blue bird', 'songbird', 'vintage'], tagsVi: ['chim giẻ cùi', 'chim xanh', 'rừng cây', 'chim cổ'], spec: { body: '#1982c4', wing: '#1d3557', belly: '#f8f9fa', head: '#1982c4', beak: '#212529', tail: '#1d3557', crest: '#1982c4' } },
    { id: 'bird-northern-cardinal-red', en: 'Crimson Northern Cardinal Songbird with Crest', vi: 'Chim hồng y giáo chủ đỏ thắm có mào', tagsEn: ['cardinal', 'red bird', 'crested', 'vintage'], tagsVi: ['chim hồng y', 'chim đỏ', 'có mào', 'chim cổ'], spec: { body: '#d62828', wing: '#9b0000', belly: '#e63946', head: '#d62828', beak: '#fb8500', tail: '#9b0000', crest: '#d62828' } },
    { id: 'bird-goldfinch-thistle', en: 'European Goldfinch with Yellow Wing Band', vi: 'Chim sẻ cánh vàng mặt đỏ đậu nhánh cây', tagsEn: ['goldfinch', 'finch', 'yellow bird', 'vintage'], tagsVi: ['chim sẻ vàng', 'chim sẻ', 'cánh vàng', 'chim cổ'], spec: { body: '#a68a64', wing: '#ffd166', belly: '#ffffff', head: '#e63946', beak: '#ede0d4', tail: '#212529' } },
    { id: 'bird-house-sparrow-twig', en: 'Little Brown House Sparrow on Garden Twig', vi: 'Chim sẻ nâu nhỏ nhắn đậu trên cành vườn', tagsEn: ['sparrow', 'brown bird', 'garden bird', 'vintage'], tagsVi: ['chim sẻ nâu', 'chim sẻ', 'khu vườn', 'chim cổ'], spec: { body: '#9c6644', wing: '#582f0e', belly: '#e9ecef', head: '#7f4f24', beak: '#3d1e05', tail: '#582f0e' } },
    { id: 'bird-toco-toucan-tropical', en: 'Tropical Toco Toucan with Giant Orange Bill', vi: 'Chim Toucan nhiệt đới mỏ cam lớn nổi bật', tagsEn: ['toucan', 'tropical bird', 'orange beak', 'vintage'], tagsVi: ['chim toucan', 'mỏ cam', 'nhiệt đới', 'chim cổ'], spec: { body: '#212529', wing: '#343a40', belly: '#ffd166', head: '#212529', beak: '#fb8500', tail: '#212529', pose: 'toucan' } },
    { id: 'bird-woodpecker-trunk', en: 'Red-Headed Woodpecker on Tree Branch', vi: 'Chim gõ kiến đầu đỏ cánh đốm trắng đen', tagsEn: ['woodpecker', 'red head', 'forest bird', 'vintage'], tagsVi: ['chim gõ kiến', 'đầu đỏ', 'rừng già', 'chim cổ'], spec: { body: '#212529', wing: '#495057', belly: '#ffffff', head: '#d62828', beak: '#6c757d', tail: '#212529', crest: '#d62828' } },
    { id: 'bird-white-peace-dove', en: 'White Peace Dove Flying with Olive Twig', vi: 'Chim bồ câu trắng tung cánh hoà bình', tagsEn: ['white dove', 'peace dove', 'flight', 'bird'], tagsVi: ['chim bồ câu', 'bồ câu trắng', 'tung cánh', 'chim cổ'], spec: { body: '#ffffff', wing: '#f8f9fa', belly: '#ffffff', head: '#ffffff', beak: '#ffb703', tail: '#e9ecef', pose: 'flight' } },
    { id: 'bird-golden-eagle-soaring', en: 'Majestic Golden Eagle Soaring with Spread Wings', vi: 'Đại bàng vàng sải cánh uy nghi trên bầu trời', tagsEn: ['golden eagle', 'eagle', 'raptor', 'flight'], tagsVi: ['đại bàng', 'đại bàng vàng', 'sải cánh', 'chim cổ'], spec: { body: '#582f0e', wing: '#7f4f24', belly: '#9c6644', head: '#ddb892', beak: '#ffb703', tail: '#3d1e05', pose: 'flight' } },
    { id: 'bird-peregrine-falcon', en: 'Peregrine Falcon Perched Watchfully', vi: 'Chim cắt lớn đậu uy dũng nhìn xa xăm', tagsEn: ['falcon', 'peregrine', 'bird of prey', 'vintage'], tagsVi: ['chim cắt', 'chim ưng', 'uy dũng', 'chim cổ'], spec: { body: '#495057', wing: '#343a40', belly: '#e9ecef', head: '#212529', beak: '#ffd166', tail: '#343a40' } },
    { id: 'bird-mallard-duck-drake', en: 'Emerald-Headed Mallard Duck Swimming', vi: 'Vịt cổ xanh bơi trên mặt hồ phẳng lặng', tagsEn: ['mallard', 'duck', 'waterfowl', 'vintage'], tagsVi: ['vịt cổ xanh', 'vịt trời', 'mặt hồ', 'chim cổ'], spec: { body: '#9c6644', wing: '#6c757d', belly: '#e9ecef', head: '#2d6a4f', beak: '#ffd166', tail: '#343a40', pose: 'swim' } },
    { id: 'bird-ring-necked-pheasant', en: 'Golden & Copper Ring-Necked Pheasant', vi: 'Chim trĩ đỏ khoang cổ trắng đuôi dài cổ điển', tagsEn: ['pheasant', 'game bird', 'long tail', 'vintage'], tagsVi: ['chim trĩ', 'trĩ đỏ', 'đuôi dài', 'chim cổ'], spec: { body: '#bc6c25', wing: '#dda15e', belly: '#9c6644', head: '#2d6a4f', beak: '#ffd166', tail: '#7f4f24' } },
    { id: 'bird-eurasian-hoopoe-crest', en: 'Crowned Eurasian Hoopoe with Striped Wings', vi: 'Chim đầu rìu xoè mào cam vằn đen độc đáo', tagsEn: ['hoopoe', 'crested bird', 'striped', 'vintage'], tagsVi: ['chim đầu rìu', 'mào cam', 'vằn đen', 'chim cổ'], spec: { body: '#dda15e', wing: '#212529', belly: '#fefae0', head: '#bc6c25', beak: '#3d1e05', tail: '#212529', crest: '#fb8500' } },
    { id: 'bird-great-blue-heron', en: 'Slate-Blue Great Heron Wading in Marsh', vi: 'Chim diệc xanh chân cao đứng bên đầm lầy', tagsEn: ['heron', 'blue heron', 'marsh bird', 'vintage'], tagsVi: ['chim diệc', 'diệc xanh', 'đầm lầy', 'chim cổ'], spec: { body: '#6c757d', wing: '#495057', belly: '#dee2e6', head: '#adb5bd', beak: '#ffb703', tail: '#495057', legs: '#6c757d', pose: 'tall' } },
    { id: 'bird-brown-pelican-coast', en: 'Coastal Pelican with Golden Throat Pouch', vi: 'Chim bồ nông biển mỏ lớn đậu bên bờ vịnh', tagsEn: ['pelican', 'seabird', 'coastal', 'vintage'], tagsVi: ['chim bồ nông', 'chim biển', 'bờ vịnh', 'chim cổ'], spec: { body: '#adb5bd', wing: '#6c757d', belly: '#f8f9fa', head: '#ffffff', beak: '#ffb703', tail: '#6c757d' } },
    { id: 'bird-atlantic-puffin', en: 'Atlantic Puffin with Colorful Striped Beak', vi: 'Chim hải âu cổ rụt mỏ cam đỏ Bắc Đại Tây Dương', tagsEn: ['puffin', 'seabird', 'colorful beak', 'vintage'], tagsVi: ['hải âu cổ rụt', 'chim puffin', 'mỏ cam', 'chim cổ'], spec: { body: '#212529', wing: '#212529', belly: '#ffffff', head: '#ffffff', beak: '#fb8500', tail: '#212529', legs: '#fb8500' } },
    { id: 'bird-emperor-penguin-chick', en: 'Antarctic Emperor Penguin Standing Proudly', vi: 'Chim cánh cụt hoàng đế ngực vàng Nam Cực', tagsEn: ['emperor penguin', 'penguin', 'antarctic', 'bird'], tagsVi: ['chim cánh cụt', 'cánh cụt hoàng đế', 'nam cực', 'chim cổ'], spec: { body: '#2b2d42', wing: '#141522', belly: '#ffffff', head: '#ffb703', beak: '#fb8500', tail: '#141522', perch: false } },
    { id: 'bird-eurasian-magpie', en: 'Iridescent Black & White Eurasian Magpie', vi: 'Chim ác là khoang đen trắng đuôi xanh ánh kim', tagsEn: ['magpie', 'black and white', 'songbird', 'vintage'], tagsVi: ['chim ác là', 'chim khách', 'đen trắng', 'chim cổ'], spec: { body: '#212529', wing: '#1d3557', belly: '#ffffff', head: '#212529', beak: '#343a40', tail: '#2d6a4f' } },
    { id: 'bird-baltimore-oriole', en: 'Bright Orange & Black Baltimore Oriole', vi: 'Chim vàng anh lông cam đen rực rỡ trên cành', tagsEn: ['oriole', 'orange bird', 'songbird', 'vintage'], tagsVi: ['chim vàng anh', 'lông cam', 'hót vang', 'chim cổ'], spec: { body: '#fb8500', wing: '#212529', belly: '#ffb703', head: '#212529', beak: '#6c757d', tail: '#212529' } },
    { id: 'bird-cedar-waxwing-berries', en: 'Silky Cedar Waxwing Songbird with Crest', vi: 'Chim nghệ mào mượt mà đậu cành quả chín', tagsEn: ['waxwing', 'crested bird', 'berries', 'vintage'], tagsVi: ['chim nghệ', 'chim có mào', 'cành quả', 'chim cổ'], spec: { body: '#ddb892', wing: '#7f4f24', belly: '#fff3b0', head: '#ddb892', beak: '#212529', tail: '#6c757d', crest: '#ddb892' } },
    { id: 'bird-yellow-canary-singing', en: 'Sunny Yellow Singing Canary on Blossom Twig', vi: 'Chim hoàng yến vàng tươi cất tiếng hót trên cành', tagsEn: ['canary', 'yellow bird', 'singing bird', 'vintage'], tagsVi: ['chim hoàng yến', 'chim yến', 'vàng tươi', 'chim cổ'], spec: { body: '#ffd166', wing: '#ffb703', belly: '#fff3b0', head: '#ffd166', beak: '#fb8500', tail: '#ffb703' } },
    { id: 'bird-kookaburra-branch', en: 'Australian Laughing Kookaburra on Gum Branch', vi: 'Chim bói cá Kookaburra Úc đậu cành bạch đàn', tagsEn: ['kookaburra', 'australian bird', 'kingfisher', 'vintage'], tagsVi: ['chim kookaburra', 'chim bói cá úc', 'bạch đàn', 'chim cổ'], spec: { body: '#ede0d4', wing: '#4cc9f0', belly: '#ffffff', head: '#ddb892', beak: '#582f0e', tail: '#9c6644' } },
  ];

  for (const b of birdSpecs) {
    await saveSvgSticker('sticker', 'birds-animals', b.id, renderVintageBirdSvg(b.spec));
    if (!manifest.items.some(x => x.id === b.id)) {
      manifest.items.push(makeItemMeta(b.id, b.en, b.vi, b.tagsEn, b.tagsVi, ['vintage', 'journal', 'nature'], 'birds-animals'));
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`birds-animals: ${manifest.items.length} items`);
}

// ============================================================================
// 8. BUTTERFLIES-INSECTS -> "Animals & Insects" / "Động vật" (+54 items -> 60 total)
// ============================================================================
function renderAnimalOrInsectSvg(spec) {
  const { type, c1, c2, c3 = '#ffffff', accent = '#ffd166' } = spec;
  if (type === 'butterfly') {
    return `
      <path d="M195 190 C135 85 45 95 62 175 C72 215 140 215 195 205 Z" fill="${c1}" stroke="#212529" stroke-width="5"/>
      <path d="M205 190 C265 85 355 95 338 175 C328 215 260 215 205 205 Z" fill="${c1}" stroke="#212529" stroke-width="5"/>
      <path d="M195 208 C135 215 78 265 112 312 C142 342 185 285 195 225 Z" fill="${c2}" stroke="#212529" stroke-width="5"/>
      <path d="M205 208 C265 215 322 265 288 312 C258 342 215 285 205 225 Z" fill="${c2}" stroke="#212529" stroke-width="5"/>
      <circle cx="115" cy="155" r="18" fill="${accent}"/><circle cx="285" cy="155" r="18" fill="${accent}"/>
      <circle cx="135" cy="272" r="12" fill="${c3}"/><circle cx="265" cy="272" r="12" fill="${c3}"/>
      <ellipse cx="200" cy="205" rx="9" ry="52" fill="#212529"/>
      <path d="M196 155 Q175 115 162 118 M204 155 Q225 115 238 118" fill="none" stroke="#212529" stroke-width="4" stroke-linecap="round"/>
    `;
  }
  if (type === 'bee') {
    return `
      <ellipse cx="148" cy="165" rx="52" ry="28" transform="rotate(-30 148 165)" fill="#caf0f8" fill-opacity="0.85" stroke="#4cc9f0" stroke-width="4"/>
      <ellipse cx="252" cy="165" rx="52" ry="28" transform="rotate(30 252 165)" fill="#caf0f8" fill-opacity="0.85" stroke="#4cc9f0" stroke-width="4"/>
      <ellipse cx="200" cy="220" rx="56" ry="74" fill="${c1}" stroke="#212529" stroke-width="6"/>
      <path d="M148 200 L252 200 M145 230 L255 230 M155 260 L245 260" stroke="${c2}" stroke-width="16"/>
      <circle cx="182" cy="168" r="6" fill="#212529"/><circle cx="218" cy="168" r="6" fill="#212529"/>
      <polygon points="194,292 206,292 200,315" fill="#212529"/>
    `;
  }
  if (type === 'dragonfly') {
    return `
      <ellipse cx="122" cy="155" rx="72" ry="18" transform="rotate(12 122 155)" fill="${c2}" fill-opacity="0.75" stroke="${c1}" stroke-width="4"/>
      <ellipse cx="278" cy="155" rx="72" ry="18" transform="rotate(-12 278 155)" fill="${c2}" fill-opacity="0.75" stroke="${c1}" stroke-width="4"/>
      <ellipse cx="130" cy="195" rx="64" ry="16" transform="rotate(-10 130 195)" fill="${c2}" fill-opacity="0.75" stroke="${c1}" stroke-width="4"/>
      <ellipse cx="270" cy="195" rx="64" ry="16" transform="rotate(10 270 195)" fill="${c2}" fill-opacity="0.75" stroke="${c1}" stroke-width="4"/>
      <rect x="192" y="135" width="16" height="195" rx="8" fill="${c1}" stroke="#141522" stroke-width="4"/>
      <circle cx="200" cy="122" r="22" fill="${c1}" stroke="#141522" stroke-width="4"/>
      <circle cx="186" cy="116" r="10" fill="${accent}"/><circle cx="214" cy="116" r="10" fill="${accent}"/>
    `;
  }
  if (type === 'beetle') {
    return `
      <path d="M135 165 L110 135 M130 220 L102 220 M135 275 L110 305 M265 165 L290 135 M270 220 L298 220 M265 275 L290 305" stroke="#212529" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="200" cy="135" rx="44" ry="32" fill="#212529"/>
      <ellipse cx="200" cy="225" rx="68" ry="82" fill="${c1}" stroke="#212529" stroke-width="6"/>
      <line x1="200" y1="145" x2="200" y2="307" stroke="#212529" stroke-width="5"/>
      <circle cx="170" cy="195" r="11" fill="${c2}"/><circle cx="230" cy="195" r="11" fill="${c2}"/>
      <circle cx="165" cy="245" r="12" fill="${c2}"/><circle cx="235" cy="245" r="12" fill="${c2}"/>
      <circle cx="178" cy="282" r="9" fill="${c2}"/><circle cx="222" cy="282" r="9" fill="${c2}"/>
    `;
  }
  if (type === 'snail') {
    return `
      <path d="M75 285 C95 255 255 255 315 275 C335 282 325 305 295 305 L95 305 C70 305 65 295 75 285 Z" fill="${c2}" stroke="#582f0e" stroke-width="5"/>
      <line x1="295" y1="268" x2="312" y2="232" stroke="${c2}" stroke-width="6" stroke-linecap="round"/>
      <line x1="310" y1="274" x2="332" y2="242" stroke="${c2}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="312" cy="230" r="6" fill="#212529"/><circle cx="332" cy="240" r="6" fill="#212529"/>
      <circle cx="185" cy="205" r="78" fill="${c1}" stroke="#582f0e" stroke-width="6"/>
      <path d="M185 205 m0 -48 a48 48 0 1 1 -42 25 a28 28 0 1 1 32 18" fill="none" stroke="#582f0e" stroke-width="6" stroke-linecap="round"/>
    `;
  }
  if (type === 'cat') {
    return `
      <path d="M255 295 C315 295 328 225 295 198" fill="none" stroke="${c1}" stroke-width="18" stroke-linecap="round"/>
      <ellipse cx="200" cy="265" rx="68" ry="62" fill="${c1}" stroke="#3d1e05" stroke-width="5"/>
      <ellipse cx="200" cy="275" rx="42" ry="44" fill="${c3}"/>
      <polygon points="135,165 142,95 188,135" fill="${c1}" stroke="#3d1e05" stroke-width="5"/>
      <polygon points="265,165 258,95 212,135" fill="${c1}" stroke="#3d1e05" stroke-width="5"/>
      <circle cx="200" cy="175" r="58" fill="${c1}" stroke="#3d1e05" stroke-width="5"/>
      <circle cx="178" cy="168" r="8" fill="#212529"/><circle cx="222" cy="168" r="8" fill="#212529"/>
      <polygon points="200,182 192,192 208,192" fill="#ff70a6"/>
      <path d="M188 198 Q200 208 212 198" fill="none" stroke="#3d1e05" stroke-width="4" stroke-linecap="round"/>
    `;
  }
  if (type === 'dog') {
    return `
      <ellipse cx="200" cy="268" rx="68" ry="60" fill="${c1}" stroke="#3d1e05" stroke-width="5"/>
      <ellipse cx="200" cy="278" rx="44" ry="42" fill="${c3}"/>
      <ellipse cx="134" cy="175" rx="22" ry="46" transform="rotate(18 134 175)" fill="${c2}" stroke="#3d1e05" stroke-width="5"/>
      <ellipse cx="266" cy="175" rx="22" ry="46" transform="rotate(-18 266 175)" fill="${c2}" stroke="#3d1e05" stroke-width="5"/>
      <circle cx="200" cy="172" r="58" fill="${c1}" stroke="#3d1e05" stroke-width="5"/>
      <ellipse cx="200" cy="190" rx="32" ry="24" fill="${c3}"/>
      <circle cx="178" cy="158" r="8" fill="#212529"/><circle cx="222" cy="158" r="8" fill="#212529"/>
      <ellipse cx="200" cy="182" rx="12" ry="9" fill="#212529"/>
      <path d="M192 198 Q200 212 208 198" fill="#ff4d6d" stroke="#3d1e05" stroke-width="3"/>
    `;
  }
  if (type === 'rabbit') {
    return `
      <ellipse cx="172" cy="108" rx="18" ry="52" transform="rotate(-10 172 108)" fill="${c1}" stroke="#6c757d" stroke-width="5"/>
      <ellipse cx="228" cy="108" rx="18" ry="52" transform="rotate(10 228 108)" fill="${c1}" stroke="#6c757d" stroke-width="5"/>
      <ellipse cx="172" cy="112" rx="9" ry="36" transform="rotate(-10 172 112)" fill="#ff99c8"/>
      <ellipse cx="228" cy="112" rx="9" ry="36" transform="rotate(10 228 112)" fill="#ff99c8"/>
      <ellipse cx="200" cy="268" rx="66" ry="58" fill="${c1}" stroke="#6c757d" stroke-width="5"/>
      <circle cx="200" cy="188" r="52" fill="${c1}" stroke="#6c757d" stroke-width="5"/>
      <circle cx="180" cy="180" r="7" fill="#212529"/><circle cx="220" cy="180" r="7" fill="#212529"/>
      <circle cx="200" cy="194" r="6" fill="#ff70a6"/>
    `;
  }
  if (type === 'frog') {
    return `
      <ellipse cx="200" cy="295" rx="115" ry="34" fill="#2d6a4f" stroke="#1b4332" stroke-width="5"/>
      <ellipse cx="200" cy="235" rx="74" ry="58" fill="${c1}" stroke="#1b4332" stroke-width="5"/>
      <ellipse cx="200" cy="248" rx="48" ry="38" fill="${c3}"/>
      <circle cx="162" cy="168" r="24" fill="${c1}" stroke="#1b4332" stroke-width="5"/>
      <circle cx="238" cy="168" r="24" fill="${c1}" stroke="#1b4332" stroke-width="5"/>
      <circle cx="162" cy="168" r="12" fill="${accent}"/><circle cx="238" cy="168" r="12" fill="${accent}"/>
      <circle cx="162" cy="168" r="6" fill="#212529"/><circle cx="238" cy="168" r="6" fill="#212529"/>
      <path d="M162 208 Q200 228 238 208" fill="none" stroke="#1b4332" stroke-width="5" stroke-linecap="round"/>
    `;
  }
  if (type === 'turtle') {
    return `
      <ellipse cx="125" cy="160" rx="34" ry="18" transform="rotate(-35 125 160)" fill="${c2}" stroke="#1b4332" stroke-width="4"/>
      <ellipse cx="275" cy="160" rx="34" ry="18" transform="rotate(35 275 160)" fill="${c2}" stroke="#1b4332" stroke-width="4"/>
      <ellipse cx="135" cy="265" rx="28" ry="16" transform="rotate(35 135 265)" fill="${c2}" stroke="#1b4332" stroke-width="4"/>
      <ellipse cx="265" cy="265" rx="28" ry="16" transform="rotate(-35 265 265)" fill="${c2}" stroke="#1b4332" stroke-width="4"/>
      <circle cx="200" cy="102" r="26" fill="${c2}" stroke="#1b4332" stroke-width="5"/>
      <circle cx="190" cy="95" r="4.5" fill="#212529"/><circle cx="210" cy="95" r="4.5" fill="#212529"/>
      <ellipse cx="200" cy="212" rx="76" ry="92" fill="${c1}" stroke="#1b4332" stroke-width="6"/>
      <polygon points="200,148 238,175 238,235 200,265 162,235 162,175" fill="${accent}" stroke="#1b4332" stroke-width="5"/>
    `;
  }
  if (type === 'chameleon') {
    return `
      <path d="M60 280 Q200 265 340 285" fill="none" stroke="#582f0e" stroke-width="14" stroke-linecap="round"/>
      <path d="M135 235 C95 155 215 135 265 210 L265 255 L145 255 Z" fill="${c1}" stroke="#1b4332" stroke-width="5"/>
      <path d="M165 172 L165 245 M198 168 L198 245 M230 178 L230 245" stroke="${c2}" stroke-width="10" stroke-linecap="round"/>
      <path d="M140 245 C95 245 78 205 110 192 C128 185 132 215 114 215" fill="none" stroke="${c1}" stroke-width="16" stroke-linecap="round"/>
      <polygon points="255,185 288,162 325,215 265,245" fill="${c2}" stroke="#1b4332" stroke-width="5"/>
      <circle cx="288" cy="208" r="16" fill="${accent}" stroke="#1b4332" stroke-width="4"/>
      <circle cx="288" cy="208" r="6" fill="#212529"/>
    `;
  }
  if (type === 'seahorse') {
    return `
      <path d="M172 155 L138 175 L172 205 Z" fill="${c2}" stroke="#9c6615" stroke-width="4"/>
      <path d="M210 105 C165 105 158 165 190 205 C225 248 165 325 198 335 C225 342 238 305 210 302" fill="none" stroke="${c1}" stroke-width="34" stroke-linecap="round"/>
      <circle cx="212" cy="105" r="28" fill="${c1}" stroke="#9c6615" stroke-width="5"/>
      <rect x="230" y="98" width="44" height="16" rx="8" fill="${c1}" stroke="#9c6615" stroke-width="4"/>
      <circle cx="216" cy="98" r="6" fill="#212529"/>
    `;
  }
  if (type === 'starfish') {
    return `
      <polygon points="200,55 236,142 332,150 258,212 282,305 200,255 118,305 142,212 68,150 164,142" fill="${c1}" stroke="#9d0208" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="200" cy="195" r="12" fill="${c2}"/>
      <circle cx="200" cy="125" r="7" fill="${c2}"/><circle cx="265" cy="168" r="7" fill="${c2}"/>
      <circle cx="242" cy="245" r="7" fill="${c2}"/><circle cx="158" cy="245" r="7" fill="${c2}"/>
      <circle cx="135" cy="168" r="7" fill="${c2}"/>
    `;
  }
  if (type === 'crab') {
    return `
      <path d="M125 215 L75 195 M120 242 L68 242 M130 268 L82 288 M275 215 L325 195 M280 242 L332 242 M270 268 L318 288" stroke="${c1}" stroke-width="10" stroke-linecap="round"/>
      <path d="M145 185 L115 135 M255 185 L285 135" stroke="${c1}" stroke-width="12" stroke-linecap="round"/>
      <path d="M115 135 C82 115 95 75 130 98 L118 118 L142 115 C145 142 125 145 115 135 Z" fill="${c1}" stroke="#6a040f" stroke-width="5"/>
      <path d="M285 135 C318 115 305 75 270 98 L282 118 L258 115 C255 142 275 145 285 135 Z" fill="${c1}" stroke="#6a040f" stroke-width="5"/>
      <ellipse cx="200" cy="232" rx="82" ry="56" fill="${c1}" stroke="#6a040f" stroke-width="6"/>
      <circle cx="176" cy="172" r="14" fill="#ffffff" stroke="#6a040f" stroke-width="4"/>
      <circle cx="224" cy="172" r="14" fill="#ffffff" stroke="#6a040f" stroke-width="4"/>
      <circle cx="176" cy="172" r="6" fill="#212529"/><circle cx="224" cy="172" r="6" fill="#212529"/>
      <path d="M178 242 Q200 258 222 242" fill="none" stroke="#6a040f" stroke-width="5" stroke-linecap="round"/>
    `;
  }
  if (type === 'fish') {
    return `
      <polygon points="285,200 355,142 338,200 355,258" fill="${c2}" stroke="#212529" stroke-width="5"/>
      <polygon points="180,145 215,98 238,148" fill="${c2}" stroke="#212529" stroke-width="4"/>
      <ellipse cx="190" cy="200" rx="98" ry="62" fill="${c1}" stroke="#212529" stroke-width="6"/>
      <path d="M165 140 Q185 200 165 260 M215 142 Q235 200 215 258" fill="none" stroke="${c3}" stroke-width="14"/>
      <circle cx="132" cy="188" r="10" fill="#ffffff"/><circle cx="130" cy="188" r="5" fill="#212529"/>
    `;
  }
  if (type === 'whale') {
    return `
      <path d="M155 125 Q140 85 115 92 M165 125 Q180 85 205 92" fill="none" stroke="#4cc9f0" stroke-width="6" stroke-linecap="round"/>
      <path d="M65 235 C65 145 195 135 255 195 C295 225 325 195 340 165 C352 195 335 245 295 255 L85 255 C68 255 65 245 65 235 Z" fill="${c1}" stroke="#1d3557" stroke-width="6"/>
      <path d="M85 255 Q175 230 255 255 Z" fill="${c3}"/>
      <circle cx="122" cy="205" r="7" fill="#141522"/>
    `;
  }
  if (type === 'octopus') {
    return `
      <ellipse cx="200" cy="155" rx="68" ry="62" fill="${c1}" stroke="#800f2f" stroke-width="6"/>
      <circle cx="176" cy="158" r="9" fill="#212529"/><circle cx="224" cy="158" r="9" fill="#212529"/>
      ${[-75, -45, -15, 15, 45, 75].map(dx => `
        <path d="M${200 + dx*0.6} 205 C${200 + dx*1.4} 255 ${200 + dx*0.9} 315 ${200 + dx*1.3} 325" fill="none" stroke="${c1}" stroke-width="18" stroke-linecap="round"/>
      `).join('')}
    `;
  }
  if (type === 'jellyfish') {
    return `
      <path d="M110 185 A90 85 0 0 1 290 185 Q245 202 200 185 Q155 202 110 185 Z" fill="${c1}" stroke="${c2}" stroke-width="6"/>
      ${[140, 170, 200, 230, 260].map((x, i) => `
        <path d="M${x} 192 Q${x + (i%2?18:-18)} 255 ${x} 325" fill="none" stroke="${c2}" stroke-width="7" stroke-linecap="round"/>
      `).join('')}
    `;
  }
  // Default cute woodland mammal
  return `
    <circle cx="145" cy="122" r="24" fill="${c1}" stroke="#3d1e05" stroke-width="5"/>
    <circle cx="255" cy="122" r="24" fill="${c1}" stroke="#3d1e05" stroke-width="5"/>
    <circle cx="145" cy="122" r="12" fill="${c2}"/><circle cx="255" cy="122" r="12" fill="${c2}"/>
    <ellipse cx="200" cy="268" rx="70" ry="60" fill="${c1}" stroke="#3d1e05" stroke-width="5"/>
    <ellipse cx="200" cy="276" rx="46" ry="42" fill="${c3}"/>
    <circle cx="200" cy="175" r="58" fill="${c1}" stroke="#3d1e05" stroke-width="5"/>
    <ellipse cx="200" cy="192" rx="30" ry="22" fill="${c3}"/>
    <circle cx="176" cy="162" r="8" fill="#212529"/><circle cx="224" cy="162" r="8" fill="#212529"/>
    <circle cx="200" cy="184" r="9" fill="#212529"/>
  `;
}

async function buildButterfliesInsects() {
  const manifestPath = path.join(ROOT, 'assets/sticker/butterflies-insects/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.name = { en: 'Animals & Insects', vi: 'Động vật' };
  preserveExistingSources('sticker', 'butterflies-insects', manifest.items);

  const animalItems = [
    // Insects (16)
    { id: 'ani-monarch-butterfly-orange', en: 'Orange & Black Monarch Butterfly', vi: 'Bướm chúa cánh cam viền đen chấm trắng', tagsEn: ['monarch butterfly', 'butterfly', 'orange', 'insect'], tagsVi: ['bướm chúa', 'bướm cam', 'côn trùng', 'động vật'], spec: { type: 'butterfly', c1: '#fb8500', c2: '#ffb703', c3: '#ffffff', accent: '#212529' } },
    { id: 'ani-swallowtail-butterfly-yellow', en: 'Yellow Tiger Swallowtail Butterfly', vi: 'Bướm phượng vàng vằn đen rực rỡ', tagsEn: ['swallowtail', 'yellow butterfly', 'insect', 'nature'], tagsVi: ['bướm phượng', 'bướm vàng', 'côn trùng', 'động vật'], spec: { type: 'butterfly', c1: '#ffd166', c2: '#ffca3a', c3: '#4cc9f0', accent: '#e63946' } },
    { id: 'ani-luna-moth-pale-green', en: 'Emerald Pale Green Actias Luna Moth', vi: 'Bướm đêm Luna xanh ngọc lục bảo thanh nhã', tagsEn: ['luna moth', 'moth', 'green butterfly', 'insect'], tagsVi: ['bướm đêm', 'xanh ngọc', 'côn trùng', 'động vật'], spec: { type: 'butterfly', c1: '#b7efc5', c2: '#6ede8a', c3: '#ffffff', accent: '#f72585' } },
    { id: 'ani-rosy-maple-moth', en: 'Pink & Yellow Rosy Maple Moth', vi: 'Bướm đêm lá phong màu hồng phấn và vàng kem', tagsEn: ['rosy maple moth', 'pink moth', 'cute insect', 'nature'], tagsVi: ['bướm hồng', 'bướm đêm', 'dễ thương', 'động vật'], spec: { type: 'butterfly', c1: '#ff70a6', c2: '#ffd166', c3: '#ffffff', accent: '#fcf6bd' } },
    { id: 'ani-honeybee-pollen', en: 'Golden Honeybee with Translucent Wings', vi: 'Ong mật vàng sọc đen vỗ cánh trong suốt', tagsEn: ['honeybee', 'bee', 'pollinator', 'insect'], tagsVi: ['ong mật', 'con ong', 'côn trùng', 'động vật'], spec: { type: 'bee', c1: '#ffd166', c2: '#212529' } },
    { id: 'ani-bumblebee-fuzzy', en: 'Chubby Garden Bumblebee', vi: 'Ong nghệ tròn trịa lông vàng cam đáng yêu', tagsEn: ['bumblebee', 'bee', 'garden', 'cute'], tagsVi: ['ong nghệ', 'ong vàng', 'khu vườn', 'động vật'], spec: { type: 'bee', c1: '#fb8500', c2: '#3d1e05' } },
    { id: 'ani-blue-darner-dragonfly', en: 'Iridescent Blue Pond Dragonfly', vi: 'Chuồn chuồn xanh biếc bay trên mặt hồ', tagsEn: ['dragonfly', 'blue dragonfly', 'pond', 'insect'], tagsVi: ['chuồn chuồn', 'chuồn chuồn xanh', 'mặt hồ', 'động vật'], spec: { type: 'dragonfly', c1: '#0096c7', c2: '#caf0f8', accent: '#ffd166' } },
    { id: 'ani-red-meadow-dragonfly', en: 'Crimson Red Autumn Dragonfly', vi: 'Chuồn chuồn ớt đỏ thắm mùa thu', tagsEn: ['red dragonfly', 'dragonfly', 'autumn', 'insect'], tagsVi: ['chuồn chuồn ớt', 'chuồn chuồn đỏ', 'côn trùng', 'động vật'], spec: { type: 'dragonfly', c1: '#e63946', c2: '#ffccd5', accent: '#ffb703' } },
    { id: 'ani-seven-spot-ladybug', en: 'Lucky Red Seven-Spotted Ladybug', vi: 'Bọ rùa đỏ bảy chấm đen may mắn', tagsEn: ['ladybug', 'ladybird', 'beetle', 'lucky'], tagsVi: ['bọ rùa', 'cánh cam', 'may mắn', 'động vật'], spec: { type: 'beetle', c1: '#e63946', c2: '#212529' } },
    { id: 'ani-stag-beetle-horned', en: 'Chestnut Brown Stag Beetle', vi: 'Bọ kẹp kìm cánh cứng màu nâu hạt dẻ', tagsEn: ['stag beetle', 'beetle', 'insect', 'forest'], tagsVi: ['bọ kẹp kìm', 'bọ cánh cứng', 'côn trùng', 'động vật'], spec: { type: 'beetle', c1: '#7f4f24', c2: '#582f0e' } },
    { id: 'ani-jewel-scarab-beetle', en: 'Metallic Emerald Green Jewel Scarab Beetle', vi: 'Bọ hung ánh kim xanh ngọc lục bảo lấp lánh', tagsEn: ['scarab', 'jewel beetle', 'emerald', 'insect'], tagsVi: ['bọ cánh cam', 'bọ ngọc bích', 'ánh kim', 'động vật'], spec: { type: 'beetle', c1: '#2a9d8f', c2: '#ffd166' } },
    { id: 'ani-rhino-beetle-kabuto', en: 'Dark Horned Rhinoceros Kabuto Beetle', vi: 'Bọ cánh cứng tê giác một sừng mạnh mẽ', tagsEn: ['rhino beetle', 'kabutomushi', 'beetle', 'insect'], tagsVi: ['bọ tê giác', 'bọ cánh cứng', 'côn trùng', 'động vật'], spec: { type: 'beetle', c1: '#3d1e05', c2: '#7f4f24' } },
    { id: 'ani-golden-cicada-wings', en: 'Summer Cicada with Veined Amber Wings', vi: 'Ve sầu mùa hạ cánh trong ánh hổ phách', tagsEn: ['cicada', 'summer insect', 'wings', 'nature'], tagsVi: ['ve sầu', 'con ve', 'mùa hè', 'động vật'], spec: { type: 'bee', c1: '#6c584c', c2: '#a3b18a' } },
    { id: 'ani-praying-mantis-green', en: 'Leaf-Green Garden Praying Mantis', vi: 'Bọ ngựa xanh lá cây trong vườn', tagsEn: ['praying mantis', 'green insect', 'garden', 'nature'], tagsVi: ['bọ ngựa', 'màu xanh', 'côn trùng', 'động vật'], spec: { type: 'dragonfly', c1: '#52b788', c2: '#b7efc5', accent: '#ffd166' } },
    { id: 'ani-garden-snail-spiral', en: 'Cute Garden Snail with Spiral Brown Shell', vi: 'Ốc sên nhỏ vỏ xoắn ốc nâu bò trên lá', tagsEn: ['snail', 'spiral shell', 'garden', 'cute'], tagsVi: ['ốc sên', 'vỏ xoắn', 'khu vườn', 'động vật'], spec: { type: 'snail', c1: '#bc6c25', c2: '#ddb892' } },
    { id: 'ani-firefly-glowing-tail', en: 'Evening Firefly Beetle with Glowing Lantern', vi: 'Đom đóm phát sáng vàng ấm trong đêm', tagsEn: ['firefly', 'lightning bug', 'glow', 'insect'], tagsVi: ['đom đóm', 'phát sáng', 'ban đêm', 'động vật'], spec: { type: 'bee', c1: '#ffd166', c2: '#2b2d42' } },

    // Pets & Farm (10)
    { id: 'ani-orange-tabby-cat', en: 'Cozy Ginger Orange Tabby Cat Sitting', vi: 'Mèo mướp vàng cam đáng yêu ngồi ngoan', tagsEn: ['orange cat', 'tabby cat', 'kitten', 'pet'], tagsVi: ['mèo vàng', 'mèo cam', 'thú cưng', 'động vật'], spec: { type: 'cat', c1: '#fb8500', c2: '#ffb703', c3: '#fff3b0' } },
    { id: 'ani-calico-cat-stretching', en: 'Cute Tri-Color Calico Cat', vi: 'Mèo tam thể trắng cam đen dễ thương', tagsEn: ['calico cat', 'cat', 'kitten', 'pet'], tagsVi: ['mèo tam thể', 'con mèo', 'thú cưng', 'động vật'], spec: { type: 'cat', c1: '#ffffff', c2: '#fb8500', c3: '#f8f9fa' } },
    { id: 'ani-black-kitten-yarn', en: 'Little Black Kitten with Golden Eyes', vi: 'Mèo đen mắt vàng tròn xoe đáng yêu', tagsEn: ['black cat', 'kitten', 'cute cat', 'pet'], tagsVi: ['mèo đen', 'mèo con', 'mắt vàng', 'động vật'], spec: { type: 'cat', c1: '#2b2d42', c2: '#495057', c3: '#343a40' } },
    { id: 'ani-golden-retriever-dog', en: 'Happy Golden Retriever Puppy', vi: 'Chú chó Golden lông vàng hiền lành tươi cười', tagsEn: ['golden retriever', 'dog', 'puppy', 'pet'], tagsVi: ['chó golden', 'chú chó', 'thú cưng', 'động vật'], spec: { type: 'dog', c1: '#dda15e', c2: '#bc6c25', c3: '#fefae0' } },
    { id: 'ani-corgi-dog-smiling', en: 'Fluffy Pembroke Welsh Corgi Dog', vi: 'Chú chó Corgi chân ngắn lông vàng trắng', tagsEn: ['corgi', 'puppy', 'dog', 'cute'], tagsVi: ['chó corgi', 'cún cưng', 'dễ thương', 'động vật'], spec: { type: 'dog', c1: '#fb8500', c2: '#bc6c25', c3: '#ffffff' } },
    { id: 'ani-french-bulldog-cute', en: 'Cream & Fawn French Bulldog Puppy', vi: 'Chú chó Bull Pháp tai dựng ngộ nghĩnh', tagsEn: ['french bulldog', 'frenchie', 'dog', 'pet'], tagsVi: ['chó bull', 'cún con', 'thú cưng', 'động vật'], spec: { type: 'dog', c1: '#ddb892', c2: '#7f4f24', c3: '#f8f9fa' } },
    { id: 'ani-white-lop-rabbit', en: 'Fluffy White Bunny Rabbit with Pink Ears', vi: 'Thỏ trắng lông bông tai hồng xinh xắn', tagsEn: ['white rabbit', 'bunny', 'cute', 'pet'], tagsVi: ['thỏ trắng', 'con thỏ', 'dễ thương', 'động vật'], spec: { type: 'rabbit', c1: '#ffffff', c2: '#ff99c8', c3: '#f8f9fa' } },
    { id: 'ani-spotted-bunny-carrot', en: 'Cinnamon Brown Meadow Bunny Rabbit', vi: 'Thỏ nâu đồng cỏ tai dài đáng yêu', tagsEn: ['brown bunny', 'rabbit', 'meadow', 'animal'], tagsVi: ['thỏ nâu', 'thỏ rừng', 'đồng cỏ', 'động vật'], spec: { type: 'rabbit', c1: '#ddb892', c2: '#ff99c8', c3: '#ffffff' } },
    { id: 'ani-golden-hamster-seed', en: 'Chubby Golden Hamster with Rosy Cheeks', vi: 'Chuột Hamster vàng mũm mĩm má hồng', tagsEn: ['hamster', 'cute pet', 'rodent', 'animal'], tagsVi: ['chuột hamster', 'mũm mĩm', 'thú cưng', 'động vật'], spec: { type: 'mammal', c1: '#ffb703', c2: '#ff70a6', c3: '#ffffff' } },
    { id: 'ani-highland-fluffy-cow', en: 'Fluffy Ginger Scottish Highland Calf', vi: 'Bê con lông xù màu nâu cam dễ thương', tagsEn: ['highland cow', 'calf', 'farm animal', 'cute'], tagsVi: ['bò lông xù', 'bê con', 'nông trại', 'động vật'], spec: { type: 'mammal', c1: '#bc6c25', c2: '#dda15e', c3: '#fefae0' } },

    // Woodland & Wild Mammals (14)
    { id: 'ani-red-fox-sitting', en: 'Woodland Red Fox with White-Tipped Tail', vi: 'Cáo đỏ rừng xanh đuôi bông trắng', tagsEn: ['red fox', 'fox', 'woodland', 'animal'], tagsVi: ['cáo đỏ', 'con cáo', 'rừng xanh', 'động vật'], spec: { type: 'cat', c1: '#e85d04', c2: '#9d0208', c3: '#ffffff' } },
    { id: 'ani-spotted-fawn-deer', en: 'Gentle Spotted Forest Fawn Deer', vi: 'Hươu sao nhỏ lông nâu đốm trắng hiền dịu', tagsEn: ['fawn', 'deer', 'forest', 'animal'], tagsVi: ['hươu sao', 'nai con', 'rừng cây', 'động vật'], spec: { type: 'dog', c1: '#bc6c25', c2: '#7f4f24', c3: '#fefae0' } },
    { id: 'ani-giant-panda-bamboo', en: 'Cute Black & White Giant Panda Bear', vi: 'Gấu trúc đen trắng mũm mĩm đáng yêu', tagsEn: ['panda', 'giant panda', 'bamboo', 'cute'], tagsVi: ['gấu trúc', 'panda', 'dễ thương', 'động vật'], spec: { type: 'mammal', c1: '#ffffff', c2: '#212529', c3: '#212529' } },
    { id: 'ani-koala-eucalyptus', en: 'Sleepy Gray Australian Koala Bear', vi: 'Gấu túi Koala lông xám tai tròn hiền lành', tagsEn: ['koala', 'australian', 'cute animal', 'nature'], tagsVi: ['gấu koala', 'gấu túi', 'dễ thương', 'động vật'], spec: { type: 'mammal', c1: '#adb5bd', c2: '#ffffff', c3: '#e9ecef' } },
    { id: 'ani-red-panda-striped-tail', en: 'Rusty Red Panda with Ringed Tail', vi: 'Gấu trúc đỏ mặt trắng đuôi vằn đáng yêu', tagsEn: ['red panda', 'cute animal', 'forest', 'wildlife'], tagsVi: ['gấu trúc đỏ', 'dễ thương', 'rừng xanh', 'động vật'], spec: { type: 'cat', c1: '#d62828', c2: '#582f0e', c3: '#ffffff' } },
    { id: 'ani-brown-bear-honey', en: 'Friendly Forest Brown Bear Cub', vi: 'Gấu nâu nhỏ hiền lành trong rừng', tagsEn: ['brown bear', 'bear cub', 'forest', 'animal'], tagsVi: ['gấu nâu', 'gấu con', 'rừng cây', 'động vật'], spec: { type: 'mammal', c1: '#7f4f24', c2: '#582f0e', c3: '#ddb892' } },
    { id: 'ani-racoon-bandit-mask', en: 'Curious Gray Woodland Raccoon', vi: 'Gấu mèo xám đeo mặt nạ đen tinh nghịch', tagsEn: ['raccoon', 'woodland', 'wildlife', 'animal'], tagsVi: ['gấu mèo', 'tinh nghịch', 'rừng xanh', 'động vật'], spec: { type: 'cat', c1: '#6c757d', c2: '#212529', c3: '#e9ecef' } },
    { id: 'ani-chipmunk-acorn', en: 'Striped Woodland Chipmunk Holding Acorn', vi: 'Sóc chuột vằn lưng nâu ôm hạt sồi', tagsEn: ['chipmunk', 'squirrel', 'acorn', 'woodland'], tagsVi: ['sóc chuột', 'con sóc', 'hạt sồi', 'động vật'], spec: { type: 'mammal', c1: '#bc6c25', c2: '#582f0e', c3: '#fefae0' } },
    { id: 'ani-european-badger', en: 'Striped Forest Badger Illustration', vi: 'Chồn lửng rừng sọc trắng đen cổ điển', tagsEn: ['badger', 'forest animal', 'woodland', 'nature'], tagsVi: ['con lửng', 'thú rừng', 'thiên nhiên', 'động vật'], spec: { type: 'mammal', c1: '#495057', c2: '#ffffff', c3: '#dee2e6' } },
    { id: 'ani-otter-holding-shell', en: 'Playful River Otter Floating on Back', vi: 'Rái cá nhỏ nâu ấm ôm vỏ sò trên sông', tagsEn: ['otter', 'sea otter', 'cute animal', 'river'], tagsVi: ['rái cá', 'vỏ sò', 'dễ thương', 'động vật'], spec: { type: 'mammal', c1: '#9c6644', c2: '#582f0e', c3: '#ede0d4' } },
    { id: 'ani-capybara-yuzu-head', en: 'Chill Capybara with Orange on Head', vi: 'Chuột lang nước Capybara điềm tĩnh đáng yêu', tagsEn: ['capybara', 'yuzu', 'chill', 'cute'], tagsVi: ['capybara', 'chuột lang nước', 'dễ thương', 'động vật'], spec: { type: 'mammal', c1: '#b07d62', c2: '#7f4f24', c3: '#ddb892' } },
    { id: 'ani-alpaca-fluffy-scarf', en: 'Fluffy Cream Alpaca with Pastel Wool', vi: 'Lạc đà không bướu Alpaca lông trắng xốp mềm', tagsEn: ['alpaca', 'llama', 'fluffy', 'cute'], tagsVi: ['lạc đà alpaca', 'lông xù', 'dễ thương', 'động vật'], spec: { type: 'mammal', c1: '#fffdf7', c2: '#ff99c8', c3: '#f8f9fa' } },
    { id: 'ani-african-elephant-calf', en: 'Sweet Baby Gray Elephant with Big Ears', vi: 'Voi con xám tai to hiền lành đáng yêu', tagsEn: ['elephant', 'baby elephant', 'safari', 'animal'], tagsVi: ['voi con', 'con voi', 'hiền lành', 'động vật'], spec: { type: 'dog', c1: '#adb5bd', c2: '#6c757d', c3: '#dee2e6' } },
    { id: 'ani-giraffe-spotted-neck', en: 'Spotted Golden Savanna Giraffe', vi: 'Hươu cao cổ vàng đốm nâu đồng cỏ', tagsEn: ['giraffe', 'savanna', 'spotted', 'animal'], tagsVi: ['hươu cao cổ', 'đốm nâu', 'đồng cỏ', 'động vật'], spec: { type: 'mammal', c1: '#ffd166', c2: '#9c6644', c3: '#fff3b0' } },

    // Amphibians, Reptiles & Marine (14)
    { id: 'ani-red-eyed-tree-frog', en: 'Tropical Red-Eyed Green Tree Frog', vi: 'Ếch cây xanh mắt đỏ nhiệt đới sống động', tagsEn: ['tree frog', 'frog', 'tropical', 'amphibian'], tagsVi: ['ếch cây', 'con ếch', 'nhiệt đới', 'động vật'], spec: { type: 'frog', c1: '#8ac926', c3: '#fff3b0', accent: '#e63946' } },
    { id: 'ani-lilypad-green-frog', en: 'Happy Pond Frog Sitting on Green Lily Pad', vi: 'Chú ếch xanh ngồi trên lá súng mặt hồ', tagsEn: ['pond frog', 'frog', 'lily pad', 'cute'], tagsVi: ['ếch xanh', 'lá súng', 'mặt hồ', 'động vật'], spec: { type: 'frog', c1: '#52b788', c3: '#d8f3dc', accent: '#ffd166' } },
    { id: 'ani-green-sea-turtle', en: 'Ocean Green Sea Turtle Swimming', vi: 'Rùa biển mai xanh bơi giữa đại dương', tagsEn: ['sea turtle', 'turtle', 'ocean', 'marine'], tagsVi: ['rùa biển', 'con rùa', 'đại dương', 'động vật'], spec: { type: 'turtle', c1: '#2d6a4f', c2: '#52b788', accent: '#95d5b2' } },
    { id: 'ani-veiled-chameleon-branch', en: 'Colorful Turquoise & Lime Chameleon', vi: 'Tắc kè hoa xanh ngọc đổi màu trên cành', tagsEn: ['chameleon', 'lizard', 'reptile', 'colorful'], tagsVi: ['tắc kè hoa', 'tắc kè', 'sắc màu', 'động vật'], spec: { type: 'chameleon', c1: '#00bbf9', c2: '#8ac926', accent: '#fee440' } },
    { id: 'ani-koi-goldfish-fantail', en: 'Graceful Orange Fantail Goldfish', vi: 'Cá vàng đuôi voan bơi uyển chuyển', tagsEn: ['goldfish', 'fish', 'aquarium', 'orange fish'], tagsVi: ['cá vàng', 'đuôi voan', 'bơi lội', 'động vật'], spec: { type: 'fish', c1: '#fb8500', c2: '#ffb703', c3: '#fff3b0' } },
    { id: 'ani-clownfish-orange-stripes', en: 'Coral Reef Orange & White Clownfish', vi: 'Cá hề cam sọc trắng rạn san hô', tagsEn: ['clownfish', 'coral reef', 'marine fish', 'ocean'], tagsVi: ['cá hề', 'san hô', 'biển cả', 'động vật'], spec: { type: 'fish', c1: '#ff5400', c2: '#ff8500', c3: '#ffffff' } },
    { id: 'ani-bottlenose-dolphin-jump', en: 'Playful Blue Bottlenose Dolphin Leaping', vi: 'Cá heo xanh phóng mình trên sóng biển', tagsEn: ['dolphin', 'ocean', 'marine', 'sea animal'], tagsVi: ['cá heo', 'biển xanh', 'đại dương', 'động vật'], spec: { type: 'whale', c1: '#4cc9f0', c2: '#0096c7', c3: '#ffffff' } },
    { id: 'ani-humpback-whale-breach', en: 'Gentle Deep Blue Ocean Whale with Water Spout', vi: 'Cá voi xanh đại dương phun cột nước trắng', tagsEn: ['whale', 'blue whale', 'ocean', 'marine'], tagsVi: ['cá voi', 'cá voi xanh', 'đại dương', 'động vật'], spec: { type: 'whale', c1: '#1d3557', c2: '#457b9d', c3: '#f1faee' } },
    { id: 'ani-red-octopus-curled', en: 'Coral Red Octopus with Curled Tentacles', vi: 'Bạch tuộc đỏ san hô xúc tu uốn lượn', tagsEn: ['octopus', 'sea creature', 'ocean', 'marine'], tagsVi: ['bạch tuộc', 'sinh vật biển', 'đại dương', 'động vật'], spec: { type: 'octopus', c1: '#e63946', c2: '#ff758f' } },
    { id: 'ani-moon-jellyfish-pink', en: 'Translucent Pink Glowing Ocean Jellyfish', vi: 'Sứa biển màu hồng phấn bơi bồng bềnh', tagsEn: ['jellyfish', 'pink jellyfish', 'ocean', 'marine'], tagsVi: ['sứa biển', 'con sứa', 'bồng bềnh', 'động vật'], spec: { type: 'jellyfish', c1: '#ff99c8', c2: '#f72585' } },
    { id: 'ani-golden-seahorse', en: 'Coral Reef Golden Seahorse Illustration', vi: 'Cá ngựa vàng rạn san hô cổ điển', tagsEn: ['seahorse', 'ocean', 'coral reef', 'marine'], tagsVi: ['cá ngựa', 'san hô', 'biển cả', 'động vật'], spec: { type: 'seahorse', c1: '#ffb703', c2: '#fb8500', accent: '#ffffff' } },
    { id: 'ani-coral-starfish-pair', en: 'Five-Pointed Coral Orange Sea Starfish', vi: 'Sao biển năm cánh màu cam san hô', tagsEn: ['starfish', 'sea star', 'beach', 'ocean'], tagsVi: ['sao biển', 'bãi biển', 'đại dương', 'động vật'], spec: { type: 'starfish', c1: '#ff7b00', c2: '#fff3b0' } },
    { id: 'ani-red-shore-crab', en: 'Happy Red Beach Crab with Claws', vi: 'Cua biển đỏ giơ đôi càng ngộ nghĩnh', tagsEn: ['crab', 'red crab', 'beach', 'sea creature'], tagsVi: ['con cua', 'cua biển', 'bãi biển', 'động vật'], spec: { type: 'crab', c1: '#d62828', c2: '#ffd166' } },
    { id: 'ani-axolotl-pink-smile', en: 'Smiling Pastel Pink Axolotl Salamander', vi: 'Kỳ nhông Axolotl màu hồng pastel tươi cười', tagsEn: ['axolotl', 'pink', 'cute animal', 'amphibian'], tagsVi: ['kỳ nhông', 'axolotl', 'dễ thương', 'động vật'], spec: { type: 'frog', c1: '#ff99c8', c3: '#ffffff', accent: '#f72585' } },
  ];

  for (const a of animalItems) {
    await saveSvgSticker('sticker', 'butterflies-insects', a.id, renderAnimalOrInsectSvg(a.spec));
    if (!manifest.items.some(x => x.id === a.id)) {
      manifest.items.push(makeItemMeta(a.id, a.en, a.vi, a.tagsEn, a.tagsVi, ['nature', 'cute', 'journal'], 'butterflies-insects'));
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`butterflies-insects: ${manifest.items.length} items`);
}

async function main() {
  await buildChristmas();
  await buildCelebrations();
  await buildBirdsAnimals();
  await buildButterfliesInsects();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
