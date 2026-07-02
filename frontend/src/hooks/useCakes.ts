import { useCallback, useEffect, useState } from "react";
import { createCake, fetchCakes } from "../api/cakes";
import type { CakeEntry } from "../types/cake";

export function useCakes() {
  const [entries, setEntries] = useState<CakeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchCakes();
      setEntries(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addCake = useCallback(
    async (name: string, date?: string) => {
      await createCake({ name, date });
      const data = await fetchCakes();
      setEntries(data);
      setError(null);
    },
    []
  );

  return {
    entries,
    loading,
    error,
    reload: load,
    addCake,
  };
}
