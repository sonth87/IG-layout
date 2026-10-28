import { Anton, Be_Vietnam_Pro, Cormorant_Garamond, Dancing_Script, Great_Vibes, Lora, Montserrat, Patrick_Hand, Playfair_Display, Space_Grotesk } from "next/font/google";

// Fonts loaded with the app: the UI fonts (Be Vietnam Pro, Space Grotesk) and the text
// fonts used by the home template library. All 70+ text fonts: lib/text/webfonts.ts,
// loaded with the editor (M11). Every font has Vietnamese glyphs (D-32).

export const beVietnam = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "vietnamese"],
  // Also the UI font (preloaded): only the useful weights.
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  preload: false,
});

export const lora = Lora({
  subsets: ["latin", "vietnamese"],
  preload: false,
});

export const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  preload: false,
});

export const dancing = Dancing_Script({
  subsets: ["latin", "vietnamese"],
  preload: false,
});

// Also used by home templates (2026-10-28): editorial serif, condensed display,
// calligraphy and handwriting. Declared here so they draw on the home screen; a file is
// fetched only when a template shows the font.
export const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

export const anton = Anton({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

export const greatVibes = Great_Vibes({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

export const patrickHand = Patrick_Hand({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext", "vietnamese"],
});

export const fontVariables = [beVietnam, spaceGrotesk].map((f) => f.variable).join(" ");
