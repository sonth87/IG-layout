// Booth moving prints (D-163): a clip is kept around each shot → on the print, Photo / Live /
// Boomerang; Live plays (the canvas changes) → save an MP4 of the print (ffprobe: H.264, size,
// length), Boomerang as a Story (1080 × 1920), a GIF (long side 720) → the clips survive a
// reload. Uses ffprobe.
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { chromePath, OUT, URL_ARG, openRoll } from "./lib.mjs";

const browser = await chromium.launch({
  executablePath: chromePath(),
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"],
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, permissions: ["camera"] });
await context.addInitScript(() => localStorage.setItem("ig-layout:booth", JSON.stringify({ frameId: "strip3", spares: false, countdown: 3, sound: false })));
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};
const probe = (file) => execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name,width,height", "-show_entries", "format=duration", "-of", "compact", file]).toString();

await page.goto(new URL("booth", URL_ARG).href);
await page.getByRole("button", { name: "Shoot solo" }).click();
await page.waitForFunction(() => document.querySelector("video")?.videoWidth > 0, null, { timeout: 10000 });

console.log("1. Shoot 3 with clips");
await page.getByRole("button", { name: "Start shooting" }).click();
await page.getByText("Tap a photo to retake it.").waitFor({ timeout: 40000 });
const kinds = page.getByRole("radiogroup", { name: "Still or moving" });
check(await kinds.isVisible(), "Photo / Live / Boomerang offered");

console.log("2. Live plays");
await kinds.getByRole("radio", { name: "Live" }).click();
const live = page.locator("canvas[data-live]");
await live.waitFor();
await page.waitForTimeout(600);
const sample = () => live.evaluate((c) => c.toDataURL("image/jpeg", 0.5).length + ":" + c.toDataURL("image/jpeg", 0.5).slice(-40));
const a = await sample();
await page.waitForTimeout(700);
const b = await sample();
check(a !== b, "the moving print changes over time");
await page.screenshot({ path: path.join(OUT, "booth-live.png") });
check((await page.getByRole("button", { name: /Save video/ }).count()) === 1, "the button says it saves a video");

console.log("3. Save MP4 (print)");
let [download] = await Promise.all([page.waitForEvent("download", { timeout: 120000 }), page.getByRole("button", { name: /Save video/ }).click()]);
let file = path.join(OUT, "booth-live.mp4");
await download.saveAs(file);
let info = probe(file);
const dur = Number(/duration=([\d.]+)/.exec(info)?.[1]);
check(download.suggestedFilename().endsWith("_loop.mp4"), `named ${download.suggestedFilename()}`);
check(/codec_name=h264\|width=600\|height=1800/.test(info), `H.264 600×1800 (${info.split("\n")[0]})`);
check(dur > 6 && dur < 14, `about 3 loops (${dur} s)`);

console.log("4. Boomerang as a Story");
await kinds.getByRole("radio", { name: "Boomerang" }).click();
await page.getByRole("radiogroup", { name: "Save as" }).getByRole("radio", { name: "Story" }).click();
[download] = await Promise.all([page.waitForEvent("download", { timeout: 120000 }), page.getByRole("button", { name: /Save video/ }).click()]);
file = path.join(OUT, "booth-boomerang-story.mp4");
await download.saveAs(file);
info = probe(file);
check(/width=1080\|height=1920/.test(info) && download.suggestedFilename().endsWith("_story_boomerang.mp4"), `Story 1080×1920 boomerang (${download.suggestedFilename()})`);

console.log("5. GIF");
[download] = await Promise.all([page.waitForEvent("download", { timeout: 120000 }), page.getByRole("button", { name: "↓ GIF" }).click()]);
file = path.join(OUT, "booth-boomerang.gif");
await download.saveAs(file);
info = execFileSync("ffprobe", ["-v", "error", "-count_frames", "-show_entries", "stream=codec_name,width,height,nb_read_frames", "-of", "compact", file]).toString();
const gifFrames = Number(/nb_read_frames=(\d+)/.exec(info)?.[1]);
check(/codec_name=gif/.test(info) && /height=720/.test(info) && download.suggestedFilename().endsWith("_boomerang.gif"), `GIF, long side 720 (${info.trim()})`);
check(gifFrames > 30, `one boomerang cycle (${gifFrames} frames)`);

console.log("6. Kept");
await page.waitForTimeout(800);
await page.reload();
await openRoll(page);
await page.getByRole("radiogroup", { name: "Still or moving" }).waitFor({ timeout: 8000 });
check(true, "the clips are still there after a reload");

check(errors.length === 0, `no console errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
