import { useEffect } from "react";
import { mdiCogOutline } from "@mdi/js";
import { MdiIcon } from "./MdiIcon";
import type { AppSettings } from "../hooks/useSettings";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export function SettingsModal({
  open,
  onClose,
  settings,
  onUpdateSetting,
}: SettingsModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <MdiIcon path={mdiCogOutline} size={22} />
            <h2 id="settings-title">Einstellungen</h2>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3 className="settings-section-title">Performance & Effekte</h3>
            <div className="settings-item">
              <div className="settings-item-info">
                <label htmlFor="setting-disable-wobble" className="settings-item-label">
                  Wackeln & Erschütterung ausschalten
                </label>
                <p className="settings-item-description">
                  Deaktiviert das permanente Wackeln der Kuchen-Nadel und die Erschütterung bei hohem Kuchendruck.
                  Empfohlen für schwächere Geräte und flüssigere Darstellung.
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  id="setting-disable-wobble"
                  type="checkbox"
                  checked={settings.disableWobble}
                  onChange={(e) => onUpdateSetting("disableWobble", e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div className="settings-footer-hint">
            Einstellungen werden automatisch im Browser gespeichert.
          </div>
        </div>
      </div>
    </div>
  );
}
