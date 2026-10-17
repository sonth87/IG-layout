// M15 — canvas and slides (docs/product/editor-v2/05): every slide in view, smallest zoom
// springs back, ‖ ⋯ under every slide, + after the last one, slide menu, drag to reorder,
// "New slide" sheet with layouts / grids.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, OUT, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

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
    return { doc: s.doc, selected: s.selectedId, past: s.past.length };
  });
};
const store = (fn, ...args) => page.evaluate(([fn, args]) => window.__igEditor.getState()[fn](...args), [fn, args]);
const frame = () => page.locator("[data-stage-frame]").boundingBox();
const inView = (b) => b.x >= 0 && b.x + b.width <= 390;
const reorder = page.getByRole("button", { name: /^Move slide/ });
const menus = page.getByRole("button", { name: /^Slide \d+ options/ });
/** Which slide an element is on (by its centre). */
const slideOf = (el) => Math.floor((el.x + el.width / 2) / 1080);

await page.goto(URL_ARG);
await page.getByRole("button", { name: "New project" }).click();
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);
// Start from one slide with one photo on it.
await page.evaluate(() => {
  const s = () => window.__igEditor.getState();
  while (s().doc.slideCount > 1) s().deleteSlide(s().doc.slideCount - 1);
  window.__igEditor.getState().select(null);
});
await page.waitForTimeout(400);
// Something to follow slide 1 around.
await page.getByRole("button", { name: "Elements" }).click();
await page.getByRole("button", { name: "Heart", exact: true }).click();
await store("select", null);
await page.waitForTimeout(300);
let st = await S();
const photo = st.doc.elements.at(-1);

console.log("1. Buttons under the slides (§1)");
check(st.doc.slideCount === 1, "one slide");
check((await menus.count()) === 1 && (await reorder.count()) === 0, "one slide: only ⋯, no ‖");
check(await page.getByRole("button", { name: "Add slide" }).isVisible(), "+ after the last slide");

console.log("8. New slide sheet: Blank, Layouts, Grids (§5)");
await page.getByRole("button", { name: "Add slide" }).click();
const sheet = page.getByRole("region", { name: "New slide" });
check(await sheet.isVisible(), "+ opens “New slide”");
const nLayouts = await sheet.getByRole("button", { name: /^Layout \d+/ }).count();
const nGrids = await sheet.getByRole("button", { name: /^Grid \d+/ }).count();
check(nLayouts >= 12 && nGrids >= 30, `${nLayouts} layouts, ${nGrids} grids`);
await page.screenshot({ path: path.join(OUT, "m15-new-slide.png") });
await sheet.getByRole("button", { name: "Grid 9", exact: true }).click(); // 2 × 2
st = await S();
const block = st.doc.elements.find((e) => e.type === "layout" && slideOf(e) === 1);
const cells = st.doc.elements.filter((e) => e.parentId === block?.id);
check(st.doc.slideCount === 2 && !!block && cells.length === 4 && cells.every((c) => c.assetId === null), "Grid 2 × 2 → slide 2 holds a block of 4 empty cells");
check(Math.abs(block.width - 1080) < 1 && Math.abs(block.x - 1080) < 1, "the block covers the new slide");
check(st.selected === null, "nothing selected after adding");
await page.getByRole("button", { name: "Add slide" }).click();
await sheet.getByRole("button", { name: "Blank" }).click();
st = await S();
check(st.doc.slideCount === 3, "Blank → slide 3");
await page.waitForTimeout(500);
check((await reorder.count()) === 3 && (await menus.count()) === 3, "three slides: ‖ and ⋯ under each");
await store("select", block.id);
await page.waitForTimeout(200);
check((await reorder.count()) === 0 && (await menus.count()) === 0 && (await page.getByRole("button", { name: "Add slide" }).isVisible()), "something selected: ‖ ⋯ hidden, + stays");
await store("select", null);
await page.waitForTimeout(200);

console.log("2. Every slide in view (§2.1, 2.2)");
check(inView(await frame()), "3 slides fit the screen");
const w3 = (await frame()).width;
await page.getByRole("button", { name: "Add slide" }).click();
await sheet.getByRole("button", { name: "Blank" }).click();
await page.waitForTimeout(500);
const f4 = await frame();
check(f4.width / 4 <= w3 / 3 + 0.5, `adding slide 4 zooms out (slide ${Math.round(w3 / 3)} → ${Math.round(f4.width / 4)} px)`);
check(f4.width / 4 >= 390 * 0.25 - 1, "never below a quarter of the screen per slide");
await store("deleteSlide", 3);
await page.waitForTimeout(500);

