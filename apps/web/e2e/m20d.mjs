// M20 C4 — a pack frame: a block the shape of its art, one empty cell per window, the art
// drawn above the photos, corners-only resizing, no re-splitting.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, newProject, OUT, pickInFillFrame, skipTips, URL_ARG } from "./lib.mjs";
import { routePacks } from "./packs.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await skipTips(context);
await routePacks(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const S = () => page.evaluate(() => {
  const s = window.__igEditor.getState();
  return { doc: s.doc, selected: s.selectedId };
});

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);
await page.evaluate(() => window.__igEditor.getState().select(null));

console.log("Add a pack frame");
await page.getByRole("button", { name: "New layer" }).click();
await page.getByRole("region", { name: "New layer" }).getByRole("button", { name: "Frame", exact: true }).click();
await page.getByRole("region", { name: "Test frames" }).getByRole("button", { name: "Gold frame" }).click();
await page.waitForTimeout(800);
let st = await S();
const block = st.doc.elements.find((e) => e.type === "layout" && e.art);
const cells = st.doc.elements.filter((e) => e.parentId === block?.id);
check(!!block && block.art.catalogId === "test-frames/gold" && st.selected === block.id, "a frame block, selected");
check(Math.abs(block.width / block.height - 600 / 750) < 0.01, "the shape of its art");
check(cells.length === 2 && cells.every((c) => c.assetId === null && c.slot), "one empty cell per window");
check(cells[1].mask === "circle", "the oval window's cell is round");

console.log("Art above the photos");
const order = await page.evaluate((ids) => {
  const layer = window.__igEditor.getState().canvas.layer;
  const kids = layer.getChildren();
  const art = kids.findIndex((n) => n.getClassName() === "Image" && !n.listening() && n.width() > 300 && n.image()?.width === 600);
  const lastCell = Math.max(...ids.map((id) => kids.findIndex((n) => n.id() === id)));
  return { art, lastCell };
}, cells.map((c) => c.id));
check(order.art > order.lastCell && order.lastCell >= 0, `the art is drawn after the cells (${order.lastCell} → ${order.art})`);
const tr = await page.evaluate(() => {
  const t = window.__igEditor.getState().canvas.layer.getStage().findOne("Transformer");
  return t.enabledAnchors();
});
check(tr.length === 4 && tr.every((a) => !a.includes("center") && !a.includes("middle")), "corners only");
const toolbar = await page.getByRole("region", { name: "Tools" }).getByRole("button").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") || e.innerText.trim()));
check(!toolbar.includes("Layout") && toolbar.includes("Position"), `no re-splitting (${toolbar.filter(Boolean).join(" · ")})`);

console.log("Fill a window");
await page.evaluate((id) => window.__igEditor.getState().select(id), cells[0].id);
await page.waitForTimeout(200);
await page.evaluate((id) => window.__igEditor.getState().openFillFrame(id, "fill"), cells[0].id);
await pickInFillFrame(page, [path.join(dir, "p4.jpg")]);
await page.waitForTimeout(1200);
st = await S();
const filled = st.doc.elements.find((e) => e.id === cells[0].id);
check(!!filled.assetId, "the window shows a photo");
await page.screenshot({ path: path.join(OUT, "m20d-frame.png") });

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
