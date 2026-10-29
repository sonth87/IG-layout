// M20 C7 — the generated frames (torn photos, torn paper, film, instant) from the real
// catalog: groups in the Frames sheet, a torn photo clipped to its tear, a 3-frame film.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, newProject, OUT, pickInFillFrame, skipTips, URL_ARG } from "./lib.mjs";

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
const S = () => page.evaluate(() => window.__igEditor.getState().doc);
const frames = async () => {
  await page.evaluate(() => window.__igEditor.getState().select(null));
  await page.getByRole("button", { name: "New layer" }).click();
  await page.getByRole("region", { name: "New layer" }).getByRole("button", { name: "Frame", exact: true }).click();
};

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

console.log("Generated frame groups");
await frames();
await page.getByRole("region", { name: "Torn photos", exact: true }).waitFor({ timeout: 15000 }).catch(() => {});
for (const g of ["Torn photos", "Torn photo collages", "Torn photos on paper", "Film strips", "Instant photos", "Stamps", "Picture frames", "Album pages", "Envelopes"]) check(await page.getByRole("region", { name: g, exact: true }).isVisible(), `group ${g}`);
await page.screenshot({ path: path.join(OUT, "m20e-sheet.png") });

console.log("A torn photo: the photo follows the tear");
await page.getByRole("region", { name: "Torn photos", exact: true }).getByRole("button").first().click();
await page.waitForTimeout(800);
let doc = await S();
const block = doc.elements.findLast((e) => e.type === "layout" && e.art);
const cell = doc.elements.find((e) => e.parentId === block.id);
check(block.art.catalogId.startsWith("gen-torn-photos/") && cell.maskPoints?.length > 100, `cell clipped to the tear (${cell.maskPoints?.length / 2} points)`);
await page.evaluate((id) => window.__igEditor.getState().openFillFrame(id, "fill"), cell.id);
await pickInFillFrame(page, [path.join(dir, "portrait.jpg")]);
await page.waitForTimeout(1500);
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "m20e-torn.png") });

console.log("A film strip: one cell per frame");
await frames();
await page.getByRole("region", { name: "Film strips" }).getByRole("button", { name: /3-frame/ }).first().click();
await page.waitForTimeout(800);
doc = await S();
const strip = doc.elements.findLast((e) => e.type === "layout" && e.art);
check(doc.elements.filter((e) => e.parentId === strip.id).length === 3, "three windows, three cells");

console.log("A torn collage: several torn photos, the upper ones last");
await frames();
await page.getByRole("region", { name: "Torn photo collages" }).getByRole("button", { name: /4 pieces/ }).first().click();
await page.waitForTimeout(800);
doc = await S();
const collage = doc.elements.findLast((e) => e.type === "layout" && e.art);
const pieces = doc.elements.filter((e) => e.parentId === collage.id);
check(pieces.length === 4 && pieces.every((c) => c.maskPoints?.length > 40), "four torn windows, each clipped to its tear");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.screenshot({ path: path.join(OUT, "m20e-collage.png") });

console.log("An album page: the photo turns with the page");
await frames();
await page.getByRole("region", { name: "Album pages", exact: true }).getByRole("button").first().click();
await page.waitForTimeout(800);
doc = await S();
const album = doc.elements.findLast((e) => e.type === "layout" && e.art);
const pc = doc.elements.find((e) => e.parentId === album.id);
check(album.cells[0].rotation !== undefined && Math.abs(pc.rotation - album.cells[0].rotation) < 0.01, `cell turned like the page (${pc.rotation.toFixed(2)}°)`);

console.log("Generated stickers and doodles");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Stickers", exact: true }).click();
for (const g of ["Doodles", "Washi tape", "Sticky notes", "Paper scraps"]) check(await page.getByRole("region", { name: g, exact: true }).isVisible(), `group ${g}`);
await page.getByRole("region", { name: "Doodles" }).getByRole("button", { name: "Curved arrow" }).click();
await page.waitForTimeout(400);
doc = await S();
check(doc.elements.at(-1).type === "icon" || doc.elements.at(-1).sticker === "doodle-arrowCurve" || JSON.stringify(doc.elements.at(-1)).includes("doodle-arrowCurve"), "a doodle added (recolourable sticker)");
await page.screenshot({ path: path.join(OUT, "m20e-stickers.png") });

console.log("Catalog fonts (G5) in the font list");
await page.getByRole("button", { name: "Close", exact: true }).click().catch(() => {});
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Text", exact: true }).click();
await page.getByRole("textbox", { name: "Edit text" }).fill("Mùa thu Hà Nội");
await page.getByRole("button", { name: "Done typing" }).click();
await page.getByRole("button", { name: "Format", exact: true }).click();
await page.getByRole("region", { name: "Format" }).getByRole("button", { name: /^Font/ }).click();
const fontList = page.getByRole("radiogroup", { name: "Font", exact: true });
await fontList.getByRole("radio", { name: "Bangers" }).waitFor({ timeout: 15000 });
const total = await fontList.getByRole("radio").count();
check(total >= 250, `${total} fonts (built-in + catalog)`);
await page.getByRole("radiogroup", { name: "Language" }).getByRole("radio", { name: "日本語" }).click();
const jp = await fontList.getByRole("radio").count();
check(jp >= 10, `${jp} Japanese fonts`);
await page.screenshot({ path: path.join(OUT, "m20e-fonts-ja.png") });
await page.getByRole("radiogroup", { name: "Language" }).getByRole("radio", { name: "All languages" }).click();
await page.getByRole("radiogroup", { name: "Font style" }).getByRole("radio", { name: "Fantasy" }).click();
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(OUT, "m20e-fonts-fantasy.png") });

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
