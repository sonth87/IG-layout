// M8 — UX fixes from docs/discussions/2026-10-14-danh-gia-ux.md, checked on a touch phone.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, OUT as out, skipOnboarding, URL_ARG } from "./lib.mjs";

const url = URL_ARG;
const shot = (p, n) => p.screenshot({ path: path.join(out, `m8-${n}.png`) });
let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await skipOnboarding(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const cdp = await context.newCDPSession(page);

const S = async () => {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, selected: s.selectedId, past: s.past.length, editing: s.editingTextId };
  });
};
const touch = (type, points) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
async function swipe(x1, y, x2) {
  await touch("touchStart", [{ x: x1, y }]);
  for (let i = 1; i <= 10; i++) await touch("touchMove", [{ x: x1 + ((x2 - x1) * i) / 10, y }]);
  await touch("touchEnd", []);
  await page.waitForTimeout(500);
}
async function tap(x, y) {
  await touch("touchStart", [{ x, y }]);
  await touch("touchEnd", []);
  await page.waitForTimeout(250);
}
/** Canvas (export px) → page coordinates, accounting for scroll. */
async function toPage(x, y) {
  const box = await page.locator("[data-stage-frame]").boundingBox();
  const st = await S();
  const w = st.doc.slideCount * 1080;
  const k = box.width / w;
  return { x: box.x + x * k, y: box.y + y * k };
}
const scrollLeft = () => page.evaluate(() => document.querySelector(".bg-canvas").scrollLeft);

await page.goto(url);
await page.getByRole("button", { name: "New project" }).click();
await page.locator('input[type="file"]').setInputFiles(["panorama.jpg", "portrait.jpg", "p3.jpg", "p4.jpg"].map((f) => path.join(dir, f)));
await page.getByRole("button", { name: /Panorama \+ 3 floating/ }).click();
await page.getByRole("button", { name: "Use this layout" }).click();
await page.waitForTimeout(700);

console.log("UX-17 first-run tips");
check(await page.getByText("Quick tips").isVisible(), "tips shown on first open");
await shot(page, "1-tips");
await page.getByRole("button", { name: "Got it" }).click();

console.log("UX-01 swipe scrolls; background photo is locked");
let st = await S();
check(st.doc.elements[0].locked === true, "panorama background is locked");
const area = await page.locator("[data-stage-frame]").boundingBox();
await swipe(area.x + 300, area.y + area.height - 30, area.x + 40);
st = await S();
// Every slide is in view now (editor-v2/05 §2): just a little left to scroll.
const fits = await page.evaluate(() => {
  const a = document.querySelector(".bg-canvas");
  return a.scrollWidth <= a.clientWidth;
});
check((fits || (await scrollLeft()) > 0) && st.doc.elements[0].x === 0, `swipe scrolls the slides if they overflow (${await scrollLeft()} px), background did not move`);
await page.evaluate(() => (document.querySelector(".bg-canvas").scrollLeft = 0));
await page.waitForTimeout(300);

console.log("UX-01 tap to select, then drag; tap background to deselect");
const photo = st.doc.elements[1];
let p = await toPage(photo.x + photo.width / 2, photo.y + photo.height / 2);
await swipe(p.x, p.y, p.x - 40); // not selected yet: must not move it
st = await S();
check(st.doc.elements[1].x === photo.x, "an unselected photo is not dragged by a swipe");
await page.evaluate(() => (document.querySelector(".bg-canvas").scrollLeft = 0));
await page.waitForTimeout(300);
p = await toPage(photo.x + photo.width / 2, photo.y + photo.height / 2);
await tap(p.x, p.y);
st = await S();
check(st.selected === photo.id, "tap selects it");
await swipe(p.x, p.y, p.x - 40);
st = await S();
check(st.doc.elements[1].x < photo.x - 10, "once selected, dragging moves it");
const bgPoint = await toPage(40, st.doc.elements[0].height - 40);
await tap(bgPoint.x, bgPoint.y);
// editor-v2/06 rule 7: a locked element can still be selected (to unlock it…).
check((await S()).selected === st.doc.elements[0].id, "tapping the locked background selects it");
await swipe(bgPoint.x, bgPoint.y, bgPoint.x - 60);
check((await S()).doc.elements[0].x === 0, "the locked background does not move");

