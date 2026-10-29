import { Bungee, Chakra_Petch, Coiny, Cormorant_Garamond, Fraunces, Space_Mono } from "next/font/google";
import { anton, beVietnam, dancing, greatVibes, patrickHand, playfair } from "@/app/fonts";

// The booth's own type (Cinema look, D-150: its own UI): Fraunces, a soft, heavy display
// serif for the sign and titles, and a mono for labels, like a cinema ticket. The themes'
// faces (Candy, Alice, Y2K, and IG Layout's handwriting / script / poster faces) load only
// when a print uses them (preload: false). All have
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

const candy = Coiny({ subsets: ["latin", "vietnamese"], weight: ["400"], preload: false });
const alice = Cormorant_Garamond({ subsets: ["latin", "vietnamese"], weight: ["600", "700"], style: ["italic"], preload: false });
const y2k = Bungee({ subsets: ["latin", "vietnamese"], weight: ["400"], preload: false });
const tech = Chakra_Petch({ subsets: ["latin", "vietnamese"], weight: ["700"], preload: false });

/** For drawing on canvas: the font-family strings next/font generated, by role (themes.ts). */
export const canvasFonts = {
  serif: boothSerif.style.fontFamily,
  mono: boothMono.style.fontFamily,
  body: beVietnam.style.fontFamily,
  candy: candy.style.fontFamily,
  alice: alice.style.fontFamily,
  y2k: y2k.style.fontFamily,
  hand: patrickHand.style.fontFamily,
  script: greatVibes.style.fontFamily,
  brush: dancing.style.fontFamily,
  poster: anton.style.fontFamily,
  news: playfair.style.fontFamily,
  tech: tech.style.fontFamily,
};
