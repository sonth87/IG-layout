import { db, dbStatus } from "./db";

// Storage check (Settings, 2026-10-19): times each step of the browser storage so a
// stuck or full storage can be told apart, and the report can be sent to us.

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`timeout ${ms} ms`)), ms))]);

export async function checkStorage() {
  const lines: string[] = [];
  const step = async (name: string, run: () => Promise<string | void>) => {
    const t0 = performance.now();
    try {
      const extra = await withTimeout(run(), 6000);
      lines.push(`✓ ${name} — ${Math.round(performance.now() - t0)} ms${extra ? ` (${extra})` : ""}`);
      return true;
    } catch (e) {
      lines.push(`✗ ${name} — ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`);
      return false;
    }
  };
  lines.push(`Browser: ${navigator.userAgent}`);
  lines.push(`Connection before: ${dbStatus.state}${dbStatus.error ? ` (${dbStatus.error})` : ""}`);
  await step("estimate", async () => {
    const e = await navigator.storage?.estimate?.();
    const persisted = await navigator.storage?.persisted?.();
    return e ? `${Math.round((e.usage ?? 0) / 1e6)} MB / ${Math.round((e.quota ?? 0) / 1e6)} MB, persisted ${persisted}` : "n/a";
  });
  await step("databases", async () => {
    const list = await indexedDB.databases?.();
    return list ? list.map((d) => `${d.name} v${d.version}`).join(", ") : "n/a";
  });
  const opened = await step("open", async () => {
    const d = await db();
    return `v${d.version}, stores ${[...d.objectStoreNames].join(", ")}`;
  });
  if (opened) {
    await step("read projects", async () => `${await (await db()).count("projects")} projects, ${await (await db()).count("assets")} files`);
    await step("write + delete a test record", async () => {
      const d = await db();
      const id = `__check-${Date.now()}`;
      const tx = d.transaction("projects", "readwrite");
      await Promise.all([tx.objectStore("projects").put({ id, name: "check", type: "post", ratio: "4:5", slideCount: 1, createdAt: 0, updatedAt: 0, size: 0 } as never), tx.done]);
      await d.delete("projects", id);
    });
  }
  lines.push(`Connection after: ${dbStatus.state}`);
  return lines.join("\n");
}
