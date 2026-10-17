// Downloads WOFF2 font subsets from Fontsource (Google Fonts) and writes
// assets/font/<pack>/manifest.json + public/packs/font/<pack>/<id>/*.woff2 (M20 G5).
// Usage: node scripts/assets/fonts.mjs [pack] [--only <id>] [--force]
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ASSETS, PACKS, ROOT } from "./common.mjs";

const RETRIEVED_DATE = "2026-10-18";

/**
 * Curated list of 162 Google Fonts across 11 packs, verified non-overlapping
 * with the 78 built-in fonts in src/lib/text/fonts.ts.
 */
export const FONT_PACKS = [
  {
    id: "handwriting",
    order: 10,
    name: { en: "Handwriting", vi: "Chữ viết tay" },
    collections: ["handDrawn", "journal"],
    fonts: [
      { id: "briem-hand", styles: ["handwriting"], collections: ["journal"] },
      { id: "edu-qld-hand", styles: ["handwriting"], collections: ["journal"] },
      { id: "fuzzy-bubbles", styles: ["handwriting", "playful"], collections: ["cute", "handDrawn"] },
      { id: "grape-nuts", styles: ["handwriting"], collections: ["journal", "handDrawn"] },
      { id: "grechen-fuemen", styles: ["handwriting", "playful"], collections: ["handDrawn"] },
      { id: "ingrid-darling", styles: ["handwriting", "script"], collections: ["cute", "handDrawn"] },
      { id: "mansalva", styles: ["handwriting"], collections: ["handDrawn"] },
      { id: "meow-script", styles: ["handwriting", "script"], collections: ["cute"] },
      { id: "ms-madi", styles: ["handwriting", "script"], collections: ["journal"] },
      { id: "mynerve", styles: ["handwriting"], collections: ["journal", "handDrawn"] },
      { id: "oooh-baby", styles: ["handwriting", "script"], collections: ["cute", "journal"] },
      { id: "pangolin", styles: ["handwriting", "playful"], collections: ["cute", "handDrawn"] },
      { id: "patrick-hand-sc", styles: ["handwriting"], collections: ["journal", "handDrawn"] },
      { id: "puppies-play", styles: ["handwriting", "script"], collections: ["cute"] },
      { id: "ruge-boogie", styles: ["handwriting"], collections: ["vintage"] },
      { id: "square-peg", styles: ["handwriting"], collections: ["journal"] },
    ],
  },
  {
    id: "calligraphy",
    order: 20,
    name: { en: "Calligraphy & Script", vi: "Thư pháp & Chữ mảnh" },
    collections: ["vintage", "journal"],
    fonts: [
      { id: "alex-brush", styles: ["calligraphy", "script"], collections: ["vintage"] },
      { id: "allison", styles: ["calligraphy", "script"], collections: ["journal"] },
      { id: "arizonia", styles: ["calligraphy", "script"], collections: ["vintage"] },
      { id: "babylonica", styles: ["calligraphy", "script"], collections: ["vintage"] },
      { id: "bad-script", styles: ["script", "handwriting"], collections: ["journal"] },
      { id: "ballet", styles: ["calligraphy", "script"], collections: ["vintage"] },
      { id: "beau-rivage", styles: ["calligraphy", "script"], collections: ["vintage", "tet"] },
      { id: "birthstone", styles: ["calligraphy", "script"], collections: ["journal"] },
      { id: "birthstone-bounce", styles: ["calligraphy", "script"], collections: ["cute"] },
      { id: "bonheur-royale", styles: ["calligraphy", "script"], collections: ["vintage", "tet"] },
      { id: "carattere", styles: ["calligraphy", "script"], collections: ["vintage"] },
      { id: "cherish", styles: ["calligraphy", "script"], collections: ["tet", "vintage"] },
      { id: "ephesis", styles: ["calligraphy", "script"], collections: ["vintage"] },
      { id: "fleur-de-leah", styles: ["calligraphy", "display"], collections: ["vintage", "christmas"] },
      { id: "gwendolyn", styles: ["calligraphy", "script"], collections: ["christmas", "vintage"] },
      { id: "imperial-script", styles: ["calligraphy", "script"], collections: ["vintage", "tet"] },
      { id: "island-moments", styles: ["calligraphy", "handwriting"], collections: ["travel"] },
      { id: "italianno", styles: ["calligraphy", "script"], collections: ["vintage"] },
    ],
  },
  {
    id: "vietnamese-display",
    order: 30,
    name: { en: "Vietnamese Display", vi: "Trang trí Tiếng Việt" },
    collections: ["tet", "vintage"],
    fonts: [
      { id: "agbalumo", styles: ["display", "playful"], collections: ["tet", "cute"] },
      { id: "agu-display", styles: ["display"], collections: ["vintage"] },
      { id: "alfa-slab-one", styles: ["display", "serif"], collections: ["retro", "vintage"] },
      { id: "alumni-sans-inline-one", styles: ["display", "outline"], collections: ["retro"] },
      { id: "arima", styles: ["display", "sans"], collections: ["cute"] },
      { id: "bahianita", styles: ["display", "handwriting"], collections: ["handDrawn"] },
      { id: "baloo-2", styles: ["display", "playful"], collections: ["cute"] },
      { id: "bellota", styles: ["display", "sans"], collections: ["cute", "journal"] },
      { id: "big-shoulders-display", styles: ["display", "sans"], collections: ["minimal"] },
      { id: "big-shoulders-inline", styles: ["display", "outline"], collections: ["retro"] },
      { id: "calistoga", styles: ["display", "serif"], collections: ["vintage", "retro"] },
      { id: "coiny", styles: ["display", "playful"], collections: ["cute"] },
      { id: "farsan", styles: ["display", "sans"], collections: ["travel"] },
      { id: "gideon-roman", styles: ["display", "serif"], collections: ["vintage"] },
      { id: "lemonada", styles: ["display", "playful"], collections: ["cute"] },
      { id: "luxurious-roman", styles: ["display", "serif"], collections: ["vintage"] },
      { id: "phudu", styles: ["display", "sans"], collections: ["travel", "tet"] },
      { id: "red-rose", styles: ["display", "serif"], collections: ["tet", "vintage"] },
      { id: "rowdies", styles: ["display", "playful"], collections: ["retro"] },
      { id: "sansita-swashed", styles: ["display", "serif"], collections: ["vintage", "tet"] },
      { id: "srisakdi", styles: ["display", "calligraphy"], collections: ["tet", "vintage"] },
      { id: "tilt-neon", styles: ["display", "outline"], collections: ["retro"] },
      { id: "tilt-prism", styles: ["display", "outline"], collections: ["retro"] },
      { id: "viaoda-libre", styles: ["display", "serif"], collections: ["tet", "vintage"] },
      { id: "vina-sans", styles: ["display", "sans"], collections: ["tet"] },
    ],
  },
  {
    id: "fantasy",
    order: 40,
    name: { en: "Fantasy & Classic", vi: "Cổ điển & Kỳ ảo" },
    collections: ["vintage"],
    fonts: [
      { id: "fruktur", styles: ["fantasy", "display"], collections: ["vintage"] },
      { id: "kings", styles: ["fantasy", "calligraphy"], collections: ["vintage"] },
      { id: "tapestry", styles: ["fantasy", "calligraphy"], collections: ["vintage"] },
      { id: "almendra-display", styles: ["fantasy", "display"], collections: ["vintage"] },
      { id: "cinzel-decorative", styles: ["fantasy", "serif", "display"], collections: ["vintage"] },
      { id: "eagle-lake", styles: ["fantasy", "calligraphy"], collections: ["vintage"] },
      { id: "fondamento", styles: ["fantasy", "calligraphy"], collections: ["vintage"] },
      { id: "henny-penny", styles: ["fantasy", "playful"], collections: ["vintage", "cute"] },
      { id: "im-fell-dw-pica-sc", styles: ["fantasy", "serif"], collections: ["vintage", "journal"] },
      { id: "jolly-lodger", styles: ["fantasy", "display"], collections: ["vintage"] },
      { id: "macondo-swash-caps", styles: ["fantasy", "display"], collections: ["vintage"] },
      { id: "medievalsharp", styles: ["fantasy", "display"], collections: ["vintage"] },
      { id: "metamorphous", styles: ["fantasy", "serif"], collections: ["vintage"] },
      { id: "mystery-quest", styles: ["fantasy", "playful"], collections: ["vintage", "cute"] },
      { id: "pirata-one", styles: ["fantasy", "display"], collections: ["vintage"] },
      { id: "uncial-antiqua", styles: ["fantasy", "display"], collections: ["vintage"] },
    ],
  },
  {
    id: "playful",
    order: 50,
    name: { en: "Playful & Toy Block", vi: "Vui nhộn & Đồ chơi" },
    collections: ["cute"],
    fonts: [
      { id: "bangers", styles: ["playful", "display"], collections: ["cute", "retro"] },
      { id: "barriecito", styles: ["playful", "display"], collections: ["cute", "handDrawn"] },
      { id: "bungee-inline", styles: ["playful", "display", "outline"], collections: ["cute", "retro"] },
      { id: "bungee-outline", styles: ["playful", "outline", "display"], collections: ["cute", "retro"] },
      { id: "bungee-shade", styles: ["playful", "display", "outline"], collections: ["cute", "retro"] },
      { id: "cherry-bomb-one", styles: ["playful", "display"], collections: ["cute", "japan"] },
      { id: "chokokutai", styles: ["playful", "display"], collections: ["cute", "japan"] },
      { id: "grandstander", styles: ["playful", "display"], collections: ["cute", "handDrawn"] },
      { id: "kablammo", styles: ["playful", "display"], collections: ["cute"] },
      { id: "moo-lah-lah", styles: ["playful", "display"], collections: ["cute"] },
      { id: "oi", styles: ["playful", "display"], collections: ["cute", "retro"] },
      { id: "sigmar", styles: ["playful", "display"], collections: ["cute"] },
      { id: "bagel-fat-one", styles: ["playful", "display"], collections: ["cute"] },
      { id: "chewy", styles: ["playful", "display"], collections: ["cute"] },
      { id: "fredoka", styles: ["playful", "sans"], collections: ["cute"] },
      { id: "luckiest-guy", styles: ["playful", "display"], collections: ["cute"] },
      { id: "rubik-bubbles", styles: ["playful", "display"], collections: ["cute"] },
      { id: "titan-one", styles: ["playful", "display"], collections: ["cute"] },
    ],
  },
  {
    id: "festive",
    order: 60,
    name: { en: "Festive & Holiday", vi: "Lễ hội & Mùa lễ" },
    collections: ["tet", "christmas", "midAutumn"],
    fonts: [
      { id: "are-you-serious", styles: ["festive", "calligraphy"], collections: ["christmas", "cute"] },
      { id: "charmonman", styles: ["festive", "calligraphy"], collections: ["tet", "midAutumn"] },
      { id: "festive", styles: ["festive", "calligraphy"], collections: ["christmas", "tet"] },
      { id: "licorice", styles: ["festive", "calligraphy"], collections: ["christmas", "tet"] },
      { id: "love-light", styles: ["festive", "calligraphy"], collections: ["tet", "christmas"] },
      { id: "lovers-quarrel", styles: ["festive", "calligraphy"], collections: ["tet", "christmas"] },
      { id: "mea-culpa", styles: ["festive", "calligraphy"], collections: ["christmas", "tet"] },
      { id: "montecarlo", styles: ["festive", "calligraphy"], collections: ["christmas", "tet"] },
      { id: "neonderthaw", styles: ["festive", "outline", "script"], collections: ["tet", "christmas"] },
      { id: "ole", styles: ["festive", "calligraphy"], collections: ["tet", "midAutumn"] },
      { id: "passions-conflict", styles: ["festive", "calligraphy"], collections: ["tet", "christmas"] },
      { id: "petemoss", styles: ["festive", "handwriting"], collections: ["christmas", "journal"] },
      { id: "praise", styles: ["festive", "calligraphy"], collections: ["tet", "christmas"] },
      { id: "qwigley", styles: ["festive", "calligraphy"], collections: ["christmas", "tet"] },
      { id: "qwitcher-grypen", styles: ["festive", "calligraphy"], collections: ["christmas", "journal"] },
      { id: "send-flowers", styles: ["festive", "display"], collections: ["tet", "cute"] },
      { id: "shalimar", styles: ["festive", "calligraphy"], collections: ["tet", "midAutumn"] },
      { id: "the-nautigal", styles: ["festive", "calligraphy"], collections: ["tet", "christmas"] },
      { id: "twinkle-star", styles: ["festive", "handwriting"], collections: ["christmas", "midAutumn", "cute"] },
      { id: "updock", styles: ["festive", "calligraphy"], collections: ["tet", "christmas"] },
      { id: "vujahday-script", styles: ["festive", "script"], collections: ["tet", "journal"] },
      { id: "whisper", styles: ["festive", "calligraphy"], collections: ["christmas", "journal"] },
      { id: "windsong", styles: ["festive", "calligraphy"], collections: ["tet", "christmas"] },
      { id: "mountains-of-christmas", styles: ["festive", "display"], collections: ["christmas"] },
    ],
  },
  {
    id: "retro-pixel",
    order: 70,
    name: { en: "Retro & Pixel", vi: "Hoài cổ & Điện tử" },
    collections: ["retro"],
    fonts: [
      { id: "black-ops-one", styles: ["retro", "stencil"], collections: ["retro"] },
      { id: "bungee-hairline", styles: ["retro", "outline"], collections: ["retro"] },
      { id: "flow-block", styles: ["pixel", "retro"], collections: ["retro"] },
      { id: "goldman", styles: ["retro", "display"], collections: ["retro"] },
      { id: "handjet", styles: ["pixel", "retro"], collections: ["retro"] },
      { id: "saira-stencil-one", styles: ["stencil", "retro"], collections: ["retro"] },
      { id: "tourney", styles: ["retro", "outline"], collections: ["retro"] },
      { id: "audiowide", styles: ["retro", "display"], collections: ["retro"] },
      { id: "codystar", styles: ["retro", "outline"], collections: ["retro"] },
      { id: "coral-pixels", styles: ["pixel", "retro"], collections: ["retro"] },
      { id: "dotgothic16", styles: ["pixel", "retro"], collections: ["retro", "japan"] },
      { id: "jersey-10", styles: ["pixel", "retro"], collections: ["retro"] },
      { id: "jersey-25", styles: ["pixel", "retro"], collections: ["retro"] },
      { id: "micro-5", styles: ["pixel", "retro"], collections: ["retro"] },
      { id: "monofett", styles: ["retro", "mono"], collections: ["retro"] },
      { id: "silkscreen", styles: ["pixel", "retro"], collections: ["retro"] },
      { id: "vt323", styles: ["pixel", "mono", "retro"], collections: ["retro"] },
      { id: "zen-dots", styles: ["retro", "display"], collections: ["retro", "japan"] },
    ],
  },
  {
    id: "brush-grunge",
    order: 80,
    name: { en: "Brush & Grunge", vi: "Cọ vẽ & Bụi bặm" },
    collections: ["handDrawn", "vintage"],
    fonts: [
      { id: "comforter", styles: ["brush", "handwriting"], collections: ["handDrawn"] },
      { id: "comforter-brush", styles: ["brush", "handwriting"], collections: ["handDrawn"] },
      { id: "fuggles", styles: ["brush", "calligraphy"], collections: ["handDrawn"] },
      { id: "kolker-brush", styles: ["brush", "calligraphy"], collections: ["handDrawn", "tet"] },
      { id: "lavishly-yours", styles: ["brush", "calligraphy"], collections: ["vintage", "tet"] },
      { id: "my-soul", styles: ["brush", "calligraphy"], collections: ["handDrawn", "tet"] },
      { id: "protest-guerrilla", styles: ["brush", "stencil", "display"], collections: ["retro"] },
      { id: "protest-revolution", styles: ["brush", "display"], collections: ["handDrawn"] },
      { id: "protest-riot", styles: ["brush", "display"], collections: ["handDrawn"] },
      { id: "protest-strike", styles: ["brush", "display"], collections: ["retro"] },
      { id: "road-rage", styles: ["brush", "display"], collections: ["handDrawn", "retro"] },
      { id: "sedgwick-ave", styles: ["brush", "handwriting"], collections: ["handDrawn"] },
      { id: "sedgwick-ave-display", styles: ["brush", "display"], collections: ["handDrawn"] },
      { id: "smooch", styles: ["brush", "script"], collections: ["handDrawn"] },
      { id: "splash", styles: ["brush", "handwriting"], collections: ["handDrawn"] },
      { id: "water-brush", styles: ["brush", "calligraphy"], collections: ["handDrawn", "tet", "midAutumn"] },
      { id: "rubik-dirt", styles: ["brush", "display"], collections: ["vintage"] },
      { id: "rubik-glitch", styles: ["display", "retro"], collections: ["retro"] },
      { id: "rubik-spray-paint", styles: ["brush", "display"], collections: ["handDrawn"] },
      { id: "rubik-wet-paint", styles: ["brush", "display"], collections: ["handDrawn"] },
      { id: "special-elite", styles: ["serif", "retro"], collections: ["vintage", "journal", "film"] },
    ],
  },
  {
    id: "japanese",
    order: 90,
    name: { en: "Japanese", vi: "Tiếng Nhật" },
    collections: ["japan"],
    cjk: true,
    fonts: [
      { id: "yomogi", styles: ["handwriting", "sans"], collections: ["japan", "journal", "cute"] },
      { id: "potta-one", styles: ["display", "brush"], collections: ["japan", "cute"] },
      { id: "yusei-magic", styles: ["handwriting", "sans"], collections: ["japan", "cute"] },
      { id: "hachi-maru-pop", styles: ["handwriting", "playful"], collections: ["japan", "cute"] },
      { id: "kiwi-maru", styles: ["serif", "playful"], collections: ["japan", "cute"] },
      { id: "klee-one", styles: ["handwriting", "serif"], collections: ["japan", "journal"] },
      { id: "mochiy-pop-one", styles: ["playful", "display"], collections: ["japan", "cute"] },
      { id: "rampart-one", styles: ["display", "outline"], collections: ["japan", "retro"] },
      { id: "rocknroll-one", styles: ["display", "sans"], collections: ["japan", "cute"] },
      { id: "stick", styles: ["display", "playful"], collections: ["japan", "cute"] },
      { id: "train-one", styles: ["display", "outline"], collections: ["japan", "retro"] },
      { id: "kaisei-decol", styles: ["serif", "display"], collections: ["japan", "vintage"] },
      { id: "yuji-syuku", styles: ["calligraphy", "serif"], collections: ["japan", "vintage"] },
    ],
  },
  {
    id: "korean",
    order: 100,
    name: { en: "Korean", vi: "Tiếng Hàn" },
    collections: ["cute", "journal"],
    cjk: true,
    fonts: [
      { id: "gaegu", styles: ["handwriting", "playful"], collections: ["cute", "journal", "handDrawn"] },
      { id: "gamja-flower", styles: ["handwriting", "playful"], collections: ["cute", "handDrawn"] },
      { id: "jua", styles: ["playful", "sans"], collections: ["cute"] },
      { id: "do-hyeon", styles: ["display", "sans"], collections: ["retro"] },
      { id: "black-han-sans", styles: ["display", "sans"], collections: ["minimal"] },
      { id: "cute-font", styles: ["playful", "display"], collections: ["cute"] },
      { id: "dokdo", styles: ["brush", "handwriting"], collections: ["handDrawn"] },
      { id: "east-sea-dokdo", styles: ["brush", "calligraphy"], collections: ["handDrawn", "vintage"] },
      { id: "gugi", styles: ["display", "retro"], collections: ["retro"] },
      { id: "hi-melody", styles: ["handwriting", "playful"], collections: ["cute", "journal"] },
      { id: "kirang-haerang", styles: ["display", "playful"], collections: ["cute", "handDrawn"] },
      { id: "nanum-brush-script", styles: ["brush", "handwriting"], collections: ["handDrawn", "journal"] },
      { id: "poor-story", styles: ["handwriting", "playful"], collections: ["cute", "journal"] },
      { id: "single-day", styles: ["handwriting", "playful"], collections: ["cute", "journal"] },
    ],
  },
  {
    id: "chinese",
    order: 110,
    name: { en: "Chinese", vi: "Tiếng Trung" },
    collections: ["tet", "midAutumn"],
    cjk: true,
    fonts: [
      { id: "zcool-kuaile", styles: ["playful", "display"], collections: ["cute", "tet"] },
      { id: "zcool-qingke-huangyou", styles: ["display", "playful"], collections: ["cute", "retro"] },
      { id: "zcool-xiaowei", styles: ["serif", "display"], collections: ["vintage", "tet", "midAutumn"] },
      { id: "ma-shan-zheng", styles: ["calligraphy", "brush"], collections: ["tet", "midAutumn", "vintage"] },
      { id: "zhi-mang-xing", styles: ["calligraphy", "handwriting"], collections: ["tet", "midAutumn", "journal"] },
      { id: "liu-jian-mao-cao", styles: ["calligraphy", "brush"], collections: ["tet", "vintage"] },
      { id: "long-cang", styles: ["handwriting", "calligraphy"], collections: ["journal", "tet"] },
      { id: "lxgw-wenkai-tc", styles: ["handwriting", "calligraphy"], collections: ["journal", "tet", "midAutumn"] },
      { id: "lxgw-marker-gothic", styles: ["handwriting", "sans"], collections: ["cute", "journal"] },
      { id: "cactus-classical-serif", styles: ["serif"], collections: ["vintage", "tet"] },
      { id: "chocolate-classical-sans", styles: ["sans"], collections: ["minimal", "journal"] },
      { id: "wdxl-lubrifont-sc", styles: ["display", "retro"], collections: ["retro", "tet"] },
    ],
  },
];

