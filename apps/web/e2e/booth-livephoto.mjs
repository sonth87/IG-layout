// Live Photo / Motion Photo trial (/labs/livephoto): shoot a roll with clips → the lab makes
// an Android Motion Photo (a JPEG with Google's XMP and the MP4 appended — the MP4 plays,
// MicroVideoOffset is its length) and an iPhone Live Photo pair (a JPEG whose Apple maker
// note and a MOV whose QuickTime metadata carry the same content identifier). Uses ffprobe.
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromePath, OUT, URL_ARG } from "./lib.mjs";

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

console.log("1. A roll with clips");
await page.goto(new URL("labs/livephoto", URL_ARG).href);
await page.getByText("Chưa có cuộn phim nào có clip").waitFor();
check(true, "no roll yet → says to shoot one");
await page.goto(new URL("booth", URL_ARG).href);
await page.getByRole("button", { name: "Shoot solo" }).click();
await page.waitForFunction(() => document.querySelector("video")?.videoWidth > 0, null, { timeout: 10000 });
await page.getByRole("button", { name: "Start shooting" }).click();
await page.getByText("Tap a photo to retake it.").waitFor({ timeout: 40000 });
await page.waitForTimeout(800);

console.log("2. Android Motion Photo");
await page.goto(new URL("labs/livephoto", URL_ARG).href);
await page.getByRole("button", { name: /Android/ }).click();
await page.getByText(/\.MP\.jpg/).waitFor({ timeout: 60000 });
let [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Tải về" }).click()]);
let file = path.join(OUT, "motion.MP.jpg");
await dl.saveAs(file);
const mp = readFileSync(file);
const text = mp.toString("latin1");
const offset = Number(/MicroVideoOffset="(\d+)"/.exec(text)?.[1]);
check(mp[0] === 0xff && mp[1] === 0xd8 && /GCamera:MotionPhoto="1"/.test(text), "a JPEG with the Motion Photo XMP");
const mp4 = mp.subarray(mp.length - offset);
check(mp4.subarray(4, 8).toString("latin1") === "ftyp", `the MP4 sits at the end (${offset} bytes)`);
writeFileSync(path.join(OUT, "motion-tail.mp4"), mp4);
const probe = execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name", "-of", "csv=p=0", path.join(OUT, "motion-tail.mp4")]).toString().trim();
check(probe === "h264", `the appended video plays (${probe})`);
const ts = Number(/MotionPhotoPresentationTimestampUs="(\d+)"/.exec(text)?.[1]);
check(ts > 500_000 && ts < 3_000_000, `the photo is at the shutter (${ts} µs)`);

console.log("3. iPhone Live Photo");
await page.getByRole("button", { name: /iPhone/ }).click();
await page.getByText(/\.MOV|Không tạo được/).first().waitFor({ timeout: 60000 });
const fail = await page.getByText(/Không tạo được/).textContent().catch(() => null);
if (fail) console.log("   ", fail);
const got = [];
page.on("download", (d) => got.push(d));
await page.getByRole("button", { name: "Tải về" }).click();
await page.waitForTimeout(1500);
check(got.length === 2, `two files (${got.map((d) => d.suggestedFilename()).join(", ")})`);
const jpg = got.find((d) => d.suggestedFilename().endsWith(".JPG"));
const mov = got.find((d) => d.suggestedFilename().endsWith(".MOV"));
await jpg.saveAs((file = path.join(OUT, "live.JPG")));
const jtext = readFileSync(file).toString("latin1");
const id = /Apple iOS\0[\s\S]{22}([0-9A-F-]{36})/.exec(jtext)?.[1];
check(!!id && /Exif\0\0MM/.test(jtext), `the JPEG's Apple maker note has a content identifier (${id})`);
await mov.saveAs((file = path.join(OUT, "live.MOV")));
const tags = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format_tags:stream=codec_name", "-of", "json", file]).toString();
check(tags.includes(`"com.apple.quicktime.content.identifier": "${id}"`), "the MOV carries the same identifier");
check(/"codec_name": "h264"/.test(tags) && /"major_brand": "qt  "/.test(tags), "a QuickTime movie, H.264");

check(errors.length === 0, `no console errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
