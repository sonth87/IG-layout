// M13.3 — colour on video, animation (in / out, typewriter), Ken Burns, animated slides
// exported as MP4. Uses ffmpeg / ffprobe to inspect files.
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromePath, FIXTURES as dir, OUT as out, skipTips, URL_ARG, newProject } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};
const shot = (p, n) => p.screenshot({ path: path.join(out, `m13b-${n}.png`) });

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const S = () => page.evaluate(() => window.__igEditor.getState().doc);
const node = (id) =>
  page.evaluate((id) => {
    const n = window.__igEditor.getState().canvas.layer.findOne("#" + id);
    const txt = n.findOne?.("Text");
    return { opacity: n.opacity(), y: n.y(), scale: n.scaleX(), text: txt ? txt.text() : null };
  }, id);

async function exported() {
  await page.waitForFunction(() => document.querySelectorAll("figure").length > 0, null, { timeout: 180000 });
  const files = await page.evaluate(async () =>
    Promise.all(
      [...document.querySelectorAll("figure")].map(async (f) => {
        const blob = await (await fetch(f.querySelector("video, img").getAttribute("src"))).blob();
        const buf = new Uint8Array(await blob.arrayBuffer());
        let bin = "";
        for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
        return { name: f.querySelector("figcaption").textContent, b64: btoa(bin) };
      }),
    ),
  );
  return files.map((f) => {
    const file = path.join(out, `m13b-${f.name}`);
    fs.writeFileSync(file, Buffer.from(f.b64, "base64"));
    return { name: f.name, file };
  });
}
const probe = (file) => execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name", "-show_entries", "format=duration", "-of", "compact", file]).toString();
/** Mean brightness of a frame at `t` seconds (ffmpeg → 8×8 gray). */
function frameLuma(file, t, crop) {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-ss", String(t), "-i", file, "-frames:v", "1", "-vf", `${crop ? crop + "," : ""}scale=8:8,format=gray`, "-f", "rawvideo", "-"]);
  return raw.reduce((s, v) => s + v, 0) / raw.length;
}

await page.goto(URL_ARG);
await newProject(page);
for (let i = 0; i < 3; i++) await page.getByLabel("Fewer slides").click(); // 2 slides
await page.locator('input[type="file"]').setInputFiles([path.join(dir, "p3.jpg"), path.join(dir, "clip.mp4")]);
await page.getByRole("button", { name: "Skip" }).click({ timeout: 120000 });
await page.getByText("4:5 · 2 slides").waitFor();
await page.waitForTimeout(1500);
let doc = await S();
const photo = doc.elements.find((e) => e.type === "image" && e.x < 1080);
const video = doc.elements.find((e) => e.type === "image" && e.x >= 1080);

console.log("M13.3 colour on video");
await page.evaluate((id) => window.__igEditor.getState().select(id), video.id);
await page.waitForTimeout(200);
check(await page.getByRole("button", { name: "Filters" }).isVisible(), "Filters for videos");
await page.getByRole("button", { name: "Filters" }).click();
await page.getByRole("tab", { name: "Mono" }).click();
await page.getByRole("button", { name: "Noir" }).click();
await page.getByRole("slider", { name: /Intensity/ }).fill("100"); // default is 80
await page.getByRole("button", { name: "Apply", exact: true }).click();
doc = await S();
check(doc.elements.find((e) => e.id === video.id).filter?.id === "noir", "filter saved on the video");
await page.getByRole("button", { name: "Done" }).click();

console.log("M13.3 animation on text");
await page.getByRole("button", { name: "Text", exact: true }).click();
await page.getByRole("textbox", { name: "Edit text" }).fill("Đà Lạt");
await page.getByRole("button", { name: "Done typing" }).click();
doc = await S();
const text = doc.elements.find((e) => e.type === "text");
await page.getByRole("button", { name: "Animate" }).click();
await page.getByRole("radio", { name: "Typewriter" }).click();
await page.getByRole("slider", { name: /Duration/ }).fill("2");
await page.getByRole("tab", { name: "Out" }).click();
await page.getByRole("radio", { name: "Slide up" }).click();
await page.getByRole("slider", { name: /Slide length/ }).fill("4");
await shot(page, "1-animation-tool");
await page.getByRole("button", { name: "Apply", exact: true }).click();
doc = await S();
const m = doc.elements.find((e) => e.id === text.id).motion;
check(m?.in === "typewriter" && m.inDuration === 2 && m.out === "slideUp" && doc.motionDuration === 4, "in / out / timing saved, slide length 4 s");
await page.getByRole("button", { name: "Done" }).click();

