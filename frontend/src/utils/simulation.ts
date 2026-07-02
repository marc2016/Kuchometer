import type { CakeEntry } from "../types/cake";
import { getTodayString } from "./dateUtils";

export function getSimulatedDays(): number | null {
  const value = new URLSearchParams(window.location.search).get("simulateDays");
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.floor(parsed);
}

export function getForecastEntries(
  entries: CakeEntry[],
  simulatedDays: number | null,
  now = new Date()
): CakeEntry[] {
  if (simulatedDays === null) {
    return entries;
  }

  const today = getTodayString(now);

  // Im Demo-Modus zählen nur zukünftige Vorankündigungen in der Vorhersage.
  return entries.filter((entry) => entry.date > today);
}
