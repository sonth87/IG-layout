// M11 — library: 70+ fonts with weights, 25 filters, stickers, overlays (blend),
// freehand drawing, new frames (like SCRL, docs/discussions/2026-10-16-phan-tich-scrl-grids.md).
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, more, OUT as out, skipTips, URL_ARG, newProject } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};
const shot = (p, n) => p.screenshot({ path: path.join(out, `m11-${n}.png`) });

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const cdp = await context.newCDPSession(page);
const touch = (type, points) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
const S = async () => {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, selected: s.selectedId, past: s.past.length, drawing: s.drawing };
  });
};
const last = (st, type) => st.doc.elements.filter((e) => e.type === type).at(-1);

await page.goto(URL_ARG);
await newProject(page);
for (let i = 0; i < 4; i++) await page.getByLabel("Fewer slides").click(); // 5 → 1
await page.locator('input[type="file"]').setInputFiles([path.join(dir, "p3.jpg")]);
await page.getByRole("button", { name: "Skip" }).click();
await page.getByText("4:5 · 1 slide").waitFor();
await page.waitForTimeout(600);

console.log("S12 fonts: 70+, categories, weight");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Text", exact: true }).click();
await page.getByRole("textbox", { name: "Edit text" }).fill("Đà Lạt");
await page.getByRole("button", { name: "Done typing" }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Format", exact: true }).click();
await page.getByRole("region", { name: "Format" }).getByRole("button", { name: /^Font/ }).click();
const styles = page.getByRole("radiogroup", { name: "Font style" });
const total = await page.getByRole("radiogroup", { name: "Font", exact: true }).getByRole("radio").count();
check(total >= 70, `${total} fonts`);
await styles.getByRole("radio", { name: "Serif", exact: true }).click();
await page.getByRole("radio", { name: "Fraunces" }).click();
await page.getByRole("slider", { name: "Weight" }).fill("900");
await page.waitForTimeout(800);
await shot(page, "1-font");
await page.getByRole("button", { name: "Done typing" }).click();
let st = await S();
let text = last(st, "text");
check(text.font === "fraunces" && text.weight === 900, `font + weight saved (${text.font} ${text.weight})`);
const loaded = await page.evaluate(() => document.fonts.check("900 64px 'Fraunces'", "Đà Lạt"));
check(loaded, "Fraunces 900 with Vietnamese loaded for the canvas");
await page.getByRole("button", { name: "Done" }).click();

console.log("S10 filters");
const photo = st.doc.elements.find((e) => e.type === "image");
await page.evaluate((id) => window.__igEditor.getState().select(id), photo.id);
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Filters" }).click();
await shot(page, "2-filters");
const names = new Set();
const groups = page.getByRole("tablist", { name: "Filters" }).getByRole("tab");
for (let g = 0; g < (await groups.count()); g++) {
  await groups.nth(g).click();
  for (const n of await page.locator("section button").allTextContents()) names.add(n.trim());
}
check(["Noir", "Teal & Orange", "Golden", "Warm Plate", "Vaporwave", "Kyoto", "Classic"].every((n) => names.has(n)), `filters listed in ${await groups.count()} groups (${[...names].filter((n) => n && n !== "None").length} filters)`);
await page.getByLabel("Cancel").click();
await page.getByRole("button", { name: "Done" }).click();

console.log("S13 stickers");
await page.getByRole("button", { name: "Stickers", exact: true }).click(); // Sticker library (M19)
await shot(page, "3-stickers");
await page.getByRole("button", { name: "Washi tape", exact: true }).click();
st = await S();
const tape = last(st, "icon");
check(tape?.icon === "tape" && tape.width / tape.height > 3, `washi tape added at its own shape (${Math.round(tape.width)}×${Math.round(tape.height)})`);
await page.getByRole("button", { name: "Color" }).click();
// The compact colour control (2026-10-20): the swatch opens the colour panel.
await page.getByRole("region", { name: "Color" }).getByRole("button", { name: "Color" }).click();
await page.getByRole("dialog", { name: "Colour" }).getByRole("button", { name: "#8e24aa" }).click();
await page.getByRole("dialog", { name: "Colour" }).getByRole("button", { name: "Close" }).click();
await page.getByRole("button", { name: "Apply", exact: true }).click();
st = await S();
check(last(st, "icon").color !== tape.color, "sticker colour can be changed");
await page.getByRole("button", { name: "Done" }).click();

console.log("Emoji stickers (Fluent Emoji, MIT)");
await page.getByRole("button", { name: "Stickers", exact: true }).click();
// A couple of rows only; "+N" opens the whole list with its tabs (owner, 2026-10-19).
const emojiTiles = await page.getByRole("region", { name: "Emoji", exact: true }).getByRole("button").count();
check(emojiTiles <= 12, `emoji: a couple of rows (${emojiTiles} tiles)`);
await page.getByRole("region", { name: "Emoji", exact: true }).getByRole("button", { name: /more$/ }).click();
await page.getByRole("button", { name: "Food & Drink" }).click();
await page.getByRole("button", { name: "pizza", exact: true }).click();
st = await S();
const emoji = last(st, "icon");
check(emoji.icon === "emoji:pizza" && emoji.svg?.includes("<path"), "emoji sticker added with its SVG stored in the project");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Stickers", exact: true }).click();
await page.getByRole("searchbox").fill("cat face");
await page.waitForTimeout(600);
check((await page.getByRole("button", { name: "cat face", exact: true }).count()) === 1, "search finds emoji across categories");
await page.getByRole("searchbox").fill("");
// The emoji just used shows (not a broken picture) under Recently used.
const recentImg = page.getByRole("region", { name: "Recently used" }).getByRole("button", { name: "pizza" }).locator("img");
check(await recentImg.evaluate((i) => (i.complete ? i.naturalWidth > 0 : new Promise((r) => (i.onload = () => r(true), i.onerror = () => r(false))))), "Recently used shows the emoji (not a broken picture)");
await page.getByLabel("Close").click();

console.log("S13 overlays (blend)");
const before = await page.evaluate(() => {
  const s = window.__igEditor.getState();
  const c = s.canvas.layer.toCanvas({ pixelRatio: 0.2 });
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let sum = 0;
  for (let i = 0; i < d.length; i += 4) sum += d[i] + d[i + 1] + d[i + 2];
  return sum / (d.length / 4);
});
await page.getByRole("button", { name: "Stickers", exact: true }).click(); // light & texture overlays are in the sticker library
await shot(page, "4-overlays");
await page.getByRole("button", { name: "Light leak", exact: true }).click();
await page.waitForTimeout(800);
st = await S();
const leak = last(st, "image");
check(leak.blend === "screen" && leak.assetId, "light leak added as a blended layer");
const after = await page.evaluate(() => {
  const s = window.__igEditor.getState();
  const c = s.canvas.layer.toCanvas({ pixelRatio: 0.2 });
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let sum = 0;
  for (let i = 0; i < d.length; i += 4) sum += d[i] + d[i + 1] + d[i + 2];
  return sum / (d.length / 4);
});
check(after > before + 5, `screen blend brightens, black disappears (${Math.round(before)} → ${Math.round(after)})`);
await page.getByRole("button", { name: "Style" }).click();
await page.getByRole("radio", { name: "Soft light" }).click();
await page.getByRole("button", { name: "Apply", exact: true }).click();
check(last(await S(), "image").blend === "soft-light", "blend mode changeable in Style");
await shot(page, "5-overlay-canvas");
await page.getByRole("button", { name: "Done" }).click();

console.log("S17 drawing");
await more(page, "Draw");
const fb = await page.locator("[data-stage-frame]").boundingBox();
const y0 = fb.y + fb.height * 0.3;
await touch("touchStart", [{ x: fb.x + 60, y: y0 }]);
for (let i = 1; i <= 15; i++) await touch("touchMove", [{ x: fb.x + 60 + i * 12, y: y0 + Math.sin(i / 2) * 30 }]);
await touch("touchEnd", []);
await page.waitForTimeout(200);
await touch("touchStart", [{ x: fb.x + 60, y: y0 + 90 }]);
for (let i = 1; i <= 10; i++) await touch("touchMove", [{ x: fb.x + 60 + i * 15, y: y0 + 90 }]);
await touch("touchEnd", []);
await page.waitForTimeout(200);
st = await S();
check(st.drawing?.strokes.length === 2, `2 strokes recorded (${st.drawing?.strokes.length})`);
check(st.doc.elements.filter((e) => e.type === "drawing").length === 0, "nothing in the project until ✓");
await page.getByRole("button", { name: "Undo stroke" }).click();
check((await S()).drawing.strokes.length === 1, "undo stroke");
await shot(page, "6-drawing");
const past = (await S()).past;
await page.getByRole("button", { name: "Apply", exact: true }).click();
st = await S();
const drawing = last(st, "drawing");
check(drawing && drawing.strokes.length === 1 && st.past === past + 1 && st.selected === drawing.id, "✓ adds one drawing element (one undo step), selected");
await page.getByRole("button", { name: "Done" }).click();

console.log("S14 frames");
await page.getByRole("button", { name: "New layer" }).click();
await page.getByRole("button", { name: "Frame", exact: true }).click();
await page.getByRole("button", { name: "Gallery", exact: true }).click();
st = await S();
check(last(st, "image").frame === "gallery", "gallery frame added");
await page.getByRole("button", { name: "Done" }).click();
await page.waitForTimeout(500);
await shot(page, "7-canvas");

console.log("Saved and reopened");
const mem = JSON.stringify((await S()).doc);
await page.waitForTimeout(1200);
await page.reload();
await page.getByRole("tab", { name: "Projects" }).click().catch(() => {});
await page.locator("article button").first().click();
await page.waitForTimeout(1200);
const reloaded = JSON.stringify((await S()).doc);
check(reloaded === mem, "weight, blend, stickers, drawing survive a reload");

console.log("Export");
await page.getByRole("button", { name: "Export" }).click();
await page.waitForTimeout(2000);
await shot(page, "8-export");
await page.getByRole("button", { name: "Back to editor" }).click();

console.log(`console errors: ${JSON.stringify(errors)}`);
await browser.close();
console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures || errors.length ? 1 : 0);
