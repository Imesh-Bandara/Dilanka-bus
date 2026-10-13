"use client";
import { useTranslation } from "./locale";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
export function ThemeToggle() {
  const tr = useTranslation();
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (value: Theme) => {
      document.documentElement.dataset.theme = value;
      setTheme(value);
    };
    const savedTheme = () => {
      try {
        return localStorage.getItem("de-theme");
      } catch {
        return null;
      }
    };
    const sync = () => {
      const saved = savedTheme();
      apply(
        saved === "light" || saved === "dark"
          ? saved
          : media.matches
            ? "dark"
            : "light",
      );
    };
    const storage = (event: StorageEvent) => {
      if (event.key === "de-theme" || event.key === null) sync();
    };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", storage);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", storage);
    };
  }, []);
  return (
    <button
      type="button"
      className="theme-toggle header-control"
      aria-label={tr(
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      )}
      title={tr(
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      )}
      aria-pressed={theme === "dark"}
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        setTheme(next);
        try {
          localStorage.setItem("de-theme", next);
        } catch {
          /* The toggle still works when browser storage is unavailable. */
        }
      }}
    >
      <Sun className="theme-sun" size={19} />
      <Moon className="theme-moon" size={19} />
    </button>
  );
}
