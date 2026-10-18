// Sample lines for the font list (M20 C5): shown when the text has nothing of its own.
// The list itself is assets/text/preview-sentences.json (G6).

import data from "../../../assets/text/preview-sentences.json";

export const PREVIEW_SENTENCES: Record<"vi" | "en" | "ja" | "ko" | "zh", string[]> = data;
