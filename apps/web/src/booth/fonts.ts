import { Fraunces, Space_Mono } from "next/font/google";

// The booth's own type (Cinema look, D-150: its own UI): Fraunces, a soft, heavy display
// serif for the sign and titles, and a mono for labels, like a cinema ticket. Both have
// Vietnamese glyphs (D-32). Loaded only on /booth.

export const boothSerif = Fraunces({
  variable: "--font-booth-serif",
  subsets: ["latin", "vietnamese"],
  axes: ["SOFT", "WONK", "opsz"],
});

export const boothMono = Space_Mono({
  variable: "--font-booth-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
});

/** For drawing on canvas: the font-family strings next/font generated. */
export const canvasFonts = { serif: boothSerif.style.fontFamily, mono: boothMono.style.fontFamily };
