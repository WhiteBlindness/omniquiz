import type { Theme } from "../../state/AppStateProvider";

type ThemeControlProps = Readonly<{
  theme: Theme;
  onToggle: () => void;
}>;

export function ThemeControl({ theme, onToggle }: ThemeControlProps) {
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      className="theme-control pixel-control"
      type="button"
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === "light"}
      onClick={onToggle}
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
  );
}