console.log("UX-03 compact toolbar, duplicate/delete always visible");
p = await toPage(st.doc.elements[2].x + st.doc.elements[2].width / 2, st.doc.elements[2].y + st.doc.elements[2].height / 2);
await page.evaluate(([x]) => (document.querySelector(".bg-canvas").scrollLeft = Math.max(0, x - 150)), [p.x]);
await page.waitForTimeout(300);
const el2 = (await S()).doc.elements[2];
p = await toPage(el2.x + el2.width / 2, el2.y + el2.height / 2);
await tap(p.x, p.y);
const overflow = await page.evaluate(() => {
  const sec = [...document.querySelectorAll("section")].at(-1);
  return sec.scrollWidth - sec.clientWidth;
});
check(overflow <= 0, "bottom toolbar fits the screen");
check(await page.getByRole("button", { name: "Duplicate" }).isVisible(), "Duplicate visible");
check(await page.getByRole("button", { name: "Delete" }).isVisible(), "Delete visible");
await shot(page, "2-toolbar");

console.log("UX-09 grid cells: outline only");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Layout" }).click();
await page.getByRole("button", { name: "Grid", exact: true }).click();
await page.getByRole("button", { name: /^2 × 2 4 photos/ }).click();
await page.getByRole("button", { name: "Use this layout" }).click();
st = await S();
const handles = async (id) => {
  await page.evaluate((id) => window.__igEditor.getState().select(id), id);
  await page.waitForTimeout(200);
  return page.evaluate(() => {
    const stage = window.__igEditor.getState().canvas.layer.getStage();
    const t = stage.findOne("Transformer");
    return { resize: t.resizeEnabled(), rotate: t.rotateEnabled(), nodes: t.nodes().map((n) => n.id()) };
  });
};
const blk = st.doc.elements.find((e) => e.type === "layout");
let tr = await handles(blk.id);
check(tr.nodes[0] === blk.id && tr.resize && tr.rotate, "the layout block resizes and turns like any element");
tr = await handles(st.doc.elements.find((e) => e.parentId === blk.id).id);
check(tr.nodes[0] === "__whole-picture" && tr.resize && !tr.rotate, "a cell photo: box around the whole picture, corners zoom, no turning");

console.log("UX-02 re-layout keeps text");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Text", exact: true }).click();
await page.getByRole("textbox", { name: "Edit text" }).fill("Giữ lại");
await page.getByRole("dialog").getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Layout" }).click();
await page.getByRole("button", { name: "Grid", exact: true }).click();
await page.getByRole("button", { name: /^1 big \+ 3/ }).click();
await page.getByRole("button", { name: "Use this layout" }).click();
st = await S();
check(st.doc.elements.some((e) => e.type === "text" && e.text === "Giữ lại"), "text survived the layout change");
const text = st.doc.elements.find((e) => e.type === "text");
check(!!text.background, "UX-12 new text has a readable background box");

console.log("UX-12 double-tap text to edit");
p = await toPage(text.x + text.width / 2, text.y + text.height / 2);
await tap(p.x, p.y);
await tap(p.x, p.y);
await page.waitForTimeout(200);
check((await S()).editing === text.id, "double-tap opened the text editor");
await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();

console.log("UX-07 pinch: nothing selected zooms the canvas; selected element scales");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Elements" }).click();
await page.getByRole("button", { name: "Heart", exact: true }).click();
st = await S();
const heart = st.doc.elements.at(-1);
await page.evaluate(() => window.__igEditor.getState().select(null));
p = await toPage(heart.x + heart.width / 2, heart.y + heart.height / 2);
await touch("touchStart", [{ x: p.x - 20, y: p.y, id: 1 }, { x: p.x + 20, y: p.y, id: 2 }]);
for (let d = 24; d <= 60; d += 6) await touch("touchMove", [{ x: p.x - d, y: p.y, id: 1 }, { x: p.x + d, y: p.y, id: 2 }]);
await touch("touchEnd", []);
st = await S();
check(st.selected === null && st.doc.elements.find((e) => e.id === heart.id).width === heart.width, "nothing selected: the pinch does not touch the element under the fingers");
await page.getByRole("button", { name: "Fit" }).click(); // that pinch zoomed the canvas
await page.waitForTimeout(300);
await page.evaluate((id) => window.__igEditor.getState().select(id), heart.id);
await page.waitForTimeout(200);
p = await toPage(heart.x + heart.width / 2, heart.y + heart.height / 2);
await touch("touchStart", [{ x: p.x - 20, y: p.y, id: 1 }, { x: p.x + 20, y: p.y, id: 2 }]);
for (let d = 24; d <= 60; d += 6) await touch("touchMove", [{ x: p.x - d, y: p.y, id: 1 }, { x: p.x + d, y: p.y, id: 2 }]);
await touch("touchEnd", []);
st = await S();
const heart2 = st.doc.elements.find((e) => e.id === heart.id);
check(st.selected === heart.id && heart2.width > heart.width * 2, `selected: the pinch scales it (${Math.round(heart.width)} → ${Math.round(heart2.width)})`);

