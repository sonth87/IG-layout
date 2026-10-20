"use client";
/* eslint-disable @next/next/no-img-element -- local blob / sample images, no optimisation needed */

import { useEffect, useMemo, useRef, useState } from "react";
import { FILTER_GROUPS, FILTERS, filterById, type FilterDef, type FilterGroup } from "@/lib/color/filters";
import { NO_ADJUST, shaderParams, vignetteOf } from "@/lib/color/params";
import { CAMERAS, drawFilmFx, FILM_FX, type FilmFx, type FxKind } from "@/lib/color/filmfx";
import { processImage } from "@/lib/color/processor";

// Filter lab (Filter v2, docs/discussions/2026-10-20-filter-v2.md): every filter on sample
// photos or the owner's own, through the app's own colour pipeline, next to a reference
// edited in another app. Marks + notes are copied back as text. Not linked from the app.

const SAMPLES = ["portrait", "lake", "camera", "fjord", "forest", "street", "food", "coffee"];
const NOTES_KEY = "ig-layout:filter-lab";
const GROUP_LABEL: Record<FilterGroup, string> = {
  film: "Film",
  analog: "Analog",
  mood: "Trầm",
  bright: "Tươi sáng",
  vivid: "Rực rỡ",
  instant: "Lấy liền",
  cinema: "Điện ảnh",
  urban: "Đô thị",
  lights: "Ánh đèn",
  mono: "Đen trắng",
  vintage: "Vintage",
  modern: "Hiện đại",
  nature: "Thiên nhiên",
  food: "Ẩm thực",
  future: "Tương lai",
};

