// M19 — text typed on the canvas (docs/product/editor-v2/10): new text at the top-left of
// the slide in view, typing over the sample, the typing bar (A| · Aa · ≡ · ✕), Format
// (B I U S, font…), Align, Opacity, one undo step, empty text removed.
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
    return { doc: s.draft ?? s.doc, saved: s.doc, past: s.past.length, editing: s.editingTextId, selected: s.selectedId };
  });
};
const box = page.getByRole("textbox", { name: "Edit text" });
const bar = page.getByRole("region", { name: "Edit" });

await page.goto(URL_ARG);
await newProject(page);
await page.locator('input[type="file"]').setInputFiles(path.join(dir, "panorama.jpg"));
await page.getByRole("button", { name: "Skip" }).click();
await page.waitForTimeout(800);
await page.evaluate(() => {
  const s = window.__igEditor.getState();
  s.select(null);
  s.setCurrentSlide(2);
});

console.log("New text (§1, §8.1)");
const past0 = (await S()).past;
await page.getByRole("button", { name: "Text", exact: true }).click();
let st = await S();
const text = st.doc.elements.at(-1);
check(text.type === "text" && Math.floor(text.x / 1080) === 2 && text.x - 2160 < 120 && text.y < 120, `“Add text” at the top-left of slide 3 (${Math.round(text.x)}, ${Math.round(text.y)})`);
check(st.editing === text.id && (await box.isVisible()) && (await box.evaluate((e) => e === document.activeElement)), "typing straight away, on the canvas");
check((await box.evaluate((e) => e.selectionEnd - e.selectionStart)) === "Add text".length, "the sample text is selected");
await page.keyboard.type("Đà Lạt mùa hoa");
st = await S();
check(st.doc.elements.find((e) => e.id === text.id).text === "Đà Lạt mùa hoa", "typing replaces it (Vietnamese)");
await page.screenshot({ path: path.join(OUT, "m19-typing.png") });

console.log("Typing bar and Format (§2–3, §8.2–3)");
for (const n of ["Edit", "Format", "Align"]) check(await bar.getByRole("tab", { name: n }).isVisible(), `bar: ${n}`);
check(await page.getByRole("button", { name: "Done typing" }).isVisible(), "bar: ✕");
await bar.getByRole("tab", { name: "Format" }).click();
const fmt = page.getByRole("region", { name: "Format" });
check((await fmt.isVisible()) && (await box.getAttribute("readonly")) !== null, "Aa opens Format instead of the keyboard");
await fmt.getByRole("button", { name: "Bold" }).click(); // the sample is bold: off…
st = await S();
check((st.doc.elements.find((e) => e.id === text.id).weight ?? 700) < 600, "B toggles bold off");
await fmt.getByRole("button", { name: "Bold" }).click(); // …and on again
await fmt.getByRole("button", { name: "Italic" }).click();
await fmt.getByRole("button", { name: "Underline" }).click();
st = await S();
let el = st.doc.elements.find((e) => e.id === text.id);
check(el.weight >= 600 || el.bold, "B → bold");
check(el.italic && el.underline, "I, U on");
await fmt.getByRole("button", { name: /^Font/ }).click();
await page.getByRole("radiogroup", { name: "Font style" }).getByRole("radio", { name: "Sans", exact: true }).click();
await page.getByRole("radio", { name: /Montserrat/ }).click();
await fmt.getByRole("button", { name: "Format", exact: true }).click();
check(await fmt.getByRole("button", { name: /^Font Montserrat/ }).isVisible(), "the Font row shows the new font");
await page.screenshot({ path: path.join(OUT, "m19-format.png") });

console.log("Align (§4)");
await bar.getByRole("tab", { name: "Align" }).click();
await page.getByRole("radio", { name: "Justify" }).click();
st = await S();
check(st.doc.elements.find((e) => e.id === text.id).align === "justify", "justified");
await bar.getByRole("tab", { name: "Edit" }).click();
check(await box.evaluate((e) => e === document.activeElement && !e.readOnly), "A| → keyboard again");

console.log("End typing (§7): one undo step");
await page.getByRole("button", { name: "Done typing" }).click();
st = await S();
el = st.saved.elements.find((e) => e.id === text.id);
check(!st.editing && st.selected === text.id && el.text === "Đà Lạt mùa hoa" && el.italic && el.font === "montserrat", "typing ended, the text stays selected, all saved");
check(st.past === past0 + 2, `adding (1) + the whole typing session (1) = ${st.past - past0} steps`);
await page.getByLabel("Undo").click();
st = await S();
check(st.saved.elements.find((e) => e.id === text.id).text === "Add text", "one undo puts back the sample text and look");
await page.getByLabel("Redo").click();

console.log("Toolbar of a selected text (§5): Opacity");
await page.evaluate((id) => window.__igEditor.getState().select(id), text.id);
await page.waitForTimeout(200);
const names = (await page.getByRole("region", { name: "Tools" }).getByRole("button").allTextContents()).map((s) => s.trim());
check(["Edit", "Format", "Align", "Position", "Opacity", "Lock", "Duplicate", "Delete"].every((n) => names.includes(n)), `text tools: ${names.join(" · ")}`);
await page.getByRole("button", { name: "Opacity", exact: true }).click();
await page.getByRole("region", { name: "Opacity" }).getByRole("slider").fill("40");
await page.getByLabel("Apply").click();
st = await S();
check(Math.abs(st.saved.elements.find((e) => e.id === text.id).opacity - 0.4) < 0.001, "opacity 40 %");

console.log("Emptied text disappears (§8.4)");
await page.getByRole("button", { name: "Edit", exact: true }).click();
await box.fill("");
// Tap outside the text box (on the canvas).
const frame = await page.locator("[data-stage-frame]").boundingBox();
await page.mouse.click(frame.x + 20, frame.y + frame.height - 20);
await page.waitForTimeout(200);
st = await S();
check(!st.editing && !st.saved.elements.some((e) => e.id === text.id), "tap outside with nothing typed → the text box is gone");

console.log("console errors:", errors);
console.log(failures === 0 && errors.length === 0 ? "ALL PASSED" : `${failures} FAILED, ${errors.length} console errors`);
if (failures || errors.length) process.exitCode = 1;
await browser.close();
