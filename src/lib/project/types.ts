// Project data model. All coordinates are in export pixels: one slide is
// slideSize(ratio) wide/high, and the canvas is slideCount slides side by side.
// Full design: docs/architecture/editor-model.md.

import type { PathShape } from "@/lib/elements/shapeLibrary";
import type { Adjustments, FilterRef } from "@/lib/color/params";

export type ProjectType = "post" | "story" | "grid";

/**
 * Slide shape: "w:h" (any ratio, 1080 px wide) or "1080x<height>" for a custom height
 * (M18, editor-v2/04). The four original ratios keep their names.
 */
export type AspectRatio = `${number}:${number}` | `1080x${number}`;

/** Size of one slide in export pixels: always 1080 wide. */
export function slideSize(ratio: AspectRatio): { width: number; height: number } {
  const custom = /^1080x(\d+)$/.exec(ratio);
  if (custom) return { width: 1080, height: Number(custom[1]) };
  const [w, h] = ratio.split(":").map(Number);
  return { width: 1080, height: w > 0 && h > 0 ? Math.round((1080 * h) / w) : 1350 };
}

/** Custom heights Instagram accepts: 1.91:1 (565) to 9:16 (1920). */
export const CUSTOM_HEIGHT = { min: 565, max: 1920 };

export const POST_RATIOS: AspectRatio[] = ["1:1", "4:5", "3:4"];

export const MAX_SLIDES = 20;

export interface ImageAsset {
  id: string;
  blob: Blob;
  /** Object URL of `blob`, used for rendering. */
  url: string;
  width: number;
  height: number;
  name: string;
  /** Video (M13): `blob` is an MP4 (compressed on import); `poster` is its first frame. */
  video?: VideoInfo;
  /** Music (M13.4): `blob` is an AAC audio file (M4A); width / height are 0. */
  audio?: { duration: number };
}

/** URL to show an asset as a still picture (videos: their first frame). */
export function stillUrl(a: Pick<ImageAsset, "url" | "video">) {
  return a.video?.posterUrl ?? a.url;
}

export interface VideoInfo {
  /** Seconds. */
  duration: number;
  hasAudio: boolean;
  poster: Blob;
  /** Object URL of `poster` (runtime only). */
  posterUrl: string;
}

