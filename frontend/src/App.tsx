import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import logo from "./assets/Logo.png";
import { Barometer } from "./components/Barometer";
import { CakeForm } from "./components/CakeForm";
import { DaysCounter } from "./components/DaysCounter";
import { Forecast } from "./components/Forecast";
import { HistoryModal } from "./components/HistoryModal";
import { ThemeToggle } from "./components/ThemeToggle";
import { useCakes } from "./hooks/useCakes";
import { useAuth } from "./hooks/useAuth";
import { UserProfile } from "./components/UserProfile";
import { mdiLogin } from "@mdi/js";
import { MdiIcon } from "./components/MdiIcon";
import {
  getDaysSinceLastCake,
  getDaysBeforeLastCake,
  isLastCakeToday,
} from "./utils/cakeLogic";
import { getSimulatedDays, getForecastEntries } from "./utils/simulation";
import { getPressureLevels } from "./utils/pressure";
import { triggerCakeRain } from "./utils/cakeConfetti";
import "./App.css";

const REVEAL_DURATION_MS = 8700;

function App() {
  const { entries, loading, error, addCake, reload } = useCakes();
  const { user, authEnabled, loading: authLoading, logout } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [historyOpen, setHistoryOpen] = useState(false);
  const simulatedDays = getSimulatedDays();

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Beim Laden bauen sich die Druck-Effekte schrittweise auf: reveal geht 0→1,
  // wodurch die Elemente – dank ihrer eigenen Schwellwerte – nacheinander erscheinen.
  const [reveal, setReveal] = useState(prefersReducedMotion ? 1 : 0);
  const revealStarted = useRef(prefersReducedMotion);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (revealStarted.current || loading) {
      return;
    }
    revealStarted.current = true;

    const start = performance.now();
    let raf = 0;
    const tick = (nowTs: number) => {
      const t = Math.min(1, (nowTs - start) / REVEAL_DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setReveal(eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loading]);

  const days = simulatedDays ?? getDaysSinceLastCake(entries, now);
  const forecastEntries = getForecastEntries(entries, simulatedDays, now);

  const hasRainRun = useRef(false);

  useEffect(() => {
    if (!loading && days === 0 && !hasRainRun.current && !prefersReducedMotion) {
      hasRainRun.current = true;
      triggerCakeRain();
    }
  }, [loading, days, prefersReducedMotion]);

  const cakeToday = simulatedDays === null && !loading && isLastCakeToday(entries, now);
  const introFromDays = cakeToday ? getDaysBeforeLastCake(entries, now) : null;

  const baseLevels = getPressureLevels(days);
  const levels = {
    pressure: baseLevels.pressure * reveal,
    heat: baseLevels.heat * reveal,
    steam: baseLevels.steam * reveal,
    crack: baseLevels.crack * reveal,
    flame: baseLevels.flame * reveal,
    shake: baseLevels.shake * reveal,
  };
  const pressureStyle = {
    ["--pressure" as string]: levels.pressure,
    ["--heat" as string]: levels.heat,
    ["--steam" as string]: levels.steam,
    ["--crack" as string]: levels.crack,
    ["--flame" as string]: levels.flame,
    ["--shake" as string]: levels.shake,
  } as CSSProperties;

  return (
    <div className="app" style={pressureStyle}>
      <div className="atmosphere" aria-hidden="true">
        <div className="atmosphere-tint" />
        <div className="atmosphere-vignette" />
        <div className="atmosphere-embers" />
      </div>
      <ThemeToggle />
      <UserProfile user={user} authEnabled={authEnabled} loading={authLoading} onLogout={logout} />
      <div className={`app-quake${levels.shake > 0 ? " app-quake--on" : ""}`}>
        <header className="app-header">
          <h1 className="app-logo">
            <img src={logo} alt="Kuchometer" />
          </h1>
          <DaysCounter days={days} />
        </header>

        <main className="app-main">
          <Barometer days={days} introFromDays={introFromDays} ready={!loading} />

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
              {(!authEnabled || user) ? (
                <CakeForm onSubmit={addCake} defaultName={user?.name ?? ""} />
              ) : (
                <div className="auth-notice-card">
                  <p>Bitte melde dich an, um einen Kuchen einzutragen.</p>
                  <a href="/api/auth/login" className="login-btn" style={{ textDecoration: "none" }}>
                    <MdiIcon path={mdiLogin} size={18} />
                    <span>Anmelden mit Dex</span>
                  </a>
                </div>
              )}
              <Forecast entries={forecastEntries} onOpenHistory={() => setHistoryOpen(true)} />
            </>
          )}
        </main>
      </div>

      <HistoryModal entries={entries} open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}

export default App;
