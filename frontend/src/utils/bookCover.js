// Resolves book cover images via Open Library. Books in our DB have no cover
// field, so we look them up by title (+ author when available) using the
// Open Library Search API, get the `cover_i` id, and build the cover URL.
//
//   GET https://openlibrary.org/search.json?title=...&author=...&limit=1
//   →  https://covers.openlibrary.org/b/id/{cover_i}-{size}.jpg
//
// Lookups are cached in localStorage forever (positive AND negative) so the
// same book never triggers a second network round-trip across page loads.
// Negative caching is important — a self-donated title with no Open Library
// match shouldn't keep hammering the API every time it's rendered.

const SEARCH_ENDPOINT = "https://openlibrary.org/search.json";
const COVER_ENDPOINT  = "https://covers.openlibrary.org/b/id";
const STORAGE_KEY     = "ol-cover-cache-v1";
const NEGATIVE        = "__none__";

let memCache = null;

const loadCache = () => {
  if (memCache) return memCache;
  try {
    memCache = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    memCache = {};
  }
  return memCache;
};

const persistCache = () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memCache)); } catch { /* quota or private mode — ok */ }
};

const cacheKey = (title, author) =>
  `${(title || "").trim().toLowerCase()}|${(author || "").trim().toLowerCase()}`;

const inflight = new Map();

/**
 * Returns a cover_i (Open Library cover id) for the given title/author, or
 * null if no match. Resolves to the same in-flight promise when called twice
 * for the same book in parallel.
 */
const resolveCoverId = async (title, author) => {
  if (!title) return null;
  const key = cacheKey(title, author);
  const cache = loadCache();

  if (key in cache) {
    return cache[key] === NEGATIVE ? null : cache[key];
  }

  if (inflight.has(key)) return inflight.get(key);

  const promise = (async () => {
    const params = new URLSearchParams({ title, limit: "1" });
    if (author) params.set("author", author);
    try {
      const res = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`);
      if (!res.ok) return null;
      const data = await res.json();
      const doc = Array.isArray(data?.docs) ? data.docs[0] : null;
      const coverId = doc?.cover_i || null;
      cache[key] = coverId || NEGATIVE;
      persistCache();
      return coverId;
    } catch {
      // Don't poison the cache on network errors — leave it unset so a
      // future call retries.
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
};

/**
 * Build a cover URL from a known cover_i. `size` is one of S | M | L.
 */
export const coverUrlFromId = (coverId, size = "M") =>
  coverId ? `${COVER_ENDPOINT}/${coverId}-${size}.jpg` : null;

/**
 * High-level helper: look up a book and return a usable cover URL (or null).
 */
export const getCoverUrl = async (title, author, size = "M") => {
  const id = await resolveCoverId(title, author);
  return coverUrlFromId(id, size);
};
