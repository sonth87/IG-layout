// M16 — adding photos (docs/product/editor-v2/09 §1–2, dev/editor-v2 §6): "Fill frame"
// sheet, several photos into the empty cells in the owner's order (G H / I J K / L),
// at most one per empty cell; the toolbar photo button adds free photos only (Q-E2).
import { chromium } from "playwright-core";
import { copyFileSync } from "node:fs";
import path from "node:path";
import { chromePath, FIXTURES as dir, OUT, pickInFillFrame, skipTips, URL_ARG, newProject } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

// Seven distinct files (names tell which photo went where).
const photos = Array.from({ length: 7 }, (_, i) => {
  const f = path.join(OUT, `photo-${i + 1}.jpg`);
  copyFileSync(path.join(dir, i % 2 ? "p4.jpg" : "p3.jpg"), f);
  return f;
});

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

const S = async () => {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, selected: s.selectedId, past: s.past.length, names: Object.fromEntries(Object.values(s.assets).map((a) => [a.id, a.name])) };
  });
};
async function tapCentre(el) {
  const box = await page.locator("[data-stage-frame]").boundingBox();
  const k = box.width / (1080 * (await S()).doc.slideCount);
  await page.mouse.click(box.x + (el.x + el.width / 2) * k, box.y + (el.y + el.height / 2) * k);
  await page.waitForTimeout(150);
}
const wait = async (cond) => {
  let st;
  for (let i = 0; i < 40 && !cond((st = await S())); i++) await page.waitForTimeout(100);
  return st;
};

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

// The owner's example: slide A with cells G H, slide B with I J K, slide C with L.
await page.evaluate(() => {
  const s = () => window.__igEditor.getState();
  for (const el of s().doc.elements) s().removeElement(el.id);
  s().addSlide(s().doc.slideCount, "g-2v");
  s().addSlide(s().doc.slideCount, "g-3c");
  s().addSlide(s().doc.slideCount, "l-margin");
  while (s().doc.slideCount > 3) s().deleteSlide(0);
  s().select(null);
});
await page.waitForTimeout(500);
let st = await S();
const cellsOf = (st) => st.doc.elements.filter((e) => e.type === "image" && e.parentId).sort((a, b) => a.x - b.x);
const [G, H, I, J, K, L] = cellsOf(st);
const name = (st, cell) => st.names[st.doc.elements.find((e) => e.id === cell.id).assetId] ?? null;
check(st.doc.slideCount === 3 && cellsOf(st).length === 6 && st.doc.elements.filter((e) => e.type === "image").length === 6, "slides A (G H), B (I J K), C (L), all empty");

console.log("Fill frame sheet (§1.1)");
await tapCentre(K);
const sheet = page.getByRole("region", { name: "Fill frame" });
check(await sheet.isVisible(), "tap on the + of K opens “Fill frame”");
check((await sheet.getByRole("button").allTextContents()).join("|").includes("Photos|Video|Files"), "three choices: Photos, Video, Files");
check(await sheet.getByText("Pick up to 6").isVisible(), "up to 6 (every empty cell of the project)");
check((await sheet.locator('input[type="file"]').evaluateAll((els) => els.every((e) => e.multiple))), "several can be picked");
await page.screenshot({ path: path.join(OUT, "m16-fill-frame.png") });
await sheet.getByRole("button", { name: "Close" }).click();
st = await S();
check(st.selected === K.id && cellsOf(st).every((c) => !c.assetId), "closed without picking: K stays selected and empty");
const tr = await page.evaluate(() => {
  const t = window.__igEditor.getState().canvas.layer.getStage().findOne("Transformer");
  return { resize: t.resizeEnabled(), rotate: t.rotateEnabled() };
});
check(!tr.resize && !tr.rotate, "an empty cell of a block has no handles of its own (it follows the block)");

console.log("Order (§1.3): 1 photo → K");
await tapCentre(K);
await pickInFillFrame(page, photos.slice(0, 1));
st = await wait((st) => cellsOf(st).some((c) => c.assetId));
check(name(st, K) === "photo-1.jpg" && cellsOf(st).filter((c) => c.assetId).length === 1, "K");
check(st.selected === null, "nothing selected afterwards");
await page.getByLabel("Undo").click();