console.log("UX-10 layers sheet: select + lock");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Layers", exact: true }).click();
await shot(page, "3-layers");
const rows = page.getByRole("region", { name: "Layers" }).locator("li");
// One row per outermost element: a layout block stands for its cells.
check((await rows.count()) === st.doc.elements.filter((e) => !e.parentId).length, `every element listed (${await rows.count()})`);
await rows.last().getByRole("button", { name: "Lock" }).click();
st = await S();
check(st.doc.elements[0].locked === true, "lock from the layers list");
await rows.last().locator("button").first().click();
st = await S();
check(st.selected === st.doc.elements[0].id, "select the bottom layer from the list");

console.log("UX-08 canvas does not jump when a tool opens");
await page.getByRole("button", { name: "Done" }).click();
const textEl = st.doc.elements.find((e) => e.type === "text");
await page.evaluate((id) => window.__igEditor.getState().select(id), textEl.id);
await page.waitForTimeout(200);
const h0 = (await page.locator("[data-stage-frame]").boundingBox()).height;
await page.getByRole("button", { name: "Style" }).click();
await page.waitForTimeout(300);
const h1 = (await page.locator("[data-stage-frame]").boundingBox()).height;
check(Math.abs(h1 - h0) < 1, `canvas keeps its size (${Math.round(h0)} → ${Math.round(h1)})`);

console.log("UX-13 slider reset button");
await page.getByRole("tab", { name: "Style" }).click();
await page.getByRole("slider").first().fill("200");
await page.getByRole("button", { name: /^Reset Size/ }).click();
check((await page.getByRole("slider").first().inputValue()) === "97", "reset returns the size to its default");
await page.getByLabel("Cancel").click();

console.log("UX-06 zoom");
await page.getByRole("button", { name: "Done" }).click();
const w0 = (await page.locator("[data-stage-frame]").boundingBox()).width;
check(!(await page.getByRole("button", { name: "Zoom in" }).isVisible()), "touch: no zoom buttons over the canvas (pinch instead)");
// Pinch on the empty space under the canvas.
const fb = await page.locator("[data-stage-frame]").boundingBox();
const zy = fb.y + fb.height + 14;
await touch("touchStart", [{ x: 150, y: zy }, { x: 240, y: zy }]);
for (let i = 1; i <= 10; i++) await touch("touchMove", [{ x: 150 - i * 6, y: zy }, { x: 240 + i * 6, y: zy }]);
await touch("touchEnd", []);
await page.waitForTimeout(300);
const w1 = (await page.locator("[data-stage-frame]").boundingBox()).width;
check(w1 > w0 * 1.4, `pinch zooms the canvas (${Math.round(w0)} → ${Math.round(w1)})`);
await page.getByRole("button", { name: "Fit" }).click();
await page.waitForTimeout(300);
check(Math.abs((await page.locator("[data-stage-frame]").boundingBox()).width - w0) < 1, "the % pill fits the canvas back");

console.log("UX-04 → editor-v2/05: + after the last slide, ‖ ⋯ under every slide");
check((await page.getByRole("button", { name: /^Slide \d options/ }).count()) === 1, "one slide: only ⋯ under it");
check((await page.getByRole("button", { name: /^Move slide/ }).count()) === 0, "one slide: no ‖");
await page.getByRole("button", { name: "Add slide" }).click();
await page.getByRole("region", { name: "New slide" }).getByRole("button", { name: "Blank" }).click();
st = await S();
check(st.doc.slideCount === 2, "+ → New slide → Blank adds a slide");
await page.waitForTimeout(600);
check((await page.getByRole("button", { name: /^Move slide/ }).count()) === 2, "two slides: ‖ under each");
await shot(page, "4-slides");

console.log("UX-11 saved indicator");
await page.waitForTimeout(1200);
check(await page.getByText("Saved").isVisible(), "“Saved” shown in the header");

console.log("UX-16 file names use the project name");
await page.getByRole("button", { name: "Export" }).click();
await page.getByText(/images · JPEG/).waitFor();
const names = await page.locator("figcaption").allTextContents();
check(names.every((n) => /^post-[a-z0-9-]+_0\d\.jpg$/.test(n)), `names: ${names.join(", ")}`);
await page.getByLabel("Back to editor").click();

console.log("UX-14 story layouts exclude seamless");
await page.getByLabel("Back").click();
await page.getByRole("button", { name: "New project" }).click();
await page.getByRole("radio", { name: /Story/ }).click();
await page.locator('input[type="file"]').setInputFiles(["portrait.jpg", "p3.jpg"].map((f) => path.join(dir, f)));
await page.getByText("Choose a layout").waitFor();
const groups = await page.locator("nav button").allTextContents();
check(!groups.includes("Seamless"), `story layout groups: ${groups.join(", ")}`);

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
