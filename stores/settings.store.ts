import { create } from "zustand";

interface SettingsStore {
  theme: "dark" | "light";
  accentColor: string;
  setTheme: (theme: "dark" | "light") => void;
  setAccentColor: (color: string) => void;
  loadSettings: (userId: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: "dark",
  accentColor: "#5E0ED7",
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      if (theme === "light") {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      } else {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      }
    }
  },
  setAccentColor: (accentColor) => {
    set({ accentColor });
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.style.setProperty("--primary", accentColor);
      root.style.setProperty("--ring", accentColor);
    }
  },
  loadSettings: async (userId) => {
    try {
      const res = await fetch("/api/settings", {
        headers: { "x-user-id": userId },
      });
      const data = await res.json();
      if (data) {
        const t = data.theme === "light" ? "light" : "dark";
        const accent = data.accentColor || "#5E0ED7";
        set({ theme: t, accentColor: accent });
        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          if (t === "light") {
            root.classList.remove("dark");
            root.style.colorScheme = "light";
          } else {
            root.classList.add("dark");
            root.style.colorScheme = "dark";
          }
          root.style.setProperty("--primary", accent);
          root.style.setProperty("--ring", accent);
        }
      }
    } catch (e) {
      console.error("Failed to load settings in store", e);
    }
  },
}));
