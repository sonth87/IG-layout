// M20 C2 — the libraries read the asset catalog: pack groups, search, adding a pack
// sticker (downloaded into the project), recent, pack overlays.
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, newProject, OUT, skipTips, URL_ARG } from "./lib.mjs";
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
const stickers = async () => {
  await page.evaluate(() => window.__igEditor.getState().select(null));
  await page.getByRole("button", { name: "Stickers", exact: true }).click();
};

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

console.log("Pack groups in the Stickers sheet");
await stickers();
const group = page.getByRole("region", { name: "Test stickers" });
await group.waitFor({ timeout: 5000 });
check((await group.getByRole("button").count()) === 3, "the pack shows all its items once loaded");
{
  const ltg = page.getByRole("region", { name: "Light & texture", exact: true });
  const more = ltg.getByRole("button", { name: /more$/ });
  const expanded = (await more.count()) > 0;
  if (expanded) await more.click();
  check((await page.getByRole("region", { name: "Light & texture", exact: true }).getByRole("button", { name: "Test leak" }).count()) === 1, "pack overlays join “Light & texture”");
  if (expanded) await page.getByRole("button", { name: "Light & texture" }).first().click(); // ‹ back
}
await page.screenshot({ path: path.join(OUT, "m20b-packs.png") });

console.log("Search");
await page.getByRole("searchbox", { name: "Search stickers" }).fill("ve");
await page.waitForTimeout(300);
check((await group.getByRole("button").count()) === 1 && (await group.getByRole("button", { name: "Blue ticket" }).isVisible()), "Vietnamese search word finds the ticket");
await page.getByRole("searchbox", { name: "Search stickers" }).fill("");

console.log("Add a pack sticker");
const before = (await S()).doc.elements.length;
await group.getByRole("button", { name: "Flower" }).click();
await page.waitForTimeout(600);
let st = await S();
const el = st.doc.elements.at(-1);
check(st.doc.elements.length === before + 1 && el.type === "image" && !!el.assetId && st.selected === el.id, "added as a free picture, selected");
const stored = await page.evaluate((id) => !!window.__igEditor.getState().assets?.[id] || null, el.assetId);
check(stored !== false, "its picture is the project's own asset");
check(Math.abs(el.width - 1080 * 0.4) < 1, "about 40 % of the slide wide");
await stickers();
check(await page.getByRole("region", { name: "Recently used" }).getByRole("button", { name: "Flower" }).isVisible(), "it shows under “Recently used”");

console.log("Add a pack overlay");
const lt = page.getByRole("region", { name: "Light & texture", exact: true });
if (!(await lt.getByRole("button", { name: "Test leak" }).isVisible())) await lt.getByRole("button", { name: /more$/ }).click();
await page.getByRole("region", { name: "Light & texture", exact: true }).getByRole("button", { name: "Test leak" }).click();
await page.waitForTimeout(600);
st = await S();
const ov = st.doc.elements.at(-1);
check(ov.type === "image" && ov.blend === "screen" && Math.abs(ov.width - 1080) < 1, "overlay covers the slide with its blend");

console.log("Pack texture as the background");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Project menu" }).click();
await page.getByRole("menu", { name: "Project menu" }).getByRole("menuitem", { name: "Background", exact: true }).click();
const bgSheet = page.getByRole("region", { name: "Background" });
await bgSheet.getByRole("tab", { name: "Texture" }).click();
await bgSheet.getByRole("region", { name: "Test textures" }).getByRole("button", { name: "Test paper" }).click();
await page.waitForTimeout(800);
await page.getByLabel("Apply").click();
st = await S();
check(st.doc.background.kind === "texture" && st.doc.background.texture === "test-textures/paper" && !!st.doc.background.assetId && st.doc.background.tile, "pack texture saved with the project's copy");
const drawn = await page.evaluate(() => !!window.__igEditor.getState().canvas.layer.findOne((n) => typeof n.fillPatternImage === "function" && n.fillPatternImage()?.width === 256));
check(drawn, "the canvas repeats it");

console.log("View by collection (C3)");
await stickers();
const viewBy = page.getByRole("radiogroup", { name: "View by" });
await viewBy.getByRole("radio", { name: "Collection" }).click();
check(await page.getByRole("region", { name: "Vintage" }).isVisible(), "stickers grouped by collection: Vintage");
check(await page.getByRole("region", { name: "Film" }).getByRole("button", { name: "Test leak" }).isVisible(), "the film overlay under Film");
check((await page.getByRole("region", { name: "Featured" }).count()) === 0, "the type groups are gone");
await page.getByRole("button", { name: "Close", exact: true }).click();
await stickers();
check((await page.getByRole("radiogroup", { name: "View by" }).getByRole("radio", { name: "Collection" }).getAttribute("aria-checked")) === "true", "the choice is remembered");
await page.getByRole("radiogroup", { name: "View by" }).getByRole("radio", { name: "Type" }).click();
check(await page.getByRole("region", { name: "Featured" }).isVisible(), "back to by type");
await page.getByRole("button", { name: "Close", exact: true }).click();

console.log("No separate Collections button; by collection, each item once (2026-10-19)");
await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "New layer" }).click();
check((await page.getByRole("region", { name: "New layer" }).getByRole("button", { name: "Collections", exact: true }).count()) === 0, "no Collections in the + menu");
await page.getByRole("region", { name: "New layer" }).getByRole("button", { name: "Close", exact: true }).click();
await stickers();
await page.getByRole("radiogroup", { name: "View by" }).getByRole("radio", { name: "Collection" }).click();
const seen = await page.getByRole("region").evaluateAll((regions) => {
  const labels = [];
  for (const r of regions) if (r.getAttribute("aria-label") !== "Stickers") for (const btn of r.querySelectorAll("button[aria-label]")) labels.push(btn.getAttribute("aria-label"));
  return labels.filter((l) => !/more$/.test(l));
});
check(seen.length > 0 && new Set(seen).size === seen.length, `every item once (${seen.length} items)`);
await page.getByRole("radiogroup", { name: "View by" }).getByRole("radio", { name: "Type" }).click();
await page.getByRole("button", { name: "Close", exact: true }).click();

console.log("Thanks lists the pack sources (C6)");
await page.getByLabel("Back").click();
await page.getByRole("tab", { name: "Settings" }).click();
await page.getByRole("button", { name: /^Thanks/ }).click();
const assetsCredits = page.getByRole("region", { name: "Pictures in the libraries" });
const creditText = await assetsCredits.innerText();
check(creditText.includes("Test") && creditText.includes("CC BY 4.0"), "a source that must be credited, with its licence");
check(!creditText.includes("Public domain source"), "public-domain / CC0 sources are not listed");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
