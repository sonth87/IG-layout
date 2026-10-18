// Layout cells are ordinary elements (D-113): select a cell (second tap), drag = move the
// cell, handles resize / turn it, it stays in its block (moving the block carries it), a
// pinch zooms the picture inside, Layout / Adjust lay the cells out again.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, newProject, OUT, skipTips, URL_ARG } from "./lib.mjs";

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
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); if (m.text().startsWith("DBG")) console.log("   ", m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
const S = async () => {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, selected: s.selectedId };
  });
};
const toPage = (x, y) =>
  page.evaluate(
    ([x, y]) => {
      const st = window.__igEditor.getState().canvas.layer.getStage();
      const r = st.container().getBoundingClientRect();
      return { x: r.left + st.x() + x * st.scaleX(), y: r.top + st.y() + y * st.scaleY() };
    },
    [x, y],
  );
const drag = async (a, b) => {
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(200);
};
const el = (st, id) => st.doc.elements.find((e) => e.id === id);

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);
// A 2×2 grid on the slide.
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "New layer" }).click();
await page.getByRole("region", { name: "New layer" }).getByRole("button", { name: "Grid", exact: true }).click();
await page.getByRole("button", { name: "Grid 9", exact: true }).click();
await page.waitForTimeout(500);
let st = await S();
const block = st.doc.elements.find((e) => e.type === "layout" && !e.art && e.id === st.selected);
const cells = st.doc.elements.filter((e) => e.parentId === block.id);
check(!!block && cells.length === 4, "a 2 × 2 block");
// Zoom in a bit so it is easy to grab.
await page.getByRole("button", { name: "Zoom in" }).click();
await page.getByRole("button", { name: "Zoom in" }).click();
await page.waitForTimeout(400);
// Bring the block to the middle of the screen.
await page.evaluate((id) => {
  const s = window.__igEditor.getState();
  const b = s.doc.elements.find((e) => e.id === id);
  const st = s.canvas.layer.getStage();
  const area = document.querySelector("[data-stage-frame]").parentElement.parentElement;
  const r = st.container().getBoundingClientRect();
  const x = r.left + st.x() + (b.x + b.width / 2) * st.scaleX();
  const y = r.top + st.y() + (b.y + b.height / 2) * st.scaleY();
  area.scrollLeft += x - (r.left + r.width / 2);
  area.scrollTop += y - (r.top + r.height / 2);
}, block.id);
await page.waitForTimeout(300);

console.log("Select a cell: it has handles like any element");
const c0 = cells[0];
// Off the "+" (its touch area is ~22 screen px around it).
let p = await toPage(c0.x + c0.width * 0.15, c0.y + c0.height * 0.85);
console.log("   before tap selected:", (await S()).selected === block.id ? "block" : (await S()).selected, "point", p);
await page.mouse.click(p.x, p.y); // block already selected → the cell
await page.waitForTimeout(250);
st = await S();
console.log("   after tap:", st.selected, "cell", c0.id, "block", block.id);
check(st.selected === c0.id, "second tap selects the cell");
const tr = await page.evaluate(() => {
  const t = window.__igEditor.getState().canvas.layer.getStage().findOne("Transformer");
  return { n: t.nodes().map((x) => x.id()), resize: t.resizeEnabled(), rotate: t.rotateEnabled() };
});
check(tr.n[0] === c0.id && tr.resize && tr.rotate, "handles to resize and turn the cell");

// Off its "+", tapping an empty cell only selects it (owner, 2026-10-18).
check((await page.getByRole("region", { name: "Fill frame" }).count()) === 0, "an empty cell tapped off its “+”: selected, no Fill frame sheet");
// On its "+": selected and the sheet opens.
const plus = await toPage(cells[1].x + cells[1].width / 2, cells[1].y + cells[1].height / 2);
await page.mouse.click(plus.x, plus.y);
await page.waitForTimeout(300);
check((await S()).selected === cells[1].id && (await page.getByRole("region", { name: "Fill frame" }).isVisible()), "on its “+”: selected and Fill frame opens");
await page.getByRole("region", { name: "Fill frame" }).getByRole("button", { name: "Close", exact: true }).click();
await page.evaluate((id) => window.__igEditor.getState().select(id), c0.id);
await page.waitForTimeout(200);

