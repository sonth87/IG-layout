// M13.1 — video: import (compress, keep sound), play / pause, sound on / off, export
// slides with video as MP4 (H.264 + AAC, or silent), reopen. Uses ffprobe to check files.
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromePath, FIXTURES as dir, OUT as out, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};
const shot = (p, n) => p.screenshot({ path: path.join(out, `m13-${n}.png`) });

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
    const el = s.doc.elements.find((e) => e.type === "image");
    const a = el && s.assets[el.assetId];
    return { el, asset: a && { type: a.blob.type, size: a.blob.size, w: a.width, h: a.height, video: a.video && { duration: a.video.duration, hasAudio: a.video.hasAudio, poster: !!a.video.poster } }, past: s.past.length };
  });
};
/** Exported files from the export sheet, saved to disk; returns ffprobe stream lists. */
async function exportedFiles() {
  await page.getByRole("heading", { name: "Export" }).waitFor();
  await page.waitForFunction(() => document.querySelectorAll("figure").length > 0, null, { timeout: 120000 });
  const files = await page.evaluate(async () => {
    const figs = [...document.querySelectorAll("figure")];
    return Promise.all(
      figs.map(async (f) => {
        const media = f.querySelector("video, img");
        const blob = await (await fetch(media.getAttribute("src"))).blob();
        const buf = new Uint8Array(await blob.arrayBuffer());
        let bin = "";
        for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
        return { name: f.querySelector("figcaption").textContent, type: blob.type, b64: btoa(bin) };
      }),
    );
  });
  return files.map((f) => {
    const file = path.join(out, `m13-${f.name}`);
    fs.writeFileSync(file, Buffer.from(f.b64, "base64"));
    let streams = "";
    if (f.name.endsWith(".mp4")) streams = execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height", "-show_entries", "format=duration", "-of", "compact", file]).toString();
    return { ...f, file, streams };
  });
}

await page.goto(URL_ARG);
await page.getByRole("button", { name: "New project" }).click();
for (let i = 0; i < 4; i++) await page.getByLabel("Fewer slides").click(); // 1 slide
const t0 = Date.now();
await page.locator('input[type="file"]').setInputFiles([path.join(dir, "clip.mp4")]);
await page.getByRole("button", { name: "Skip" }).click({ timeout: 120000 });
await page.getByText("4:5 · 1 slide").waitFor();
await page.waitForTimeout(1500);

console.log("Import: compressed, sound kept, poster");
let st = await S();
check(st.asset?.type === "video/mp4" && st.asset.video, `video imported in ${Math.round((Date.now() - t0) / 1000)}s (${st.asset?.w}×${st.asset?.h}, ${st.asset?.video?.duration?.toFixed(2)} s)`);
check(st.asset?.video?.hasAudio === true && st.asset.video.poster, "sound kept, poster made");
await shot(page, "1-editor");

console.log("Play / pause");
await page.getByRole("button", { name: "Play" }).click();
await page.waitForTimeout(1200);
const playing = await page.evaluate(() => {
  const v = document.querySelector("body > div[aria-hidden] video");
  return { t: v?.currentTime ?? 0, paused: v?.paused, ready: v?.readyState };
});
check(playing.t > 0.3 && !playing.paused, `the video plays (at ${playing.t.toFixed(2)} s, readyState ${playing.ready})`);
await page.getByRole("button", { name: "Pause" }).click();
const timeLabel = await page.getByRole("slider", { name: "Timeline" }).inputValue();
check(Number(timeLabel) > 0.3, `timeline follows (${Number(timeLabel).toFixed(2)} s)`);
await shot(page, "2-playing");

console.log("Video tools: Sound");
await page.evaluate(() => {
  const s = window.__igEditor.getState();
  s.select(s.doc.elements.find((e) => e.type === "image").id);
});
await page.waitForTimeout(200);
check(await page.getByRole("button", { name: "Sound" }).isVisible(), "Sound tool for videos");
check(await page.getByRole("button", { name: "Filters" }).isVisible(), "colour tools for videos (M13.3)");
await page.getByRole("button", { name: "Sound" }).click();
await page.getByRole("slider", { name: /Volume/ }).fill("60");
await page.getByRole("button", { name: "Apply", exact: true }).click();
st = await S();
check(st.el.media?.volume === 0.6 && st.el.media.muted === false, "volume saved (one step)");
await page.getByRole("button", { name: "Done" }).click();

