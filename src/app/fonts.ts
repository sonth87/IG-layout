import { Be_Vietnam_Pro, Dancing_Script, Lora, Montserrat, Playfair_Display, Space_Grotesk } from "next/font/google";

// All fonts include Vietnamese glyphs (D-32, D-41). Self-hosted by next/font at build time.
// Be Vietnam Pro + Space Grotesk are also the UI fonts.

export const beVietnam = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["500", "700"],
});

export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "700"],
});

export const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "700"],
});

export const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "700"],
});

export const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "700"],
});

export const fontVariables = [beVietnam, spaceGrotesk, playfair, lora, montserrat, dancing].map((f) => f.variable).join(" ");
