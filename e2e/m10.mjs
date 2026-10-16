// M10 — onboarding, home template library, start from a template (like SCRL).
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, OUT as out, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};
const shot = (p, n) => p.screenshot({ path: path.join(out, `m10-${n}.png`) });

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
// Editor tips off; onboarding stays on (tested here).
await context.addInitScript(() => localStorage.setItem("ig-layout:tips-seen", "1"));
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const S = async () => {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, past: s.past.length, name: s.projectName };
  });
};

await page.goto(URL_ARG);

console.log("S1 onboarding on first launch");
const onboarding = page.getByRole("dialog", { name: "Welcome" });
check(await onboarding.isVisible(), "shown on first launch");
await shot(page, "1-onboarding");
await page.getByRole("button", { name: "Next" }).click();
await page.getByRole("button", { name: "Next" }).click();
await shot(page, "2-onboarding-last");
await page.getByRole("button", { name: "Browse templates" }).click();
check(!(await onboarding.isVisible()), "closes");
check((await page.getByRole("tab", { name: "Templates" }).getAttribute("aria-selected")) === "true", "“Browse templates” opens the Templates tab");
await page.reload();
await page.waitForTimeout(500);
check(!(await page.getByRole("dialog", { name: "Welcome" }).isVisible()), "not shown again");

console.log("Home: template library");
await page.getByRole("tab", { name: "Templates" }).click();
const cards = page.locator('[role="tablist"] ~ div.grid > button');
const total = await cards.count();
check(total >= 15, `library lists the designs (${total})`);
await page.waitForTimeout(500);
await shot(page, "3-library");
await page.getByRole("button", { name: "Story", exact: true }).click();
const stories = await cards.count();
check(stories > 0 && stories < total, `category filter (Story: ${stories})`);
await page.getByRole("button", { name: "All", exact: true }).click();

console.log("S2 use a template → editor with empty cells");
await page.getByRole("button", { name: "Travel journal" }).click();
await page.waitForTimeout(300);
await shot(page, "4-details");
await page.getByRole("button", { name: "Use template" }).click();
await page.getByText("4:5 · 3 slides").waitFor();
await page.waitForTimeout(800);
let st = await S();
const cells = st.doc.elements.filter((e) => e.type === "image");
const texts = st.doc.elements.filter((e) => e.type === "text");
check(cells.length === 4 && cells.every((c) => c.assetId === null), `4 empty photo cells (${cells.length})`);
check(texts.length >= 3 && texts.some((x) => x.text.includes("Weekend")), `template texts placed (${texts.length})`);
check(st.past === 0, "starting from a template is not an undo step");
check(st.name === "Travel journal", `project named after the template (${st.name})`);
await shot(page, "5-editor-empty");

console.log("Add photos fills the empty cells in order");
await page.locator('input[type="file"][multiple]').setInputFiles(["p3.jpg", "p4.jpg", "portrait.jpg"].map((f) => path.join(dir, f)));
await page.waitForTimeout(1500);
st = await S();
const filled = st.doc.elements.filter((e) => e.type === "image");
check(filled.slice(0, 3).every((c) => c.assetId) && filled[3].assetId === null, "first 3 cells filled, 4th still empty");
check(filled.length === 4, "no extra floating photos");
await shot(page, "6-editor-filled");

console.log("Export works with template text");
await page.getByRole("button", { name: "Export" }).click();
await page.getByText(/3 images/i).first().waitFor({ timeout: 20000 }).catch(() => {});
await page.waitForTimeout(800);
await shot(page, "7-export");
check(errors.length === 0, "no errors while exporting");
await page.getByRole("button", { name: "Back to editor" }).click();

console.log("Seamless template with a background photo cell");
await page.getByRole("button", { name: "Back" }).click();
await page.getByRole("tab", { name: "Templates" }).click();
await page.getByRole("button", { name: "Panorama + title" }).click();
await page.getByRole("button", { name: "Use template" }).click();
await page.waitForTimeout(800);
st = await S();
check(st.doc.elements[0].type === "image" && st.doc.elements[0].assetId === null && st.doc.elements[0].locked, "an empty locked background cell");
await page.locator('input[type="file"][multiple]').setInputFiles([path.join(dir, "panorama.jpg")]);
await page.waitForTimeout(1200);
st = await S();
check(!!st.doc.elements[0].assetId && st.doc.elements.filter((e) => e.type === "image").length === 1, "the photo becomes the background");
await shot(page, "8-panorama");

console.log("Vietnamese template text");
await page.getByRole("button", { name: "Back" }).click();
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("ig-layout:settings") || "{}");
  localStorage.setItem("ig-layout:settings", JSON.stringify({ ...s, locale: "vi" }));
});
await page.reload();
await page.getByRole("tab", { name: "Template" }).click();
await page.getByRole("button", { name: "Nhật ký du lịch" }).click();
await page.getByRole("button", { name: "Dùng template" }).click();
await page.waitForTimeout(800);
st = await S();
check(st.doc.elements.some((e) => e.type === "text" && e.text.includes("Cuối tuần")), "texts in Vietnamese");

console.log(`console errors: ${JSON.stringify(errors)}`);
await browser.close();
console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures || errors.length ? 1 : 0);
