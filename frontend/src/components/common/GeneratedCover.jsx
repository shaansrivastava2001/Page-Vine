// Procedurally-generated book cover used as the placeholder when Open Library
// has no match. Each book's title hashes deterministically into one of N
// palette × layout combinations, so the same title always renders the same
// cover (even across navigations / page reloads). Pure SVG, no external
// assets, scales crisply from a 28px thumbnail to a 168px detail-page cover.

const PALETTES = [
  { bg: "#1f2a44", fg: "#f4ebd9" },  // navy + cream (Penguin Classic)
  { bg: "#2c4a3e", fg: "#d8b66a" },  // forest + gold
  { bg: "#6b1f2a", fg: "#f1e7d6" },  // burgundy + cream
  { bg: "#2a2d34", fg: "#d49336" },  // charcoal + amber
  { bg: "#5a5d39", fg: "#ede5cf" },  // olive + cream
  { bg: "#1f4a4a", fg: "#f4ebd9" },  // teal + cream
  { bg: "#3a1f4a", fg: "#f4ebd9" },  // plum + cream
  { bg: "#8a3a25", fg: "#f4ebd9" },  // brick + cream
  { bg: "#3a4a6b", fg: "#e8d8b8" },  // slate + cream
  { bg: "#4a3320", fg: "#e8d8b8" },  // espresso + cream
];

// Each layout is a pure function of the chosen palette → SVG children.
// Designed at a 100×150 viewBox (book aspect 2:3); the container forces the
// real aspect ratio so the SVG fills cleanly at any size.
const LAYOUTS = [
  // 0. Top band with a small accent dot
  ({ bg, fg }) => (
    <>
      <rect width="100" height="150" fill={bg} />
      <rect x="0" y="38" width="100" height="34" fill={fg} />
      <circle cx="50" cy="115" r="3" fill={fg} />
    </>
  ),
  // 1. Spine stripe + two horizontal accent lines
  ({ bg, fg }) => (
    <>
      <rect width="100" height="150" fill={bg} />
      <rect x="0" y="0" width="18" height="150" fill={fg} />
      <rect x="32" y="60" width="55" height="2" fill={fg} />
      <rect x="32" y="68" width="40" height="2" fill={fg} />
    </>
  ),
  // 2. Frame around an inset emblem
  ({ bg, fg }) => (
    <>
      <rect width="100" height="150" fill={bg} />
      <rect x="9" y="12" width="82" height="126" fill="none" stroke={fg} strokeWidth="2" />
      <circle cx="50" cy="62" r="6" fill={fg} />
      <rect x="22" y="100" width="56" height="2" fill={fg} />
      <rect x="32" y="108" width="36" height="2" fill={fg} />
    </>
  ),
  // 3. Diagonal split with a small disc
  ({ bg, fg }) => (
    <>
      <rect width="100" height="150" fill={bg} />
      <polygon points="0,0 100,0 0,150" fill={fg} opacity="0.9" />
      <circle cx="78" cy="115" r="6" fill={fg} />
    </>
  ),
  // 4. Triple-stripe header + central band
  ({ bg, fg }) => (
    <>
      <rect width="100" height="150" fill={bg} />
      <rect x="0" y="22" width="100" height="2" fill={fg} />
      <rect x="0" y="28" width="100" height="2" fill={fg} />
      <rect x="0" y="34" width="100" height="2" fill={fg} />
      <rect x="14" y="68" width="72" height="20" fill={fg} />
    </>
  ),
  // 5. Wave curve at the bottom + sun emblem
  ({ bg, fg }) => (
    <>
      <rect width="100" height="150" fill={bg} />
      <path d="M 0 108 Q 50 72 100 108 L 100 150 L 0 150 Z" fill={fg} />
      <circle cx="50" cy="48" r="9" fill={fg} opacity="0.92" />
    </>
  ),
  // 6. Bottom band with double horizontal lines above
  ({ bg, fg }) => (
    <>
      <rect width="100" height="150" fill={bg} />
      <rect x="0" y="100" width="100" height="50" fill={fg} />
      <rect x="14" y="60" width="72" height="2" fill={fg} />
      <rect x="14" y="66" width="72" height="2" fill={fg} />
    </>
  ),
  // 7. Two stacked rectangles offset on a contrasting field
  ({ bg, fg }) => (
    <>
      <rect width="100" height="150" fill={fg} />
      <rect x="14" y="22" width="62" height="40" fill={bg} />
      <rect x="22" y="80" width="62" height="40" fill={bg} />
    </>
  ),
];

// Cheap deterministic 32-bit hash (djb2-style). Stable across reloads.
const hashString = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

const GeneratedCover = ({ title }) => {
  const seed = hashString(title || "untitled");
  const palette = PALETTES[seed % PALETTES.length];
  const layout = LAYOUTS[Math.floor(seed / PALETTES.length) % LAYOUTS.length];

  return (
    <svg
      className="book-cover__svg"
      viewBox="0 0 100 150"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
      aria-hidden="true"
    >
      {layout(palette)}
    </svg>
  );
};

export default GeneratedCover;
