"use client";

import { useEffect, useState, type ReactNode } from "react";
import { readThemePreference, type ThemePreference } from "./game/storage";

export function ThemeShell({
  className,
  children,
}: Readonly<{ className: string; children: ReactNode }>) {
  const [theme, setTheme] = useState<ThemePreference>("dark");

  useEffect(() => {
    setTheme(readThemePreference());
  }, []);

  return (
    <main className={className} data-theme={theme}>
      {children}
    </main>
  );
}
