import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** `false` during SSR and hydration, `true` once rendering on the client. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
