import { type FormEvent, useState } from "react";
import { getTodayString } from "../utils/dateUtils";

interface CakeFormProps {
  onSubmit: (name: string, date?: string) => Promise<void>;
}

export function CakeForm({ onSubmit }: CakeFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Bitte einen Namen eingeben.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(trimmedName, date);
      setName("");
      setDate(getTodayString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="cake-form" onSubmit={handleSubmit}>
      <label className="cake-form-field">
        <span>Datum</span>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <label className="cake-form-field">
        <span>Name</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Wer bringt den Kuchen?"
          required
        />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? "Speichern…" : "Absenden"}
      </button>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
