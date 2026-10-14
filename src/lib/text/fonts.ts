import { beVietnam, dancing, lora, montserrat, playfair, spaceGrotesk } from "@/app/fonts";
import type { FontKey } from "@/lib/project/types";

// Text fonts for canvas text (M5). Labels stay as the font names.

export const TEXT_FONTS: Record<FontKey, { label: string; family: string }> = {
  beVietnam: { label: "Be Vietnam Pro", family: beVietnam.style.fontFamily },
  playfair: { label: "Playfair Display", family: playfair.style.fontFamily },
  lora: { label: "Lora", family: lora.style.fontFamily },
  montserrat: { label: "Montserrat", family: montserrat.style.fontFamily },
  dancing: { label: "Dancing Script", family: dancing.style.fontFamily },
  spaceGrotesk: { label: "Space Grotesk", family: spaceGrotesk.style.fontFamily },
};

export function fontWeight(bold: boolean) {
  return bold ? 700 : 400;
}

/** Canvas text only renders a web font once it is loaded: load it explicitly. */
export function loadFont(font: FontKey, bold: boolean) {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  // A Vietnamese sample makes sure the Vietnamese subset is fetched too.
  return document.fonts
    .load(`${fontWeight(bold)} 64px ${TEXT_FONTS[font].family}`, "Đà Lạt ấm áp")
    .then(() => undefined)
    .catch(() => undefined);
}
