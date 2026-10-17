import type { ImageAsset } from "@/lib/project/types";

// Sample photos for template previews (M18, editor-v2/03 §3): small drawn landscapes,
// so a template looks finished in the library. Our own drawings (D-66), no downloads,
// so the home screen works offline.

const SCENES: [string, string, string, string, string][] = [
  // sky top, sky bottom, sun, far hills, near hills
  ["#f6b17a", "#fbe3c4", "#fff3d6", "#c97b63", "#7d4e45"],
  ["#7fb7d9", "#d7ecf5", "#ffffff", "#7aa38a", "#44685a"],
  ["#2d3561", "#c05c7e", "#f3826f", "#4a3c5e", "#241e33"],
  ["#a8d0c6", "#f1efe2", "#fdf6e3", "#9cae8f", "#5e7a63"],
  ["#e9c3c9", "#f9eae6", "#ffffff", "#c99aa5", "#8a5d6c"],
  ["#1f4e5f", "#7fb3a6", "#f2e9d0", "#2f6f6a", "#173c40"],
  ["#f4d58d", "#f9eccb", "#fffaf0", "#d39b5f", "#8c5a3c"],
  ["#bfc8e8", "#eef0f8", "#ffffff", "#8d94b8", "#555b80"],
];

function scene(i: number, w: number, h: number) {
  const [top, bottom, sun, far, near] = SCENES[i % SCENES.length];
  const sx = (0.25 + ((i * 37) % 50) / 100) * w;
  const hill = (y: number, amp: number, phase: number) => {
    const pts: string[] = [];
    for (let x = 0; x <= 8; x++) pts.push(`${(x / 8) * w},${y + Math.sin(x * 0.9 + phase) * amp}`);
    return `M0,${h} L${pts.join(" L")} L${w},${h} Z`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<circle cx="${sx}" cy="${h * 0.36}" r="${Math.min(w, h) * 0.11}" fill="${sun}" opacity="0.9"/>
<path d="${hill(h * 0.6, h * 0.05, i)}" fill="${far}"/>
<path d="${hill(h * 0.75, h * 0.06, i + 2)}" fill="${near}"/>
</svg>`;
}

let cache: ImageAsset[] | null = null;

/** A dozen sample photos (portrait and landscape mixed), made once. */
export function samplePhotos(): ImageAsset[] {
  cache ??= Array.from({ length: 12 }, (_, i) => {
    const [w, h] = i % 3 === 1 ? [600, 400] : [480, 600];
    return {
      id: `sample-${i}`,
      blob: new Blob(),
      // Parentheses escaped too: the URL goes inside CSS url().
      url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(scene(i, w, h)).replace(/\(/g, "%28").replace(/\)/g, "%29")}`,
      width: w,
      height: h,
      name: `sample-${i}`,
    };
  });
  return cache;
}

/** The sample photos in an order of its own for each template, so cards don't all look alike. */
export function samplePhotosFor(key: string): ImageAsset[] {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const all = samplePhotos();
  const k = h % all.length;
  return (byKey[key] ??= [...all.slice(k), ...all.slice(0, k)]);
}
const byKey: Record<string, ImageAsset[]> = {};
