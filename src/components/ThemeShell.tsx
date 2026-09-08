"use client";

import { useState, type ReactNode } from "react";
import { readThemePreference, type ThemePreference } from "./game/storage";

function getInitialTheme(): ThemePreference {
  if (typeof document !== "undefined") {
    const stored = document.documentElement.dataset.storedTheme;
    if (stored === "light" || stored === "dark") return stored;
  }
  return readThemePreference();
}

export function ThemeShell({
  className,
  children,
}: Readonly<{ className: string; children: ReactNode }>) {
  const [theme] = useState<ThemePreference>(getInitialTheme);

  return (
    <main className={className} data-theme={theme}>
      {children}
    </main>
  );
}