function parseArgs(argv) {
  const args = argv.slice(2);
  let targetPack = null;
  let onlyId = null;
  let force = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--force") force = true;
    else if (a === "--only") onlyId = args[++i];
    else if (!a.startsWith("--") && !targetPack) targetPack = a.replace(/^font\//, "");
  }
  return { targetPack, onlyId, force };
}

async function fetchJsonWithRetry(url, retries = 4) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function fetchBufferWithRetry(url, retries = 4) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function loadGoogleFontDesigners() {
  const map = new Map();
  try {
    const res = await fetch("https://fonts.google.com/metadata/fonts");
    if (res.ok) {
      const text = await res.text();
      const json = JSON.parse(text.slice(text.indexOf("{")));
      for (const item of json.familyMetadataList ?? []) {
        if (item.family && Array.isArray(item.designers) && item.designers.length > 0) {
          map.set(item.family.toLowerCase(), item.designers.join(", "));
        }
      }
    }
  } catch {
    // Fallback handled per font.
  }
  return map;
}

/** Choose up to 3 weights (normal style only), always including 400 if available. */
function selectWeights(availableWeights, isCjk) {
  const sorted = [...availableWeights].sort((a, b) => a - b);
  if (isCjk) {
    // Keep CJK fonts single-weight (400) so total size stays well under 8 MB.
    if (sorted.includes(400)) return [400];
    return [sorted[0]];
  }
  const picked = new Set();
  if (sorted.includes(400)) picked.add(400);
  else if (sorted.length > 0) picked.add(sorted[0]);

  for (const preferred of [700, 600, 500, 300, 800]) {
    if (picked.size >= 3) break;
    if (sorted.includes(preferred)) picked.add(preferred);
  }
  return [...picked].sort((a, b) => a - b);
}

