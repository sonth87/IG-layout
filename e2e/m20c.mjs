// M20 C5 — the new font list: the text's own words (or a nice line) in every font, the
// name small below, style / language filters, search, catalog fonts usable on the canvas.
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
const S = () => page.evaluate(() => { const s = window.__igEditor.getState(); return s.draft ?? s.doc; });

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p3.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);

await page.evaluate(() => window.__igEditor.getState().select(null));
await page.getByRole("button", { name: "Text", exact: true }).click();
await page.getByRole("textbox", { name: "Edit text" }).fill("Mùa thu Hà Nội\nthứ hai");
await page.getByRole("button", { name: "Done typing" }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Format", exact: true }).click();
await page.getByRole("region", { name: "Format" }).getByRole("button", { name: /^Font/ }).click();
const list = page.getByRole("radiogroup", { name: "Font", exact: true });
await list.getByRole("radio", { name: "Test Hand" }).waitFor({ timeout: 5000 });

console.log("Samples");
const first = await list.getByRole("radio").first().innerText();
check(first.includes("Mùa thu Hà Nội") && !first.includes("thứ hai") && !first.includes("Đà Lạt"), `the text's first line is the sample (${first.split("\n")[0]})`);
check(first.trim().endsWith("Be Vietnam Pro"), "the font name small below");
await page.screenshot({ path: path.join(OUT, "m20c-fonts.png") });

console.log("Filters and search");
const styles = page.getByRole("radiogroup", { name: "Font style" });
await styles.getByRole("radio", { name: "Handwriting" }).click();
const hand = await list.getByRole("radio").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
check(hand.includes("Test Hand") && hand.includes("Patrick Hand") && !hand.includes("Inter"), `Handwriting: ${hand.length} fonts incl. the catalog one`);
await styles.getByRole("radio", { name: "All", exact: true }).click();
const langs = page.getByRole("radiogroup", { name: "Language" });
await langs.getByRole("radio", { name: "日本語" }).click();
const jp = await list.getByRole("radio").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
check(jp.length === 1 && jp[0] === "Test JP", `Japanese filter: ${jp.join(", ")}`);
await langs.getByRole("radio", { name: "All languages" }).click();
await page.getByRole("searchbox", { name: "Search fonts" }).fill("fraun");
check((await list.getByRole("radio").count()) === 1, "search by name");
await page.getByRole("searchbox", { name: "Search fonts" }).fill("");

console.log("A catalog font on the canvas");
await list.getByRole("radio", { name: "Test Hand" }).click();
await page.waitForTimeout(800);
let doc = await S();
const text = doc.elements.filter((e) => e.type === "text").at(-1);
check(text.font === "c:test-hand", `saved as a catalog font (${text.font})`);
const drawn = await page.evaluate(() => {
  const n = window.__igEditor.getState().canvas.layer.findOne("Text");
  return n?.fontFamily();
});
check(drawn === "'c-test-hand'", `the canvas draws with it (${drawn})`);
check(await page.evaluate(() => document.fonts.check("400 64px 'c-test-hand'", "Mùa thu")), "its file is loaded");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
