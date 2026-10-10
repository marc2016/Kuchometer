import { mdiCog } from "@mdi/js";
import { MdiIcon } from "./MdiIcon";

interface SettingsToggleProps {
  onClick: () => void;
}

export function SettingsToggle({ onClick }: SettingsToggleProps) {
  return (
    <button
      type="button"
      className="settings-toggle"
      onClick={onClick}
      aria-label="Einstellungen öffnen"
      title="Einstellungen"
    >
      <MdiIcon path={mdiCog} size={20} className="settings-toggle-icon" />
    </button>
  );
}
