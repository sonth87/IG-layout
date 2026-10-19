// D-114 — card widgets: three new groups in the Widget sheet, a card added at its own
// aspect, its texts / card style / colour edited in one undo step, the height following
// the texts, and the card drawn in the export.
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
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const S = () => page.evaluate(() => window.__igEditor.getState());
const widgets = async () => {
  await page.evaluate(() => window.__igEditor.getState().select(null));
  await page.getByRole("button", { name: "New layer" }).click();
  await page.getByRole("region", { name: "New layer" }).getByRole("button", { name: "Widget", exact: true }).click();
};

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

console.log("Widget sheet groups");
await widgets();
for (const g of ["Text", "Social", "Info", "Keepsakes"]) check(await page.getByRole("region", { name: g, exact: true }).isVisible(), `group ${g}`);
await page.screenshot({ path: path.join(OUT, "widgets-sheet.png") });
// Every card (for a look at the drawings).
for (const g of ["Social", "Info", "Keepsakes"]) {
  const region = page.getByRole("region", { name: g, exact: true });
  check((await region.getByRole("button").count()) >= 6, `${g}: every card shown`);
  await region.scrollIntoViewIfNeeded();
  await region.screenshot({ path: path.join(OUT, `widgets-${g.toLowerCase()}.png`) });
}

console.log("Add a boarding pass");
await page.getByRole("button", { name: "Boarding pass", exact: true }).click();
await page.waitForTimeout(400);
let st = await S();
let w = st.doc.elements.at(-1);
check(w.type === "icon" && w.widget?.kind === "boardingPass" && st.selectedId === w.id, "an icon element with widget data, selected");
check(w.width > 500 && w.height > 200 && w.width / w.height > 1.2 && w.width / w.height < 2.2, `at its own aspect (${Math.round(w.width)} × ${Math.round(w.height)})`);
check(w.widget.fields.fromCode === "SGN", "sample texts (English locale)");

console.log("Edit: texts, dark card, colour; ✓ is one undo step");
const pastBefore = st.past.length;
await page.getByRole("button", { name: "Edit widget" }).click();
await page.getByRole("textbox", { name: "From (code)" }).fill("HAN");
await page.getByRole("radio", { name: "Dark" }).click();
await page.screenshot({ path: path.join(OUT, "widgets-edit.png") });
await page.getByRole("button", { name: "Apply" }).click();
st = await S();
w = st.doc.elements.find((e) => e.id === w.id);
check(w.widget.fields.fromCode === "HAN" && w.widget.theme === "dark", "texts and card style saved");
check(st.past.length === pastBefore + 1, "one undo step");

console.log("Height follows the texts");
await page.getByRole("button", { name: "New layer" }).waitFor().catch(() => {});
await widgets();
await page.getByRole("button", { name: "Mini checklist", exact: true }).click();
await page.waitForTimeout(300);
st = await S();
let list = st.doc.elements.at(-1);
const h0 = list.height;
await page.getByRole("button", { name: "Edit widget" }).click();
await page.getByRole("textbox", { name: "Title" }).fill("A much longer title for today that will need a second line to fit");
await page.getByRole("button", { name: "Apply" }).click();
st = await S();
list = st.doc.elements.find((e) => e.id === list.id);
check(list.height > h0 + 20, `taller (${Math.round(h0)} → ${Math.round(list.height)})`);

console.log("Undo removes the edit; the layer name is the widget's");
await page.evaluate(() => window.__igEditor.getState().undo());
st = await S();
check(Math.abs(st.doc.elements.find((e) => e.id === list.id).height - h0) < 1, "undo restores the height");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Layers" }).click();
check(await page.getByText("Mini checklist").first().isVisible(), "listed as Mini checklist in Layers");
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

console.log("Drawn on the canvas");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "widgets-canvas.png") });
check(errors.length === 0, `no console errors${errors.length ? `: ${errors.slice(0, 3).join(" | ")}` : ""}`);
await browser.close();
if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
