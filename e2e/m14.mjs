// M14 — layout blocks and the selection model (docs/product/editor-v2/02, 06, 07 §1–4;
// docs/dev/editor-v2.md): a grid is one block whose cells follow it; first tap selects the
// block, the next one the photo inside; one finger acts on the selection, else the canvas;
// side bars, turn handle below, box around the whole picture, equal-size ruler.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, OUT, skipTips, URL_ARG, newProject } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};
const near = (a, b, eps = 0.5) => Math.abs(a - b) <= eps;

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
    return { doc: s.doc, selected: s.selectedId, past: s.past.length };
  });
};
const store = (fn, ...args) => page.evaluate(([fn, args]) => window.__igEditor.getState()[fn](...args), [fn, args]);
/** Canvas px → page px. */
async function toPage(x, y) {
  const box = await page.locator("[data-stage-frame]").boundingBox();
  const k = box.width / (1080 * (await S()).doc.slideCount);
  return { x: box.x + x * k, y: box.y + y * k, k };
}
const centre = (el) => toPage(el.x + el.width / 2, el.y + el.height / 2);
async function tapAt(el, dx = 0, dy = 0) {
  const p = await toPage(el.x + el.width / 2 + dx, el.y + el.height / 2 + dy);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(100);
}
async function drag(from, to, steps = 10) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps });
}
/** Page position of a transformer handle ("bottom-right", "middle-right", "rotater"…). */
const anchor = (name) =>
  page.evaluate((name) => {
    const stage = window.__igEditor.getState().canvas.layer.getStage();
    const a = stage.findOne("Transformer").findOne(`.${name}`);
    const r = stage.container().getBoundingClientRect();
    const p = a.getAbsolutePosition();
    return { x: r.left + p.x, y: r.top + p.y };
  }, name);
const cellsOf = (st, block) => st.doc.elements.filter((e) => e.parentId === block.id);
const blockOf = (st) => st.doc.elements.find((e) => e.type === "layout");

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(["panorama.jpg", "portrait.jpg", "p3.jpg"].map((f) => path.join(dir, f)));
await page.getByText("Choose a layout").waitFor();
await page.getByRole("button", { name: "Grid", exact: true }).click();
await page.getByRole("button", { name: /^2 × 2 4 photos/ }).click();
await page.getByRole("button", { name: "Use this layout" }).click();
await page.waitForTimeout(600);

console.log("Data: a grid is one block with its cells (editor-v2/02 §3)");
let st = await S();
let block = blockOf(st);
let cells = cellsOf(st, block);
check(!!block && block.cells.length === 4 && cells.length === 4, "one layout block, four cells");
check(near(block.x, 0) && near(block.width, 1080), "the block covers the slide");
const iBlock = st.doc.elements.indexOf(block);
check(cells.every((c) => st.doc.elements.indexOf(c) > iBlock), "the cells are drawn above the block's place in the layers");
const empty = cells.find((c) => !c.assetId);
const full = cells.filter((c) => c.assetId);
check(!!empty && full.length === 3, "three photos, one empty cell");

console.log("Tap rules (editor-v2/06)");
await tapAt(full[0]);
check((await S()).selected === block.id, "rule 2: first tap on a cell photo selects the block");
await tapAt(full[0]);
check((await S()).selected === full[0].id, "rule 3: tapping again goes into that photo");
await tapAt(full[1]);
check((await S()).selected === full[1].id, "rule 5: another cell of the same block is selected directly");
await tapAt(empty, empty.width * 0.35, 0);
check((await S()).selected === block.id, "rule 6: beside the + of an empty cell → the block");
await tapAt(empty);
const fillSheet = page.getByRole("region", { name: "Fill frame" });
check((await fillSheet.isVisible()) && (await S()).selected === empty.id, "rule 6: on the + → that cell is selected and “Fill frame” opens");
await fillSheet.getByRole("button", { name: "Close" }).click();
// Well below the slide (under its ‖ ⋯ buttons): no element there.
const below = await toPage(540, 1350 + 300);
await page.mouse.click(below.x, below.y);
check((await S()).selected === null, "tap where there is no element deselects");

