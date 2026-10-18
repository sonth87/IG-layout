// Generates an interactive HTML review page at assets/<kind>/<pack>/review.html
// showing every item on light, dark, and checkerboard backgrounds, with licence,
// source link, and red window outlines for frames (M20 G1).
// Usage: node scripts/assets/review.mjs <kind>/<pack>

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ASSETS, itemFiles, KINDS, PACKS, ROOT } from "./common.mjs";

const target = process.argv[2];
if (!target || !target.includes("/")) {
  console.error("Usage: node scripts/assets/review.mjs <kind>/<pack>");
  process.exit(1);
}

const [kind, pack] = target.split("/");
if (!KINDS.includes(kind) || kind === "font" || !pack) {
  console.error(`Invalid target "${target}". Expected <sticker|frame|texture|overlay>/<pack>`);
  process.exit(1);
}

const packDir = path.join(ASSETS, kind, pack);
const manifestPath = path.join(packDir, "manifest.json");
if (!existsSync(manifestPath)) {
  console.error(`Manifest not found: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const outHtmlPath = path.join(packDir, "review.html");

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const cardsHtml = (manifest.items ?? [])
  .map((item) => {
    const rel = itemFiles(kind, pack, item.id);
    const absMain = path.join(PACKS, rel.file);
    const absThumb = path.join(PACKS, rel.thumb);
    const relFromPackDir = path.relative(packDir, absMain).split(path.sep).join("/");
    const sizeKb = existsSync(absMain) ? (statSync(absMain).size / 1000).toFixed(1) : "?";
    const thumbKb = existsSync(absThumb) ? (statSync(absThumb).size / 1000).toFixed(1) : "?";

    const windowsOverlay =
      kind === "frame" && Array.isArray(item.windows)
        ? item.windows
            .map((w, idx) => {
              const radius = w.shape === "ellipse" ? "50%" : "2px";
              const rot = w.rotation ? `transform: rotate(${w.rotation}deg);` : "";
              return `<div class="win-box" style="left:${(w.x * 100).toFixed(2)}%;top:${(w.y * 100).toFixed(2)}%;width:${(w.w * 100).toFixed(2)}%;height:${(w.h * 100).toFixed(2)}%;border-radius:${radius};${rot}" title="Window #${idx + 1}: x=${w.x}, y=${w.y}, w=${w.w}, h=${w.h}"><span>#${idx + 1}</span></div>`;
            })
            .join("")
        : "";

    const badges = [
      `<span class="badge lic">${esc(item.source?.license)}</span>`,
      item.width && item.height ? `<span class="badge">${item.width}×${item.height}</span>` : "",
      `<span class="badge">${sizeKb} KB (thumb ${thumbKb} KB)</span>`,
      item.tile ? `<span class="badge tile">tile: true</span>` : "",
      item.blend ? `<span class="badge">blend: ${esc(item.blend)}</span>` : "",
      kind === "frame" ? `<span class="badge">${(item.windows ?? []).length} window(s)</span>` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return `
      <article class="card">
        <header class="card-head">
          <div>
            <h2>${esc(item.name?.vi)} <small>(${esc(item.name?.en)})</small></h2>
            <code>${esc(item.id)}</code>
          </div>
          <div class="badges">${badges}</div>
        </header>
        <div class="previews">
          <div class="stage bg-light" title="Nền sáng (Light)">
            <span class="stage-label">Sáng</span>
            <div class="img-wrap">
              <img src="${esc(relFromPackDir)}" alt="${esc(item.name?.vi)}" loading="lazy" />
              ${windowsOverlay}
            </div>
          </div>
          <div class="stage bg-dark" title="Nền tối (Dark)">
            <span class="stage-label">Tối</span>
            <div class="img-wrap">
              <img src="${esc(relFromPackDir)}" alt="${esc(item.name?.vi)}" loading="lazy" />
              ${windowsOverlay}
            </div>
          </div>
          <div class="stage bg-checker" title="Nền ca rô (Checkerboard)">
            <span class="stage-label">Ca rô</span>
            <div class="img-wrap">
              <img src="${esc(relFromPackDir)}" alt="${esc(item.name?.vi)}" loading="lazy" />
              ${windowsOverlay}
            </div>
          </div>
        </div>
        <footer class="card-foot">
          <div>
            <strong>Nguồn:</strong>
            <a href="${esc(item.source?.url)}" target="_blank" rel="noopener noreferrer">${esc(item.source?.provider)}</a>
            ${item.source?.author ? ` · Tác giả: ${esc(item.source.author)}` : ""}
            ${item.source?.licenseUrl ? ` · <a href="${esc(item.source.licenseUrl)}" target="_blank" rel="noopener noreferrer">Giấy phép</a>` : ""}
          </div>
          <div class="tags">
            VI: ${esc((item.tags?.vi ?? []).join(", "))} | EN: ${esc((item.tags?.en ?? []).join(", "))}
          </div>
        </footer>
      </article>
    `;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Duyệt gói: ${esc(manifest.name?.vi)} (${esc(kind)}/${esc(pack)})</title>
  <style>
    :root { color-scheme: dark light; font-family: system-ui, -apple-system, sans-serif; }
    body { margin: 0; padding: 24px; background: #111827; color: #f3f4f6; }
    header.top { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid #374151; padding-bottom: 16px; }
    h1 { margin: 0; font-size: 1.5rem; }
    .meta { color: #9ca3af; font-size: 0.9rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(520px, 1fr)); gap: 20px; }
    .card { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap; }
    .card-head h2 { margin: 0; font-size: 1.05rem; }
    .card-head h2 small { color: #9ca3af; font-weight: normal; }
    .card-head code { font-size: 0.8rem; color: #60a5fa; }
    .badges { display: flex; gap: 6px; flex-wrap: wrap; }
    .badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 999px; background: #374151; color: #e5e7eb; }
    .badge.lic { background: #065f46; color: #a7f3d0; font-weight: 600; }
    .badge.tile { background: #1e40af; color: #bfdbfe; }
    .previews { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .stage { position: relative; border-radius: 8px; min-height: 180px; display: flex; align-items: center; justify-content: center; padding: 12px; overflow: hidden; border: 1px solid #374151; }
    .stage-label { position: absolute; top: 6px; left: 8px; font-size: 0.7rem; padding: 1px 6px; border-radius: 4px; background: rgba(0,0,0,0.55); color: #fff; z-index: 2; }
    .bg-light { background: #f8fafc; }
    .bg-dark { background: #090d16; }
    .bg-checker {
      background-color: #e5e7eb;
      background-image:
        linear-gradient(45deg, #cbd5e1 25%, transparent 25%),
        linear-gradient(-45deg, #cbd5e1 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #cbd5e1 75%),
        linear-gradient(-45deg, transparent 75%, #cbd5e1 75%);
      background-size: 16px 16px;
      background-position: 0 0, 0 8px, 8px -8px, -8px 0;
    }
    .img-wrap { position: relative; display: inline-block; max-width: 100%; max-height: 220px; line-height: 0; }
    .img-wrap img { max-width: 100%; max-height: 220px; width: auto; height: auto; object-fit: contain; display: block; }
    .win-box { position: absolute; border: 2px solid #ef4444; background: rgba(239, 68, 68, 0.18); box-sizing: border-box; pointer-events: auto; display: flex; align-items: flex-start; justify-content: flex-start; }
    .win-box span { background: #ef4444; color: #fff; font-size: 10px; line-height: 1; padding: 2px 4px; font-weight: 700; }
    .card-foot { font-size: 0.82rem; color: #d1d5db; display: flex; flex-direction: column; gap: 4px; border-top: 1px solid #374151; padding-top: 8px; }
    .card-foot a { color: #38bdf8; text-decoration: none; }
    .card-foot a:hover { text-decoration: underline; }
    .tags { color: #9ca3af; font-size: 0.78rem; }
  </style>
</head>
<body>
  <header class="top">
    <div>
      <h1>${esc(manifest.name?.vi)} <span class="meta">(${esc(manifest.name?.en)} — ${esc(kind)}/${esc(pack)})</span></h1>
      <div class="meta">Tổng số mục: ${(manifest.items ?? []).length} · Bộ sưu tập: ${esc((manifest.collections ?? []).join(", ") || "—")}</div>
    </div>
    <div class="meta">Sinh bởi <code>scripts/assets/review.mjs</code></div>
  </header>
  <main class="grid">
    ${cardsHtml}
  </main>
</body>
</html>
`;

writeFileSync(outHtmlPath, html);
console.log(`Review page written to: ${path.relative(ROOT, outHtmlPath)}`);
