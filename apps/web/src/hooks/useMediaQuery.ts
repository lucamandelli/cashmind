import { useEffect, useState } from "react";

/**
 * Returns true when the viewport matches the given media query string.
 * Initializes synchronously by reading `window.matchMedia` on first render
 * so there is no layout flash on desktop.
 */
export function useMediaQuery(query: string): boolean {
  const getMatch = () =>
    typeof window !== "undefined" && window.matchMedia(query).matches;

  const [matches, setMatches] = useState<boolean>(getMatch);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Returns true on desktop (≥ 768 px).
 * Use to switch between Dialog (desktop) and Drawer (mobile).
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 768px)");
}