console.log("One finger: nothing selected → canvas; block selected → moves with its cells");
st = await S();
const c0 = cellsOf(st, block)[0];
let p = await centre(c0);
await drag(p, { x: p.x - 60, y: p.y });
await page.mouse.up();
st = await S();
check(near(blockOf(st).x, block.x), "nothing selected: a drag does not move the block");
await tapAt(c0);
check((await S()).selected === block.id, "block selected");
const menuOpacity = () => page.evaluate(() => document.querySelector('[aria-label="Quick actions"]')?.style.opacity);
check((await menuOpacity()) === "1", "floating menu shown over the block");
p = await centre(c0);
const k = p.k;
await drag(p, { x: p.x + 40, y: p.y + 30 });
check((await menuOpacity()) === "0", "floating menu hides during the move");
await page.mouse.up();
await page.waitForTimeout(200);
check((await menuOpacity()) === "1", "…and comes back when the finger lifts");
st = await S();
let b2 = blockOf(st);
const dx = b2.x - block.x;
const dy = b2.y - block.y;
check(dx > 20 / k && dy > 10 / k, `the block moved (${dx.toFixed(0)}, ${dy.toFixed(0)})`);
check(
  cellsOf(st, b2).every((c, i) => near(c.x - cells[i].x, dx, 1) && near(c.y - cells[i].y, dy, 1)),
  "every cell moved with it",
);
check(cellsOf(st, b2).every((c, i) => near(c.crop.x, cells[i].crop.x) && near(c.crop.width, cells[i].crop.width)), "the photos in the cells did not change");
await page.getByLabel("Undo").click();
st = await S();
check(near(blockOf(st).x, block.x) && near(cellsOf(st, block)[0].x, cells[0].x), "one undo puts block and cells back");

console.log("Handles: side bar stretches the block, cells follow");
await store("select", block.id);
await page.waitForTimeout(200);
await store("updateElement", block.id, { x: 140, y: 170, width: 800, height: 1000 });
st = await S();
block = blockOf(st);
cells = cellsOf(st, block);
check(near(cells[0].x, 140, 30) && cells[0].width < 420, "resizing the block in the store resizes its cells");
let a = await anchor("middle-right");
await drag(a, { x: a.x + 30, y: a.y });
await page.mouse.up();
st = await S();
b2 = blockOf(st);
check(b2.width > block.width + 20 / k && near(b2.height, block.height, 1), `side bar: wider only (${block.width.toFixed(0)} → ${b2.width.toFixed(0)}, h ${b2.height.toFixed(0)})`);
const right = cellsOf(st, b2).reduce((m, c) => Math.max(m, c.x + c.width), 0);
check(near(right, b2.x + b2.width, 40), "cells still fill the block");
check(cellsOf(st, b2).every((c) => near(c.crop.width / c.crop.height, (c.width - 0) / c.height, 0.02) || c.frame !== "none" || !c.assetId), "cell photos re-cropped, not stretched");

console.log("Handles: turn handle below rotates the block and its cells");
a = await anchor("rotater");
const mid = await centre(b2);
check(a.y > mid.y, "the turn handle is below the element");
await drag(a, { x: mid.x + (a.y - mid.y), y: mid.y }, 12); // quarter turn
await page.mouse.up();
st = await S();
b2 = blockOf(st);
check(Math.abs(b2.rotation) > 30, `the block turned (${b2.rotation.toFixed(1)}°)`);
check(cellsOf(st, b2).every((c) => near(c.rotation, b2.rotation, 0.1)), "the cells turned with it");
await store("updateElement", block.id, { rotation: 0 });

console.log("Photo in a cell: box around the whole picture (editor-v2/07 §1)");
st = await S();
// The narrowest picture, so its handles are on screen (the panorama's are not).
const assets = await page.evaluate(() => window.__igEditor.getState().assets);
const photo = cellsOf(st, blockOf(st))
  .filter((c) => c.assetId)
  .sort((a, b) => assets[a.assetId].width / assets[a.assetId].height - assets[b.assetId].width / assets[b.assetId].height)[0];
await store("select", photo.id);
await page.waitForTimeout(250);
const tr = await page.evaluate(() => {
  const stage = window.__igEditor.getState().canvas.layer.getStage();
  const t = stage.findOne("Transformer");
  const n = t.nodes()[0];
  return { id: n?.id(), w: n?.width(), h: n?.height(), rotate: t.rotateEnabled() };
});
const asset = await page.evaluate((id) => window.__igEditor.getState().assets[id], photo.assetId);
const z = photo.width / photo.crop.width;
check(tr.id === "__whole-picture" && near(tr.w, asset.width * z, 2) && near(tr.h, asset.height * z, 2), `the box is the whole picture (${tr.w?.toFixed(0)} × ${tr.h?.toFixed(0)})`);
check(!tr.rotate, "no turn handle on a photo inside a cell");
a = await anchor("bottom-right");
await drag(a, { x: a.x + 40, y: a.y + 40 });
await page.mouse.up();
st = await S();
const photo2 = st.doc.elements.find((e) => e.id === photo.id);
check(photo2.crop.width < photo.crop.width - 1 && near(photo2.x, photo.x) && near(photo2.width, photo.width), "corner handle zooms the photo inside, the cell stays");

