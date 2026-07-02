import type { CakeEntry } from "../types/cake";
import { formatDisplayDate, getForecastDays, getTodayString } from "../utils/dateUtils";
import { hasCakeOnDay } from "../utils/cakeLogic";

interface ForecastProps {
  entries: CakeEntry[];
  onOpenHistory: () => void;
}

export function Forecast({ entries, onOpenHistory }: ForecastProps) {
  const today = getTodayString();
  const forecastDays = getForecastDays(10);

  return (
    <div className="forecast">
      <button
        type="button"
        className="forecast-card forecast-card--history"
        onClick={onOpenHistory}
        aria-label="Historie öffnen"
      >
        <span className="forecast-icon">📜</span>
      </button>
      {forecastDays.map((dateStr) => {
        const hasCake = hasCakeOnDay(entries, dateStr);
        const isToday = dateStr === today;

        return (
          <div
            key={dateStr}
            className={`forecast-card${isToday ? " forecast-card--today" : ""}`}
            aria-label={`${formatDisplayDate(dateStr)} ${hasCake ? "mit Kuchen" : "ohne Kuchen"}`}
          >
            <span className="forecast-icon">{hasCake ? "🍰" : "🍽️"}</span>
            <span className="forecast-date">{formatDisplayDate(dateStr)}</span>
          </div>
        );
      })}
    </div>
  );
}
