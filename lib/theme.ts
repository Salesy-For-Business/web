export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var r=t==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;document.documentElement.setAttribute("data-theme",r);document.documentElement.setAttribute("data-theme-preference",t);document.documentElement.style.colorScheme=r}catch(e){}})()`;

type Listener = () => void;
const listeners = new Set<Listener>();

/**
 * Subscribe to preference changes made via `applyTheme` — including from a
 * different mounted `ThemeToggle` instance. Backs `useSyncExternalStore` in
 * the toggle so React re-reads `getThemePreference()` on change instead of
 * the component needing its own `useState` + effect-driven sync.
 */
export function subscribeThemeChange(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

export function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.setAttribute("data-theme-preference", preference);
  document.documentElement.style.colorScheme = resolved;
  localStorage.setItem(THEME_STORAGE_KEY, preference);
  listeners.forEach((listener) => listener());
}