console.log("Equal-size ruler (editor-v2/07 §4)");
await store("select", null);
await page.getByRole("button", { name: "Shapes", exact: true }).click(); // Shapes library (M19)
await page.getByRole("button", { name: "Heart", exact: true }).click();
await page.getByRole("button", { name: "Done" }).click().catch(() => {});
await page.getByRole("button", { name: "Shapes", exact: true }).click(); // Shapes library (M19)
await page.getByRole("button", { name: "Heart", exact: true }).click();
st = await S();
const [h1, h2] = st.doc.elements.filter((e) => e.type === "shape" || e.type === "icon").slice(-2);
await store("updateElement", h1.id, { x: 100, y: 1000, width: 300, height: 300 });
await store("updateElement", h2.id, { x: 600, y: 1000, width: 240, height: 240 });
await store("select", h2.id);
await page.waitForTimeout(250);
a = await anchor("middle-right");
const target = (300 - 240) * k + 2; // a little past the other heart's width
await drag(a, { x: a.x + target, y: a.y }, 15);
const rulers = await page.evaluate(() => window.__igEditor.getState().canvas.layer.getStage().findOne(".rulers").getChildren().length);
check(rulers >= 6, `ruler drawn over both hearts while sizes match (${rulers} lines)`);
await page.mouse.up();
st = await S();
check(near(st.doc.elements.find((e) => e.id === h2.id).width, 300, 0.5), "the width snapped to exactly the other heart's");
check((await page.evaluate(() => window.__igEditor.getState().canvas.layer.getStage().findOne(".rulers").getChildren().length)) === 0, "ruler gone when the finger lifts");

console.log("Duplicate / delete a block takes its cells");
st = await S();
block = blockOf(st);
const n0 = st.doc.elements.length;
await store("duplicateElement", block.id);
st = await S();
const blocks = st.doc.elements.filter((e) => e.type === "layout");
check(blocks.length === 2 && st.doc.elements.length === n0 + 5, "duplicate copies the block and its 4 cells");
check(cellsOf(st, blocks[1]).length === 4 && cellsOf(st, blocks[0]).length === 4, "each block has its own cells");
await store("removeElement", blocks[1].id);
st = await S();
check(st.doc.elements.length === n0, "delete removes the block with its cells");
const cell = cellsOf(st, block).find((c) => c.assetId);
await store("removeElement", cell.id);
st = await S();
check(st.doc.elements.find((e) => e.id === cell.id)?.assetId === null, "deleting a cell photo leaves an empty cell");

console.log("Projects saved before M14 open with their grid as a block (editor-v2/02 §7)");
await page.waitForTimeout(1500); // autosave
const pid = await page.evaluate(() => window.__igEditor.getState().projectId);
await page.evaluate(
  (id) =>
    new Promise((resolve, reject) => {
      const req = indexedDB.open("ig-layout");
      req.onsuccess = () => {
        const tx = req.result.transaction("states", "readwrite");
        const states = tx.objectStore("states");
        const get = states.get(id);
        get.onsuccess = () => {
          const old = (doc) => ({ ...doc, elements: doc.elements.filter((e) => e.type !== "layout").map((e) => { const c = { ...e }; delete c.parentId; return c; }) });
          states.put({ ...get.result, doc: old(get.result.doc), past: [], future: [] });
        };
        tx.oncomplete = () => resolve(null);
        tx.onerror = () => reject(tx.error);
      };
    }),
  pid,
);
await page.evaluate((id) => window.__igEditor.getState().openProject(id), pid);
st = await S();
const migrated = blockOf(st);
check(!!migrated && cellsOf(st, migrated).length === 4, "old flat cells are grouped into one block per slide");
check(st.doc.elements.filter((e) => e.type === "shape" || e.type === "icon").every((e) => !e.parentId), "free elements stay free");

await store("select", blockOf(st).id);
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "m14-blocks.png") });
console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
