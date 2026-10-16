import {
  Alegreya,
  Allura,
  Amatic_SC,
  Anton,
  Anybody,
  Archivo,
  Big_Shoulders,
  Bitter,
  Bricolage_Grotesque,
  Brygada_1918,
  Bungee,
  Charm,
  Chonburi,
  Comfortaa,
  Corinthia,
  Cormorant_Garamond,
  Crimson_Pro,
  Dela_Gothic_One,
  EB_Garamond,
  Fraunces,
  Geologica,
  Gluten,
  Great_Vibes,
  Grenze_Gotisch,
  Hanken_Grotesk,
  Inter,
  Itim,
  JetBrains_Mono,
  Josefin_Sans,
  Kanit,
  League_Spartan,
  Lexend,
  Libre_Bodoni,
  Literata,
  Lobster,
  Mali,
  Manrope,
  Merienda,
  Merriweather,
  Moon_Dance,
  Mulish,
  MuseoModerno,
  Newsreader,
  Nunito,
  Open_Sans,
  Oswald,
  Pacifico,
  Patrick_Hand,
  Paytone_One,
  Pinyon_Script,
  Playball,
  Playpen_Sans,
  Plus_Jakarta_Sans,
  Prompt,
  Quicksand,
  Raleway,
  Recursive,
  Roboto,
  Roboto_Mono,
  Roboto_Slab,
  Shantell_Sans,
  Smooch_Sans,
  Source_Serif_4,
  Space_Mono,
  Sriracha,
  Taviraj,
  Tektur,
  Unbounded,
  Vollkorn,
  Work_Sans,
  Yanone_Kaffeesatz,
  Yeseva_One,
} from "next/font/google";

// The rest of the text fonts (M11, S12: SCRL has 70+). Imported by the editor only, so
// their @font-face CSS loads with the editor, not with the home screen. Not preloaded:
// a font file is fetched the first time a text uses it, then cached for offline.
// Families are referenced by name in lib/text/fonts.ts (no generated fallback fonts).
// Generated list; every font has Vietnamese glyphs (D-32).

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const lexend = Lexend({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const raleway = Raleway({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const workSans = Work_Sans({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const josefin = Josefin_Sans({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const openSans = Open_Sans({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const mulish = Mulish({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const archivo = Archivo({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const hanken = Hanken_Grotesk({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const comfortaa = Comfortaa({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const kanit = Kanit({
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  preload: false,
  adjustFontFallback: false,
});

const prompt = Prompt({
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  preload: false,
  adjustFontFallback: false,
});

const geologica = Geologica({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const fraunces = Fraunces({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const ebGaramond = EB_Garamond({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const bodoni = Libre_Bodoni({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const newsreader = Newsreader({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const literata = Literata({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const crimson = Crimson_Pro({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const bitter = Bitter({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const merriweather = Merriweather({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const vollkorn = Vollkorn({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const alegreya = Alegreya({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const brygada = Brygada_1918({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const yeseva = Yeseva_One({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const taviraj = Taviraj({
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  preload: false,
  adjustFontFallback: false,
});

const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const anton = Anton({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const bungee = Bungee({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const unbounded = Unbounded({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const bigShoulders = Big_Shoulders({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const anybody = Anybody({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const leagueSpartan = League_Spartan({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const smooch = Smooch_Sans({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const yanone = Yanone_Kaffeesatz({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const tektur = Tektur({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const museo = MuseoModerno({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const grenze = Grenze_Gotisch({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const dela = Dela_Gothic_One({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const paytone = Paytone_One({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const chonburi = Chonburi({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const amatic = Amatic_SC({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  preload: false,
  adjustFontFallback: false,
});

const pacifico = Pacifico({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const greatVibes = Great_Vibes({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const lobster = Lobster({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const charm = Charm({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  preload: false,
  adjustFontFallback: false,
});

const allura = Allura({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const pinyon = Pinyon_Script({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const playball = Playball({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const corinthia = Corinthia({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  preload: false,
  adjustFontFallback: false,
});

const moonDance = Moon_Dance({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const patrickHand = Patrick_Hand({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const itim = Itim({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const mali = Mali({
  subsets: ["latin", "vietnamese"],
  weight: ["200", "300", "400", "500", "600", "700"],
  preload: false,
  adjustFontFallback: false,
});

const shantell = Shantell_Sans({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const playpen = Playpen_Sans({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const merienda = Merienda({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const gluten = Gluten({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const sriracha = Sriracha({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  preload: false,
  adjustFontFallback: false,
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const spaceMono = Space_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  preload: false,
  adjustFontFallback: false,
});

const robotoMono = Roboto_Mono({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

const recursive = Recursive({
  subsets: ["latin", "vietnamese"],
  preload: false,
  adjustFontFallback: false,
});

/** Keeps the declarations alive (next/font emits the CSS for each call). */
export const WEB_FONTS = [inter, manrope, jakarta, lexend, nunito, quicksand, raleway, workSans, josefin, openSans, roboto, mulish, archivo, bricolage, hanken, comfortaa, kanit, prompt, geologica, fraunces, ebGaramond, cormorant, bodoni, newsreader, literata, crimson, bitter, merriweather, vollkorn, alegreya, sourceSerif, robotoSlab, brygada, yeseva, taviraj, oswald, anton, bungee, unbounded, bigShoulders, anybody, leagueSpartan, smooch, yanone, tektur, museo, grenze, dela, paytone, chonburi, amatic, pacifico, greatVibes, lobster, charm, allura, pinyon, playball, corinthia, moonDance, patrickHand, itim, mali, shantell, playpen, merienda, gluten, sriracha, jetbrains, spaceMono, robotoMono, recursive].length;
