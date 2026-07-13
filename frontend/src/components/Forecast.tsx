import { useState } from "react";
import historyIcon from "../assets/history-icon.png";
import emptyPlateIcon from "../assets/empty-plate-icon.png";
import type { CakeEntry } from "../types/cake";
import { formatDisplayDate, getForecastDays, getTodayString } from "../utils/dateUtils";
import { getForecastDayEntries, hasCakeOnForecastDay } from "../utils/cakeLogic";

interface ForecastProps {
  entries: CakeEntry[];
  onOpenHistory: () => void;
}

export function Forecast({ entries, onOpenHistory }: ForecastProps) {
  const today = getTodayString();
  const forecastDays = getForecastDays(10);
  const [openDate, setOpenDate] = useState<string | null>(null);

  function handleDayClick(dateStr: string) {
    setOpenDate((current) => (current === dateStr ? null : dateStr));
  }

  return (
    <div className="forecast-section">
      <h2 className="forecast-title">
        <span className="forecast-title-text">🍰 Kuchenvorhersage der nächsten Tage</span>
      </h2>
      <div className="forecast">
      <button
        type="button"
        className="forecast-card forecast-card--history"
        onClick={onOpenHistory}
        aria-label="Historie öffnen"
      >
        <img className="forecast-icon-img" src={historyIcon} alt="" />
      </button>
      {forecastDays.map((dateStr) => {
        const hasCake = hasCakeOnForecastDay(entries, dateStr);
        const isToday = dateStr === today;
        const isOpen = openDate === dateStr;
        const dayEntries = getForecastDayEntries(entries, dateStr);
        const names = dayEntries.map((entry) => entry.name).join(", ");
        const tooltipText = hasCake ? names : "Kein Kuchen";

        return (
          <button
            key={dateStr}
            type="button"
            className={`forecast-card${isToday ? " forecast-card--today" : ""}${isOpen ? " forecast-card--tooltip-open" : ""}`}
            onClick={() => handleDayClick(dateStr)}
            aria-label={`${formatDisplayDate(dateStr)} ${hasCake ? `Kuchen von ${names}` : "kein Kuchen"}`}
            aria-describedby={`forecast-tooltip-${dateStr}`}
          >
            {hasCake ? (
              <span className="forecast-icon">🍰</span>
            ) : (
              <img className="forecast-icon-img forecast-icon-img--plate" src={emptyPlateIcon} alt="" />
            )}
            <span className="forecast-date">{formatDisplayDate(dateStr)}</span>
            <span className="forecast-tooltip" id={`forecast-tooltip-${dateStr}`} role="tooltip">
              {tooltipText}
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
