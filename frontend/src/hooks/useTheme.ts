import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const THEME_COOKIE = "kuchometer-theme";

function readThemeCookie(): Theme | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]+)`));
  if (!match) {
    return null;
  }
  const value = decodeURIComponent(match[1]);
  return value === "light" || value === "dark" ? value : null;
}

function writeThemeCookie(theme: Theme) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${THEME_COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getInitialTheme(): Theme {
  return (
    readThemeCookie() ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    writeThemeCookie(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "light" ? "dark" : "light"));
  }, []);

  return { theme, toggleTheme };
}
