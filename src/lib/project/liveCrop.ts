import type { Rect } from "./types";

// Crop being changed by a two-finger pinch inside a frame (drawn live by ImageNode,
// committed as one history step when the fingers are lifted).
export const liveCrops = new Map<string, Rect>();
