import { useEffect, useState } from "react";

/**
 * Returns `false` during server rendering and on the very first client render,
 * then `true` after the component has mounted (hydrated) in the browser.
 *
 * Use this to gate UI that depends on client-only state (e.g. React Query data
 * fetched with `enabled: isBrowser`). Rendering such state on the first client
 * paint diverges from the server HTML — which renders nothing because the query
 * is disabled — and triggers a React hydration mismatch. Deferring it until
 * after mount keeps the first client render identical to the server output.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
