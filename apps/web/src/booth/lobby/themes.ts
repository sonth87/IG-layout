import type { CSSProperties } from "react";
import { activeEvents, homeToday, type EventId } from "@ig-layout/core/templates/seasons";

// Lobby themes (D-164): the booth's front in a few moods — the cinema it started as, and
// Christmas, Tết, Halloween, cyberpunk, glitch. Each is a scene (scenes.tsx) and the colours
// of the sign and the ticket in front of it; swiping sideways goes from one to the next.
// Picking one also starts new rolls in the print theme that goes with it.

export type LobbyId = "cinema" | "noel" | "tet" | "halloween" | "cyber" | "glitch";

export interface LobbyTheme {
  id: LobbyId;
  /** Two colours for the little square in the corner. */
  swatch: [string, string];
  /** Print theme (packages/core/booth/themes.ts) new rolls start in. */
  print: string;
  /** The ticket and the sign, as CSS variables (see Home.tsx). */
  vars: {
    paper: string;
    ink: string;
    /** Printed labels ("Admit one"). */
    label: string;
    /** The big "Shoot solo" button. */
    main: string;
    mainInk: string;
    /** The other buttons / fields. */
    second: string;
    secondInk: string;
    field: string;
    fieldInk: string;
    /** Borders and the hard shadow. */
    edge: string;
    shadow: string;
    /** The sign: board, title, kicker, glow around the title, the running band. */
    board: string;
    title: string;
    kicker: string;
    glow: string;
    band: string;
    bandInk: string;
    /** Text straight on the scene (tagline, privacy line). */
    onScene: string;
  };
  /** The sign's frame: chasing bulbs, a neon tube, or a window title bar. */
  sign: "bulbs" | "neon" | "window";
  /** Bulb colours (bulbs). */
  bulbs?: string[];
  /** The ticket's shape: notched, square (window). */
  ticket: "notch" | "window";
}

