"use client";

import { useEffect, useMemo, useState } from "react";
import { liveJpeg, liveMov, motionPhoto } from "@ig-layout/core/booth/livephoto";
import { listRolls, type BoothRoll } from "@ig-layout/core/storage/booth";
import { clipVideo, hasClips, printVideo, shutterSeconds } from "./live";
import { formatBlob, shotBlobs } from "./look";
import { Btn, Label, Paper, display, mono, serif } from "./ui";
import { boothMono, boothSerif } from "./fonts";

// Trial page (/labs/livephoto, 2026-10-30): turn a booth roll's moving print, or one shot's
// clip, into a phone's own moving photo — an Android Motion Photo (one .jpg) or an iPhone Live
// Photo (a .jpg + .mov pair) — then share / save it, to see on real phones whether the gallery
// shows it moving. Made first, shared on a second tap: a phone only opens the share sheet
// straight after a tap. Owner-facing, Vietnamese only.

type Kind = "android" | "iphone";

export function LivePhotoLab() {
  const [rolls, setRolls] = useState<BoothRoll[] | null>(null);
  const [rollId, setRollId] = useState<string | null>(null);
  /** -1: the print; otherwise a cell. */
  const [source, setSource] = useState(-1);
  const [busy, setBusy] = useState<Kind | null>(null);
  const [made, setMade] = useState<{ kind: Kind; files: File[] } | null>(null);
  const [note, setNote] = useState("");
  useEffect(() => {
    void listRolls().then((all) => {
      const list = all.filter(hasClips);
      setRolls(list);
      setRollId(list[0]?.id ?? null);
    });
  }, []);
  const roll = rolls?.find((r) => r.id === rollId) ?? null;
  const cells = useMemo(() => (roll ? roll.shots.flatMap((b, i) => (b && roll.clips?.[i]?.frames.length ? [i] : [])) : []), [roll]);

  async function make(kind: Kind) {
    if (!roll) return;
    setBusy(kind);
    setMade(null);
    setNote("");
    try {
      const container = kind === "iphone" ? "mov" : "mp4";
      const still = source < 0 ? await formatBlob(roll, "print") : (await shotBlobs(roll))[roll.shots.flatMap((b, i) => (b ? [i] : [])).indexOf(source)];
      const video = source < 0 ? await printVideo(roll, "loop", container) : await clipVideo(roll, source, "loop", container);
      const jpeg = new Uint8Array(await still.arrayBuffer());
      const clip = new Uint8Array(await video.blob.arrayBuffer());
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
      if (kind === "android") {
        const bytes = motionPhoto(jpeg, clip, shutterSeconds(roll, "loop") * 1e6);
        setMade({ kind, files: [new File([bytes], `PXL_${stamp}.MP.jpg`, { type: "image/jpeg" })] });
      } else {
        const id = crypto.randomUUID().toUpperCase();
        setMade({ kind, files: [new File([liveJpeg(jpeg, id)], `IMG_${stamp}.JPG`, { type: "image/jpeg" }), new File([liveMov(clip, id)], `IMG_${stamp}.MOV`, { type: "video/quicktime" })] });
      }
    } catch (e) {
      setNote(`Không tạo được: ${String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  async function share() {
    if (!made) return;
    try {
      if (navigator.canShare?.({ files: made.files })) {
        await navigator.share({ files: made.files });
        setNote("Đã mở bảng chia sẻ.");
      } else {
        download();
        setNote("Trình duyệt này không chia sẻ được tệp — đã tải về.");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setNote(`Chia sẻ lỗi: ${String(e)}`);
    }
  }

  function download() {
    for (const f of made?.files ?? []) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(f);
      a.download = f.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 30_000);
    }
  }

  return (
    <div className={`${boothSerif.variable} ${boothMono.variable} min-h-dvh bg-[#1a1310] px-4 py-6 text-[#f3e9d6]`}>
      <div className="mx-auto max-w-md">
        <p className={`${mono} text-[10px] font-bold uppercase tracking-[0.3em] text-[#eaa63c]`}>Trang thử</p>
        <h1 className={`${serif} text-3xl`} style={display}>
          Live Photo / Motion Photo
        </h1>
        <p className={`${mono} mt-2 text-xs leading-relaxed opacity-80`}>Biến bản in động (hoặc clip một kiểu) của booth thành ảnh động của điện thoại, rồi xem thư viện ảnh có cho nó chuyển động không.</p>

        {rolls === null ? null : !roll ? (
          <Paper className="mt-6">
            <p className={`${mono} p-5 text-sm`}>
              Chưa có cuộn phim nào có clip. Vào{" "}
              <a className="font-bold underline" href="/booth">
                booth
              </a>
              , chụp một cuộn bằng camera, rồi quay lại đây.
            </p>
          </Paper>
        ) : (
          <Paper className="mt-6">
            <div className="p-5">
              <Label>Cuộn phim</Label>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {rolls.map((r) => (
                  <RollPick key={r.id} roll={r} on={r.id === rollId} onPick={() => (setRollId(r.id), setSource(-1), setMade(null))} />
                ))}
              </div>
              <Label className="mt-4">Lấy</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[-1, ...cells].map((c) => (
                  <button key={c} type="button" aria-pressed={source === c} onClick={() => (setSource(c), setMade(null))} className={`${mono} border-2 border-[#1d1612] px-3 py-1.5 text-xs font-bold ${source === c ? "bg-[#1d1612] text-[#f3e9d6]" : "bg-[#e7d9bd]"}`}>
                    {c < 0 ? "Bản in" : `Kiểu ${c + 1}`}
                  </button>
                ))}
              </div>
              <div className="mt-5 grid gap-3">
                <Btn tone="main" disabled={!!busy} onClick={() => void make("android")}>
                  {busy === "android" ? "Đang tạo…" : "Android · Motion Photo (1 tệp)"}
                </Btn>
                <Btn tone="ink" disabled={!!busy} onClick={() => void make("iphone")}>
                  {busy === "iphone" ? "Đang tạo…" : "iPhone · Live Photo (2 tệp)"}
                </Btn>
              </div>
              {made && (
                <div className="mt-5 border-t-2 border-dashed border-[#1d1612]/30 pt-4">
                  <p className={`${mono} text-xs`}>
                    {made.files.map((f) => (
                      <span key={f.name} className="block">
                        {f.name} · {(f.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    ))}
                  </p>
                  <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
                    <Btn tone="main" onClick={() => void share()}>
                      Chia sẻ / Lưu vào Ảnh
                    </Btn>
                    <Btn onClick={download}>Tải về</Btn>
                  </div>
                </div>
              )}
              {note && <p className={`${mono} mt-3 text-xs text-[#c8432f]`}>{note}</p>}
            </div>
          </Paper>
        )}

        <div className={`${mono} mt-6 space-y-3 text-xs leading-relaxed opacity-85`}>
          <p className="font-bold uppercase tracking-[0.2em] text-[#eaa63c]">Cần xem gì</p>
          <p>
            <b>Android:</b> bấm «Chia sẻ / Lưu» → chọn Google Photos (hoặc Tải về rồi mở trong Google Photos / Thư viện). Mở ảnh: góc trên có nút <b>Motion / Chuyển động</b>, nhấn giữ hoặc bấm nút thì ảnh chạy? Samsung: thử cả Gallery của Samsung.
          </p>
          <p>
            <b>iPhone:</b> bấm «Chia sẻ / Lưu» → <b>Lưu 2 mục</b> (Save 2 Items). Mở app Ảnh: có ra <b>một</b> ảnh với chữ <b>LIVE</b> ở góc, nhấn giữ thì chạy? Hay thành 2 mục riêng (một ảnh, một video)? Thử thêm: Tải về → mở app Tệp → chọn cả 2 tệp → Lưu vào Ảnh.
          </p>
          <p>Báo lại kết quả từng máy (tên máy, bản iOS / Android). Không được thì bỏ tính năng này.</p>
        </div>
      </div>
    </div>
  );
}

function RollPick({ roll, on, onPick }: { roll: BoothRoll; on: boolean; onPick: () => void }) {
  const url = useMemo(() => (roll.thumbnail.size ? URL.createObjectURL(roll.thumbnail) : null), [roll.thumbnail]);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  return (
    <button type="button" aria-pressed={on} onClick={onPick} className={`shrink-0 border-2 p-0.5 ${on ? "border-[#c8432f]" : "border-transparent"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a local blob URL */}
      {url ? <img src={url} alt="" className="h-20 w-auto" /> : <span className="block h-20 w-8 bg-[#2a231d]" />}
    </button>
  );
}
