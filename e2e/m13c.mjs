// M13.4 — background music (pick, volume, plays with the project, mixed into videos) and
// the whole carousel as one 9:16 video. Uses ffprobe.
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromePath, FIXTURES as dir, more, OUT as out, skipTips, URL_ARG } from "./lib.mjs";

let failures = 0;
const check = (cond, msg) => {
  console.log(cond ? "  ✓" : "  ✗", msg);
  if (!cond) failures++;
};
const shot = (p, n) => p.screenshot({ path: path.join(out, `m13c-${n}.png`) });
const probe = (file) => execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height", "-show_entries", "format=duration", "-of", "compact", file]).toString();
async function save(src, name) {
  const b64 = await page.evaluate(async (src) => {
    const buf = new Uint8Array(await (await (await fetch(src)).blob()).arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return btoa(bin);
  }, src);
  const file = path.join(out, `m13c-${name}`);
  fs.writeFileSync(file, Buffer.from(b64, "base64"));
  return file;
}

const browser = await chromium.launch({ executablePath: chromePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await skipTips(context);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const S = () => page.evaluate(() => window.__igEditor.getState().doc);

await page.goto(URL_ARG);
await page.getByRole("button", { name: "New project" }).click();
await page.getByLabel("Fewer slides").click();
await page.getByLabel("Fewer slides").click(); // 3 slides
await page.locator('input[type="file"]').setInputFiles([path.join(dir, "p3.jpg"), path.join(dir, "clip.mp4")]);
await page.getByRole("button", { name: "Skip" }).click({ timeout: 120000 });
await page.getByText("4:5 · 3 slides").waitFor();
await page.waitForTimeout(1200);
// Slide 3: a text that fades in (animated slide).
await page.evaluate(() => {
  const s = window.__igEditor.getState();
  s.addElement({
    id: "t3", type: "text", x: 2160 + 140, y: 600, width: 800, height: 120, rotation: 0, opacity: 1, text: "Hẹn gặp lại", font: "playfair", bold: true,
    fontSize: 96, color: "#ffffff", align: "center", letterSpacing: 0, lineHeight: 1.15, stroke: null, shadow: false, background: { color: "#1a1b1ecc", padding: 28, radius: 20 },
    motion: { in: "fade" },
  });
  s.select(null);
});
await page.waitForTimeout(300);

console.log("M13.4 music");
await more(page, "Music");
await page.locator('input[type="file"][accept="audio/*"]').setInputFiles(path.join(dir, "tone.m4a"));
await page.getByText("tone.m4a").waitFor({ timeout: 30000 });
await page.getByRole("slider", { name: /Volume/ }).fill("50");
await shot(page, "1-music");
await page.getByRole("button", { name: "Apply", exact: true }).click();
let doc = await S();
check(doc.music?.volume === 0.5 && doc.music.fadeIn && doc.music.fadeOut, "music set (volume, fades)");
await page.getByRole("button", { name: "Play" }).click();
await page.waitForTimeout(1200);
const musicPlaying = await page.evaluate(() => {
  const a = document.querySelector("body > div[aria-hidden] audio");
  return a ? { t: a.currentTime, paused: a.paused } : null;
});
check(musicPlaying && musicPlaying.t > 0.3 && !musicPlaying.paused, `music plays with the project (${musicPlaying?.t.toFixed(2)} s)`);
await page.getByRole("button", { name: "Pause" }).click();

console.log("Export: still → JPEG, video / animated → MP4 with sound");
await page.getByRole("button", { name: "Export" }).click();
await page.waitForFunction(() => document.querySelectorAll("figure").length === 3, null, { timeout: 180000 });
const figs = await page.evaluate(() => [...document.querySelectorAll("figure")].map((f) => ({ name: f.querySelector("figcaption").textContent, src: f.querySelector("video, img").getAttribute("src") })));
check(figs[0].name.endsWith(".jpg") && figs[1].name.endsWith(".mp4") && figs[2].name.endsWith(".mp4"), `files: ${figs.map((f) => f.name.split("_").pop()).join(", ")}`);
const f2 = probe(await save(figs[1].src, "02.mp4"));
const f3 = probe(await save(figs[2].src, "03.mp4"));
check(/codec_type=audio/.test(f2) && /codec_type=audio/.test(f3), "video slide and animated slide carry sound (video + music, music)");

console.log("One 9:16 video");
await page.getByRole("button", { name: "Make the 9:16 video" }).click();
await page.getByRole("region", { name: /One video/ }).locator("video").waitFor({ timeout: 300000 });
await shot(page, "2-reel");
const reelSrc = await page.getByRole("region", { name: /One video/ }).locator("video").getAttribute("src");
const reel = probe(await save(reelSrc, "reel.mp4"));
const dur = Number(/duration=([\d.]+)/.exec(reel)?.[1]);
check(/width=1080\|height=1920/.test(reel) && /codec_name=h264/.test(reel), "1080×1920 H.264");
check(/codec_name=aac\|codec_type=audio/.test(reel), "with sound (video + music)");
// 2.5 s still + 0.6 swipe + 4 s video + 0.6 swipe + 5 s animated slide = 12.7 s
check(Math.abs(dur - 12.7) < 0.3, `length = slides one after another with swipes (${dur} s)`);
await page.getByRole("button", { name: "Back to editor" }).click();

console.log("Saved and reopened");
await page.waitForTimeout(1200);
await page.reload();
await page.locator("article button").first().click();
await page.waitForTimeout(1500);
doc = await S();
const musicAsset = await page.evaluate(() => {
  const s = window.__igEditor.getState();
  return s.assets[s.doc.music?.assetId]?.audio?.duration;
});
check(doc.music?.volume === 0.5 && musicAsset > 7, "music survives a reload");

console.log(`console errors: ${JSON.stringify(errors)}`);
await browser.close();
console.log(failures ? `${failures} FAILED` : "ALL PASSED");
process.exit(failures || errors.length ? 1 : 0);
