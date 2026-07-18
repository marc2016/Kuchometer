import { mdiWrench, mdiClose, mdiPlus, mdiMinus } from "@mdi/js";
import { MdiIcon } from "./MdiIcon";

interface DevPanelProps {
  simulatedDays: number | null;
  onChangeSimulatedDays: (value: number | null) => void;
  currentDays: number | null;
}

export function DevPanel({ simulatedDays, onChangeSimulatedDays, currentDays }: DevPanelProps) {
  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      onChangeSimulatedDays(null);
    } else {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed >= 0) {
        onChangeSimulatedDays(Math.floor(parsed));
      }
    }
  };

  const handleStep = (amount: number) => {
    const base = simulatedDays !== null ? simulatedDays : (currentDays ?? 0);
    const newValue = Math.max(0, base + amount);
    onChangeSimulatedDays(newValue);
  };

  const handleClear = () => {
    onChangeSimulatedDays(null);
  };

  return (
    <div className="dev-panel">
      <span className="dev-panel-label" title="Entwickler-Optionen">
        <MdiIcon path={mdiWrench} size={16} />
        <span>Dev:</span>
      </span>

      <button
        type="button"
        onClick={() => handleStep(-1)}
        className="dev-panel-btn"
        title="Tag abziehen"
        aria-label="Einen Tag abziehen"
      >
        <MdiIcon path={mdiMinus} size={14} />
      </button>

      <input
        type="number"
        min="0"
        value={simulatedDays !== null ? simulatedDays : ""}
        onChange={handleInputChange}
        placeholder="Tage..."
        className="dev-panel-input"
        aria-label="Simulierte Tage eingeben"
      />

      <button
        type="button"
        onClick={() => handleStep(1)}
        className="dev-panel-btn"
        title="Tag hinzufügen"
        aria-label="Einen Tag hinzufügen"
      >
        <MdiIcon path={mdiPlus} size={14} />
      </button>

      {simulatedDays !== null && (
        <button
          type="button"
          onClick={handleClear}
          className="dev-panel-clear-btn"
          title="Simulation zurücksetzen"
          aria-label="Simulation zurücksetzen"
        >
          <MdiIcon path={mdiClose} size={14} />
        </button>
      )}
    </div>
  );
}