export const LOBBIES: LobbyTheme[] = [
  {
    id: "cinema",
    swatch: ["#8a1220", "#eaa63c"],
    print: "cinema",
    sign: "bulbs",
    bulbs: ["#ffd88a"],
    ticket: "notch",
    vars: { paper: "#f3e9d6", ink: "#1d1612", label: "#c8432f", main: "#c8432f", mainInk: "#f3e9d6", second: "#e7d9bd", secondInk: "#1d1612", field: "#fbf6ec", fieldInk: "#1d1612", edge: "#1d1612", shadow: "#0b0806", board: "#2a1d16", title: "#f3e9d6", kicker: "#eaa63c", glow: "rgba(234,166,60,0.45)", band: "#0f0b09", bandInk: "#eaa63c", onScene: "#f3e9d6" },
  },
  {
    id: "noel",
    swatch: ["#1f5a3c", "#d62c2c"],
    print: "xmas",
    sign: "bulbs",
    bulbs: ["#ff5a5a", "#ffd36e", "#7fd4ff", "#9dff8a"],
    ticket: "notch",
    vars: { paper: "#fffaf0", ink: "#14301f", label: "#c62828", main: "#c62828", mainInk: "#fffaf0", second: "#e4f0e6", secondInk: "#14301f", field: "#ffffff", fieldInk: "#14301f", edge: "#14301f", shadow: "#06140c", board: "#123524", title: "#fffaf0", kicker: "#ffd36e", glow: "rgba(255,255,255,0.45)", band: "#0b2416", bandInk: "#ffd36e", onScene: "#f4fbff" },
  },
  {
    id: "tet",
    swatch: ["#c8102e", "#ffd76a"],
    print: "tet",
    sign: "bulbs",
    bulbs: ["#ffd76a", "#ffb347"],
    ticket: "notch",
    vars: { paper: "#c8102e", ink: "#ffe08a", label: "#ffe08a", main: "#ffd24a", mainInk: "#8a0a17", second: "#a50d24", secondInk: "#ffe08a", field: "#fff4d6", fieldInk: "#8a0a17", edge: "#5c0610", shadow: "#3a0409", board: "#7a0812", title: "#ffe08a", kicker: "#fff4d6", glow: "rgba(255,215,106,0.6)", band: "#5c0610", bandInk: "#ffd76a", onScene: "#fff4d6" },
  },
  {
    id: "halloween",
    swatch: ["#2b1640", "#ff7a1a"],
    print: "halloween",
    sign: "bulbs",
    bulbs: ["#ff8c2a", "#b46cff"],
    ticket: "notch",
    vars: { paper: "#f4e3c3", ink: "#1e1029", label: "#7b3fb8", main: "#ff7a1a", mainInk: "#1e1029", second: "#e8d0a6", secondInk: "#1e1029", field: "#fff6e6", fieldInk: "#1e1029", edge: "#1e1029", shadow: "#08040c", board: "#1e1029", title: "#ffb35c", kicker: "#c79bff", glow: "rgba(255,122,26,0.55)", band: "#120a1a", bandInk: "#ff8c2a", onScene: "#f4e3c3" },
  },
  {
    id: "cyber",
    swatch: ["#ff2bd6", "#2df6ff"],
    print: "cyberpunk",
    sign: "neon",
    ticket: "notch",
    vars: { paper: "#140a2a", ink: "#e8f7ff", label: "#2df6ff", main: "#ff2bd6", mainInk: "#12061f", second: "#1f1240", secondInk: "#2df6ff", field: "#0b0618", fieldInk: "#e8f7ff", edge: "#2df6ff", shadow: "#ff2bd6", board: "#0b0618", title: "#ffe1fb", kicker: "#2df6ff", glow: "rgba(255,43,214,0.8)", band: "#0b0618", bandInk: "#2df6ff", onScene: "#d8f8ff" },
  },
  {
    id: "glitch",
    swatch: ["#00ff9c", "#ff00e1"],
    print: "glitch",
    sign: "window",
    ticket: "window",
    vars: { paper: "#c3c3c3", ink: "#0b0b0b", label: "#000080", main: "#000080", mainInk: "#ffffff", second: "#d6d6d6", secondInk: "#0b0b0b", field: "#ffffff", fieldInk: "#0b0b0b", edge: "#0b0b0b", shadow: "#00ff9c", board: "#0b0b0b", title: "#ffffff", kicker: "#00ff9c", glow: "rgba(0,255,156,0.0)", band: "#000000", bandInk: "#00ff9c", onScene: "#d9ffe9" },
  },
];

export const lobbyById = (id: string | null | undefined) => LOBBIES.find((l) => l.id === id) ?? LOBBIES[0];

const KEY = "ig-layout:booth-lobby";

/** The lobby theme last shown (kept on the device, D-164). */
export function loadLobby(): LobbyId {
  try {
    return lobbyById(localStorage.getItem(KEY)).id;
  } catch {
    return "cinema";
  }
}

export function saveLobby(id: LobbyId) {
  try {
    localStorage.setItem(KEY, id);
  } catch {}
}

const SEASON_KEY = "ig-layout:booth-lobby-season";
/** Events with a scene of their own (the same windows as IG Layout's seasonal home). */
const SEASONS: Partial<Record<EventId, LobbyId>> = { halloween: "halloween", christmas: "noel", tet: "tet" };

/** In season (D-165): the season's scene, once — the first time the lobby opens in that
 * season (Halloween, Christmas, Tết, each year); after that, whatever was picked stays.
 * `?today=2026-12-20` tries another date. Null when there's nothing to switch to. */
export function seasonalLobby(): LobbyId | null {
  const today = homeToday();
  const event = activeEvents(today).find((e) => SEASONS[e.id]);
  if (!event) return null;
  const key = `${event.id}-${today.getFullYear()}`;
  try {
    if (localStorage.getItem(SEASON_KEY) === key) return null;
    localStorage.setItem(SEASON_KEY, key);
  } catch {
    return null;
  }
  return SEASONS[event.id]!;
}

/** The theme's colours as CSS variables on its page. */
export function lobbyVars(t: LobbyTheme): CSSProperties {
  return Object.fromEntries(Object.entries(t.vars).map(([k, v]) => [`--l-${k}`, v])) as CSSProperties;
}