/** Verify that a font's vietnamese unicode-range genuinely covers full Vietnamese diacritics. */
function hasFullVietnameseDiacritics(unicodeRangeMap) {
  const viRange = unicodeRangeMap?.vietnamese;
  if (!viRange || typeof viRange !== "string") return false;
  const upper = viRange.toUpperCase();
  return upper.includes("1EA0") && upper.includes("1EF9") && upper.includes("0110") && upper.includes("01AF");
}

/** Determine supported FONT_LANGUAGES for a font from Fontsource metadata. */
function detectLanguages(meta, packId) {
  const langs = new Set(["latin"]);
  if (hasFullVietnameseDiacritics(meta.unicodeRange)) {
    langs.add("vietnamese");
  }
  const subsets = new Set(meta.subsets ?? []);
  if (subsets.has("japanese") || packId === "japanese") langs.add("japanese");
  if (subsets.has("korean") || packId === "korean") langs.add("korean");
  if (subsets.has("chinese-simplified") || (packId === "chinese" && !subsets.has("chinese-traditional"))) {
    langs.add("chinese-simplified");
  }
  if (subsets.has("chinese-traditional")) {
    langs.add("chinese-traditional");
  }
  if (subsets.has("cyrillic")) langs.add("cyrillic");
  if (subsets.has("greek")) langs.add("greek");
  if (subsets.has("thai")) langs.add("thai");
  return [...langs];
}

