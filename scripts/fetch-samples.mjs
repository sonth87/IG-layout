// Sample photos for template previews (owner, 2026-10-28): real photos from Pexels
// (Pexels licence: free to use, no credit required — we credit anyway) instead of the
// drawn landscapes. Grouped by theme so each template shows photos that suit it.
//
//   node --env-file=.env.local scripts/fetch-samples.mjs [--force]
//
// Needs PEXELS_API_KEY (keep it in .env.local, never commit it). Writes
// public/samples/<theme>-<n>.webp and src/lib/templates/samplePhotos.json.
// Already downloaded files are kept unless --force.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "samples");
const manifestPath = path.join(root, "src", "lib", "templates", "samplePhotos.json");
const key = process.env.PEXELS_API_KEY;
const force = process.argv.includes("--force");
if (!key) throw new Error("PEXELS_API_KEY is not set (node --env-file=.env.local …)");

/** Theme → searches; `per` photos taken from each search. */
const THEMES = {
  travel: { per: 5, queries: ["travel mountains lake", "road trip vintage car", "airplane window travel"] },
  beach: { per: 5, queries: ["beach summer people", "sailboat sea"] },
  city: { per: 4, queries: ["european street old town", "tokyo street night", "paris cafe street"] },
  food: { per: 5, queries: ["coffee croissant cafe", "brunch table aesthetic"] },
  portrait: { per: 5, queries: ["woman portrait golden hour", "street style portrait"] },
  friends: { per: 5, queries: ["friends laughing together", "friends party night"] },
  couple: { per: 5, queries: ["couple romantic", "wedding couple"] },
  autumn: { per: 4, queries: ["autumn leaves park", "pumpkin autumn", "halloween costume party"] },
  nature: { per: 5, queries: ["forest cabin", "mountain landscape mist"] },
  minimal: { per: 5, queries: ["minimal ceramic still life", "minimal interior light shadow"] },
  mono: { per: 5, queries: ["black and white portrait", "black and white street photography"] },
  party: { per: 5, queries: ["birthday cake candles", "celebration confetti"] },
  fashion: { per: 5, queries: ["fashion editorial model", "fashion details accessories"] },
  // Seasons and holidays (2026-10-28, second batch).
  winter: { per: 5, queries: ["snow winter woman", "cozy winter knit sweater"] },
  christmas: { per: 5, queries: ["christmas lights tree", "christmas gifts friends"] },
  lunar: { per: 4, queries: ["lunar new year red lanterns", "ao dai vietnam", "mid autumn lantern festival"] },
  spring: { per: 5, queries: ["cherry blossom spring", "spring flowers garden woman"] },
  flowers: { per: 5, queries: ["flower bouquet", "pink flowers aesthetic"] },
  school: { per: 5, queries: ["students campus friends", "graduation cap gown"] },
  kids: { per: 5, queries: ["child playing happy", "family with kids outdoors"] },
  retro: { per: 5, queries: ["vintage aesthetic 70s", "retro diner neon"] },
};

/** Pexels ids left out after review (off-theme, blurry, too many of one kind). */
const SKIP = new Set([13155692, 3856457, 22388078, 32138464, 19189052, 35915780, 7699983, 14890717]);

async function search(query, page = 1) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=30&page=${page}`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) throw new Error(`${query}: ${res.status} ${await res.text()}`);
  return (await res.json()).photos;
}

mkdirSync(outDir, { recursive: true });
const old = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : [];
// The owner's own photos (JPEG, not from Pexels) stay as they are.
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")).filter((p) => p.ext === "jpg") : [];
const seen = new Set();

for (const [theme, { per, queries }] of Object.entries(THEMES)) {
  let n = 0;
  for (const query of queries) {
    const photos = await search(query);
    // Mix portrait and landscape photos; skip repeats and near-square crops of the same shoot.
    const photographers = new Set();
    let taken = 0;
    for (const p of photos) {
      if (taken >= per) break;
      if (SKIP.has(p.id) || seen.has(p.id) || photographers.has(p.photographer_id)) continue;
      seen.add(p.id);
      photographers.add(p.photographer_id);
      const id = `${theme}-${++n}`;
      const file = path.join(outDir, `${id}.webp`);
      const prev = old.find((o) => o.id === id);
      if (!force && prev && prev.pexels === p.id && existsSync(file)) {
        manifest.push(prev);
        taken++;
        continue;
      }
      const img = await fetch(`${p.src.original}?auto=compress&cs=tinysrgb&w=900`);
      if (!img.ok) continue;
      const buf = await sharp(Buffer.from(await img.arrayBuffer()))
        .rotate()
        .resize({ width: 720, height: 720, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 72 })
        .toBuffer({ resolveWithObject: true });
      writeFileSync(file, buf.data);
      manifest.push({
        id,
        theme,
        width: buf.info.width,
        height: buf.info.height,
        color: p.avg_color,
        pexels: p.id,
        author: p.photographer,
        url: p.url,
      });
      taken++;
    }
  }
  console.log(`${theme}: ${n}`);
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + "\n");
console.log(`${manifest.length} photos → public/samples/`);
