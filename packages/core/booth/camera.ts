// The camera for the booth (and the room lab): open it, fall back to a moving test card when
// there's none (a laptop without a camera, the e2e browser), take one full-resolution shot.

export type Facing = "user" | "environment";

/** Why the camera didn't open (getUserMedia's error names, grouped). */
export type CameraError = "denied" | "none" | "busy" | "insecure" | "other";

/** `audio`: also the microphone (group rooms: voice); a refused mic still gives the camera. */
export async function openCamera(facing: Facing = "user", label = "?", audio = false): Promise<{ stream: MediaStream; fake: boolean; error?: CameraError }> {
  if (!navigator.mediaDevices?.getUserMedia) return { stream: fakeCamera(label), fake: true, error: isSecureContext ? "other" : "insecure" };
  const video = { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } };
  try {
    if (audio) {
      try {
        return { stream: await navigator.mediaDevices.getUserMedia({ video, audio: { echoCancellation: true, noiseSuppression: true } }), fake: false };
      } catch {
        // No mic / mic refused: carry on with the camera only.
      }
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
    return { stream, fake: false };
  } catch (e) {
    const name = e instanceof DOMException ? e.name : "";
    const error: CameraError =
      name === "NotAllowedError" || name === "SecurityError"
        ? "denied"
        : name === "NotFoundError" || name === "OverconstrainedError"
          ? "none"
          : name === "NotReadableError" || name === "AbortError"
            ? "busy"
            : "other";
    return { stream: fakeCamera(label), fake: true, error };
  }
}

export function stopCamera(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop());
}

/** A moving test card, so a laptop without a camera can still try the booth. */
export function fakeCamera(label: string): MediaStream {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const c = canvas.getContext("2d")!;
  const hue = Math.floor(Math.random() * 360);
  const draw = () => {
    const t = performance.now() / 1000;
    c.fillStyle = `hsl(${hue} 45% 30%)`;
    c.fillRect(0, 0, 640, 480);
    c.fillStyle = `hsl(${hue} 70% 65%)`;
    c.beginPath();
    c.arc(320 + Math.cos(t) * 180, 240 + Math.sin(t * 1.3) * 120, 60, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fff";
    c.font = "bold 64px sans-serif";
    c.textAlign = "center";
    c.fillText(label, 320, 260);
    c.font = "24px monospace";
    c.fillText(new Date().toLocaleTimeString("vi-VN"), 320, 440);
  };
  draw();
  const timer = setInterval(draw, 1000 / 15);
  const stream = canvas.captureStream(15);
  stream.getVideoTracks()[0]?.addEventListener("ended", () => clearInterval(timer));
  // stop() doesn't fire "ended" on the track itself: wrap it.
  for (const track of stream.getVideoTracks()) {
    const stop = track.stop.bind(track);
    track.stop = () => {
      clearInterval(timer);
      stop();
    };
  }
  return stream;
}

/** One full-resolution JPEG from the camera, as the sensor sees it (mirrored when asked). */
export async function snap(video: HTMLVideoElement, mirror = false): Promise<Blob | null> {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d")!;
  if (mirror) {
    c.translate(w, 0);
    c.scale(-1, 1);
  }
  c.drawImage(video, 0, 0);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
}
