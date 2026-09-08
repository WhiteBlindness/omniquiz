"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { readThemePreference, writeThemePreference, type ThemePreference } from "./game/storage";

const listeners = new Set<() => void>();

export function subscribeTheme(callback: () => void) {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}

function getClientTheme(): ThemePreference {
  const stored = document.documentElement.dataset.storedTheme;
  if (stored === "light" || stored === "dark") return stored;
  return readThemePreference();
}

function getServerTheme(): ThemePreference {
  return "dark";
}

function useTheme(): ThemePreference {
  return useSyncExternalStore(subscribeTheme, getClientTheme, getServerTheme);
}

export function toggleShellTheme(): void {
  const current = getClientTheme();
  const next: ThemePreference = current === "dark" ? "light" : "dark";
  writeThemePreference(next);
  document.documentElement.dataset.storedTheme = next;
  listeners.forEach((cb) => cb());
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
