// M19 — "+" and the libraries (docs/product/editor-v2/11): New layer with 11 kinds, groups
// with "+N" and a full-group screen, sticker search, frames, grids, widgets, Brand Kit
// kept across projects, Save sticker.
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
const S = async () => {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, selected: s.selectedId, editing: s.editingTextId };
  });
};
const deselect = () => page.evaluate(() => window.__igEditor.getState().select(null));
const newLayer = async (item) => {
  await deselect();
  await page.getByRole("button", { name: "New layer" }).click();
  await page.getByRole("region", { name: "New layer" }).getByRole("button", { name: item, exact: true }).click();
};

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);
await deselect();

console.log("Toolbar and New layer (§1)");
const pill = (await page.getByRole("region", { name: "Tools" }).getByRole("button").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")))).filter(Boolean);
check(["Photos", "Text", "Stickers", "Shapes", "New layer"].every((n) => pill.includes(n)), `toolbar: ${pill.join(" · ")}`);
await page.getByRole("button", { name: "New layer" }).click();
const nl = page.getByRole("region", { name: "New layer" });
const kinds = ["Photo", "Video", "Files", "Text", "Sticker", "Frame", "Grid", "Draw", "Widget", "Shape", "Brand Kit"];
for (const k of kinds) check(await nl.getByRole("button", { name: k, exact: true }).isVisible(), `New layer: ${k}`);
await page.screenshot({ path: path.join(OUT, "m19c-new-layer.png") });
await nl.getByRole("button", { name: "Close", exact: true }).click();

console.log("Shapes: groups, +N, full group, back (§4, §10.2)");
await page.getByRole("button", { name: "Shapes", exact: true }).click();
const shapes = page.getByRole("region", { name: "Shapes" }).first();
for (const g of ["Basic", "Lines", "Stars", "Hearts", "Arrows", "Callouts", "Banners", "Flowers", "Abstract"]) check(await page.getByRole("region", { name: g }).count() === 1, `group ${g}`);
const callouts = page.getByRole("region", { name: "Callouts" });
check(await callouts.getByRole("button", { name: "2 more" }).isVisible(), "Callouts ends with “+2”");
await page.screenshot({ path: path.join(OUT, "m19c-shapes.png") });
await callouts.getByRole("button", { name: "2 more" }).click();
check((await page.getByRole("region", { name: "Callouts" }).getByRole("button").count()) === 9, "the whole group (9)");
await page.getByRole("button", { name: "Callouts" }).first().click(); // ‹ back
check(await page.getByRole("region", { name: "Basic" }).isVisible(), "‹ back to every group");
await page.getByRole("button", { name: "Star", exact: true }).click();
let st = await S();
let last = st.doc.elements.at(-1);
check(last.type === "shape" && last.shape === "star5" && st.selected === last.id, "a star added and selected");
check(!(await shapes.isVisible()), "the sheet closes, the shape's toolbar shows");

console.log("Stickers: search (§3, §10.3)");
await deselect();
await page.getByRole("button", { name: "Stickers", exact: true }).click();
check(await page.getByRole("region", { name: "Featured" }).isVisible(), "Featured stickers");
await page.getByRole("searchbox", { name: "Search stickers" }).fill("heart");
await page.waitForTimeout(500);
const featured = await page.getByRole("region", { name: "Featured" }).getByRole("button").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
check(featured.length > 0 && featured.every((n) => /heart/i.test(n)), `search “heart” leaves only hearts (${featured.join(", ")})`);
await page.getByRole("region", { name: "Featured" }).getByRole("button").first().click();
await deselect();
await page.getByRole("button", { name: "Stickers", exact: true }).click();
check((await page.getByRole("region", { name: "Recently used" }).getByRole("button").count()) >= 1, "it shows up under “Recently used”");
await page.getByRole("button", { name: "Close", exact: true }).click();

console.log("Frame (§5)");
await newLayer("Frame");
for (const g of ["Instant", "Film", "Paper cut-outs"]) check(await page.getByRole("region", { name: g }).isVisible(), `group ${g}`);
await page.getByRole("button", { name: "Heart window" }).click();
st = await S();
last = st.doc.elements.at(-1);
check(last.type === "image" && last.assetId === null && last.mask === "heart", "an empty heart-shaped photo frame");

console.log("Grid (§6)");
await newLayer("Grid");
await page.getByRole("button", { name: "29 more" }).click(); // +N → the whole group
await page.getByRole("button", { name: "Grid 9", exact: true }).click();
st = await S();
const block = st.doc.elements.find((e) => e.type === "layout");
check(!!block && Math.abs(block.width - 1080 * 0.8) < 1 && st.selected === block.id, "a 2 × 2 block, 80 % of the slide, selected");

console.log("Widget (§7, §10.7)");
await newLayer("Widget");
await page.getByRole("button", { name: "Location" }).click();
st = await S();
last = st.doc.elements.at(-1);
check(last.type === "text" && last.text.includes("Da Lat") && !!last.background, "Location widget");
await page.getByRole("button", { name: "Edit", exact: true }).click();
await page.getByRole("textbox", { name: "Edit text" }).fill("📍 Hội An");
await page.getByRole("button", { name: "Done typing" }).click();
st = await S();
check(st.doc.elements.find((e) => e.id === last.id).text === "📍 Hội An", "its text can be retyped");

console.log("Save sticker → My stickers");
const photo = st.doc.elements.find((e) => e.type === "image" && e.assetId);
await page.evaluate((id) => window.__igEditor.getState().select(id), photo.id);
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Save sticker" }).click();
check(await page.getByRole("status").filter({ hasText: "Saved to My stickers" }).waitFor({ timeout: 4000 }).then(() => true, () => false), "saved");

console.log("Brand Kit (§8, §10.8)");
await newLayer("Brand Kit");
const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.getByRole("button", { name: "Add logo" }).click()]);
await chooser.setFiles(path.join(dir, "portrait.jpg"));
await page.waitForTimeout(600);
check((await page.getByRole("button", { name: "portrait.jpg" }).count()) === 1, "logo saved in the Brand Kit");
await page.getByRole("button", { name: "Close", exact: true }).click();
// Another project: the logo and my sticker are still there.
await page.getByRole("button", { name: "Back", exact: true }).click();
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p4.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);
await newLayer("Brand Kit");
await page.waitForTimeout(500);
console.log("   logos:", await page.getByRole("button", { name: "portrait.jpg" }).count());
check((await page.getByRole("button", { name: "portrait.jpg" }).count()) >= 1, "project 2 sees the logo");
await page.getByRole("button", { name: "portrait.jpg" }).click();
st = await S();
check(st.doc.elements.at(-1).type === "image" && st.doc.elements.at(-1).assetId, "tap → added to the canvas");
await deselect();
await page.getByRole("button", { name: "Stickers", exact: true }).click();
await page.waitForTimeout(500);
check((await page.getByRole("region", { name: "My stickers" }).getByRole("button").count()) >= 1, "project 2 sees “My stickers”");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
