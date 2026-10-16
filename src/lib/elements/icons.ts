import {
  ArrowRight,
  Cake,
  Camera,
  Cloud,
  Coffee,
  Flower2,
  Gift,
  Heart,
  Leaf,
  MapPin,
  Moon,
  Music,
  Plane,
  Smile,
  Sparkles,
  Star,
  Sun,
} from "lucide-static";
import { isSticker, stickerSvg } from "./stickers";

// Icon set (Lucide, ISC licence — listed on the Credits screen).
// Rendered as SVG images at the size they are drawn, so they stay sharp.

export const ICONS: Record<string, string> = {
  heart: Heart,
  star: Star,
  sparkles: Sparkles,
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  flower: Flower2,
  leaf: Leaf,
  pin: MapPin,
  plane: Plane,
  camera: Camera,
  music: Music,
  coffee: Coffee,
  cake: Cake,
  gift: Gift,
  smile: Smile,
  arrow: ArrowRight,
};

export const ICON_KEYS = Object.keys(ICONS);

/** SVG markup for `icon` drawn in `color` at `size` px. */
export function iconSvg(icon: string, color: string, size: number) {
  const svg = ICONS[icon] ?? ICONS.star;
  return svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/width="24"/, `width="${size}"`)
    .replace(/height="24"/, `height="${size}"`)
    .replace(/stroke="currentColor"/, `stroke="${color}"`);
}

/** Icon or sticker (M11) as an image URL; `size` = width in px. */
export function iconDataUrl(icon: string, color: string, size: number) {
  const svg = isSticker(icon) ? stickerSvg(icon, color, size) : iconSvg(icon, color, size);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
