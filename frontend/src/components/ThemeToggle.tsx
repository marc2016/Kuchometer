import { mdiMoonWaningCrescent, mdiWeatherSunny } from "@mdi/js";
import { useTheme } from "../hooks/useTheme";
import { MdiIcon } from "./MdiIcon";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Dark Mode aktivieren" : "Light Mode aktivieren"}
      title={theme === "light" ? "Dark Mode" : "Light Mode"}
    >
      <MdiIcon
        path={theme === "light" ? mdiMoonWaningCrescent : mdiWeatherSunny}
        size={20}
        className="theme-toggle-icon"
      />
    </button>
  );
}