console.log("Drag = move the cell");
// Lower part of the cell: the floating menu sits above the selection.
p = await toPage(c0.x + c0.width / 2, c0.y + c0.height * 0.78);
await drag(p, { x: p.x + 30, y: p.y + 20 });
st = await S();
let c1 = el(st, c0.id);
let b1 = el(st, block.id);
check(c1.x > c0.x + 20 && c1.y > c0.y + 10 && Math.abs(c1.crop.x - c0.crop.x) < 0.01, `the cell moved, not its picture (${c0.x.toFixed(0)} → ${c1.x.toFixed(0)})`);
check(b1.custom === true && Math.abs(b1.x - block.x) < 0.01, "the block remembers it; the block did not move");
await page.screenshot({ path: path.join(OUT, "slots-moved.png") });

console.log("The block carries its moved cell");
await page.evaluate((id) => window.__igEditor.getState().select(id), block.id);
await page.waitForTimeout(200);
const before = { cx: c1.x - b1.x, cy: c1.y - b1.y };
await page.evaluate((id) => {
  const s = window.__igEditor.getState();
  const b = s.doc.elements.find((e) => e.id === id);
  s.updateElement(id, { x: b.x + 100, y: b.y + 50 });
}, block.id);
st = await S();
const c2 = el(st, c0.id);
const b2 = el(st, block.id);
check(Math.abs(c2.x - b2.x - before.cx) < 0.5 && Math.abs(c2.y - b2.y - before.cy) < 0.5, "the cell keeps its place in the block");

console.log("Resize the cell (side handle)");
await page.evaluate((id) => window.__igEditor.getState().select(id), c0.id);
await page.waitForTimeout(250);
const right = await toPage(c2.x + c2.width, c2.y + c2.height / 2);
await drag(right, { x: right.x + 30, y: right.y });
st = await S();
const c3 = el(st, c0.id);
check(c3.width > c2.width + 20 && Math.abs(c3.height - c2.height) < 1, `wider (${c2.width.toFixed(0)} → ${c3.width.toFixed(0)})`);
const cellEntry = el(st, block.id).cells.find((c) => c.id === c0.id);
check(Math.abs(cellEntry.w * el(st, block.id).width - c3.width) < 0.5, "the block's cell entry follows");

console.log("Cell toolbar: Position, Lock, Duplicate (in the block)");
const names = await page.getByRole("region", { name: "Tools" }).getByRole("button").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") || e.innerText.trim()));
check(["Position", "Lock", "Duplicate"].every((n) => names.includes(n)), `cell toolbar: ${names.join(" · ")}`);
const n0 = (await S()).doc.elements.length;
await page.getByRole("region", { name: "Tools" }).getByRole("button", { name: "Duplicate" }).click();
st = await S();
const copy = st.doc.elements.find((e) => e.id === st.selected);
check(st.doc.elements.length === n0 + 1 && copy.parentId === block.id && el(st, block.id).cells.some((c) => c.id === copy.id), "the copy is another cell of the block");

console.log("Layout / Adjust lay the cells out again (with a notice)");
await page.evaluate((id) => window.__igEditor.getState().select(id), block.id);
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Adjust", exact: true }).click();
check(await page.getByRole("status").filter({ hasText: "laid out again" }).isVisible(), "notice before");
await page.getByRole("slider", { name: "Gap" }).fill("4");
await page.getByLabel("Apply").click();
st = await S();
check(!el(st, block.id).custom, "spacing changed → cells laid out by the pattern again");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
