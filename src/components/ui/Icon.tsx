const PATHS = {
  back: <path d="M15 18l-6-6 6-6" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  insertLeft: (
    <>
      <rect x="11" y="5" width="9" height="14" rx="2" />
      <path d="M6 9v6M3 12h6" />
    </>
  ),
  insertRight: (
    <>
      <rect x="4" y="5" width="9" height="14" rx="2" />
      <path d="M18 9v6M15 12h6" />
    </>
  ),
  handle: <path d="M10 6v12M14 6v12" />,
  move: <path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  alignTop: <path d="M4 4h16M9 8v12M15 8v7" />,
  alignMiddle: <path d="M4 12h16M9 6v12M15 8v8" />,
  alignBottom: <path d="M4 20h16M9 4v12M15 9v7" />,
  alignH: <path d="M12 3v18M6 8h12v3H6zM8 14h8v3H8z" />,
  toFront: <path d="M12 4v10M8 8l4-4 4 4M5 20h14" />,
  toBack: <path d="M12 20V10M8 16l4 4 4-4M5 4h14" />,
  fillHeight: <path d="M8 3v18M16 3v18M12 7v10M10 9l2-2 2 2M10 15l2 2 2-2" />,
  fillWidth: <path d="M3 8h18M3 16h18M7 12h10M9 10l-2 2 2 2M15 10l2 2-2 2" />,
  fillWidth2: <path d="M3 6h18v12H3zM12 6v12" />,
  folder: <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />,
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10l5-3v10l-5-3" />
    </>
  ),
  undo: (
    <>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 0 10h-3" />
    </>
  ),
  redo: (
    <>
      <path d="M15 14l5-5-5-5" />
      <path d="M20 9H9a5 5 0 0 0 0 10h3" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 17l-5-5-9 8" />
    </>
  ),
  layerUp: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M12 21v-6M9 18l3 3 3-3" transform="rotate(180 12 18)" />
    </>
  ),
  layerDown: (
    <>
      <path d="M12 11l9 5-9 5-9-5 9-5z" />
      <path d="M12 3v6M9 6l3 3 3-3" />
    </>
  ),
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  download: <path d="M12 4v12M6 10l6 6 6-6M4 20h16" />,
  share: <path d="M12 3v13M7 8l5-5 5 5M5 14v6h14v-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="19" cy="12" r="1.2" fill="currentColor" />
    </>
  ),
  check: <path d="M20 6L9 17l-5-5" />,
  pencil: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  crop: (
    <>
      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
      <path d="M18 22V8a2 2 0 0 0-2-2H2" />
    </>
  ),
  mask: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="12" cy="12" r="5" />
    </>
  ),
  style: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="7" y="7" width="10" height="10" />
    </>
  ),
  replace: <path d="M4 7h13l-3-3M20 17H7l3 3" />,
  duplicate: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  background: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 15l6-6 12 12" />
    </>
  ),
  slides: (
    <>
      <rect x="2" y="6" width="6" height="12" rx="1" />
      <rect x="9" y="6" width="6" height="12" rx="1" />
      <rect x="16" y="6" width="6" height="12" rx="1" />
    </>
  ),
  rotate: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
  flipH: (
    <>
      <path d="M12 3v18" />
      <path d="M8 7L3 12l5 5V7zM16 7l5 5-5 5V7z" />
    </>
  ),
  flipV: (
    <>
      <path d="M3 12h18" />
      <path d="M7 8l5-5 5 5H7zM7 16l5 5 5-5H7z" />
    </>
  ),
  adjust: (
    <>
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  filters: (
    <>
      <circle cx="9" cy="9" r="5" />
      <circle cx="15" cy="9" r="5" />
      <circle cx="12" cy="15" r="5" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  unlock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 7.5-2" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
    </>
  ),
  text: <path d="M5 6V4h14v2M12 4v16M9 20h6" />,
  shapes: (
    <>
      <circle cx="8" cy="8" r="4" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
      <path d="M4 21l4-6 4 6z" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A4.6 4.6 0 0 0 22 9.8C22 6 17.5 3 12 3z" />
      <circle cx="7.5" cy="11" r="1" fill="currentColor" />
      <circle cx="10.5" cy="7" r="1" fill="currentColor" />
      <circle cx="15" cy="7" r="1" fill="currentColor" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  alignLeft: <path d="M4 6h16M4 12h10M4 18h14" />,
  alignCenter: <path d="M4 6h16M7 12h10M5 18h14" />,
  alignRight: <path d="M4 6h16M10 12h10M6 18h14" />,
  swap: <path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />,
  layout: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 10h18M10 10v11" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </>
  ),
  play: <path d="M7 4.5v15l12-7.5z" fill="currentColor" />,
  pause: (
    <>
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
    </>
  ),
  volume: (
    <>
      <path d="M11 5L6 9H3v6h3l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </>
  ),
  motion: (
    <>
      <path d="M13 4l7 8-7 8" />
      <path d="M4 12h9" />
      <path d="M4 7h4M4 17h4" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12" />
    </>
  ),
  grip: (
    <>
      <circle cx="9" cy="6" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="18" r="1" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
      <path d="M2 2l20 20" />
    </>
  ),
  reset: (
    <>
      <path d="M4 4v6h6" />
      <path d="M20 20a8 8 0 0 0-14.9-10" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
