"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  readMutePreference,
  readThemePreference,
  writeMutePreference,
  type ThemePreference,
} from "./game/storage";
import { subscribeTheme, toggleShellTheme } from "./ThemeShell";
import { SoundControl } from "./game/SoundControl";

function getClientTheme(): ThemePreference {
  const stored = document.documentElement.dataset.storedTheme;
  if (stored === "light" || stored === "dark") return stored;
  return readThemePreference();
}

function getServerTheme(): ThemePreference {
  return "dark";
}

export function PacksControls() {
  const theme = useSyncExternalStore(subscribeTheme, getClientTheme, getServerTheme);
  const nextTheme = theme === "dark" ? "light" : "dark";

  const [muted, setMuted] = useState(false);
  useEffect(() => { setMuted(readMutePreference()); }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      writeMutePreference(next);
      return next;
    });
  }, []);

  return (
    <aside className="global-controls packs-controls" aria-label="Display controls">
      <button
        className="theme-control pixel-control"
        type="button"
        aria-label={`Switch to ${nextTheme} theme`}
        aria-pressed={theme === "light"}
        onClick={toggleShellTheme}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          {theme === "dark" ? (
            <path d="M14.8 3.2a8.2 8.2 0 1 0 6 10.1 7 7 0 1 1-6-10.1Z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </>
          )}
        </svg>
        <span className="theme-control-label" aria-hidden="true">
          THEME / {theme === "dark" ? "DARK" : "LIGHT"}
        </span>
      </button>
      <SoundControl muted={muted} onToggle={toggleMute} />
    </aside>
  );
}
