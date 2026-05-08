import { useEffect, useState } from "react";

// Tiny pub/sub for tracking in-flight axios requests app-wide. The appAxios
// interceptors call inc/dec; the GlobalLoader subscribes via useLoaderActive.
//
// Why a counter and not a boolean: parallel requests are common (Home fires
// 5 stat calls in Promise.all). A boolean flips off when the first one
// resolves; a counter only flips off when *all* have settled.

let count = 0;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn(count));

export const loaderStore = {
  inc() { count += 1; notify(); },
  dec() { count = Math.max(0, count - 1); notify(); },
  get() { return count; },
  subscribe(fn) {
    listeners.add(fn);
    fn(count);
    return () => listeners.delete(fn);
  },
};

// Debounced visibility hook: skip the loader for snappy <250ms requests, and
// linger ~120ms after the last one settles to avoid flicker between chained
// calls. Keeps the UI from strobing on fast networks.
const SHOW_DELAY_MS = 250;
const HIDE_DELAY_MS = 120;

export function useLoaderActive() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let showTimer = null;
    let hideTimer = null;

    const unsubscribe = loaderStore.subscribe((c) => {
      if (c > 0) {
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        if (!showTimer) {
          showTimer = setTimeout(() => {
            showTimer = null;
            // Re-check current count — it may have dropped to 0 already.
            if (loaderStore.get() > 0) setActive(true);
          }, SHOW_DELAY_MS);
        }
      } else {
        if (showTimer) { clearTimeout(showTimer); showTimer = null; }
        if (!hideTimer) {
          hideTimer = setTimeout(() => {
            hideTimer = null;
            if (loaderStore.get() === 0) setActive(false);
          }, HIDE_DELAY_MS);
        }
      }
    });

    return () => {
      unsubscribe();
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  return active;
}
