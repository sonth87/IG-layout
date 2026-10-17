// M17 — toolbars and editing sheets (docs/product/editor-v2/07 §5, 08): per-kind toolbars,
// Position (arrange, align, fill, advanced numbers), block Layout and Adjust.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, OUT, skipTips, URL_ARG } from "./lib.mjs";

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
const select = async (id) => {
  await page.evaluate((id) => window.__igEditor.getState().select(id), id);
  await page.waitForTimeout(200);
};
const tools = page.getByRole("region", { name: "Tools" });
const toolNames = async () => (await tools.getByRole("button").allTextContents()).map((s) => s.trim()).filter(Boolean);
const apply = () => page.getByLabel("Apply").click();
const cancel = () => page.getByRole("button", { name: "Cancel" }).click();

await page.goto(URL_ARG);
await page.getByRole("button", { name: "New project" }).click();
await page.locator('input[type="file"]').setInputFiles(["p3.jpg", "p4.jpg", "portrait.jpg", "panorama.jpg"].map((f) => path.join(dir, f)));
await page.getByText("Choose a layout").waitFor();
await page.getByRole("button", { name: "Grid", exact: true }).click();
await page.getByRole("button", { name: /^2 × 2 4 photos/ }).click();
await page.getByRole("button", { name: "Use this layout" }).click();
await page.waitForTimeout(600);
let st = await S();
const block = st.doc.elements.find((e) => e.type === "layout");

console.log("Toolbars by kind (07 §5)");
await select(block.id);
let names = await toolNames();
check(["Layout", "Adjust", "Position", "Lock", "Duplicate", "Delete"].every((n) => names.includes(n)), `block: ${names.join(" · ")}`);
const photo = st.doc.elements.find((e) => e.parentId === block.id && e.assetId);
await select(photo.id);
names = await toolNames();
check(["Replace", "Crop", "Style", "Adjust", "Filters", "Clear", "Delete"].every((n) => names.includes(n)) && !names.includes("Position"), `photo in a cell: ${names.join(" · ")}`);
const scroller = tools.locator(".overflow-x-auto");
check(await scroller.evaluate((e) => e.scrollWidth > e.clientWidth), "the bar slides sideways when the tools don't fit");
check(await page.getByRole("button", { name: "Done" }).isVisible(), "✕ to deselect");
await select(null);
await page.getByRole("button", { name: "Text", exact: true }).click();
await page.getByRole("textbox", { name: "Edit text" }).fill("Hello");
await page.getByRole("dialog").getByRole("button", { name: "Done" }).click();
st = await S();
const text = st.doc.elements.find((e) => e.type === "text");
await select(text.id);
names = await toolNames();
check(["Edit", "Position", "Lock", "Duplicate", "Delete"].every((n) => names.includes(n)), `text: ${names.join(" · ")}`);

console.log("Position → Align left (08 §7.1)");
await page.getByRole("button", { name: "Position" }).click();
const sheet = page.getByRole("region", { name: "Position" });
check(await sheet.isVisible(), "Position sheet with tabs");
await sheet.getByRole("button", { name: "Left" }).nth(1).click(); // Nudge Left is first, Align Left second
await apply();
st = await S();
let t1 = st.doc.elements.find((e) => e.id === text.id);
check(near(t1.x, 0), `text's left edge on the slide's left edge (x = ${t1.x.toFixed(1)})`);

console.log("Position → Advanced: lock ratio, rotation (08 §7.3)");
await select(text.id);
await page.getByRole("button", { name: "Position" }).click();
await sheet.getByRole("tab", { name: "Advanced" }).click();
await sheet.getByLabel("Rotate").fill("15");
await sheet.getByLabel("Rotate").press("Enter");
await apply();
st = await S();
check(near(st.doc.elements.find((e) => e.id === text.id).rotation, 15), "Rotate 15 → 15°");
// A free photo for the size / fill checks.
await select(null);
await page.locator('input[type="file"][multiple]').first().setInputFiles(path.join(dir, "portrait.jpg"));
for (let i = 0; i < 30 && (st = await S()).doc.elements.at(-1).type !== "image"; i++) await page.waitForTimeout(100);
const free = st.doc.elements.at(-1);
await select(free.id);
await page.getByRole("button", { name: "Position" }).click();
await sheet.getByRole("tab", { name: "Advanced" }).click();
await sheet.getByLabel("Width").fill("500");
await sheet.getByLabel("Width").press("Enter");
await page.waitForTimeout(100);
const h500 = Number(await sheet.getByLabel("Height").inputValue());
check(Math.abs(h500 - Math.round((free.height * 500) / free.width)) <= 1, `ratio kept: width 500 → height ${h500}`);
await cancel();
st = await S();
check(near(st.doc.elements.find((e) => e.id === free.id).width, free.width), "✕ puts it back");

console.log("Position → Fill → Width 2× (08 §7.2) — needs two slides");
await page.evaluate(() => window.__igEditor.getState().addSlide(1, null));
await select(free.id);
await page.getByRole("button", { name: "Position" }).click();
await sheet.getByRole("button", { name: "Width 2×" }).click();
const past0 = (await S()).past;
await apply();
st = await S();
let f2 = st.doc.elements.find((e) => e.id === free.id);
check(near(f2.width, 2160) && near(f2.x, 0), `two slides wide across slides 1–2 (x ${f2.x.toFixed(0)}, w ${f2.width.toFixed(0)})`);
check(st.past === past0 + 1, "one undo step");

