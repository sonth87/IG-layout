import type { ImageAsset } from "../project/types";

// Data for the trim screen (M13.2): a strip of frames and the sound's waveform,
// computed once per video (cached for the session).

const strips = new Map<string, Promise<string[]>>();
const waves = new Map<string, Promise<Float32Array | null>>();

/** `count` JPEG thumbnails (object URLs), evenly spread over the whole video. */
export function filmstrip(asset: ImageAsset, count: number, height = 120): Promise<string[]> {
  const key = `${asset.id}:${count}:${height}`;
  if (!strips.has(key)) {
    strips.set(
      key,
      (async () => {
        const mb = await import("mediabunny");
        const input = new mb.Input({ source: new mb.BlobSource(asset.blob), formats: mb.ALL_FORMATS });
        const track = (await input.getPrimaryVideoTrack())!;
        const first = await track.getFirstTimestamp();
        const duration = asset.video?.duration ?? (await track.computeDuration());
        const sink = new mb.CanvasSink(track, { height, fit: "contain", poolSize: 1 });
        const times = Array.from({ length: count }, (_, i) => first + ((i + 0.5) / count) * duration);
        const urls: string[] = [];
        for await (const frame of sink.canvasesAtTimestamps(times)) {
          if (!frame) continue;
          const c = frame.canvas;
          const blob =
            "convertToBlob" in c
              ? await c.convertToBlob({ type: "image/jpeg", quality: 0.7 })
              : await new Promise<Blob>((ok, fail) => c.toBlob((b) => (b ? ok(b) : fail(new Error("thumb"))), "image/jpeg", 0.7));
          urls.push(URL.createObjectURL(blob));
        }
        return urls;
      })(),
    );
  }
  return strips.get(key)!;
}

/** Peak level (0..1) of the sound in `buckets` equal slices of the video; null without sound. */
export function waveform(asset: ImageAsset, buckets: number): Promise<Float32Array | null> {
  const key = `${asset.id}:${buckets}`;
  if (!waves.has(key)) {
    waves.set(
      key,
      (async () => {
        if (!asset.video?.hasAudio) return null;
        const mb = await import("mediabunny");
        const input = new mb.Input({ source: new mb.BlobSource(asset.blob), formats: mb.ALL_FORMATS });
        const track = await input.getPrimaryAudioTrack();
        if (!track) return null;
        const duration = asset.video.duration;
        const peaks = new Float32Array(buckets);
        for await (const { buffer, timestamp } of new mb.AudioBufferSink(track).buffers()) {
          const data = buffer.getChannelData(0);
          const rate = buffer.sampleRate;
          for (let i = 0; i < data.length; i += 64) {
            const b = Math.floor(((timestamp + i / rate) / duration) * buckets);
            if (b < 0 || b >= buckets) continue;
            const v = Math.abs(data[i]);
            if (v > peaks[b]) peaks[b] = v;
          }
        }
        const max = Math.max(0.0001, ...peaks);
        return peaks.map((p) => p / max);
      })(),
    );
  }
  return waves.get(key)!;
}
