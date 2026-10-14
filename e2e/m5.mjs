import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, FIXTURES as dir, OUT as out, URL_ARG } from "./lib.mjs";

const url = URL_ARG;
const shot = (p, n) => p.screenshot({ path: path.join(out, `m5-${n}.png`) });
let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

const S = async () => {
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const s = window.__igEditor.getState();
    return { doc: s.doc, past: s.past.length, selected: s.selectedId };
  });
};
const last = (st, type) => st.doc.elements.filter((e) => e.type === type).at(-1);
const apply = () => page.getByRole("button", { name: "Apply", exact: true }).click();

await page.goto(url);
await page.getByRole("button", { name: "New project" }).click();
await page.getByLabel("Fewer slides").click();
await page.getByLabel("Fewer slides").click();
await page.getByLabel("Fewer slides").click();
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "p4.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.getByText("4:5 · 2 slides").waitFor();
await page.getByRole("button", { name: "Done" }).click();

console.log("1. Add text (Vietnamese)");
await page.getByRole("button", { name: "Text", exact: true }).click();
const box = page.getByRole("textbox", { name: "Edit text" });
await box.waitFor();
await box.fill("Đà Lạt mùa sương");
await page.getByRole("dialog").getByRole("button", { name: "Done" }).click();
let st = await S();
let text = last(st, "text");
check(text?.text === "Đà Lạt mùa sương", "text element with Vietnamese text");
await page.waitForTimeout(600);
st = await S();
text = last(st, "text");
check(text.height > text.fontSize * 0.9, `height follows the text (${Math.round(text.height)} for size ${text.fontSize})`);
const fontOk = await page.evaluate(() => document.fonts.check("700 64px " + getComputedStyle(document.documentElement).getPropertyValue("--font-playfair"), "Đà"));
check(fontOk, "Playfair Display (with Vietnamese) loaded for canvas");

console.log("2. Text style: font, size, background — one step");
const past0 = st.past;
await page.getByRole("button", { name: "Style" }).click();
await page.getByRole("radio", { name: /Montserrat/ }).click();
await page.getByRole("tab", { name: "Style" }).click();
await page.getByRole("slider").first().fill("150");
await page.getByRole("tab", { name: "Effects" }).click();
await page.getByRole("checkbox", { name: "Background" }).check();
await shot(page, "1-text-style");
await apply();
st = await S();
text = last(st, "text");
check(text.font === "montserrat" && text.fontSize === 150 && !!text.background, "font Montserrat, size 150, background on");
check(st.past === past0 + 1, "one history step");

console.log("3. Elements: search icon, recolor");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Elements" }).click();
await page.getByPlaceholder("Search shapes, icons, frames…").fill("heart");
check((await page.getByRole("button", { name: "Heart" }).count()) === 1 && (await page.getByRole("button", { name: "Star" }).count()) === 0, "search filters to Heart");
await page.getByRole("button", { name: "Heart" }).click();
st = await S();
const icon = last(st, "icon");
check(icon?.icon === "heart" && st.selected === icon.id, "heart icon added and selected");
await page.getByRole("button", { name: "Color", exact: true }).click();
await page.getByRole("button", { name: "#f2b84b" }).click();
await apply();
st = await S();
check(last(st, "icon").color === "#f2b84b", "icon recolored");

console.log("4. Shapes: film strip");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Elements" }).click();
await page.getByRole("button", { name: "Shapes", exact: true }).click();
await page.getByRole("button", { name: "Film strip" }).click();
st = await S();
check(last(st, "shape")?.shape === "film", "film strip shape added");

console.log("5. Photo frame: polaroid, fill it");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Elements" }).click();
await page.getByRole("button", { name: "Polaroid" }).click();
st = await S();
let framed = st.doc.elements.find((e) => e.type === "image" && e.frame === "polaroid");
check(!!framed && framed.assetId === null, "empty polaroid frame added");
const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.getByRole("button", { name: "Add photo" }).click()]);
await chooser.setFiles(path.join(dir, "portrait.jpg"));
for (let i = 0; i < 30 && !(st = await S()).doc.elements.find((e) => e.id === framed.id).assetId; i++);
framed = st.doc.elements.find((e) => e.id === framed.id);
const m = Math.min(framed.width, framed.height);
const innerAspect = (framed.width - m * 0.12) / (framed.height - m * 0.28);
check(Math.abs(framed.crop.width / framed.crop.height - innerAspect) < 0.01, "photo crop fits the polaroid's inner area");
await shot(page, "2-elements");

console.log("6. Frame from the Style tool");
await page.getByRole("button", { name: "Style" }).click();
await page.getByRole("radio", { name: "White frame" }).click();
await apply();
st = await S();
check(st.doc.elements.find((e) => e.id === framed.id).frame === "white", "frame switched to white");

console.log("7. Film strip layout");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Layout" }).click();
await page.getByRole("button", { name: "Seamless", exact: true }).click();
await page.getByRole("button", { name: /^Film strip/ }).click();
await page.getByRole("button", { name: "Use this layout" }).click();
st = await S();
check(st.doc.slideCount === 3 && st.doc.elements[0].type === "shape" && st.doc.elements[0].shape === "film", "film band under the photos, 3 slides");
check(st.doc.elements.filter((e) => e.type === "image").length === 5, "5 photo slots on the band");
await shot(page, "3-film-layout");
await page.getByLabel("Undo").click();

console.log("8. Export with text");
await page.getByRole("button", { name: "Export" }).click();
await page.getByText("2 images · JPEG · 1080 × 1350").waitFor();
check((await page.locator("figure img").count()) === 2, "2 slides exported");
await shot(page, "4-export");
await page.getByLabel("Back to editor").click();

console.log("9. Saved and reopened");
await page.waitForTimeout(1200);
await page.reload();
await page.locator("article").first().getByRole("button").first().click();
await page.getByText("4:5 · 2 slides").waitFor();
st = await S();
const types = st.doc.elements.map((e) => e.type).sort().join(",");
check(types.includes("text") && types.includes("icon") && types.includes("shape"), `elements persisted (${types})`);

console.log("10. Credits in Settings");
await page.getByLabel("Back").click();
await page.getByLabel("Settings and language").click();
check(await page.getByText("Lucide — ISC License.").isVisible(), "credits listed");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