/** Playback settings of a video element (M13). Times in seconds of the source video. */
export interface MediaSettings {
  muted: boolean;
  /** 0..1 */
  volume: number;
  start: number;
  end: number;
  /** Playback speed (M13.2): 0.5 … 2. Sound is off when not 1. Default 1. */
  speed?: number;
  /** Repeat the part when the slide lasts longer (default), or hold the last frame. */
  loop?: boolean;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MASK_SHAPES = ["none", "rounded", "circle", "arch", "heart", "star", "hexagon", "blob"] as const;
export type MaskShape = (typeof MASK_SHAPES)[number];

export interface Border {
  width: number;
  color: string;
}

export type Background =
  | { kind: "color"; color: string }
  | {
      kind: "gradient";
      from: string;
      to: string;
      angle: number;
      /** Custom gradient (M19): colour stops (0..1), from / to then mirror the ends. */
      stops?: { color: string; at: number }[];
      /** Radiating from the middle instead of along `angle`. */
      radial?: boolean;
    }
  | { kind: "blur"; assetId: string }
  /**
   * A drawn texture tile (lib/elements/textures), repeated (M19). From a pack (M20):
   * `texture` is the catalog id and `assetId` the project's copy of the picture —
   * repeated when `tile`, else covering the canvas.
   */
  | { kind: "texture"; texture: string; assetId?: string; tile?: boolean };

interface ElementBase {
  id: string;
  /** Top-left of the frame before rotation. Rotation is around the frame center. */
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  /** Locked: not draggable / resizable (e.g. a background photo). Still selectable for its tools. */
  locked?: boolean;
  /** Hidden: not drawn on the canvas nor exported (layers panel, S8). */
  hidden?: boolean;
  /** Animation (M13.3): how it enters / leaves the slide; photos can also drift (Ken Burns). */
  motion?: Motion;
  /** Created by a layout; replaced when another layout is applied (user-added items are kept). */
  fromLayout?: boolean;
  /** Inside a layout block (M14, editor-v2/02): the block's id. Geometry is driven by the block. */
  parentId?: string;
}

export const ANIM_IN = ["fade", "slideUp", "slideDown", "slideLeft", "slideRight", "zoom", "pop", "typewriter"] as const;
export type AnimIn = (typeof ANIM_IN)[number];
export const ANIM_OUT = ["fade", "slideUp", "slideDown", "slideLeft", "slideRight", "zoom"] as const;
export type AnimOut = (typeof ANIM_OUT)[number];
export const KEN_BURNS = ["zoomIn", "zoomOut", "panLeft", "panRight"] as const;
/** Continuous motion for the whole slide (M13.3 "hiệu ứng động"). */
export const ANIM_LOOP = ["pulse", "float", "flicker", "spin", "shake"] as const;
export type AnimLoop = (typeof ANIM_LOOP)[number];
export type KenBurns = (typeof KEN_BURNS)[number];

export interface Motion {
  in?: AnimIn;
  /** Seconds (default 0.6). */
  inDuration?: number;
  /** Seconds after the slide starts before it enters (default 0). */
  delay?: number;
  out?: AnimOut;
  /** Seconds, ending with the slide (default 0.6). */
  outDuration?: number;
  /** Photos / videos: slow zoom or pan of the picture inside its frame, over the whole slide. */
  kenBurns?: KenBurns;
  /** Keeps moving while the slide plays (pulse, float, flicker, spin, shake). */
  loop?: AnimLoop;
}

export const FRAME_STYLES = ["none", "polaroid", "white", "film", "black", "polaroidBlack", "gallery"] as const;

/** Frame colour (film draws its own strip). */
export function frameColor(frame: FrameStyle) {
  return frame === "black" || frame === "polaroidBlack" ? "#141414" : "#ffffff";
}
export type FrameStyle = (typeof FRAME_STYLES)[number];

export interface ShadowStyle {
  /** 0..1 */
  opacity: number;
  /** Direction the shadow falls, degrees (90 = straight down). */
  angle: number;
  /** Export px. */
  distance: number;
  blur: number;
  color: string;
}

export interface ImageElement extends ElementBase {
  type: "image";
  /** null = empty template slot. */
  assetId: string | null;
  /** Region of the image shown in the frame, in image pixels. */
  crop: Rect;
  /** Degrees; rotates the image inside the frame (auto-zoomed to keep it covered). */
  straighten: number;
  /** 3D tilt of the picture in its frame (D-111 part 2), degrees around the frame's horizontal (x) and vertical (y) axes; seen in perspective. */
  tiltX?: number;
  tiltY?: number;
  flipX: boolean;
  flipY: boolean;
  mask: MaskShape;
  /** Outline instead of `mask` (M20: a pack frame's torn window): polygon [x0, y0, x1, y1…] in 0–1 of the frame. */
  maskPoints?: number[];
  /** For the "rounded" mask, in export pixels. */
  cornerRadius: number;
  border: Border | null;
  shadow: boolean;
  /** Radius of each corner (top-left, top-right, bottom-right, bottom-left) instead of `cornerRadius` (M17). */
  corners?: [number, number, number, number];
  /** How the shadow looks once tuned in the Style sheet (M17); absent = the soft default. */
  shadowStyle?: ShadowStyle;
  /** The photo before background removal / cut-out / eraser (M19): "Restore background" goes back to it. */
  originalAssetId?: string;
  /** Template cell: dragging pans the photo inside instead of moving the frame. */
  slot: boolean;
  /** Manual colour adjustments (M4). */
  adjust: Adjustments;
  filter: FilterRef | null;
  /** Decorative frame around the photo (M5); the photo fills the inner area. */
  frame: FrameStyle;
  /** How it mixes with what is below (M11 overlays: light leaks "screen", paper "multiply"). */
  blend?: BlendMode;
  /** Video elements (asset is a video, M13): sound and the part that plays. */
  media?: MediaSettings;
}

export const BLEND_MODES = ["normal", "screen", "multiply", "overlay", "soft-light"] as const;
export type BlendMode = (typeof BLEND_MODES)[number];

export const FONT_KEYS = ["beVietnam", "playfair", "lora", "montserrat", "dancing", "spaceGrotesk", "inter", "manrope", "jakarta", "lexend", "nunito", "quicksand", "raleway", "workSans", "josefin", "openSans", "roboto", "mulish", "archivo", "bricolage", "hanken", "comfortaa", "kanit", "prompt", "geologica", "fraunces", "ebGaramond", "cormorant", "bodoni", "newsreader", "literata", "crimson", "bitter", "merriweather", "vollkorn", "alegreya", "sourceSerif", "robotoSlab", "brygada", "yeseva", "taviraj", "oswald", "anton", "bungee", "unbounded", "bigShoulders", "anybody", "leagueSpartan", "smooch", "yanone", "tektur", "museo", "grenze", "dela", "paytone", "chonburi", "amatic", "pacifico", "greatVibes", "lobster", "charm", "allura", "pinyon", "playball", "corinthia", "moonDance", "patrickHand", "itim", "mali", "shantell", "playpen", "merienda", "gluten", "sriracha", "jetbrains", "spaceMono", "robotoMono", "recursive"] as const;
export type BuiltinFontKey = (typeof FONT_KEYS)[number];
/** A built-in font, or a catalog font (M20) as "c:<id>". */
export type FontKey = BuiltinFontKey | `c:${string}`;

export interface TextElement extends ElementBase {
  type: "text";
  text: string;
  font: FontKey;
  bold: boolean;
  /** 100–900; overrides `bold` when set (M11, variable fonts). */
  weight?: number;
  /** Export pixels. `width` wraps the text; `height` follows the text (derived). */
  fontSize: number;
  color: string;
  align: "left" | "center" | "right" | "justify";
  /** Format sheet toggles (M19). */
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  /** Export pixels. */
  letterSpacing: number;
  /** Multiplier of the font size. */
  lineHeight: number;
  stroke: Border | null;
  shadow: boolean;
  background: { color: string; padding: number; radius: number } | null;
}

export const SHAPES = ["rect", "roundRect", "circle", "triangle", "line", "arrow", "film"] as const;
/** Built-in shapes, plus the path shapes of the library (M19). */
export type ShapeKind = (typeof SHAPES)[number] | PathShape;

export interface ShapeElement extends ElementBase {
  type: "shape";
  shape: ShapeKind;
  fill: string;
}

export interface IconElement extends ElementBase {
  type: "icon";
  /** Key in lib/elements/icons.ts (icons, stickers), or "emoji:<name>" (M13 batch). */
  icon: string;
  color: string;
  /** Emoji stickers: the SVG body (32 × 32 viewBox), kept in the project so it never needs fetching again. */
  svg?: string;
}

/** Freehand drawing (M11, S17). Points are relative to the box (0..1), so resizing scales it. */
export interface DrawingElement extends ElementBase {
  type: "drawing";
  /** One flat [x0, y0, x1, y1, …] list per stroke. */
  strokes: number[][];
  color: string;
  /** Export pixels at the current size. */
  strokeWidth: number;
}

/**
 * Layout block (M14, editor-v2/02): a grid / layout holding photo cells. The cells are
 * ordinary image elements (`parentId` = this block) whose frames follow the block: moving,
 * resizing or rotating the block moves them. Cell rects are relative to the block (0..1).
 */
export interface LayoutElement extends ElementBase {
  type: "layout";
  cells: LayoutCell[];
  /** Split it was made from (lib/templates/slideLayouts): cells can then be re-spaced (M17). */
  layout?: string;
  /** Gap between cells and margin around them, relative to the block width. */
  gap?: number;
  padding?: number;
  /** Corner radius of the cells, relative to the block width. */
  radius?: number;
  /** Colour behind the cells; none = transparent. */
  fill?: string | null;
  /**
   * Frame art from a pack (M20 C4): a picture with transparent windows, drawn above the
   * cells — the photos show through the windows and never cover the frame.
   */
  art?: { assetId: string; catalogId: string };
}

export interface LayoutCell {
  /** Id of the image element in this cell. */
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Extra turn of the cell, on top of the block's. */
  rotation?: number;
}

export type CanvasElement = ImageElement | TextElement | ShapeElement | IconElement | DrawingElement | LayoutElement;

export function isImage(el: CanvasElement | undefined): el is ImageElement {
  return el?.type === "image";
}

/**
 * Drag / pinch move the picture inside its frame instead of the frame (template cells,
 * and locked photos such as a background: the frame stays, the view inside can change).
 */
/**
 * A drag / pinch on this photo moves the picture inside its frame: photos in grid cells.
 * Locked means locked (owner, 2026-10-17, replaces D-85): nothing moves, only the "+" of
 * an empty frame still adds a photo.
 */
export function pansInside(el: CanvasElement | undefined): boolean {
  return isImage(el) && !!el.assetId && el.slot && !el.locked;
}

/** Background music of the project (M13.4). Times in seconds of the track. */
export interface Music {
  assetId: string;
  /** Where in the track the project starts. */
  start: number;
  /** 0..1 */
  volume: number;
  fadeIn: boolean;
  fadeOut: boolean;
}

export interface ProjectDoc {
  /** Background music (M13.4). */
  music?: Music;
  /** Seconds a slide with animation but no video lasts when exported as video (M13.3, default 5). */
  motionDuration?: number;
  type: ProjectType;
  ratio: AspectRatio;
  /** Post: slides, Story: frames, Grid: tiles (3 × rows). */
  slideCount: number;
  /** Grid projects only (M6). */
  grid?: { rows: number; gapCompensation: boolean };
  background: Background;
  /** Back to front. */
  elements: CanvasElement[];
}

export function newId() {
  return `id${Math.random().toString(36).slice(2, 10)}`;
}
