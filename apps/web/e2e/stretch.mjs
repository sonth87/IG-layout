// Side handles (owner, 2026-10-20): a line of text keeps its side handles (moved outside a
// short edge instead of hidden) and they size the letters with the box (owner, 2026-10-28);
// a boarding pass stretched sideways gets a wider layout —
// same text size, the height follows — instead of scaling up.
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
page.on("pageerror", (e) => errors.push(String(e)));
const S = () => page.evaluate(() => window.__igEditor.getState());
/** Page position of a transformer handle's drawn middle. */
const handle = (name) =>
  page.evaluate((name) => {
    const st = window.__igEditor.getState().canvas.layer.getStage();
    const a = st.findOne("Transformer").findOne("." + name);
    if (!a || !a.visible()) return null;
    const r = a.getClientRect();
    const box = st.container().getBoundingClientRect();
    return { x: box.left + r.x + r.width / 2, y: box.top + r.y + r.height / 2 };
  }, name);

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

console.log("A line of text keeps its side handles");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Text", exact: true }).click();
await page.getByRole("textbox", { name: "Edit text" }).fill("Hello");
await page.getByRole("button", { name: "Done typing" }).click();
await page.waitForTimeout(400);
let st = await S();
const text = st.doc.elements.at(-1);
const right = await handle("middle-right");
check(!!right, "middle-right handle shown");
if (right) {
  await page.mouse.move(right.x, right.y);
  await page.mouse.down();
  await page.mouse.move(right.x + 40, right.y, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  st = await S();
  const t2 = st.doc.elements.find((e) => e.id === text.id);
  check(t2.width > text.width + 20 && t2.fontSize > text.fontSize * 1.05, `bigger box, bigger letters (${Math.round(text.fontSize)} → ${Math.round(t2.fontSize)})`);
  check(Math.abs(t2.width / text.width - t2.fontSize / text.fontSize) < 0.02, "letters and box scale together (no re-wrap)");
}

console.log("A boarding pass stretched sideways");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "New layer" }).click();
await page.getByRole("region", { name: "New layer" }).getByRole("button", { name: "Widget", exact: true }).click();
await page.getByRole("button", { name: "Boarding pass · Paper with stub", exact: true }).click();
await page.waitForTimeout(400);
st = await S();
const pass = st.doc.elements.at(-1);
check(!(await handle("top-center")) && !(await handle("bottom-center")), "no top / bottom handles on a widget");
const h2 = await handle("middle-right");
check(!!h2, "side handle");
await page.mouse.move(h2.x, h2.y);
await page.mouse.down();
await page.mouse.move(h2.x + 60, h2.y, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(400);
st = await S();
const p2 = st.doc.elements.find((e) => e.id === pass.id);
const k1 = pass.width / 760;
const k2 = p2.width / p2.widget.bw;
check(p2.widget.bw > 800, `wider layout (base 760 → ${Math.round(p2.widget.bw)})`);
check(Math.abs(k1 - k2) / k1 < 0.02, "same scale: the text keeps its size");
check(p2.width / p2.height > pass.width / pass.height + 0.1, "longer, not taller");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "stretch.png") });

console.log("Undo goes back");
await page.evaluate(() => window.__igEditor.getState().undo());
st = await S();
check(!st.doc.elements.find((e) => e.id === pass.id).widget.bw, "undo: back to its own width");

check(errors.length === 0, `no page errors${errors.length ? `: ${errors[0]}` : ""}`);
await browser.close();
if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
