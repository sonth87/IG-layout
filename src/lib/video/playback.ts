import { create } from "zustand";
import type { MediaSettings } from "@/lib/project/types";

// Video playback in the editor (M13.1). One hidden <video> per video element (iOS only
// plays videos that are in the page, muted or after a tap, inline). A single clock
// drives them all: play / pause / seek, each video following its own trimmed part and
// looping. While playing, the canvas is redrawn every frame.

/** Clock state for the UI (time changes every frame while playing: subscribe narrowly). */
export const usePlayback = create<{ playing: boolean; time: number; duration: number }>()(() => ({
  playing: false,
  time: 0,
  duration: 0,
}));

interface Entry {
  video: HTMLVideoElement;
  media: MediaSettings;
}

const entries = new Map<string, Entry>();
let host: HTMLDivElement | null = null;
let redraw: () => void = () => {};
let frame = 0;
let startedAt = 0;

/** Called by the canvas: how to redraw it when a video frame changes. */
export function setRedraw(fn: () => void) {
  redraw = fn;
}

function hostEl() {
  if (!host) {
    host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:fixed;left:0;top:0;width:2px;height:2px;overflow:hidden;opacity:0.01;pointer-events:none";
    document.body.appendChild(host);
  }
  return host;
}

const length = (m: MediaSettings) => Math.max(0.05, m.end - m.start);
/** Where a video should be at project time `t` (loops within its part). */
const localTime = (m: MediaSettings, t: number) => m.start + (t % length(m));

function updateDuration() {
  let d = 0;
  for (const e of entries.values()) d = Math.max(d, length(e.media));
  usePlayback.setState({ duration: d });
}

function applySound(e: Entry) {
  const { playing } = usePlayback.getState();
  // Sound only while playing; muted otherwise so iOS lets us seek / preview freely.
  e.video.muted = !playing || e.media.muted;
  e.video.volume = Math.max(0, Math.min(1, e.media.volume));
}

/** Registers (or updates) the player of a video element; returns its <video>. */
export function attachVideo(elementId: string, url: string, media: MediaSettings) {
  let e = entries.get(elementId);
  if (!e) {
    const video = document.createElement("video");
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    // A new frame is ready: show it (paused seeks, first load).
    video.addEventListener("seeked", () => redraw());
    video.addEventListener("loadeddata", () => {
      seekOne(entries.get(elementId)!, usePlayback.getState().time);
      redraw();
    });
    hostEl().appendChild(video);
    e = { video, media };
    entries.set(elementId, e);
  }
  e.media = media;
  if (e.video.dataset.src !== url) {
    e.video.dataset.src = url;
    e.video.src = url;
    e.video.load();
  }
  applySound(e);
  updateDuration();
  return e.video;
}

export function detachVideo(elementId: string) {
  const e = entries.get(elementId);
  if (!e) return;
  e.video.pause();
  e.video.removeAttribute("src");
  e.video.load();
  e.video.remove();
  entries.delete(elementId);
  updateDuration();
  if (entries.size === 0) pause();
}

function seekOne(e: Entry, t: number) {
  if (e.video.readyState < 1) return;
  const target = localTime(e.media, t);
  if (Math.abs(e.video.currentTime - target) > 0.04) e.video.currentTime = target;
}

function tick() {
  const { duration } = usePlayback.getState();
  let t = (performance.now() - startedAt) / 1000;
  if (duration > 0 && t >= duration) {
    // Whole project loops: restart every video together.
    startedAt = performance.now();
    t = 0;
    for (const e of entries.values()) seekOne(e, 0);
  }
  for (const e of entries.values()) {
    const target = localTime(e.media, t);
    const drift = Math.abs(e.video.currentTime - target);
    // Each video loops on its own part; resync when it drifts (or wrapped).
    if (e.video.currentTime >= e.media.end - 0.02 || drift > 0.25) e.video.currentTime = target;
    if (e.video.paused) void e.video.play().catch(() => {});
  }
  usePlayback.setState({ time: t });
  redraw();
  frame = requestAnimationFrame(tick);
}

export function play() {
  if (entries.size === 0 || usePlayback.getState().playing) return;
  usePlayback.setState({ playing: true });
  startedAt = performance.now() - usePlayback.getState().time * 1000;
  for (const e of entries.values()) {
    applySound(e);
    seekOne(e, usePlayback.getState().time);
    // Called from the tap: iOS allows sound.
    void e.video.play().catch(() => {});
  }
  frame = requestAnimationFrame(tick);
}

export function pause() {
  cancelAnimationFrame(frame);
  usePlayback.setState({ playing: false });
  for (const e of entries.values()) {
    e.video.pause();
    applySound(e);
  }
  redraw();
}

export function togglePlay() {
  if (usePlayback.getState().playing) pause();
  else play();
}

export function seek(t: number) {
  const { duration, playing } = usePlayback.getState();
  const time = Math.max(0, Math.min(duration, t));
  usePlayback.setState({ time });
  if (playing) startedAt = performance.now() - time * 1000;
  for (const e of entries.values()) seekOne(e, time);
}

/** Stops everything and forgets the players (closing a project). */
export function resetPlayback() {
  pause();
  for (const id of [...entries.keys()]) detachVideo(id);
  usePlayback.setState({ time: 0, duration: 0 });
}

export function defaultMedia(duration: number): MediaSettings {
  return { muted: false, volume: 1, start: 0, end: duration };
}