console.log("3–4. Pinch: zoom in, below the smallest zoom springs back, double tap fits (§2.3, 2.4)");
let f = await frame();
const y = f.y + f.height / 2;
await touch("touchStart", [{ x: 170, y, id: 1 }, { x: 220, y, id: 2 }]);
for (let i = 1; i <= 8; i++) await touch("touchMove", [{ x: 170 - i * 10, y, id: 1 }, { x: 220 + i * 10, y, id: 2 }]);
await touch("touchEnd", []);
await page.waitForTimeout(300);
const zoomed = (await frame()).width;
check(zoomed > f.width * 1.5, `nothing selected: pinch zooms the canvas (${Math.round(f.width)} → ${Math.round(zoomed)})`);
// Double tap on empty canvas space (above the slides): back to every slide in view.
const ys = (await frame()).y - 40;
for (let n = 0; n < 2; n++) {
  await touch("touchStart", [{ x: 200, y: ys, id: 1 }]);
  await touch("touchEnd", []);
  await page.waitForTimeout(80);
}
await page.waitForTimeout(500);
check(Math.abs((await frame()).width - f.width) < 1, "double tap on empty space → every slide in view again");

console.log("5. ⋯ → Add left (§3)");
await menus.nth(1).click();
await page.getByRole("menuitem", { name: "Add left" }).click();
st = await S();
const movedBlock = st.doc.elements.find((e) => e.id === block.id);
check(st.doc.slideCount === 4 && slideOf(movedBlock) === 2, "a blank slide 2; the grid moved to slide 3");
check(st.doc.elements.filter((e) => e.parentId === block.id).every((c) => slideOf(c) === 2), "its cells moved with it");
check(slideOf(st.doc.elements.find((e) => e.id === photo.id)) === 0, "slide 1 untouched");

console.log("6. ⋯ → Duplicate (§3)");
const n0 = st.doc.elements.length;
await menus.nth(2).click();
await page.getByRole("menuitem", { name: "Duplicate" }).click();
st = await S();
const blocks = st.doc.elements.filter((e) => e.type === "layout");
check(st.doc.slideCount === 5 && st.doc.elements.length === n0 + 5, "slide copied right after, with its block and 4 cells");
check(blocks.length === 2 && slideOf(blocks[1]) === 3 && st.doc.elements.filter((e) => e.parentId === blocks[1].id).length === 4, "the copy has its own cells");

console.log("Delete slide asks first when something is on it");
await menus.nth(3).click();
await page.getByRole("menuitem", { name: "Delete slide" }).click();
await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
st = await S();
check(st.doc.slideCount === 4 && st.doc.elements.filter((e) => e.type === "layout").length === 1, "slide and its content deleted");

console.log("7. Drag ‖ to reorder (§4)");
await page.waitForTimeout(400);
const before = await S();
await page.evaluate(() => (document.querySelector(".bg-canvas").scrollLeft = 0));
await page.waitForTimeout(200);
const h = await reorder.nth(0).boundingBox();
const slidePx = (await frame()).width / before.doc.slideCount;
const start = { x: h.x + h.width / 2, y: h.y + h.height / 2 };
await touch("touchStart", [{ ...start, id: 1 }]);
await page.waitForTimeout(260); // hold
for (let i = 1; i <= 10; i++) await touch("touchMove", [{ x: start.x + (i * slidePx * 2) / 10, y: start.y + i * 3, id: 1 }]);
await page.waitForTimeout(100);
check((await menus.count()) === 0 && !(await page.getByRole("button", { name: "Add slide" }).isVisible()), "while dragging the other buttons hide");
const hb = await page.getByRole("button", { name: "Move slide 1" }).boundingBox();
check(Math.abs(hb.y + hb.height / 2 - start.y) < 2, "‖ follows the finger sideways only");
await touch("touchEnd", []);
await page.waitForTimeout(300);
st = await S();
check(slideOf(st.doc.elements.find((e) => e.id === photo.id)) === 2, "slide 1 is now slide 3, with its photo");
check(slideOf(st.doc.elements.find((e) => e.id === block.id)) === 1, "the grid moved left by one");
check((await menus.count()) === st.doc.slideCount, "buttons back after the drop");
await page.getByLabel("Undo").click();
st = await S();
check(slideOf(st.doc.elements.find((e) => e.id === photo.id)) === 0 && slideOf(st.doc.elements.find((e) => e.id === block.id)) === 2, "one undo puts everything back");

await page.screenshot({ path: path.join(OUT, "m15-slides.png") });
console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
