// Moving photos the phone's gallery understands (trial, 2026-10-30 — the owner tests them on
// real phones; dropped if they don't work). Byte work only, no DOM.
//
// - Android "Motion Photo" (Google's format, read by Google Photos and recent galleries): one
//   JPEG whose XMP says a video follows, with the MP4 appended after the picture. The XMP also
//   carries OPPO's (OpCamera) and Xiaomi's (MiCamera) own fields, as their galleries look for
//   those (field list from github.com/oodicraft/turn-video-into-live-photo, MIT).
// - iPhone "Live Photo": a JPEG and a MOV sharing a content identifier — in the JPEG's Apple
//   maker note (tag 17) and in the MOV's metadata (com.apple.quicktime.content.identifier).
//   Apple's own files also carry a still-image-time metadata track; left out here.

const enc = new TextEncoder();

function concat(parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

const u16 = (n: number) => new Uint8Array([(n >> 8) & 255, n & 255]);
const u32 = (n: number) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);

/** A JPEG with `segment` (a whole APPn segment) inserted right after its SOI marker. */
function insertSegment(jpeg: Uint8Array, segment: Uint8Array) {
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) throw new Error("not a JPEG");
  return concat([jpeg.subarray(0, 2), segment, jpeg.subarray(2)]);
}

/** An APPn segment: marker, length (includes itself), body. */
function app(n: number, body: Uint8Array) {
  if (body.length + 2 > 0xffff) throw new Error("segment too long");
  return concat([new Uint8Array([0xff, 0xe0 + n]), u16(body.length + 2), body]);
}

// ── Android Motion Photo ─────────────────────────────────────────────────────

/** The JPEG with `mp4` appended and the XMP that points at it. `presentationUs`: where in the
 * video the photo was taken (microseconds). */
export function motionPhoto(jpeg: Uint8Array, mp4: Uint8Array, presentationUs: number) {
  const xmp = `<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="IG Layout">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:GCamera="http://ns.google.com/photos/1.0/camera/"
    xmlns:OpCamera="http://ns.oplus.com/photos/1.0/camera/"
    xmlns:MiCamera="http://ns.xiaomi.com/photos/1.0/camera/"
    xmlns:Container="http://ns.google.com/photos/1.0/container/"
    xmlns:Item="http://ns.google.com/photos/1.0/container/item/"
    GCamera:MotionPhoto="1"
    GCamera:MotionPhotoVersion="1"
    GCamera:MotionPhotoPresentationTimestampUs="${Math.round(presentationUs)}"
    GCamera:MicroVideo="1"
    GCamera:MicroVideoVersion="1"
    GCamera:MicroVideoOffset="${mp4.length}"
    GCamera:MicroVideoPresentationTimestampUs="${Math.round(presentationUs)}"
    OpCamera:MotionPhotoPrimaryPresentationTimestampUs="${Math.round(presentationUs)}"
    OpCamera:MotionPhotoOwner="oplus"
    OpCamera:OLivePhotoVersion="2"
    OpCamera:VideoLength="${mp4.length}"
    MiCamera:XMPMeta="&lt;?xml version='1.0' encoding='UTF-8' standalone='yes' ?&gt;">
   <Container:Directory>
    <rdf:Seq>
     <rdf:li rdf:parseType="Resource">
      <Container:Item Item:Mime="image/jpeg" Item:Semantic="Primary" Item:Length="0" Item:Padding="0"/>
     </rdf:li>
     <rdf:li rdf:parseType="Resource">
      <Container:Item Item:Mime="video/mp4" Item:Semantic="MotionPhoto" Item:Length="${mp4.length}" Item:Padding="0"/>
     </rdf:li>
    </rdf:Seq>
   </Container:Directory>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>`;
  const segment = app(1, concat([enc.encode("http://ns.adobe.com/xap/1.0/\0"), enc.encode(xmp)]));
  return concat([insertSegment(jpeg, segment), mp4]);
}

// ── iPhone Live Photo ────────────────────────────────────────────────────────

/** The JPEG with an EXIF block holding an Apple maker note whose tag 17 is `id`. */
export function liveJpeg(jpeg: Uint8Array, id: string) {
  // Maker note (big-endian, offsets from its own start): "Apple iOS\0", version 1, "MM",
  // an IFD with one entry (17, ASCII), then the string.
  const value = enc.encode(`${id}\0`);
  const makerNote = concat([enc.encode("Apple iOS\0"), u16(1), enc.encode("MM"), u16(1), u16(0x0011), u16(2), u32(value.length), u32(32), u32(0), value]);
  // TIFF: header, IFD0 (→ Exif IFD), Exif IFD (→ maker note), the maker note.
  const exifIfdAt = 8 + 2 + 12 + 4;
  const makerAt = exifIfdAt + 2 + 12 + 4;
  const tiff = concat([
    enc.encode("MM"),
    u16(42),
    u32(8),
    u16(1),
    u16(0x8769),
    u16(4),
    u32(1),
    u32(exifIfdAt),
    u32(0),
    u16(1),
    u16(0x927c),
    u16(7),
    u32(makerNote.length),
    u32(makerAt),
    u32(0),
    makerNote,
  ]);
  return insertSegment(jpeg, app(1, concat([enc.encode("Exif\0\0"), tiff])));
}

const box = (type: string | Uint8Array, ...payload: Uint8Array[]) => {
  const body = concat(payload);
  return concat([u32(8 + body.length), typeof type === "string" ? enc.encode(type) : type, body]);
};

/** The MOV with a moov/meta (QuickTime keys) holding com.apple.quicktime.content.identifier =
 * `id`. The movie box must come after the media data (no fast start), so no offsets move. */
export function liveMov(mov: Uint8Array, id: string) {
  const view = new DataView(mov.buffer, mov.byteOffset, mov.byteLength);
  let at = 0;
  let moov = -1;
  let mdat = -1;
  while (at + 8 <= mov.length) {
    const size = view.getUint32(at);
    const type = String.fromCharCode(mov[at + 4], mov[at + 5], mov[at + 6], mov[at + 7]);
    if (type === "moov") moov = at;
    if (type === "mdat") mdat = at;
    if (size < 8) break;
    at += size;
  }
  if (moov < 0) throw new Error("no moov");
  if (mdat > moov) throw new Error("moov before mdat");
  const key = "com.apple.quicktime.content.identifier";
  const meta = box(
    "meta",
    box("hdlr", u32(0), u32(0), enc.encode("mdta"), u32(0), u32(0), u32(0), new Uint8Array([0])),
    box("keys", u32(0), u32(1), u32(8 + key.length), enc.encode("mdta"), enc.encode(key)),
    box("ilst", box(u32(1), box("data", u32(1), u32(0), enc.encode(id)))),
  );
  const size = view.getUint32(moov);
  const grown = concat([u32(size + meta.length), mov.subarray(moov + 4, moov + size), meta]);
  return concat([mov.subarray(0, moov), grown, mov.subarray(moov + size)]);
}
