import { chromium } from "playwright-core";
import path from "node:path";
import { skipTips, chromePath, FIXTURES as dir, OUT as out, URL_ARG, pickInFillFrame, newProject } from "./lib.mjs";

const url = URL_ARG;
const shot = (p, n) => p.screenshot({ path: path.join(out, `m5-${n}.png`) });
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
    return { doc: s.doc, past: s.past.length, selected: s.selectedId };
  });
};
const last = (st, type) => st.doc.elements.filter((e) => e.type === type).at(-1);
const apply = () => page.getByRole("button", { name: "Apply", exact: true }).click();

await page.goto(url);
await newProject(page);
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
await page.getByRole("button", { name: "Done typing" }).click();
let st = await S();
let text = last(st, "text");
check(text?.text === "Đà Lạt mùa sương", "text element with Vietnamese text");
await page.waitForTimeout(600);
st = await S();
text = last(st, "text");
check(text.height > text.fontSize * 0.9, `height follows the text (${Math.round(text.height)} for size ${text.fontSize})`);
const fontOk = await page.evaluate(() => document.fonts.check("700 64px 'Playfair Display'", "Đà"));
check(fontOk, "Playfair Display (with Vietnamese) loaded for canvas");

console.log("2. Text style: font, size, background — one step");
const past0 = st.past;
// Format sheet of the typing session (M19, editor-v2/10 §3).
const fmt = page.getByRole("region", { name: "Format" });
await page.getByRole("button", { name: "Format" }).click();
await fmt.getByRole("button", { name: /^Font/ }).click();
await page.getByRole("radiogroup", { name: "Font style" }).getByRole("radio", { name: "Sans", exact: true }).click(); // font categories (M11)
await page.getByRole("radio", { name: /Montserrat/ }).click();
await fmt.getByRole("button", { name: "Format", exact: true }).click(); // back
await fmt.getByRole("button", { name: /^Size/ }).click();
await fmt.getByRole("slider").first().fill("150");
await fmt.getByRole("button", { name: "Format", exact: true }).click();
await fmt.getByRole("button", { name: /^Background/ }).click();
await fmt.getByRole("checkbox", { name: "Background" }).check();
await shot(page, "1-text-style");
await page.getByRole("button", { name: "Done typing" }).click();
st = await S();
text = last(st, "text");
check(text.font === "montserrat" && text.fontSize === 150 && !!text.background, "font Montserrat, size 150, background on");
check(st.past === past0 + 1, "one history step");

console.log("3. Elements: search icon, recolor");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Shapes", exact: true }).click(); // Shapes library, in groups (M19)
check((await page.getByRole("button", { name: "Heart", exact: true }).count()) === 1 && (await page.getByRole("region", { name: "Hearts" }).count()) === 1, "Hearts group with Heart");
await page.getByRole("button", { name: "Heart", exact: true }).click();
st = await S();
const icon = last(st, "shape");
check(icon?.shape === "heart" && st.selected === icon.id, "heart shape added and selected");
await page.getByRole("button", { name: "Color", exact: true }).click();
await page.getByRole("button", { name: "#f2b84b" }).click();
await apply();
st = await S();
check(last(st, "shape").fill === "#f2b84b", "shape recolored");

console.log("4. Shapes: film strip");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Shapes", exact: true }).click();
await page.getByRole("button", { name: "Film strip" }).click();
st = await S();
check(last(st, "shape")?.shape === "film", "film strip shape added");

console.log("5. Photo frame: polaroid, fill it");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "New layer" }).click();
await page.getByRole("button", { name: "Frame", exact: true }).click();
await page.getByRole("button", { name: "Polaroid", exact: true }).click();
st = await S();
let framed = st.doc.elements.find((e) => e.type === "image" && e.frame === "polaroid");
check(!!framed && framed.assetId === null, "empty polaroid frame added");
await page.getByRole("button", { name: "Add photo" }).click();
await pickInFillFrame(page, path.join(dir, "portrait.jpg"));
for (let i = 0; i < 30 && !(st = await S()).doc.elements.find((e) => e.id === framed.id).assetId; i++);
framed = st.doc.elements.find((e) => e.id === framed.id);
const m = Math.min(framed.width, framed.height);
const innerAspect = (framed.width - m * 0.12) / (framed.height - m * 0.28);
check(Math.abs(framed.crop.width / framed.crop.height - innerAspect) < 0.01, "photo crop fits the polaroid's inner area");
await shot(page, "2-elements");

console.log("6. Frame from the Style tool");
// Filling leaves nothing selected (editor-v2/09 §1.3): select the framed photo again.
await page.evaluate((id) => window.__igEditor.getState().select(id), framed.id);
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Style" }).click();
await page.getByRole("radio", { name: "White frame" }).click();
await apply();
st = await S();
check(st.doc.elements.find((e) => e.id === framed.id).frame === "white", "frame switched to white");

console.log("7. Film strip layout");
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Project menu" }).click(); // the project's Layout (M19: in the ⋯ menu)
await page.getByRole("menu", { name: "Project menu" }).getByRole("menuitem", { name: "Layout", exact: true }).click();
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
await page.getByRole("tab", { name: "Projects" }).click();
await page.locator("article").first().getByRole("button").first().click();
await page.getByText("4:5 · 2 slides").waitFor();
st = await S();
const types = st.doc.elements.map((e) => e.type).sort().join(",");
check(types.includes("text") && types.includes("shape") && types.includes("image"), `elements persisted (${types})`);

console.log("10. Thanks (credits) from Settings (M20 C6)");
await page.getByLabel("Back").click();
await page.getByRole("tab", { name: "Settings" }).click();
await page.getByRole("button", { name: /^Thanks/ }).click();
check(await page.getByRole("link", { name: "Lucide icons" }).isVisible(), "icons credited");
check(await page.getByRole("region", { name: "Code libraries" }).getByRole("link", { name: "Konva · react-konva" }).isVisible(), "code libraries credited");
check(/Google Fonts — \d+ fonts/.test(await page.getByRole("region", { name: "Fonts" }).innerText()), "fonts credited");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
