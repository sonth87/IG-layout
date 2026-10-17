// Asset catalog (M20, docs/architecture/asset-catalog.md): the libraries' content that
// is not drawn by code — stickers, frame art, textures, overlays, fonts — sourced from
// outside under a licence we may redistribute (D-106).
//
// Two sides:
// - assets/<kind>/<pack>/manifest.json — the source of truth, written by hand or by the
//   sourcing scripts (one manifest per pack, with every item's licence).
// - public/packs/ — what the app downloads: images (WebP) written by the processing
//   script, and JSON generated from the manifests by scripts/assets/build-catalog.mjs.

import type { CollectionId } from "./collections";
import type { LicenseId } from "./licenses";

export type CatalogKind = "sticker" | "frame" | "texture" | "overlay" | "font";

export interface Names {
  en: string;
  vi: string;
}

/** Where an item comes from; shown on the Thanks screen. */
export interface Source {
  /** Collection / site, e.g. "Smithsonian Open Access", "Open Doodles", "Google Fonts". */
  provider: string;
  /** Page of the item itself (not a search page). */
  url: string;
  /** Author / artist / foundry, when known. */
  author?: string;
  /** Original title, when the source has one. */
  title?: string;
  license: LicenseId;
  /** Licence text; required for "custom" licences (e.g. a font's own free-for-personal-use terms). */
  licenseUrl?: string;
  /** ISO date the item was downloaded. */
  retrieved: string;
}

/** A photo window in frame art, normalised to the art's size (0–1). */
export interface FrameWindow {
  x: number;
  y: number;
  w: number;
  h: number;
  /** rect (default), ellipse, or an SVG path in the same 0–1 space. */
  shape?: "rect" | "ellipse";
  path?: string;
  /** Turn of the window, degrees (a tilted polaroid in a stack). */
  rotation?: number;
}

// ---- assets/<kind>/<pack>/manifest.json ----------------------------------------

export interface ManifestItem {
  /** Unique inside the pack; kebab-case, ascii. The file names derive from it. */
  id: string;
  name: Names;
  /** Search words, both languages; the name is searched too. */
  tags: { en: string[]; vi: string[] };
  /** Extra collections besides the pack's own. */
  collections?: CollectionId[];
  source: Source;
  /** Image size after processing (px), filled by the processing script. */
  width?: number;
  height?: number;
  /** Frame art only: its photo windows (transparent holes); detected by the processing script, checked by eye. */
  windows?: FrameWindow[];
  /** Texture only: drawn as a repeating tile. */
  tile?: boolean;
  /** Overlay only: how it blends over the slide. */
  blend?: "screen" | "multiply" | "overlay" | "soft-light" | "normal";
  /** Hints for the processing script (sticker: skip background removal / trimming). */
  process?: { removeBg?: boolean; trim?: boolean };
}

export interface FontManifestItem {
  id: string;
  /** CSS family name used on the canvas, e.g. "Patrick Hand". */
  family: string;
  /** Kept as the font's own name in both languages. */
  label: string;
  styles: FontStyleTag[];
  /** Scripts it really covers (Vietnamese = every Vietnamese letter with its marks). */
  languages: FontLanguage[];
  /** Weights shipped (normal style; italics are not shipped). */
  weights: number[];
  /** Files written by the font script: one per weight and subset. */
  files: { weight: number; subset: string; file: string; unicodeRange: string }[];
  source: Source;
  collections?: CollectionId[];
}

export type FontStyleTag =
  | "sans"
  | "serif"
  | "display"
  | "handwriting"
  | "script"
  | "calligraphy"
  | "brush"
  | "fantasy"
  | "playful"
  | "retro"
  | "pixel"
  | "mono"
  | "festive"
  | "stencil"
  | "outline";

export type FontLanguage = "latin" | "vietnamese" | "japanese" | "korean" | "chinese-simplified" | "chinese-traditional" | "thai" | "cyrillic" | "greek";

export interface PackManifest {
  id: string;
  kind: CatalogKind;
  name: Names;
  /** Collections every item of the pack belongs to. */
  collections: CollectionId[];
  /** Sort order in the library (small first). */
  order: number;
  items: ManifestItem[] | FontManifestItem[];
}

// ---- public/packs/*.json (generated; what the app reads) ----------------------

export interface CatalogItem {
  id: string;
  name: Names;
  /** Lower-case search text, both languages. */
  search: string;
  collections: CollectionId[];
  /** Paths under /packs/. */
  file: string;
  thumb: string;
  width: number;
  height: number;
  /** Index into the catalog's credits. */
  credit: number;
  windows?: FrameWindow[];
  tile?: boolean;
  blend?: ManifestItem["blend"];
}

export interface CatalogPack {
  id: string;
  kind: CatalogKind;
  name: Names;
  collections: CollectionId[];
  order: number;
  count: number;
  /** Items file under /packs/ (loaded when the pack is opened). */
  file: string;
  /** A few items shown before the pack is opened. */
  preview: CatalogItem[];
}

export interface CatalogFont extends Omit<FontManifestItem, "source"> {
  credit: number;
  search: string;
}

export interface Credit {
  provider: string;
  author?: string;
  license: LicenseId;
  licenseUrl?: string;
  /** Page of the source (the provider's home when many items share it). */
  url: string;
  items: number;
}

export interface Catalog {
  version: number;
  packs: CatalogPack[];
  fonts: CatalogFont[];
  credits: Credit[];
}
