// M18 — home, templates, new project (docs/product/editor-v2/01, 03, 04): bottom navigation,
// banners, Continue / Create new, template groups, detail, likes, search; the "New
// project" sheet with drawn ratio cards, "Other" ratios and a custom height.
import { chromium } from "playwright-core";
import { chromePath, OUT, skipOnboarding, skipTips, URL_ARG } from "./lib.mjs";
import path from "node:path";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
await skipTips(context);
await skipOnboarding(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const S = () => page.evaluate(() => window.__igEditor.getState().doc);
const back = () => page.getByRole("button", { name: "Back", exact: true }).click();
const sheet = page.getByRole("region", { name: "New project" });

await page.goto(URL_ARG);
await page.waitForTimeout(600);

console.log("Bottom navigation (03 §2.6)");
for (const name of ["Home", "Projects", "Settings"]) check(await page.getByRole("tab", { name }).isVisible(), `${name} tab`);
check((await page.getByRole("tab", { name: "Home" }).getAttribute("aria-selected")) === "true", "opens on Home");
check(await page.getByRole("button", { name: "New project" }).isVisible(), "round + apart");

console.log("New project sheet (04 §3, §7.1–2)");
await page.getByRole("button", { name: "New project" }).click();
const cards = ["4:5 Portrait", "3:4 Portrait", "9:16 Story", "1:1 Square", "1.91:1 Landscape", "Other", "Profile grid", "From photos"];
for (const c of cards) check(await sheet.getByRole("button", { name: c }).count() === 1, `card “${c}”`);
const shapes = await sheet.locator("button span.rounded-md").evaluateAll((els) => els.slice(0, 5).map((e) => e.getBoundingClientRect()).map((r) => ({ w: r.width, h: r.height, bottom: r.bottom })));
check(shapes.every((s) => Math.abs(s.bottom - shapes[0].bottom) < 1), "every card on the same baseline");
check(Math.abs(shapes[0].w / shapes[0].h - 0.8) < 0.02 && Math.abs(shapes[2].w / shapes[2].h - 9 / 16) < 0.02 && Math.abs(shapes[4].w / shapes[4].h - 1.91) < 0.03, "cards drawn in their shape");
await page.screenshot({ path: path.join(OUT, "m18-new-project.png") });
await sheet.getByRole("button", { name: "4:5 Portrait" }).click();
await page.waitForFunction(() => window.__igEditor?.getState().doc);
let doc = await S();
check(doc.slideCount === 1 && doc.ratio === "4:5" && doc.elements.length === 0 && doc.type === "post", "4:5 → one blank 1080 × 1350 slide");
await back();

console.log("Other → 16:9 (04 §7.3)");
await page.getByRole("button", { name: "New project" }).click();
await sheet.getByRole("button", { name: "Other" }).click();
const other = page.getByRole("region", { name: "Other" });
check(await other.getByText("1080 × 608").isVisible(), "16:9 listed as 1080 × 608");
check(await other.getByText("Instagram crops it to 4:5").first().isVisible(), "a note on ratios taller than 4:5");
await other.getByRole("button", { name: /^16:9/ }).click();
await page.waitForFunction(() => window.__igEditor?.getState().doc);
doc = await S();
const h169 = await page.evaluate(() => window.__igEditor.getState().canvas.layer.getStage() && true);
check(doc.ratio === "16:9" && h169, "project 16:9");
await back();

console.log("Custom height (04 §5, §7.4)");
await page.getByRole("button", { name: "New project" }).click();
await sheet.getByRole("button", { name: "Other" }).click();
await other.getByRole("button", { name: "Custom" }).click();
const dialog = page.getByRole("alertdialog", { name: "Custom size" });
check(await dialog.getByRole("button", { name: "Create" }).isDisabled(), "Create disabled while empty");
await dialog.getByLabel("Height").fill("564");
await dialog.getByRole("button", { name: "Create" }).click();
check(await dialog.getByText("The height must be from 565 to 1920 px.").isVisible(), "564 → error, nothing created");
await dialog.getByLabel("Height").fill("1921");
await dialog.getByRole("button", { name: "Create" }).click();
check(await dialog.getByText("The height must be from 565 to 1920 px.").isVisible(), "1921 → error");
await dialog.getByRole("button", { name: "Cancel" }).click();
check(await other.isVisible(), "Cancel → back to “Other”");
await other.getByRole("button", { name: "Custom" }).click();
await dialog.getByLabel("Height").fill("1200");
await dialog.getByRole("button", { name: "Create" }).click();
await page.waitForFunction(() => window.__igEditor?.getState().doc);
doc = await S();
check(doc.ratio === "1080x1200", `1200 → 1080 × 1200 (${doc.ratio})`);
check(await page.getByText("1080×1200 · 1 slide").isVisible(), "title shows the custom size");
await back();

console.log("Home (03 §8)");
await page.getByRole("tab", { name: "Home" }).click();
await page.waitForTimeout(400);
check(await page.getByRole("button", { name: "Continue" }).isVisible(), "a project exists → “Continue”");
check(await page.getByRole("button", { name: /Create new/ }).isVisible(), "“Create new” beside it");
const banners = page.locator("section .snap-x").first();
await banners.evaluate((e) => e.scrollTo({ left: e.clientWidth }));
await page.waitForTimeout(500);
check((await page.locator("section span.w-5.bg-white").count()) === 1, "banners swipe sideways, the dots follow");
// Banners follow the date (seasons.ts): read the second one's title first.
const bannerTitle = (await page.locator("section h2").nth(1).textContent()).trim();
await page.getByRole("button", { name: "Explore now" }).nth(1).click();
check(await page.getByRole("heading", { name: bannerTitle, exact: true, level: 1 }).isVisible(), "“Explore now” opens that group");
await back();
// Group strip slides sideways without scrolling the page.
const strip = page.getByRole("region", { name: "Everyday" }).locator(".overflow-x-auto").first();
const pageTop = await page.locator("main > div.overflow-y-auto").evaluate((e) => e.scrollTop);
await strip.evaluate((e) => (e.scrollLeft = 200));
check((await strip.evaluate((e) => e.scrollLeft)) > 100 && (await page.locator("main > div.overflow-y-auto").evaluate((e) => e.scrollTop)) === pageTop, "a group strip scrolls sideways");
await page.getByRole("region", { name: "Everyday" }).getByRole("button", { name: /Everyday/ }).click();
check(await page.getByRole("heading", { name: "Everyday", exact: true }).isVisible(), "group title → full group grid");
await back();
// Like without opening.
const card = page.getByRole("region", { name: "Everyday" }).getByRole("button", { name: "Like" }).first();
await card.click();
check((await page.getByRole("button", { name: "Unlike" }).count()) >= 1 && !(await page.getByRole("heading", { name: "Template", exact: true }).isVisible()), "♡ likes it without opening it");
await page.getByRole("button", { name: "Liked" }).click();
check((await page.getByRole("button", { name: "Unlike" }).count()) >= 1, "the liked list shows it");
await back();

// A carousel card swipes through its slides (owner, 2026-10-17).
const strip0 = page.getByRole("region", { name: "Everyday" }).locator(".snap-mandatory").first();
await strip0.evaluate((e) => e.scrollTo({ left: e.clientWidth }));
await page.waitForTimeout(400);
check((await strip0.evaluate((e) => e.scrollLeft)) > 50, "a carousel template card swipes to its next slide");

console.log("Template detail (03 §5–6)");
await page.getByRole("button", { name: "Travel journal" }).first().click();
check(await page.getByRole("heading", { name: "Template", exact: true }).isVisible(), "detail screen");
check(await page.getByText("4 photos").isVisible() && (await page.getByText("3 slides").isVisible()), "photo and slide counts");
const slides = page.getByRole("dialog", { name: "Template" }).locator(".snap-mandatory").first();
await slides.evaluate((e) => e.scrollTo({ left: e.clientWidth }));
await page.waitForTimeout(400);
check(await page.getByLabel("2 / 3").isVisible(), "swipe to see slide 2");
await page.screenshot({ path: path.join(OUT, "m18-detail.png") });
await page.getByRole("button", { name: "Use template" }).click();
await page.waitForFunction(() => window.__igEditor?.getState().doc);
doc = await S();
check(doc.slideCount === 3 && doc.elements.filter((e) => e.type === "image").every((e) => !e.assetId) && doc.elements.some((e) => e.type === "text"), "Use template: 3 slides, empty photo cells, texts kept");
await back();

console.log("Search (03 §4, §8.8)");
await page.getByRole("tab", { name: "Home" }).click();
await page.getByRole("button", { name: "Search" }).click();
await page.getByRole("searchbox", { name: "Search" }).fill("birthday");
const search = page.getByRole("dialog", { name: "Search" });
check(await search.getByRole("button", { name: "Birthday", exact: true }).isVisible(), "“birthday” finds the Birthday template");
await page.getByRole("searchbox", { name: "Search" }).fill("special");
check(await search.getByRole("button", { name: "Anniversary", exact: true }).isVisible(), "searching the group name finds its templates");

console.log("Seasons & events (2026-10-28)");
for (const [day, name] of [["2026-12-20", "Merry Christmas"], ["2027-01-28", "Lunar New Year"], ["2026-09-15", "Mid-Autumn Festival"]]) {
  await page.goto(`${URL_ARG}?today=${day}`);
  await page.waitForTimeout(700);
  const first = (await page.locator("section h2").first().textContent()).trim();
  check(first === name && (await page.getByRole("region", { name, exact: true }).isVisible()), `${day}: banner and first group are “${name}”`);
}
await page.getByRole("region", { name: "Mid-Autumn Festival", exact: true }).getByRole("button").first().click();
check(await page.getByRole("heading", { name: "Mid-Autumn Festival", exact: true, level: 1 }).isVisible(), "an event group opens its own list");

console.log("Templates with pack frames, stickers and widgets (2026-10-28)");
const openTemplate = async (name) => {
  await page.goto(URL_ARG);
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("searchbox", { name: "Search" }).fill(name);
  await page.getByRole("dialog", { name: "Search" }).getByRole("button", { name, exact: true }).first().click();
  await page.getByRole("button", { name: "Use template" }).click();
  await page.waitForFunction(() => window.__igEditor?.getState().doc?.elements.length > 0);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, assets: Object.values(s.assets).map((a) => a.name) };
  });
};
let used = await openTemplate("Torn strips");
const torn = used.doc.elements.find((e) => e.type === "layout" && e.art);
check(
  torn && torn.cells.length === 3 && used.doc.elements.filter((e) => e.parentId === torn.id && e.maskPoints?.length).length === 3 && used.assets.some((n) => n.includes("torn-collage")),
  "torn paper frame: art stored in the project, 3 torn photo windows",
);
used = await openTemplate("Pastel notes");
check(used.doc.elements.some((e) => e.type === "image" && e.assetId && !e.slot) && used.doc.elements.some((e) => e.type === "icon"), "pack stickers and drawn stickers placed");
used = await openTemplate("Countdown");
check(used.doc.elements.some((e) => e.type === "icon" && e.widget?.kind === "countdown"), "a template widget becomes a card widget");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
