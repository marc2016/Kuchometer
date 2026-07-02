import type { CakeEntry } from "../types/cake";
import { getCakeResetTime } from "./dateUtils";

export function getActiveCakeEntries(entries: CakeEntry[], now = new Date()): CakeEntry[] {
  return entries.filter((entry) => getCakeResetTime(entry.date) <= now);
}

export function getLastResetTime(entries: CakeEntry[], now = new Date()): Date | null {
  const activeEntries = getActiveCakeEntries(entries, now);
  if (activeEntries.length === 0) {
    return null;
  }

  let latest: Date | null = null;
  for (const entry of activeEntries) {
    const resetTime = getCakeResetTime(entry.date);
    if (!latest || resetTime > latest) {
      latest = resetTime;
    }
  }

  return latest;
}

export function getDaysSinceLastCake(entries: CakeEntry[], now = new Date()): number | null {
  const lastReset = getLastResetTime(entries, now);
  if (!lastReset) {
    return null;
  }

  const diffMs = now.getTime() - lastReset.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function hasCakeOnDay(entries: CakeEntry[], dateStr: string): boolean {
  return entries.some((entry) => entry.date === dateStr);
}

export function sortEntries(entries: CakeEntry[]): CakeEntry[] {
  return [...entries].sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}