console.log("Style: each corner, shadow angle, custom colour, one undo step (08 §7.4, 7.5, 7.7)");
await select(free.id);
const pastStyle = (await S()).past;
await page.getByRole("button", { name: "Style" }).click();
const style = page.getByRole("region", { name: "Style" });
await style.getByRole("checkbox", { name: "Each corner" }).check();
await style.getByRole("slider", { name: "Top left" }).fill("60");
await style.getByRole("slider", { name: "Top right" }).fill("60");
await style.getByRole("button", { name: /^Shadow/ }).click();
await style.getByRole("checkbox").check();
await style.getByRole("slider", { name: "Angle" }).fill("45");
await style.getByLabel("HEX").fill("#123456");
await style.getByLabel("HEX").press("Enter");
await page.waitForTimeout(100);
check(await style.getByRole("button", { name: "#123456" }).first().isVisible(), "a custom colour shows up among the recent ones");
await apply();
st = await S();
const fs = st.doc.elements.find((e) => e.id === free.id);
check(JSON.stringify(fs.corners) === "[60,60,0,0]" && fs.mask === "rounded", `only the two top corners rounded (${JSON.stringify(fs.corners)})`);
check(fs.shadow && fs.shadowStyle?.angle === 45 && fs.shadowStyle?.color === "#123456", "shadow at 45° in the custom colour");
check(st.past === pastStyle + 1, "several changes in the sheet = one undo step");
await page.getByLabel("Undo").click();
st = await S();
check(!st.doc.elements.find((e) => e.id === free.id).corners, "one undo puts the style back");

console.log("Block → Layout: 4 photos into 2 cells (08 §7.6)");
await select(block.id);
await page.getByRole("button", { name: "Layout" }).click();
await page.getByRole("region", { name: "Layout" }).getByRole("button", { name: "Grid 1", exact: true }).click(); // 2 side by side
await apply();
check(await page.getByRole("status").filter({ hasText: "2 photo(s) placed outside the grid" }).isVisible(), "note: 2 photos outside");
st = await S();
const b2 = st.doc.elements.find((e) => e.id === block.id);
const kids = st.doc.elements.filter((e) => e.parentId === block.id);
check(b2.cells.length === 2 && kids.length === 2 && kids.every((k) => k.assetId), "2 cells, both with a photo");
check(st.doc.elements.filter((e) => e.type === "image" && !e.parentId && e.assetId).length === 3, "2 photos became free (plus the free one)");
check(near(b2.x, block.x) && near(b2.width, block.width), "the block keeps its place and size");
await page.getByLabel("Undo").click();
st = await S();
check(st.doc.elements.find((e) => e.id === block.id).cells.length === 4, "undo: 4 cells again");

console.log("Block → Adjust: gap, corners, background (08 §5)");
await select(block.id);
await page.getByRole("button", { name: "Layout" }).click();
await page.getByRole("region", { name: "Layout" }).getByRole("button", { name: "Grid 9", exact: true }).click(); // 2 × 2, spaced
await apply();
await select(block.id);
await page.getByRole("button", { name: "Adjust" }).click();
const adjust = page.getByRole("region", { name: "Adjust" });
await adjust.getByRole("slider", { name: "Gap" }).fill("40");
await adjust.getByRole("slider", { name: "Corners" }).fill("30");
await adjust.getByRole("button", { name: "#111111" }).click();
await apply();
st = await S();
const b3 = st.doc.elements.find((e) => e.id === block.id);
const c3 = st.doc.elements.filter((e) => e.parentId === block.id).sort((a, b) => a.x - b.x || a.y - b.y);
check(near(c3[2].x - (c3[0].x + c3[0].width), 40, 1), `40 px between cells (${(c3[2].x - (c3[0].x + c3[0].width)).toFixed(1)})`);
check(c3.every((c) => c.mask === "rounded" && near(c.cornerRadius, 30, 0.5)), "every cell rounded 30 px");
check(b3.fill === "#111111", "dark colour behind the cells");
await page.screenshot({ path: path.join(OUT, "m17-block.png") });

console.log("Bottom sheet 50 – 95 %, pushes the canvas up (12 §1)");
await select(null);
await page.getByRole("button", { name: "Layers", exact: true }).click();
const layers = page.getByRole("region", { name: "Layers" });
await page.waitForTimeout(400);
const H = 844;
let lb = await layers.boundingBox();
check(Math.abs(lb.height - H * 0.5) < 4, `opens at 50 % (${Math.round(lb.height)} px)`);
let fr = await page.locator("[data-stage-frame]").boundingBox();
check(fr.y + fr.height <= lb.y + 1, "the canvas sits above it");
const handle = layers.getByRole("separator");
const dragTo = async (y) => {
  const b = await handle.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, y, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(400);
};
await dragTo(40);
lb = await layers.boundingBox();
check(lb.height > H * 0.85, `dragged up → about 95 % (${Math.round(lb.height)} px, header stays)`);
await dragTo(H * 0.68); // ~32 % tall
lb = await layers.boundingBox();
check(Math.abs(lb.height - H * 0.5) < 4, `released between 20 and 50 % → back to 50 % (${Math.round(lb.height)} px)`);
await dragTo(H * 0.9); // ~10 % tall
check(!(await layers.isVisible()), "released under 20 % → closed");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