/** Determine which unicodeRange subset keys to download for a font. */
function selectSubsets(unicodeRangeMap, isCjk) {
  const keys = Object.keys(unicodeRangeMap ?? {});
  const allowedNamed = new Set([
    "latin",
    "latin-ext",
    "vietnamese",
    ...(isCjk ? ["japanese", "korean", "chinese-simplified", "chinese-traditional"] : []),
  ]);
  return keys.filter((k) => {
    if (allowedNamed.has(k)) return true;
    if (isCjk && /^\[\d+\]$/.test(k)) return true;
    return false;
  });
}

async function runPool(items, concurrency, fn) {
  let idx = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (idx < items.length) {
      const cur = idx++;
      await fn(items[cur], cur);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const { targetPack, onlyId, force } = parseArgs(process.argv);
  const designersMap = await loadGoogleFontDesigners();

  // Verify no overlap with built-in fonts in src/lib/text/fonts.ts
  const fontsTs = readFileSync(path.join(ROOT, "src", "lib", "text", "fonts.ts"), "utf8");
  const builtinNames = new Set(
    [...fontsTs.matchAll(/label:\s*"([^"]+)"/g)].map((m) => m[1].toLowerCase())
  );

  const packsToRun = targetPack ? FONT_PACKS.filter((p) => p.id === targetPack) : FONT_PACKS;
  if (packsToRun.length === 0) {
    console.error(`Unknown font pack: ${targetPack}`);
    process.exit(1);
  }

  for (const packDef of packsToRun) {
    console.log(`\n=== Processing font pack: ${packDef.id} (${packDef.fonts.length} fonts) ===`);
    const manifestDir = path.join(ASSETS, "font", packDef.id);
    const manifestPath = path.join(manifestDir, "manifest.json");
    mkdirSync(manifestDir, { recursive: true });

    let existingItems = new Map();
    if (existsSync(manifestPath)) {
      try {
        const prev = JSON.parse(readFileSync(manifestPath, "utf8"));
        for (const it of prev.items ?? []) existingItems.set(it.id, it);
      } catch {
        // Ignore invalid previous manifest
      }
    }

    const items = [];
    for (const fontDef of packDef.fonts) {
      if (onlyId && fontDef.id !== onlyId) {
        if (existingItems.has(fontDef.id)) items.push(existingItems.get(fontDef.id));
        continue;
      }

      const prevItem = existingItems.get(fontDef.id);
      if (
        !force &&
        prevItem &&
        Array.isArray(prevItem.files) &&
        prevItem.files.length > 0 &&
        prevItem.files.every((f) => existsSync(path.join(PACKS, f.file)))
      ) {
        items.push(prevItem);
        console.log(`  [skip] ${fontDef.id} (${prevItem.files.length} files already cached)`);
        continue;
      }

      const metaUrl = `https://api.fontsource.org/v1/fonts/${fontDef.id}`;
      const meta = await fetchJsonWithRetry(metaUrl);
      if (builtinNames.has(meta.family.toLowerCase())) {
        console.warn(`  [warn] Skipping ${fontDef.id} (${meta.family}) - overlaps with built-in fonts.ts`);
        continue;
      }

      const weights = selectWeights(meta.weights ?? [400], Boolean(packDef.cjk));
      const subsetKeys = selectSubsets(meta.unicodeRange ?? {}, Boolean(packDef.cjk));
      const outDir = path.join(PACKS, "font", packDef.id, fontDef.id);
      mkdirSync(outDir, { recursive: true });

      const downloadTasks = [];
      for (const weight of weights) {
        const normalVariants = meta.variants?.[String(weight)]?.normal ?? {};
        for (const uKey of subsetKeys) {
          const cleanSubset = uKey.replace(/^\[|\]$/g, "");
          const unicodeRange = meta.unicodeRange[uKey];
          const woff2Url =
            normalVariants[cleanSubset]?.url?.woff2 ??
            `https://cdn.jsdelivr.net/fontsource/fonts/${fontDef.id}@latest/${cleanSubset}-${weight}-normal.woff2`;
          const relFile = `font/${packDef.id}/${fontDef.id}/${cleanSubset}-${weight}.woff2`;
          const absFile = path.join(PACKS, relFile);
          downloadTasks.push({ weight, subset: cleanSubset, file: relFile, absFile, unicodeRange, woff2Url });
        }
      }

      await runPool(downloadTasks, 16, async (t) => {
        if (!force && existsSync(t.absFile) && statSync(t.absFile).size > 0) return;
        const buf = await fetchBufferWithRetry(t.woff2Url);
        writeFileSync(t.absFile, buf);
      });

      const files = downloadTasks.map(({ weight, subset, file, unicodeRange }) => ({
        weight,
        subset,
        file,
        unicodeRange,
      }));

      const totalBytes = downloadTasks.reduce((sum, t) => sum + (existsSync(t.absFile) ? statSync(t.absFile).size : 0), 0);
      const languages = detectLanguages(meta, packDef.id);
      const license = meta.license === "Apache-2.0" ? "Apache-2.0" : "OFL-1.1";
      const author = designersMap.get(meta.family.toLowerCase()) ?? "Google Fonts Authors";
      const googleSpecimenUrl = `https://fonts.google.com/specimen/${encodeURIComponent(meta.family).replace(/%20/g, "+")}`;

      items.push({
        id: fontDef.id,
        family: meta.family,
        label: meta.family,
        styles: fontDef.styles,
        languages,
        weights,
        files,
        collections: fontDef.collections,
        source: {
          provider: "Google Fonts",
          url: googleSpecimenUrl,
          author,
          title: meta.family,
          license,
          retrieved: RETRIEVED_DATE,
        },
      });

      console.log(
        `  ✓ ${fontDef.id} (${meta.family}) — weights:[${weights.join(",")}] files:${files.length} size:${Math.round(totalBytes / 1024)}KB langs:[${languages.join(",")}]`
      );
    }

    const manifest = {
      id: packDef.id,
      kind: "font",
      name: packDef.name,
      collections: packDef.collections,
      order: packDef.order,
      items,
    };
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`Saved ${manifestPath} (${items.length} fonts)`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
