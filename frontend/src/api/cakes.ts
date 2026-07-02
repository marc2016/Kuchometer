import type { CakeEntry, CreateCakePayload } from "../types/cake";

export async function fetchCakes(): Promise<CakeEntry[]> {
  const response = await fetch("/api/cakes");
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Einträge konnten nicht geladen werden.");
  }
  return response.json();
}

export async function createCake(payload: CreateCakePayload): Promise<CakeEntry> {
  const response = await fetch("/api/cakes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Eintrag konnte nicht gespeichert werden.");
  }

  return response.json();
}
