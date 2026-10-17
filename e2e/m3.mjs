import { chromium } from "playwright-core";
import { more, skipTips, chromePath, FIXTURES as dir, OUT as out, URL_ARG } from "./lib.mjs";
import path from "node:path";

const url = URL_ARG;
const shot = (p, n) => p.screenshot({ path: path.join(out, `m3-${n}.png`) });
let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};
const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => { if (m.text().startsWith("DBG")) console.log("   " + m.text()); if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

const S = async () => {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, past: s.past.length, names: Object.fromEntries(Object.values(s.assets).map((a) => [a.id, a.name])), swapFrom: s.swapFrom };
  });
};
/** Cells of the layout block (child photos); the block itself is a "layout" element. */
const cells = (st) => st.doc.elements.filter((e) => e.type === "image");
async function tapEl(el, dx = 0, dy = 0) {
  const box = await page.locator("[data-stage-frame]").boundingBox();
  const st = await S();
  const k = box.width / (1080 * st.doc.slideCount);
  await page.mouse.click(box.x + (el.x + el.width / 2 + dx) * k, box.y + (el.y + el.height / 2 + dy) * k);
}

await page.goto(url);
await page.getByRole("button", { name: "New project" }).click();
await page.locator('input[type="file"]').setInputFiles(["panorama.jpg", "portrait.jpg", "p3.jpg", "p4.jpg"].map((f) => path.join(dir, f)));

console.log("1. Layout picker after choosing photos");
await page.getByText("Choose a layout").waitFor();
check(await page.getByRole("button", { name: "For 4 photos" }).isVisible(), "suggested tab 'For 4 photos'");
const names = await page.locator("button[aria-pressed] span.font-semibold").allTextContents();
check(names.includes("2 × 2") && names.includes("Panorama + 3 floating"), `suggestions include 2×2 and Panorama + 3 floating (${names.length} shown)`);
// swap order of photo 1 and 2 in the tray
await page.getByLabel("Photo 1", { exact: true }).click();
await page.getByLabel("Photo 2", { exact: true }).click();
await page.getByRole("button", { name: /Panorama \+ 3 floating/ }).click();
await shot(page, "1-picker");
await page.getByRole("button", { name: "Use this layout" }).click();
await page.getByText("4:5 · 3 slides").waitFor();
let st = await S();
check(st.doc.slideCount === 3 && st.doc.elements.length === 4, "3 slides, 4 elements");
const bgEl = st.doc.elements[0];
check(bgEl.width === 3240 && bgEl.height === 1350, "first photo covers the whole canvas");
check(st.names[bgEl.assetId] === "portrait.jpg", `tray swap: 2nd picked photo became photo 1 (background = ${st.names[bgEl.assetId]})`);
check(st.doc.elements[1].border?.width > 0 && st.doc.elements[1].shadow, "floating photos have white border + shadow");
await shot(page, "2-seamless");

console.log("2. Re-layout in the editor: Grid 2 × 2 with spacing");
await page.getByRole("button", { name: "Layout" }).click();
await page.getByRole("button", { name: "Grid", exact: true }).click();
await page.getByRole("button", { name: /^2 × 2 4 photos/ }).click();
await page.getByRole("slider").nth(0).fill("20");
await page.getByRole("slider").nth(1).fill("30");
await page.getByRole("button", { name: "Use this layout" }).click();
st = await S();
const g = 0.02 * 1080;
const block = st.doc.elements.find((e) => e.type === "layout");
check(st.doc.slideCount === 1 && cells(st).length === 4 && block?.cells.length === 4, "1 slide, a layout block with 4 cells");
check(cells(st).every((e) => e.parentId === block.id), "cells belong to the block");
const c0 = cells(st)[0];
check(Math.abs(c0.x - g) < 0.01 && Math.abs(c0.width - (540 - g - g / 2)) < 0.01, `cell gaps: x=${c0.x.toFixed(1)} w=${c0.width.toFixed(1)}`);
check(cells(st).every((e) => e.slot && e.mask === "rounded"), "cells are slots with rounded corners");
await shot(page, "3-grid");

console.log("3. Drag inside a cell pans the photo");
await tapEl(c0);
check((await page.evaluate(() => window.__igEditor.getState().selectedId)) === block.id, "first tap selects the block");
await tapEl(c0);
check((await page.evaluate(() => window.__igEditor.getState().selectedId)) === c0.id, "second tap selects the cell photo");
const box = await page.locator("[data-stage-frame]").boundingBox();
const k = box.width / 1080;
const start = { x: box.x + (c0.x + c0.width / 2) * k, y: box.y + (c0.y + c0.height / 2) * k };
await page.mouse.move(start.x, start.y);
await page.mouse.down();
await page.mouse.move(start.x + 40, start.y + 40, { steps: 8 });
await page.mouse.up();
st = await S();
const c0b = cells(st)[0];
check(c0b.x === c0.x && c0b.y === c0.y, "frame did not move");
check(c0b.crop.x !== c0.crop.x || c0b.crop.y !== c0.crop.y, `crop moved (${c0.crop.x.toFixed(0)} → ${c0b.crop.x.toFixed(0)})`);

console.log("4. Swap two cells");
const a0 = cells(st)[0].assetId;
const a1 = cells(st)[1].assetId;
await more(page, "Swap");
check((await S()).swapFrom === cells(st)[0].id, "swap mode on");
await tapEl(cells(st)[1]);
st = await S();
check(cells(st)[0].assetId === a1 && cells(st)[1].assetId === a0, "photos swapped");

console.log("5. Empty cells: 3 × 3 with 4 photos, fill one");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Layout" }).click();
await page.getByRole("button", { name: "Grid", exact: true }).click();
await page.getByRole("button", { name: /^3 × 3 9 photos/ }).click();
await page.getByRole("button", { name: "Use this layout" }).click();
st = await S();
const empties = cells(st).filter((e) => !e.assetId);
check(cells(st).length === 9 && empties.length === 5, `9 cells, ${empties.length} empty`);
// Off the + of an empty cell in a grid: selects the block (editor-v2/06 rule 6).
await tapEl(empties[0], empties[0].width * 0.35, 0);
check((await page.evaluate(() => window.__igEditor.getState().selectedId)) === st.doc.elements.find((e) => e.type === "layout").id, "tap beside the + selects the block");
// Right on the +: picks a photo for that cell at once.
const [chooser] = await Promise.all([page.waitForEvent("filechooser"), tapEl(empties[0])]);
check((await page.evaluate(() => window.__igEditor.getState().selectedId)) === empties[0].id, "tap on the + selects the empty cell and opens the picker");
await chooser.setFiles(path.join(dir, "p3.jpg"));
for (let i = 0; i < 30 && cells(st = await S()).filter((e) => !e.assetId).length !== 4; i++);
check(cells(st).filter((e) => !e.assetId).length === 4, "one empty cell filled");
await shot(page, "4-grid9");

console.log("6. Undo restores previous layouts");
const pastNow = st.past;
await page.getByRole("button", { name: "Done" }).click().catch(() => {});
await page.getByLabel("Undo").click();
await page.getByLabel("Undo").click();
st = await S();
check(cells(st).length === 4 && st.past === pastNow - 2, "back to 2 × 2");

console.log("7. Skip in picker keeps old behavior");
await page.getByLabel("Back").click();
await page.getByRole("button", { name: "New project" }).click();
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "panorama.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.getByText("4:5 · 5 slides").waitFor();
st = await S();
check(st.doc.elements.length === 1 && st.doc.elements[0].width === 5400, "skip → panorama across 5 slides");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
