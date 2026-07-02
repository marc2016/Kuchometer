import { useEffect, useState } from "react";
import logo from "./assets/Logo.png";
import { Barometer } from "./components/Barometer";
import { CakeForm } from "./components/CakeForm";
import { DaysCounter } from "./components/DaysCounter";
import { Forecast } from "./components/Forecast";
import { HistoryModal } from "./components/HistoryModal";
import { ThemeToggle } from "./components/ThemeToggle";
import { useCakes } from "./hooks/useCakes";
import { getDaysSinceLastCake } from "./utils/cakeLogic";
import { getSimulatedDays, getForecastEntries } from "./utils/simulation";
import "./App.css";

function App() {
  const { entries, loading, error, addCake, reload } = useCakes();
  const [now, setNow] = useState(() => new Date());
  const [historyOpen, setHistoryOpen] = useState(false);
  const simulatedDays = getSimulatedDays();

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const days = simulatedDays ?? getDaysSinceLastCake(entries, now);
  const forecastEntries = getForecastEntries(entries, simulatedDays, now);

  return (
    <div className="app">
      <ThemeToggle />
      <header className="app-header">
        <h1 className="app-logo">
          <img src={logo} alt="Kuchometer" />
        </h1>
        <DaysCounter days={days} />
      </header>

      <main className="app-main">
        <Barometer days={days} />

        {loading ? (
          <p className="status-message">Lade Kuchen-Daten…</p>
        ) : (
          <>
            {error && (
              <p className="status-message status-message--error">
                {error}{" "}
                <button type="button" className="link-button" onClick={() => void reload()}>
                  Erneut versuchen
                </button>
              </p>
            )}
            <CakeForm onSubmit={addCake} />
            <Forecast entries={forecastEntries} onOpenHistory={() => setHistoryOpen(true)} />
          </>
        )}
      </main>

      <HistoryModal entries={entries} open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}

export default App;
