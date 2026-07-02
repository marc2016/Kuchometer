import { useState } from "react";
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function handleDayClick(dateStr: string) {
    setSelectedDate((current) => (current === dateStr ? null : dateStr));
  }

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
        const hasCake = hasCakeOnForecastDay(entries, dateStr);
        const isToday = dateStr === today;
        const isSelected = selectedDate === dateStr;
        const dayEntries = getForecastDayEntries(entries, dateStr);
        const names = dayEntries.map((entry) => entry.name).join(", ");

        return (
          <button
            key={dateStr}
            type="button"
            className={`forecast-card${isToday ? " forecast-card--today" : ""}${isSelected ? " forecast-card--selected" : ""}`}
            onClick={() => handleDayClick(dateStr)}
            aria-label={`${formatDisplayDate(dateStr)} ${hasCake ? `Kuchen von ${names}` : "kein Kuchen"}`}
            aria-pressed={isSelected}
          >
            <span className="forecast-icon">{hasCake ? "🍰" : "🍽️"}</span>
            <span className="forecast-date">{formatDisplayDate(dateStr)}</span>
            {isSelected && (
              <span className="forecast-name">{hasCake ? names : "Kein Kuchen"}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
