import { create } from "zustand";
import type { Theme } from "../types";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);
  root.classList.toggle("dark", shouldUseDark);
}

type ThemeStore = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: "system",
  setTheme(theme) {
    localStorage.setItem("mono-theme", theme);
    applyTheme(theme);
    set({ theme });
  },
  initTheme() {
    const saved = (localStorage.getItem("mono-theme") as Theme | null) || "system";
    applyTheme(saved);
    set({ theme: saved });

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      applyTheme(get().theme);
    });
  },
}));
