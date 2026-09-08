"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { readThemePreference, type ThemePreference } from "./game/storage";

function getClientTheme(): ThemePreference {
  const stored = document.documentElement.dataset.storedTheme;
  if (stored === "light" || stored === "dark") return stored;
  return readThemePreference();
}

function getServerTheme(): ThemePreference {
  return "dark";
}

const noop = () => () => {};

function useTheme(): ThemePreference {
  return useSyncExternalStore(noop, getClientTheme, getServerTheme);
}

export function ThemeShell({
  className,
  children,
}: Readonly<{ className: string; children: ReactNode }>) {
  const theme = useTheme();

  return (
    <main className={className} data-theme={theme}>
      {children}
    </main>
  );
}
