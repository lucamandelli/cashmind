import { useEffect, useState } from "react";

export type ThemePref = "light" | "dark" | "system";

const STORAGE_KEY = "cm-theme-pref";

function resolveTheme(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: "light" | "dark") {
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

const VALID_PREFS = new Set<string>(["light", "dark", "system"]);

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_PREFS.has(stored ?? "") ? (stored as ThemePref) : "system";
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => applyTheme(resolveTheme(pref));
    apply();
    localStorage.setItem(STORAGE_KEY, pref);

    // Re-apply when OS preference changes while pref === "system".
    const onOsChange = () => {
      if (pref === "system") apply();
    };
    mq.addEventListener("change", onOsChange);
    return () => mq.removeEventListener("change", onOsChange);
  }, [pref]);

  return { pref, setPref };
}
