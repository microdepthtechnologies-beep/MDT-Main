"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerThemeSnapshot(): Theme {
  return "dark";
}

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("mdt-theme-change", onChange);
  return () => window.removeEventListener("mdt-theme-change", onChange);
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    let savedTheme: string | null = null;
    try {
      savedTheme = window.localStorage.getItem("mdt-theme");
    } catch {
      // The current document theme remains the fallback when storage is unavailable.
    }
    const currentTheme = savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : document.documentElement.dataset.theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = currentTheme;
    window.dispatchEvent(new Event("mdt-theme-change"));
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.dispatchEvent(new Event("mdt-theme-change"));
    setStorageError("");
    try {
      window.localStorage.setItem("mdt-theme", nextTheme);
    } catch {
      setStorageError("Your theme changed, but your preference could not be saved.");
    }
  }

  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <>
      <button
        className={`theme-toggle ${className}`.trim()}
        type="button"
        aria-label={`Switch to ${nextTheme} mode`}
        aria-pressed={theme === "dark"}
        title={`Switch to ${nextTheme} mode`}
        onClick={toggleTheme}
      >
        <Icon size={19} aria-hidden="true" />
      </button>
      <span className="sr-only" role="status" aria-live="polite">{storageError}</span>
    </>
  );
}
