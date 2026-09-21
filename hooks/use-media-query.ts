import { useSyncExternalStore } from "react";

/**
 * Reactive `window.matchMedia` — `false` during SSR/hydration, then the
 * live match on the client. Safe to use for layout switches: React re-renders
 * with the client value right after hydration without a mismatch error.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
