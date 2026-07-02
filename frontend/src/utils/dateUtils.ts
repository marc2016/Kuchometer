export function getTodayString(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getCakeResetTime(dateStr: string): Date {
  const date = parseDateString(dateStr);
  date.setHours(10, 0, 0, 0);
  return date;
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDateString(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.`;
}

export function getForecastDays(count: number, now = new Date()): string[] {
  const days: string[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    days.push(getTodayString(date));
  }
  return days;
}

export function formatHistoryDate(dateStr: string): string {
  const date = parseDateString(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}
