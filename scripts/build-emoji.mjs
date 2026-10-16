// Builds the emoji sticker library (M13 batch, S13) from Microsoft Fluent Emoji Flat
// (MIT, via @iconify-json/fluent-emoji-flat) into public/emoji/:
//   index.json            categories + names (for browsing and search)
//   <category>.json       { name: svgBody } — fetched only when that category is opened
// Skin-tone variants are left out (default yellow only). public/emoji is not committed.
import fs from "node:fs";
import path from "node:path";

const dir = fs.realpathSync(path.join(process.cwd(), "node_modules", "@iconify-json", "fluent-emoji-flat"));
const { icons, width = 32, height = 32 } = JSON.parse(fs.readFileSync(path.join(dir, "icons.json"), "utf8"));
const { categories } = JSON.parse(fs.readFileSync(path.join(dir, "metadata.json"), "utf8"));
const TONE = /-(light|medium-light|medium|medium-dark|dark)(?:-|$)/;
const ORDER = ["Smileys & Emotion", "Animals & Nature", "Food & Drink", "Activities", "Travel & Places", "Objects", "Symbols", "People & Body", "Flags"];

const out = path.join(process.cwd(), "public", "emoji");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const index = { license: "Fluent Emoji — © Microsoft, MIT License", size: [width, height], categories: [] };
for (const name of ORDER) {
  const keys = (categories[name] ?? []).filter((k) => icons[k] && !TONE.test(k));
  const id = name.toLowerCase().replace(/[^a-z]+/g, "-");
  const bodies = Object.fromEntries(keys.map((k) => [k, icons[k].body]));
  fs.writeFileSync(path.join(out, `${id}.json`), JSON.stringify(bodies));
  index.categories.push({ id, name, names: keys });
}
fs.writeFileSync(path.join(out, "index.json"), JSON.stringify(index));
const total = index.categories.reduce((n, c) => n + c.names.length, 0);
console.log(`emoji stickers: ${total} in ${index.categories.length} categories → public/emoji`);
