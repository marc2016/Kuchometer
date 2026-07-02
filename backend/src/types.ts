export interface CakeEntry {
  id: string;
  date: string;
  name: string;
  createdAt: string;
}

export interface CakeRow {
  id: string;
  date: Date;
  name: string;
  created_at: Date;
}

export function rowToEntry(row: CakeRow): CakeEntry {
  const date =
    row.date instanceof Date
      ? formatDateOnly(row.date)
      : String(row.date).slice(0, 10);

  return {
    id: row.id,
    date,
    name: row.name,
    createdAt: row.created_at.toISOString(),
  };
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
