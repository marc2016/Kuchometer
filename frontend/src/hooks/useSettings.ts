import { useState, useEffect, useCallback } from "react";

export interface AppSettings {
  disableWobble: boolean;
}

const SETTINGS_KEY = "kuchometer_settings";

const DEFAULT_SETTINGS: AppSettings = {
  disableWobble: false,
};

function loadSettings(): AppSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (err) {
    console.warn("Fehler beim Laden der Einstellungen aus dem localStorage:", err);
    return DEFAULT_SETTINGS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
      console.warn("Fehler beim Speichern der Einstellungen im localStorage:", err);
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return { settings, updateSetting };
}
