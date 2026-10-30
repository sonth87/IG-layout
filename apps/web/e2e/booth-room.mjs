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
const file = path.join(OUT, "booth-room.png");
await dl.saveAs(file);
const png = readFileSync(file);
const w = png.readUInt32BE(16);
const h = png.readUInt32BE(20);
check(w === 600 && h === 1800, `saved ${w}×${h}`);
check((await host.getByRole("button", { name: "Lobby" }).count()) === 0, "no lobby button in a room");

console.log("5. Decorate together");
const [g1, g2] = guests;
await host.getByRole("button", { name: /Decorate/ }).click();
await g1.getByRole("button", { name: /Decorate/ }).click();
await g1.locator("[data-others]").getByText("An is decorating · Theme").waitFor({ timeout: 10000 });
check(true, "guest sees the host decorating (and on which tab)");
const g1Before = await g1.locator("canvas").first().evaluate((c) => c.toDataURL("image/jpeg", 0.5));
await host.locator("[data-theme-id='forest']").click();
await g1.locator("[data-theme-id='forest'][aria-checked='true']").waitFor({ timeout: 10000 });
await g1.waitForTimeout(600);
check((await g1.locator("canvas").first().evaluate((c) => c.toDataURL("image/jpeg", 0.5))) !== g1Before, "host picks Woodland → the guest's print changes too");
await g1.getByRole("tab", { name: "Layout" }).click();
await g1.getByRole("radio", { name: "Straight" }).click();
await host.getByRole("tab", { name: "Layout" }).click();
await host.getByRole("radio", { name: "Straight", checked: true }).waitFor({ timeout: 10000 });
check(true, "guest sets Straight → the host's print follows");
await host.locator("[data-others]").getByText("Binh is decorating · Layout").waitFor({ timeout: 10000 });
check(true, "host sees the guest decorating · Layout");
// The third phone stayed on the print screen: it got the changes as well.
await g2.getByRole("button", { name: /Decorate/ }).click();
await g2.getByRole("tab", { name: "Theme" }).click();
await g2.locator("[data-theme-id='forest'][aria-checked='true']").waitFor({ timeout: 10000 });
await g2.getByRole("tab", { name: "Layout" }).click();
check((await g2.getByRole("radio", { name: "Straight" }).getAttribute("aria-checked")) === "true", "the phone that wasn't decorating has the same print");
const prints = await Promise.all(all.map((p) => p.locator("canvas").first().evaluate((c) => c.toDataURL("image/jpeg", 0.5))));
check(new Set(prints).size === 1, "all three prints are the same");
await host.screenshot({ path: path.join(OUT, "booth-room-together.png") });
for (const p of all) await p.getByRole("button", { name: "Done" }).click();

console.log("6. Back to the room, refresh & reconnect, host leaves");
for (const p of all) await p.getByRole("button", { name: /Back to the room/ }).click();
await host.locator("[data-room-code]").waitFor();
check(new URL(host.url()).searchParams.get("r") === code, `room URL carries ?r=${code}`);

// Host refreshes (F5): guests stay in the room and host reconnects automatically.
await host.reload();
await host.locator("[data-room-code]").waitFor({ timeout: 10000 });
for (const p of all) {
  await p.waitForFunction(() => document.querySelectorAll("[data-person] video").length === 3 && [...document.querySelectorAll("[data-person] video")].every((v) => v.videoWidth > 0), null, { timeout: 20000 });
}
check(true, "host refreshed (F5) → guests stayed in room and host reconnected");

// Guest refreshes (F5): rejoins automatically without knocking again.
await g1.reload();
await g1.locator("[data-room-code]").waitFor({ timeout: 10000 });
for (const p of all) {
  await p.waitForFunction(() => document.querySelectorAll("[data-person] video").length === 3 && [...document.querySelectorAll("[data-person] video")].every((v) => v.videoWidth > 0), null, { timeout: 20000 });
}
check(true, "guest refreshed (F5) → auto-rejoined without knocking again");

await host.getByRole("button", { name: "Leave" }).click();
await host.getByRole("alertdialog").getByRole("button", { name: "Leave" }).click();
for (const g of guests) await g.getByText("The host closed the room.").waitFor({ timeout: 10000 });
check(true, "host left → room closed for the guests");

// Opening the old link after the session ended bounces back to Home lobby.
await g1.goto(new URL(`booth?r=${code}`, URL_ARG).href);
await g1.getByRole("button", { name: "Start a group room" }).waitFor({ timeout: 10000 });
check(new URL(g1.url()).searchParams.get("r") === null, "opening ended room URL bounces to Home and strips ?r=");

check(errors.length === 0, `no page errors ${errors.length ? JSON.stringify(errors) : ""}`);
await browser.close();
console.log(failed ? `FAILED ${failed}` : "ALL PASSED");
process.exit(failed ? 1 : 0);
