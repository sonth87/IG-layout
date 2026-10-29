// Booth lab (/labs/booth): three browsers share a room through the local signal worker
// (cd apps/signal && pnpm dev) — host creates, two guests knock and are admitted, cameras
// (Chromium's fake device) show up peer-to-peer, one roll is shot, every page ends with a
// strip holding all 4 × 3 photos. Not in run.mjs: it needs the worker running.
// Usage: node e2e/booth.mjs http://localhost:3000/
import { chromium } from "playwright-core";
import path from "node:path";
import { chromePath, OUT, URL_ARG } from "./lib.mjs";

const url = new URL("labs/booth", URL_ARG).href;
const browser = await chromium.launch({
  executablePath: chromePath(),
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});
const errors = [];
async function open(name) {
  const context = await browser.newContext({ viewport: { width: 700, height: 1000 }, permissions: ["camera"] });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e}`));
  await page.goto(url);
  await page.getByLabel("Tên của bạn").fill(name);
  return page;
}

const host = await open("Host");
await host.getByRole("button", { name: "Tạo phòng mới" }).click();
await host.getByText("Chụp 4 kiểu").waitFor();
const code = new URL(host.url()).searchParams.get("r");
console.log("room", code);

const guests = [];
for (const name of ["An", "Bình"]) {
  const g = await open(name);
  await g.locator("input[placeholder=AB12]").fill(code);
  await g.getByRole("button", { name: "Vào phòng" }).click();
  await g.getByText("Đang chờ chủ phòng cho vào").waitFor();
  await host.getByText(`${name} muốn vào phòng`).waitFor();
  await host.getByRole("button", { name: "Cho vào" }).click();
  await g.getByText("Chủ phòng bấm chụp").waitFor();
  guests.push(g);
}

// Every page sees 3 tiles with live video (videoWidth > 0) and no "connecting…".
const pages = [host, ...guests];
for (const p of pages) {
  await p.waitForFunction(() => {
    const v = [...document.querySelectorAll("video")];
    return v.length === 3 && v.every((e) => e.videoWidth > 0) && !document.body.innerText.includes("đang nối");
  }, null, { timeout: 15000 });
}
console.log("mesh: 3 × 3 videos live");

await host.getByRole("button", { name: /Chụp 4 kiểu \(3 người\)/ }).click();
for (const p of pages) await p.getByText("đã có 12/12 ảnh").waitFor({ timeout: 30000 });
console.log("all pages: 12/12 photos");

const sizes = [];
for (const [i, p] of pages.entries()) {
  const img = p.getByRole("img", { name: "Strip lượt 1" });
  await img.waitFor();
  sizes.push(await img.evaluate((e) => `${e.naturalWidth}×${e.naturalHeight}`));
  await img.screenshot({ path: path.join(OUT, `booth-strip-${i}.png`) });
}
console.log("strip sizes", sizes);

// Host leaves → guests are told the room is closed.
await host.getByRole("button", { name: "Thoát" }).click();
for (const g of guests) await g.getByText("Chủ phòng đã đóng phòng").waitFor();
console.log("host left → room closed");

await browser.close();
if (errors.length || new Set(sizes).size !== 1) {
  console.error("FAIL", errors, sizes);
  process.exit(1);
}
console.log("OK booth");
