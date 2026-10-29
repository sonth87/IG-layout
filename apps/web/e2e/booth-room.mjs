// The group room in the booth (D-159): the host creates a room from the lobby (the code is
// made for them, name asked once), two friends join by typing the code in the lobby, knock,
// get let in; everyone sees and hears everyone (video + audio tracks); the host picks the
// frame (the others see it), starts; one countdown everywhere; every phone ends on the same
// print (each shot = the 3 people tiled); back to the room; the host leaves → room closed.
// Needs the room server: `pnpm signal` (ws://localhost:8787) and a build without
// NEXT_PUBLIC_SIGNAL_URL (or with it pointing there).
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromePath, OUT, URL_ARG } from "./lib.mjs";

const browser = await chromium.launch({
  executablePath: chromePath(),
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"],
});
const errors = [];
let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};
async function open() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ["camera", "microphone"], acceptDownloads: true });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(new URL("booth", URL_ARG).href);
  return p;
}
async function name(p, n) {
  await p.getByRole("dialog", { name: "Your name" }).getByRole("textbox").fill(n);
  await p.getByRole("button", { name: "Continue" }).click();
}

console.log("1. Create, join, let in");
const host = await open();
await host.getByRole("button", { name: "Start a group room" }).click();
await name(host, "An");
const code = (await host.locator("[data-room-code]").textContent({ timeout: 10000 })).trim();
check(/^[2-9A-Z]{4}$/.test(code), `room code made for the host: ${code}`);
const guests = [];
for (const n of ["Binh", "Chi"]) {
  const g = await open();
  await g.getByRole("textbox", { name: "Join with a code" }).fill(code.toLowerCase());
  await g.getByRole("button", { name: "Go" }).click();
  await name(g, n);
  await g.getByText(`Knocking on room ${code}`).waitFor({ timeout: 10000 });
  await host.getByRole("button", { name: "Let in" }).click({ timeout: 10000 });
  guests.push(g);
}
const all = [host, ...guests];
check(true, "two guests knocked and were let in");

console.log("2. See and hear everyone");
for (const p of all) {
  await p.waitForFunction(() => document.querySelectorAll("[data-person] video").length === 3 && [...document.querySelectorAll("[data-person] video")].every((v) => v.videoWidth > 0), null, { timeout: 20000 });
}
check(true, "3 × 3 live videos");
const audio = await host.evaluate(() => [...document.querySelectorAll("[data-person] video")].filter((v) => !v.muted).map((v) => v.srcObject?.getAudioTracks().length ?? 0));
check(audio.length === 2 && audio.every((n) => n === 1), `host hears both guests (audio tracks ${audio.join(", ")}), own video muted`);
await guests[1].getByRole("button", { name: "Microphone" }).click();
check((await guests[1].getByRole("button", { name: "Microphone" }).getAttribute("aria-pressed")) === "false", "mic off");
await host.screenshot({ path: path.join(OUT, "booth-room-host.png") });

console.log("3. The host picks the frame");
check((await guests[0].getByRole("radiogroup", { name: "Frame" }).count()) === 0, "guests can't pick a frame");
await host.getByRole("radio", { name: /Strip of 3/ }).click();
for (const g of guests) await g.locator("[data-host-frame='strip3']").waitFor({ timeout: 5000 });
check(true, "guests see the host's frame (Strip of 3)");
await guests[0].screenshot({ path: path.join(OUT, "booth-room-guest.png") });

console.log("4. Shoot together");
await host.getByRole("button", { name: /Shoot 3 shots/ }).click();
await Promise.all(all.map((p) => p.locator("[data-countdown]").waitFor({ timeout: 6000 })));
check(true, "the countdown runs on every phone");
await host.screenshot({ path: path.join(OUT, "booth-room-countdown.png") });
await Promise.all(all.map((p) => p.getByText("Fresh off the press!").waitFor({ timeout: 60000 })));
check(true, "every phone gets the print");
const sizes = await Promise.all(all.map((p) => p.locator("canvas").first().evaluate((c) => (c.width / c.height).toFixed(3))));
check(sizes.every((s) => s === (600 / 1800).toFixed(3)), `same frame everywhere (${sizes.join(", ")})`);
const [dl] = await Promise.all([guests[0].waitForEvent("download"), guests[0].getByRole("button", { name: /Save photo/ }).click()]);
const file = path.join(OUT, "booth-room.jpg");
await dl.saveAs(file);
const jpg = readFileSync(file);
let w = 0,
  h = 0;
for (let i = 2; i < jpg.length - 9; i++)
  if (jpg[i] === 0xff && (jpg[i + 1] === 0xc0 || jpg[i + 1] === 0xc2)) {
    h = jpg.readUInt16BE(i + 5);
    w = jpg.readUInt16BE(i + 7);
    break;
  }
check(w === 600 && h === 1800, `saved ${w}×${h}`);
check((await host.getByRole("button", { name: "Lobby" }).count()) === 0, "no lobby button in a room");

console.log("5. Back to the room, host leaves");
for (const p of all) await p.getByRole("button", { name: /Back to the room/ }).click();
await host.locator("[data-room-code]").waitFor();
await host.getByRole("button", { name: "Leave" }).click();
await host.getByRole("alertdialog").getByRole("button", { name: "Leave" }).click();
for (const g of guests) await g.getByText("The host closed the room.").waitFor({ timeout: 10000 });
check(true, "host left → room closed for the guests");

check(errors.length === 0, `no page errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