type Mark = "good" | "fix" | "bad";
type Notes = Record<string, { mark?: Mark; note?: string }>;
interface Photo {
  name: string;
  img: HTMLImageElement;
  /** The same photo edited in another app (VSCO…), to compare against. */
  ref?: string;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Tiles render one at a time so the page stays responsive while 60 filters draw.
const queue: (() => void)[] = [];
let pumping = false;
function schedule(job: () => void) {
  queue.push(job);
  if (pumping) return;
  pumping = true;
  const pump = () => {
    const next = queue.shift();
    if (!next) return void (pumping = false);
    next();
    setTimeout(pump, 0);
  };
  setTimeout(pump, 0);
}

function Rendered(props: { img: HTMLImageElement; filter: FilterDef | null; intensity: number; max: number; original?: boolean; fx?: FilmFx; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { img, filter, intensity, max, original, fx } = props;
  useEffect(() => {
    let live = true;
    schedule(() => {
      const c = ref.current;
      if (!live || !c) return;
      const out = !original && filter ? processImage(img, shaderParams(NO_ADJUST, filter.preset, intensity), max) : null;
      const src = out ?? img;
      const s = Math.min(1, max / Math.max(img.width, img.height));
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      const ctx = c.getContext("2d")!;
      ctx.drawImage(src, 0, 0, c.width, c.height);
      const v = original ? 0 : vignetteOf(undefined, filter ? { id: filter.id, intensity } : null) / 100;
      if (v > 0) {
        const r = Math.hypot(c.width, c.height) / 2;
        const g = ctx.createRadialGradient(c.width / 2, c.height / 2, r * 0.35, c.width / 2, c.height / 2, r);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, `rgba(0,0,0,${0.75 * v})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, c.width, c.height);
      }
      if (!original) drawFilmFx(ctx, c.width, c.height, fx);
    });
    return () => {
      live = false;
    };
  }, [img, filter, intensity, max, original, fx]);
  return <canvas ref={ref} className={props.className ?? "block aspect-[4/5] w-full rounded-md bg-white/5 object-cover"} />;
}

const MARK_LABEL: Record<Mark, string> = { good: "Đẹp", fix: "Cần sửa", bad: "Bỏ" };
const MARK_COLOR: Record<Mark, string> = { good: "bg-emerald-500", fix: "bg-amber-500", bad: "bg-rose-500" };

export function FilterLab() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [mode, setMode] = useState<"photo" | "filter" | "fx">("photo");
  const [seed, setSeed] = useState(11);
  const [photoAt, setPhotoAt] = useState(0);
  const [filterId, setFilterId] = useState(FILTERS[0].id);
  const [group, setGroup] = useState<FilterGroup | "all" | "new">("new");
  const [intensity, setIntensity] = useState(100);
  const [detail, setDetail] = useState<{ photo: number; filter: string } | null>(null);
  const [holding, setHolding] = useState(false);
  const [notes, setNotes] = useState<Notes>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all(SAMPLES.map(async (n) => ({ name: n, img: await loadImage(`/labs/filter-samples/${n}.jpg`) }))).then((p) => {
      setPhotos((old) => [...p, ...old]);
      try {
        setNotes(JSON.parse(localStorage.getItem(NOTES_KEY) ?? "{}"));
      } catch {
        // private mode: notes live only in memory
      }
    });
  }, []);
  const saveNotes = (n: Notes) => {
    setNotes(n);
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(n));
    } catch {
      // ignore
    }
  };

  const shown = useMemo(
    () => FILTERS.filter((f) => (group === "all" ? true : group === "new" ? !!f.preset.lut : f.group === group)),
    [group],
  );

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const added = await Promise.all([...files].map(async (f) => ({ name: f.name, img: await loadImage(URL.createObjectURL(f)) })));
    setPhotos((p) => [...p, ...added]);
    setPhotoAt(photos.length);
  }
  function addRef(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPhotos((p) => p.map((x, i) => (i === photoAt ? { ...x, ref: url } : x)));
  }
  async function copy() {
    const marked = Object.entries(notes).filter(([, v]) => v.mark || v.note);
    const text = [
      `Filter lab — ${new Date().toISOString().slice(0, 16)} — ${navigator.userAgent}`,
      ...marked.map(([id, v]) => `${filterById(id)?.name ?? id} (${id}): ${v.mark ? MARK_LABEL[v.mark] : "—"}${v.note ? ` — ${v.note}` : ""}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("Sao chép đoạn này:", text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const photo = photos[photoAt];
  const markedCount = Object.values(notes).filter((v) => v.mark).length;
  const tab = (active: boolean) => `h-9 shrink-0 rounded-full px-3.5 text-sm ${active ? "bg-white font-semibold text-black" : "bg-white/10 text-white/80"}`;

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#111214] text-white">
      <header className="sticky top-0 z-10 space-y-2 bg-[#111214]/95 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur">
        <div className="flex items-center gap-2">
          <h1 className="flex-1 text-lg font-bold">Phòng thử filter</h1>
          <button type="button" onClick={copy} className="h-9 rounded-full bg-white/10 px-3.5 text-sm">
            {copied ? "Đã chép ✓" : `Sao chép nhận xét (${markedCount})`}
          </button>
        </div>
        <div className="flex gap-2">
          <button type="button" className={tab(mode === "photo")} onClick={() => setMode("photo")}>1 ảnh × mọi filter</button>
          <button type="button" className={tab(mode === "filter")} onClick={() => setMode("filter")}>1 filter × mọi ảnh</button>
          <button type="button" className={tab(mode === "fx")} onClick={() => setMode("fx")}>Máy ảnh & Film FX</button>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {(["new", "all", ...FILTER_GROUPS] as const).map((g) => (
            <button key={g} type="button" className={tab(group === g)} onClick={() => setGroup(g)}>
              {g === "new" ? "Mới (v2)" : g === "all" ? "Tất cả" : GROUP_LABEL[g]}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm">
          <span className="w-20 shrink-0 text-white/70">Cường độ</span>
          <input type="range" min={0} max={100} value={intensity} onChange={(e) => setIntensity(+e.target.value)} className="flex-1" />
          <span className="w-8 text-right tabular-nums">{intensity}</span>
        </label>
      </header>

      <main className="px-4 pb-16">
        {mode === "fx" && photo ? (
          <FxBoard photo={photo} photos={photos} photoAt={photoAt} setPhotoAt={setPhotoAt} seed={seed} onShuffle={() => setSeed(Math.floor(Math.random() * 1e9))} />
        ) : mode === "photo" ? (
          <>
            <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto py-1">
              {photos.map((p, i) => (
                <button key={i} type="button" onClick={() => setPhotoAt(i)} className={`shrink-0 overflow-hidden rounded-md ${i === photoAt ? "ring-2 ring-white" : "opacity-60"}`}>
                  <img src={p.img.src} alt={p.name} className="h-16 w-[52px] object-cover" />
                </button>
              ))}
              <label className="flex h-16 w-[52px] shrink-0 cursor-pointer items-center justify-center rounded-md bg-white/10 text-2xl">
                +
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
              </label>
            </div>
            {photo && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <figure>
                  <Rendered img={photo.img} filter={null} intensity={0} max={480} original />
                  <figcaption className="mt-1 text-xs text-white/60">Ảnh gốc</figcaption>
                </figure>
                <figure>
                  {photo.ref ? (
                    <img src={photo.ref} alt="Đối chiếu" className="block aspect-[4/5] w-full rounded-md object-cover" />
                  ) : (
                    <label className="flex aspect-[4/5] w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-white/25 p-3 text-center text-xs text-white/60">
                      + Ảnh đối chiếu (cùng ảnh, chỉnh bằng VSCO…)
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => addRef(e.target.files)} />
                    </label>
                  )}
                  <figcaption className="mt-1 text-xs text-white/60">Đối chiếu</figcaption>
                </figure>
                {shown.map((f) => (
                  <Tile key={f.id} filter={f} note={notes[f.id]} onOpen={() => setDetail({ photo: photoAt, filter: f.id })}>
                    <Rendered img={photo.img} filter={f} intensity={intensity} max={480} />
                  </Tile>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <select value={filterId} onChange={(e) => setFilterId(e.target.value)} className="mb-3 h-10 w-full rounded-lg bg-white/10 px-3 text-sm">
              {shown.map((f) => (
                <option key={f.id} value={f.id} className="text-black">
                  {GROUP_LABEL[f.group]} — {f.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((p, i) => (
                <button key={i} type="button" onClick={() => setDetail({ photo: i, filter: filterId })} className="text-left">
                  <Rendered img={p.img} filter={filterById(filterId) ?? null} intensity={intensity} max={480} />
                  <span className="mt-1 block truncate text-xs text-white/60">{p.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      {detail && photos[detail.photo] && (
        <Detail
          photo={photos[detail.photo]}
          filter={filterById(detail.filter)!}
          intensity={intensity}
          holding={holding}
          setHolding={setHolding}
          note={notes[detail.filter] ?? {}}
          onNote={(v) => saveNotes({ ...notes, [detail.filter]: v })}
          onStep={(d) => {
            const list = mode === "photo" ? shown : null;
            if (list) {
              const i = list.findIndex((f) => f.id === detail.filter);
              const next = list[(i + d + list.length) % list.length];
              setDetail({ ...detail, filter: next.id });
            } else setDetail({ ...detail, photo: (detail.photo + d + photos.length) % photos.length });
          }}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

function Tile(props: { filter: FilterDef; note?: { mark?: Mark; note?: string }; onOpen: () => void; children: React.ReactNode }) {
  const mark = props.note?.mark;
  return (
    <button type="button" onClick={props.onOpen} className="relative text-left">
      {props.children}
      <span className="mt-1 flex items-center gap-1.5 text-xs">
        <span className="truncate font-medium">{props.filter.name}</span>
        <span className="text-white/40">{GROUP_LABEL[props.filter.group]}</span>
      </span>
      {mark && <span className={`absolute right-1.5 top-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${MARK_COLOR[mark]}`}>{MARK_LABEL[mark]}</span>}
    </button>
  );
}

function Detail(props: {
  photo: Photo;
  filter: FilterDef;
  intensity: number;
  holding: boolean;
  setHolding: (v: boolean) => void;
  note: { mark?: Mark; note?: string };
  onNote: (v: { mark?: Mark; note?: string }) => void;
  onStep: (d: number) => void;
  onClose: () => void;
}) {
  const { photo, filter, note } = props;
  const [showRef, setShowRef] = useState(false);
  return (
    <div className="fixed inset-0 z-20 flex flex-col bg-black">
      <div className="flex items-center gap-2 px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
        <button type="button" onClick={props.onClose} className="h-9 w-9 rounded-full bg-white/10" aria-label="Đóng">
          ✕
        </button>
        <div className="flex-1 text-center">
          <div className="font-semibold">{filter.name}</div>
          <div className="text-xs text-white/50">
            {GROUP_LABEL[filter.group]} · {photo.name} · giữ ảnh để xem gốc
          </div>
        </div>
        <button type="button" onClick={() => props.onStep(-1)} className="h-9 w-9 rounded-full bg-white/10" aria-label="Trước">
          ‹
        </button>
        <button type="button" onClick={() => props.onStep(1)} className="h-9 w-9 rounded-full bg-white/10" aria-label="Sau">
          ›
        </button>
      </div>
      <div
        className="flex min-h-0 flex-1 select-none items-center justify-center gap-2 px-2"
        onPointerDown={() => props.setHolding(true)}
        onPointerUp={() => props.setHolding(false)}
        onPointerLeave={() => props.setHolding(false)}
        onPointerCancel={() => props.setHolding(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        {showRef && photo.ref ? (
          <img src={photo.ref} alt="Đối chiếu" className="block max-h-full min-w-0 flex-1 object-contain" />
        ) : (
          <Rendered img={photo.img} filter={filter} intensity={props.intensity} max={1400} original={props.holding} className="block max-h-full min-w-0 max-w-full flex-1 object-contain" />
        )}
        {photo.ref && !showRef && <img src={photo.ref} alt="Đối chiếu" className="hidden max-h-full min-w-0 flex-1 object-contain sm:block" />}
      </div>
      <div className="space-y-2 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
        {photo.ref && (
          <button type="button" onClick={() => setShowRef(!showRef)} className="h-9 w-full rounded-full bg-white/10 text-sm sm:hidden">
            {showRef ? "Xem filter" : "Xem ảnh đối chiếu"}
          </button>
        )}
        <div className="flex gap-2">
          {(["good", "fix", "bad"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => props.onNote({ ...note, mark: note.mark === m ? undefined : m })}
              className={`h-10 flex-1 rounded-full text-sm font-semibold ${note.mark === m ? MARK_COLOR[m] : "bg-white/10"}`}
            >
              {MARK_LABEL[m]}
            </button>
          ))}
        </div>
        <input
          value={note.note ?? ""}
          onChange={(e) => props.onNote({ ...note, note: e.target.value })}
          placeholder="Ghi chú (ví dụ: da hơi vàng, xanh lá quá gắt…)"
          className="h-10 w-full rounded-lg bg-white/10 px-3 text-sm placeholder:text-white/40"
        />
      </div>
    </div>
  );
}

const FX_KIND_LABEL: Record<FxKind, string> = { light: "Ánh sáng", texture: "Kết cấu", frame: "Viền", distress: "Cũ hỏng" };

/** Retro cameras and every Film FX layer on one photo; Shuffle re-rolls the random parts. */
function FxBoard(props: { photo: Photo; photos: Photo[]; photoAt: number; setPhotoAt: (i: number) => void; seed: number; onShuffle: () => void }) {
  const { photo, seed } = props;
  const today = new Date();
  const stamp = `'${String(today.getFullYear() % 100).padStart(2, "0")} ${String(today.getMonth() + 1).padStart(2, "0")} ${String(today.getDate()).padStart(2, "0")}`;
  return (
    <>
      <div className="no-scrollbar mb-3 flex items-center gap-2 overflow-x-auto py-1">
        {props.photos.map((p, i) => (
          <button key={i} type="button" onClick={() => props.setPhotoAt(i)} className={`shrink-0 overflow-hidden rounded-md ${i === props.photoAt ? "ring-2 ring-white" : "opacity-60"}`}>
            <img src={p.img.src} alt={p.name} className="h-16 w-[52px] object-cover" />
          </button>
        ))}
        <button type="button" onClick={props.onShuffle} className="h-10 shrink-0 rounded-full bg-white px-4 text-sm font-semibold text-black">
          Xáo
        </button>
      </div>
      <h2 className="mb-2 mt-2 font-semibold">Máy ảnh retro</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CAMERAS.map((cam) => {
          const fx: FilmFx = { date: cam.date ? stamp : undefined };
          for (const [k, l] of Object.entries(cam.layers)) fx[k as FxKind] = { ...l, seed };
          return (
            <figure key={cam.id}>
              <Rendered img={photo.img} filter={filterById(cam.filter) ?? null} intensity={100} max={720} fx={fx} />
              <figcaption className="mt-1 text-xs">
                <span className="font-medium">{cam.name}</span> <span className="text-white/40">{filterById(cam.filter)?.name}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
      {(["light", "texture", "frame", "distress"] as const).map((k) => (
        <section key={k}>
          <h2 className="mb-2 mt-6 font-semibold">Film FX — {FX_KIND_LABEL[k]}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {FILM_FX.filter((f) => f.kind === k).map((f) => (
              <figure key={f.id}>
                <Rendered img={photo.img} filter={null} intensity={0} max={720} fx={{ [k]: { id: f.id, amount: k === "frame" ? 100 : 75, seed } }} />
                <figcaption className="mt-1 text-xs font-medium">{f.name.vi}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