console.log("3 photos → K, I, J");
await tapCentre(K);
await pickInFillFrame(page, photos.slice(0, 3));
st = await wait((st) => cellsOf(st).filter((c) => c.assetId).length === 3);
check([K, I, J].map((c) => name(st, c)).join() === "photo-1.jpg,photo-2.jpg,photo-3.jpg", `K I J (${[K, I, J].map((c) => name(st, c)).join(", ")})`);
const past3 = st.past;
await page.getByLabel("Undo").click();
st = await S();
check(cellsOf(st).every((c) => !c.assetId) && st.past === past3 - 1, "the whole batch is one undo step");

console.log("7 photos for 6 cells → K, I, J, G, H, L and a note");
await tapCentre(K);
await pickInFillFrame(page, photos);
check(await page.getByRole("status").filter({ hasText: "Used the first 6" }).isVisible(), "“Used the first 6 for the 6 empty frames”");
st = await wait((st) => cellsOf(st).filter((c) => c.assetId).length === 6);
const order = [K, I, J, G, H, L].map((c) => name(st, c));
check(order.join() === photos.slice(0, 6).map((f) => path.basename(f)).join(), `K I J G H L (${order.join(", ")})`);
check(st.doc.elements.filter((e) => e.type === "image").length === 6, "no extra floating photo");
const kEl = st.doc.elements.find((e) => e.id === K.id);
const asset = await page.evaluate((id) => window.__igEditor.getState().assets[id], kEl.assetId);
check(Math.abs(kEl.crop.width / kEl.crop.height - kEl.width / kEl.height) < 0.01 && (kEl.crop.width >= asset.width - 1 || kEl.crop.height >= asset.height - 1), "each photo covers its cell");

console.log("Replace (§4): one photo into the selected cell");
await page.evaluate((id) => window.__igEditor.getState().select(id), K.id);
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Replace" }).click();
await pickInFillFrame(page, photos[6]);
st = await wait((st) => name(st, K) === "photo-7.jpg");
check(name(st, K) === "photo-7.jpg" && name(st, I) === "photo-2.jpg", "K replaced, others untouched");

console.log("Toolbar photo button: free photos, never into empty cells (Q-E2, §2)");
await page.getByLabel("Undo").click();
await page.getByLabel("Undo").click();
await page.getByLabel("Undo").click(); // back to empty cells
st = await S();
check(cellsOf(st).every((c) => !c.assetId), "cells empty again");
await page.evaluate(() => window.__igEditor.getState().select(null));
const n0 = st.doc.elements.length;
await page.locator('input[type="file"][multiple][accept="image/*,video/*"]').first().setInputFiles(photos.slice(0, 2));
st = await wait((st) => st.doc.elements.length === n0 + 2);
const free = st.doc.elements.slice(-2);
check(cellsOf(st).every((c) => !c.assetId) && free.every((e) => e.type === "image" && !e.parentId), "2 free photos added; empty cells stay empty");
const slide = Math.floor(free[0].x / 1080);
const corner = free[0].x - slide * 1080 < 120 && free[0].y < 120;
const sized = Math.abs(free[0].width - 1080 * 0.6) < 2 || Math.abs(free[0].height - 1350 * 0.6) < 2;
check(corner && sized, `first one near the top-left corner of the slide in view, ~60 % of it (${Math.round(free[0].width)} × ${Math.round(free[0].height)})`);
check(Math.abs(free[1].x - free[0].x - 40) < 0.5 && Math.abs(free[1].y - free[0].y - 40) < 0.5, "next one 40 px further down and right");
check(st.selected === free[1].id, "the last one is selected");
// More than 10 at once: the first 10.
const many = Array.from({ length: 12 }, (_, i) => photos[i % 7]);
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.locator('input[type="file"][multiple][accept="image/*,video/*"]').first().setInputFiles(many);
check(await page.getByRole("status").filter({ hasText: "Added the first 10" }).isVisible(), "more than 10 → the first 10, with a note");
st = await wait((st) => st.doc.elements.length === n0 + 12);
check(st.doc.elements.length === n0 + 12, "10 more free photos");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
