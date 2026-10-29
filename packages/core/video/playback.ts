import { create } from "zustand";
import type { MediaSettings, Music } from "../project/types";
import { musicGain } from "./music";

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
/** Called with the clock (M13.3 animation): active = show the animation state at t. */
let frameHook: (t: number, active: boolean) => void = () => {};
/** Length of animations when the project has no video (M13.3). */
let extraDuration = 0;

// ── Background music (M13.4) ──────────────────────────────────────
let music: { audio: HTMLAudioElement; settings: Music; duration: number } | null = null;

export function attachMusic(url: string, settings: Music, trackDuration: number) {
  if (!music) {
    const audio = document.createElement("audio");
    audio.preload = "auto";
    hostEl().appendChild(audio);
    music = { audio, settings, duration: trackDuration };
  }
  music.settings = settings;
  music.duration = trackDuration;
  if (music.audio.dataset.src !== url) {
    music.audio.dataset.src = url;
    music.audio.src = url;
    music.audio.load();
  }
}

export function detachMusic() {
  if (!music) return;
  music.audio.pause();
  music.audio.removeAttribute("src");
  music.audio.load();
  music.audio.remove();
  music = null;
}

/** Track position at project time t (loops when the track is shorter). */
function musicTime(t: number) {
  if (!music) return 0;
  const len = Math.max(0.1, music.duration - music.settings.start);
  return music.settings.start + (t % len);
}

function syncMusic(t: number, playing: boolean) {
  if (!music) return;
  const a = music.audio;
  a.volume = Math.max(0, Math.min(1, musicGain(music.settings, t, usePlayback.getState().duration)));
  if (!playing) {
    a.pause();
    return;
  }
  if (Math.abs(a.currentTime - musicTime(t)) > 0.3) a.currentTime = musicTime(t);
  if (a.paused) void a.play().catch(() => {});
}

export function setFrameHook(fn: (t: number, active: boolean) => void) {
  frameHook = fn;
}

export function setExtraDuration(d: number) {
  extraDuration = d;
  updateDuration();
}
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

export const mediaSpeed = (m: MediaSettings) => m.speed ?? 1;
/** Seconds the video takes on the timeline: its part, at its speed. */
export const timelineLength = (m: MediaSettings) => Math.max(0.05, (m.end - m.start) / mediaSpeed(m));
/** Sound plays only at normal speed (M13.2). */
export const isAudible = (m: MediaSettings) => !m.muted && m.volume > 0 && mediaSpeed(m) === 1;
/** Where in the source a video is at project time `t`: loops its part, or holds the last frame. */
export function sourceTime(m: MediaSettings, t: number) {
  const len = timelineLength(m);
  const local = m.loop === false ? Math.min(t, len - 1 / 60) : t % len;
  return m.start + local * mediaSpeed(m);
}
const length = timelineLength;
const localTime = sourceTime;

function updateDuration() {
  let d = extraDuration;
  for (const e of entries.values()) d = Math.max(d, length(e.media));
  usePlayback.setState({ duration: d });
}

function applySound(e: Entry) {
  const { playing } = usePlayback.getState();
  // Sound only while playing; muted otherwise so iOS lets us seek / preview freely.
  e.video.muted = !playing || !isAudible(e.media);
  e.video.playbackRate = mediaSpeed(e.media);
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
  if (usePlayback.getState().duration <= 0) pause();
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
    const holding = e.media.loop === false && t >= timelineLength(e.media) - 1 / 30;
    if (holding) {
      // Not looping: stay on the last frame.
      if (!e.video.paused) e.video.pause();
      if (drift > 0.05) e.video.currentTime = target;
      continue;
    }
    // Each video loops on its own part; resync when it drifts (or wrapped).
    if (e.video.currentTime >= e.media.end - 0.02 || drift > 0.25 * mediaSpeed(e.media)) e.video.currentTime = target;
    if (e.video.paused) void e.video.play().catch(() => {});
  }
  usePlayback.setState({ time: t });
  syncMusic(t, true);
  frameHook(t, true);
  redraw();
  frame = requestAnimationFrame(tick);
}

export function play() {
  if (usePlayback.getState().duration <= 0 || usePlayback.getState().playing) return;
  usePlayback.setState({ playing: true });
  startedAt = performance.now() - usePlayback.getState().time * 1000;
  for (const e of entries.values()) {
    applySound(e);
    seekOne(e, usePlayback.getState().time);
    // Called from the tap: iOS allows sound.
    void e.video.play().catch(() => {});
  }
  if (music) {
    music.audio.currentTime = musicTime(usePlayback.getState().time);
    syncMusic(usePlayback.getState().time, true);
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
  syncMusic(usePlayback.getState().time, false);
  // Paused at the start: back to editing positions; elsewhere: keep the frame shown.
  frameHook(usePlayback.getState().time, usePlayback.getState().time > 0);
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
  frameHook(time, playing || time > 0);
  redraw();
}

/** Stops everything and forgets the players (closing a project). */
export function resetPlayback() {
  usePlayback.setState({ time: 0 });
  pause();
  detachMusic();
  for (const id of [...entries.keys()]) detachVideo(id);
  usePlayback.setState({ time: 0, duration: 0 });
}

export function defaultMedia(duration: number): MediaSettings {
  return { muted: false, volume: 1, start: 0, end: duration };
}
