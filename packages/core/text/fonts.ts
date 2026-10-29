import { loadCatalog, packUrl, useCatalog } from "../catalog/load";
import type { CatalogFont, FontLanguage, FontStyleTag } from "../catalog/types";
import type { BuiltinFontKey, FontKey, TextElement } from "../project/types";

// Text fonts for canvas text (M5, M11). Labels stay as the font names. Families by
// name: their @font-face rules come from app/fonts.ts (loaded with the app) and
// lib/text/webfonts.ts (loaded with the editor).

export type FontCategory = "sans" | "serif" | "display" | "script" | "mono";
export const FONT_CATEGORIES: FontCategory[] = ["sans", "serif", "display", "script", "mono"];

/** Available weights: a range for variable fonts, a list for static ones. */
export type FontWeights = { min: number; max: number } | number[];

export interface TextFont {
  label: string;
  family: string;
  category: FontCategory;
  weights: FontWeights;
  /** Finer styles (catalog fonts, M20); built-ins derive them from the category. */
  styles?: FontStyleTag[];
  /** Scripts covered; built-ins are all Latin + Vietnamese (D-32). */
  languages?: FontLanguage[];
}

export const TEXT_FONTS: Record<BuiltinFontKey, TextFont> = {
  beVietnam: { label: "Be Vietnam Pro", family: "'Be Vietnam Pro'", category: "sans", weights: [300, 400, 500, 600, 700, 800] },
  playfair: { label: "Playfair Display", family: "'Playfair Display'", category: "serif", weights: { min: 400, max: 900 } },
  lora: { label: "Lora", family: "'Lora'", category: "serif", weights: { min: 400, max: 700 } },
  montserrat: { label: "Montserrat", family: "'Montserrat'", category: "sans", weights: { min: 100, max: 900 } },
  dancing: { label: "Dancing Script", family: "'Dancing Script'", category: "script", weights: { min: 400, max: 700 } },
  spaceGrotesk: { label: "Space Grotesk", family: "'Space Grotesk'", category: "sans", weights: { min: 300, max: 700 } },
  inter: { label: "Inter", family: "'Inter'", category: "sans", weights: { min: 100, max: 900 } },
  manrope: { label: "Manrope", family: "'Manrope'", category: "sans", weights: { min: 200, max: 800 } },
  jakarta: { label: "Plus Jakarta Sans", family: "'Plus Jakarta Sans'", category: "sans", weights: { min: 200, max: 800 } },
  lexend: { label: "Lexend", family: "'Lexend'", category: "sans", weights: { min: 100, max: 900 } },
  nunito: { label: "Nunito", family: "'Nunito'", category: "sans", weights: { min: 200, max: 1000 } },
  quicksand: { label: "Quicksand", family: "'Quicksand'", category: "sans", weights: { min: 300, max: 700 } },
  raleway: { label: "Raleway", family: "'Raleway'", category: "sans", weights: { min: 100, max: 900 } },
  workSans: { label: "Work Sans", family: "'Work Sans'", category: "sans", weights: { min: 100, max: 900 } },
  josefin: { label: "Josefin Sans", family: "'Josefin Sans'", category: "sans", weights: { min: 100, max: 700 } },
  openSans: { label: "Open Sans", family: "'Open Sans'", category: "sans", weights: { min: 300, max: 800 } },
  roboto: { label: "Roboto", family: "'Roboto'", category: "sans", weights: { min: 100, max: 900 } },
  mulish: { label: "Mulish", family: "'Mulish'", category: "sans", weights: { min: 200, max: 1000 } },
  archivo: { label: "Archivo", family: "'Archivo'", category: "sans", weights: { min: 100, max: 900 } },
  bricolage: { label: "Bricolage Grotesque", family: "'Bricolage Grotesque'", category: "sans", weights: { min: 200, max: 800 } },
  hanken: { label: "Hanken Grotesk", family: "'Hanken Grotesk'", category: "sans", weights: { min: 100, max: 900 } },
  comfortaa: { label: "Comfortaa", family: "'Comfortaa'", category: "sans", weights: { min: 300, max: 700 } },
  kanit: { label: "Kanit", family: "'Kanit'", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  prompt: { label: "Prompt", family: "'Prompt'", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  geologica: { label: "Geologica", family: "'Geologica'", category: "sans", weights: { min: 100, max: 900 } },
  fraunces: { label: "Fraunces", family: "'Fraunces'", category: "serif", weights: { min: 100, max: 900 } },
  ebGaramond: { label: "EB Garamond", family: "'EB Garamond'", category: "serif", weights: { min: 400, max: 800 } },
  cormorant: { label: "Cormorant Garamond", family: "'Cormorant Garamond'", category: "serif", weights: { min: 300, max: 700 } },
  bodoni: { label: "Libre Bodoni", family: "'Libre Bodoni'", category: "serif", weights: { min: 400, max: 700 } },
  newsreader: { label: "Newsreader", family: "'Newsreader'", category: "serif", weights: { min: 200, max: 800 } },
  literata: { label: "Literata", family: "'Literata'", category: "serif", weights: { min: 200, max: 900 } },
  crimson: { label: "Crimson Pro", family: "'Crimson Pro'", category: "serif", weights: { min: 200, max: 900 } },
  bitter: { label: "Bitter", family: "'Bitter'", category: "serif", weights: { min: 100, max: 900 } },
  merriweather: { label: "Merriweather", family: "'Merriweather'", category: "serif", weights: { min: 300, max: 900 } },
  vollkorn: { label: "Vollkorn", family: "'Vollkorn'", category: "serif", weights: { min: 400, max: 900 } },
  alegreya: { label: "Alegreya", family: "'Alegreya'", category: "serif", weights: { min: 400, max: 900 } },
  sourceSerif: { label: "Source Serif 4", family: "'Source Serif 4'", category: "serif", weights: { min: 200, max: 900 } },
  robotoSlab: { label: "Roboto Slab", family: "'Roboto Slab'", category: "serif", weights: { min: 100, max: 900 } },
  brygada: { label: "Brygada 1918", family: "'Brygada 1918'", category: "serif", weights: { min: 400, max: 700 } },
  yeseva: { label: "Yeseva One", family: "'Yeseva One'", category: "serif", weights: [400] },
  taviraj: { label: "Taviraj", family: "'Taviraj'", category: "serif", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  oswald: { label: "Oswald", family: "'Oswald'", category: "display", weights: { min: 200, max: 700 } },
  anton: { label: "Anton", family: "'Anton'", category: "display", weights: [400] },
  bungee: { label: "Bungee", family: "'Bungee'", category: "display", weights: [400] },
  unbounded: { label: "Unbounded", family: "'Unbounded'", category: "display", weights: { min: 200, max: 900 } },
  bigShoulders: { label: "Big Shoulders", family: "'Big Shoulders'", category: "display", weights: { min: 100, max: 900 } },
  anybody: { label: "Anybody", family: "'Anybody'", category: "display", weights: { min: 100, max: 900 } },
  leagueSpartan: { label: "League Spartan", family: "'League Spartan'", category: "display", weights: { min: 100, max: 900 } },
  smooch: { label: "Smooch Sans", family: "'Smooch Sans'", category: "display", weights: { min: 100, max: 900 } },
  yanone: { label: "Yanone Kaffeesatz", family: "'Yanone Kaffeesatz'", category: "display", weights: { min: 200, max: 700 } },
  tektur: { label: "Tektur", family: "'Tektur'", category: "display", weights: { min: 400, max: 900 } },
  museo: { label: "MuseoModerno", family: "'MuseoModerno'", category: "display", weights: { min: 100, max: 900 } },
  grenze: { label: "Grenze Gotisch", family: "'Grenze Gotisch'", category: "display", weights: { min: 100, max: 900 } },
  dela: { label: "Dela Gothic One", family: "'Dela Gothic One'", category: "display", weights: [400] },
  paytone: { label: "Paytone One", family: "'Paytone One'", category: "display", weights: [400] },
  chonburi: { label: "Chonburi", family: "'Chonburi'", category: "display", weights: [400] },
  amatic: { label: "Amatic SC", family: "'Amatic SC'", category: "display", weights: [400, 700] },
  pacifico: { label: "Pacifico", family: "'Pacifico'", category: "script", weights: [400] },
  greatVibes: { label: "Great Vibes", family: "'Great Vibes'", category: "script", weights: [400] },
  lobster: { label: "Lobster", family: "'Lobster'", category: "script", weights: [400] },
  charm: { label: "Charm", family: "'Charm'", category: "script", weights: [400, 700] },
  allura: { label: "Allura", family: "'Allura'", category: "script", weights: [400] },
  pinyon: { label: "Pinyon Script", family: "'Pinyon Script'", category: "script", weights: [400] },
  playball: { label: "Playball", family: "'Playball'", category: "script", weights: [400] },
  corinthia: { label: "Corinthia", family: "'Corinthia'", category: "script", weights: [400, 700] },
  moonDance: { label: "Moon Dance", family: "'Moon Dance'", category: "script", weights: [400] },
  patrickHand: { label: "Patrick Hand", family: "'Patrick Hand'", category: "script", weights: [400] },
  itim: { label: "Itim", family: "'Itim'", category: "script", weights: [400] },
  mali: { label: "Mali", family: "'Mali'", category: "script", weights: [200, 300, 400, 500, 600, 700] },
  shantell: { label: "Shantell Sans", family: "'Shantell Sans'", category: "script", weights: { min: 300, max: 800 } },
  playpen: { label: "Playpen Sans", family: "'Playpen Sans'", category: "script", weights: { min: 100, max: 800 } },
  merienda: { label: "Merienda", family: "'Merienda'", category: "script", weights: { min: 300, max: 900 } },
  gluten: { label: "Gluten", family: "'Gluten'", category: "script", weights: { min: 100, max: 900 } },
  sriracha: { label: "Sriracha", family: "'Sriracha'", category: "script", weights: [400] },
  jetbrains: { label: "JetBrains Mono", family: "'JetBrains Mono'", category: "mono", weights: { min: 100, max: 800 } },
  spaceMono: { label: "Space Mono", family: "'Space Mono'", category: "mono", weights: [400, 700] },
  robotoMono: { label: "Roboto Mono", family: "'Roboto Mono'", category: "mono", weights: { min: 100, max: 700 } },
  recursive: { label: "Recursive", family: "'Recursive'", category: "mono", weights: { min: 300, max: 1000 } },
};

// ── Catalog fonts (M20 C5) ─────────────────────────────────────────────────

const CATEGORY_OF: Partial<Record<FontStyleTag, FontCategory>> = { serif: "serif", mono: "mono", handwriting: "script", script: "script", calligraphy: "script", brush: "script" };

export const isCatalogFont = (key: string): key is `c:${string}` => key.startsWith("c:");

function catalogFont(key: string): CatalogFont | undefined {
  return useCatalog.getState().catalog?.fonts.find((f) => f.id === key.slice(2));
}

/** Label, family and weights of any font: built-in or catalog. */
export function fontInfo(key: FontKey): TextFont {
  if (!isCatalogFont(key)) return TEXT_FONTS[key] ?? TEXT_FONTS.beVietnam;
  const f = catalogFont(key);
  // Not in the catalog (yet): draw with the default font meanwhile.
  if (!f) return { ...TEXT_FONTS.beVietnam, label: key.slice(2) };
  return { label: f.label, family: `'c-${f.id}'`, category: f.styles.map((s) => CATEGORY_OF[s]).find(Boolean) ?? "display", weights: f.weights, styles: f.styles, languages: f.languages };
}

/** @font-face rules of every catalog font, added once: the browser fetches a file only when text needs it. */
let faces = false;
function addCatalogFaces(fonts: CatalogFont[]) {
  if (faces || typeof document === "undefined" || fonts.length === 0) return;
  faces = true;
  const css = fonts
    .flatMap((f) => f.files.map((file) => `@font-face{font-family:'c-${f.id}';font-style:normal;font-weight:${file.weight};font-display:swap;src:url(${packUrl(file.file)}) format('woff2');unicode-range:${file.unicodeRange};}`))
    .join("\n");
  const style = document.createElement("style");
  style.dataset.catalogFonts = "";
  style.textContent = css;
  document.head.appendChild(style);
}

/** Loads the catalog and declares its fonts (call before showing or drawing them). */
export async function prepareCatalogFonts() {
  const catalog = await loadCatalog();
  addCatalogFaces(catalog.fonts);
  return catalog.fonts;
}

/** The weight closest to `wanted` that the font has. */
export function nearestWeight(font: FontKey, wanted: number) {
  const w = fontInfo(font).weights;
  if (!Array.isArray(w)) return Math.max(w.min, Math.min(w.max, wanted));
  return w.reduce((best, x) => (Math.abs(x - wanted) < Math.abs(best - wanted) ? x : best), w[0]);
}

/** Weight a text is drawn with: explicit `weight` (M11), else bold / regular (older texts). */
export function fontWeight(el: Pick<TextElement, "font" | "bold" | "weight">) {
  return nearestWeight(el.font, el.weight ?? (el.bold ? 700 : 400));
}

/** Canvas text only renders a web font once it is loaded: load it explicitly. */
export async function loadFont(font: FontKey, weight: number, sample = "Đà Lạt ấm áp") {
  if (typeof document === "undefined" || !document.fonts) return;
  if (isCatalogFont(font)) await prepareCatalogFonts();
  // A Vietnamese sample makes sure the Vietnamese subset is fetched too.
  await document.fonts.load(`${weight} 64px ${fontInfo(font).family}`, sample).catch(() => undefined);
}
