import { Playfair_Display, Space_Mono } from "next/font/google";

// The booth's own type (Cinema look, D-150: its own UI): a bold serif for titles and a
// mono for labels, like a cinema ticket. Both have Vietnamese glyphs (D-32). Loaded only
// on /booth.

export const boothSerif = Playfair_Display({
  variable: "--font-booth-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["700", "900"],
});

export const boothMono = Space_Mono({
  variable: "--font-booth-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
});

/** For drawing on canvas: the font-family strings next/font generated. */
export const canvasFonts = { serif: boothSerif.style.fontFamily, mono: boothMono.style.fontFamily };