console.log("Export: MP4 with sound");
await page.getByRole("button", { name: "Export" }).click();
let files = await exportedFiles();
await shot(page, "3-export");
check(files.length === 1 && files[0].name.endsWith("_01.mp4") && files[0].type === "video/mp4", `slide exported as ${files[0]?.name}`);
check(/codec_name=h264\|codec_type=video\|width=1080\|height=1350/.test(files[0].streams), "H.264 1080×1350");
check(/codec_name=aac\|codec_type=audio/.test(files[0].streams), "AAC sound track");
const dur = Number(/duration=([\d.]+)/.exec(files[0].streams)?.[1]);
check(Math.abs(dur - st.asset.video.duration) < 0.3, `length follows the video (${dur} s)`);
// A frame from the middle is not empty (the video was drawn, not a blank / poster only).
const png = path.join(out, "m13-frame.png");
execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", "2", "-i", files[0].file, "-frames:v", "1", png]);
check(fs.statSync(png).size > 20000, "frames have the video in them");

console.log("Export without sound");
await page.getByRole("checkbox", { name: "Export videos with sound" }).uncheck();
files = await exportedFiles();
check(!/codec_type=audio/.test(files[0].streams) && /codec_type=video/.test(files[0].streams), "no sound track when switched off");
await page.getByRole("button", { name: "Back to editor" }).click();

console.log("M13.2 trim: strip, waveform, handles, play the part, speed");
await page.evaluate(() => {
  const s = window.__igEditor.getState();
  s.select(s.doc.elements.find((e) => e.type === "image").id);
});
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Trim" }).click();
const trim = page.getByRole("dialog", { name: "Trim" });
await page.waitForFunction(() => document.querySelectorAll('[role="dialog"] [role="group"] img').length >= 8, null, { timeout: 30000 });
check(true, "strip of frames shown");
check(await trim.getByRole("img", { name: "Sound" }).isVisible().catch(() => false) || (await page.locator('canvas[aria-label="Sound"]').isVisible()), "waveform shown");
const sb = await trim.getByRole("group").boundingBox();
// Drag the start handle from the left edge to 25%.
await page.mouse.move(sb.x + 4, sb.y + sb.height / 2);
await page.mouse.down();
await page.mouse.move(sb.x + sb.width * 0.25, sb.y + sb.height / 2, { steps: 8 });
await page.mouse.up();
for (let i = 0; i < 5; i++) await trim.getByRole("button", { name: "End 0.1 s earlier" }).click();
await trim.getByRole("button", { name: "Play the part" }).click();
await page.waitForTimeout(1500);
const preview = await page.evaluate(() => document.querySelector('[role="dialog"] video').currentTime);
await shot(page, "4-trim");
await trim.getByRole("button", { name: "Pause" }).click();
await trim.getByRole("radio", { name: "2×" }).click();
check(await trim.getByText("Sound is off at speeds other than 1×.").isVisible(), "speed ≠ 1× says the sound is off");
await trim.getByRole("button", { name: "Apply" }).click();
st = await S();
const m = st.el.media;
check(Math.abs(m.start - 1) < 0.15 && Math.abs(m.end - 3.5) < 0.15 && m.speed === 2, `part ${m.start.toFixed(2)}–${m.end.toFixed(2)} s at 2× saved`);
check(preview >= m.start - 0.1 && preview <= m.end + 0.1, `"play the part" stays inside it (${preview.toFixed(2)} s)`);
await page.getByRole("button", { name: "Done" }).click();
await page.getByRole("button", { name: "Export" }).click();
await page.getByRole("checkbox", { name: "Export videos with sound" }).waitFor({ state: "attached" }).catch(() => {});
files = await exportedFiles();
const dur2 = Number(/duration=([\d.]+)/.exec(files[0].streams)?.[1]);
check(Math.abs(dur2 - (m.end - m.start) / 2) < 0.2, `exported length = part / speed (${dur2} s)`);
check(!/codec_type=audio/.test(files[0].streams), "no sound at 2×");
await page.getByRole("button", { name: "Back to editor" }).click();

console.log("Saved and reopened");
await page.waitForTimeout(1200);
await page.reload();
await page.locator("article button").first().click();
await page.waitForTimeout(1500);
st = await S();
check(st.asset?.video?.hasAudio && st.asset.video.poster && st.el.media?.volume === 0.6 && st.el.media.speed === 2, "video, poster, sound and trim settings survive a reload");
check(await page.getByRole("button", { name: "Play" }).isVisible(), "playback bar after reopening");

console.log(`console errors: ${JSON.stringify(errors)}`);
await browser.close();
console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures || errors.length ? 1 : 0);