console.log("Ken Burns on the photo");
await page.evaluate((id) => window.__igEditor.getState().select(id), photo.id);
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Animate" }).click();
await page.getByRole("tab", { name: "Motion" }).click();
await page.getByRole("radio", { name: "Zoom in" }).click();
await page.getByRole("button", { name: "Apply", exact: true }).click();
check((await S()).elements.find((e) => e.id === photo.id).motion?.kenBurns === "zoomIn", "Ken Burns saved");
await page.getByRole("button", { name: "Done" }).click();

console.log("Playing shows the animation; stopped = real positions");
const base = await node(text.id);
await page.getByRole("button", { name: "Play" }).click();
await page.waitForTimeout(700);
const mid = await node(text.id);
check(mid.text.length > 0 && mid.text.length < "Đà Lạt".length, `typewriter mid-way ("${mid.text}")`);
await page.getByRole("button", { name: "Pause" }).click();
await page.getByRole("slider", { name: "Timeline" }).fill("0");
await page.waitForTimeout(200);
const back = await node(text.id);
check(back.text === "Đà Lạt" && Math.abs(back.y - base.y) < 0.5 && back.opacity === base.opacity, "back at 0 s: full text, real position");
await shot(page, "2-editor");

console.log("Loop animation (spin)");
await page.evaluate((id) => window.__igEditor.getState().select(id), text.id);
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Animate" }).click();
await page.getByRole("tab", { name: "Loop" }).click();
await page.getByRole("radio", { name: "Spin" }).click();
await page.getByRole("button", { name: "Apply", exact: true }).click();
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Play" }).click();
await page.waitForTimeout(900);
const spun = await page.evaluate((id) => window.__igEditor.getState().canvas.layer.findOne("#" + id).rotation(), text.id);
await page.getByRole("button", { name: "Pause" }).click();
await page.getByRole("slider", { name: "Timeline" }).fill("0");
await page.waitForTimeout(200);
const still = await page.evaluate((id) => window.__igEditor.getState().canvas.layer.findOne("#" + id).rotation(), text.id);
check(spun > 20 && still === 0, `spin turns while playing (${spun.toFixed(0)}°), back to 0° when stopped`);

console.log("Export: both slides become MP4");
await page.getByRole("button", { name: "Export" }).click();
const files = await exported();
await shot(page, "3-export");
check(files.length === 2 && files.every((f) => f.name.endsWith(".mp4")), `animated photo slide and video slide are MP4 (${files.map((f) => f.name).join(", ")})`);
const p1 = probe(files[0].file);
const d1 = Number(/duration=([\d.]+)/.exec(p1)?.[1]);
check(Math.abs(d1 - 4) < 0.2 && !/codec_type=audio/.test(p1), `slide 1 (photo with Ken Burns): 4 s (slide length), no sound (${d1} s)`);
// Ken Burns: the picture changes over time even though it is a still photo.
const a = frameLuma(files[0].file, 0.1, "crop=iw/2:ih/3:0:0");
const b = frameLuma(files[0].file, 3.8, "crop=iw/2:ih/3:0:0");
check(Math.abs(a - b) > 1, `Ken Burns moves the photo (${a.toFixed(1)} → ${b.toFixed(1)})`);
// Noir on the video slide: gray frames (no colour).
const rgb = execFileSync("ffmpeg", ["-v", "error", "-ss", "1", "-i", files[1].file, "-frames:v", "1", "-vf", "scale=16:16,format=rgb24", "-f", "rawvideo", "-"]);
let sat = 0;
for (let i = 0; i < rgb.length; i += 3) sat += Math.max(rgb[i], rgb[i + 1], rgb[i + 2]) - Math.min(rgb[i], rgb[i + 1], rgb[i + 2]);
sat /= rgb.length / 3;
check(sat < 25, `video slide exported with the Noir filter (colour ${sat.toFixed(1)})`);
await page.getByRole("button", { name: "Back to editor" }).click();

console.log(`console errors: ${JSON.stringify(errors)}`);
await browser.close();
console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures || errors.length ? 1 : 0);
