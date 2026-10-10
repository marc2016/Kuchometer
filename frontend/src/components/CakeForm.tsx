import { type FormEvent, useState, useEffect } from "react";
import type { CakeEntry } from "../types/cake";
import { formatDisplayDate, getTodayString } from "../utils/dateUtils";

interface CakeFormProps {
  onSubmit: (name: string, date?: string) => Promise<void>;
  defaultName?: string;
  readOnlyName?: boolean;
  existingEntries?: CakeEntry[];
}

export function CakeForm({
  onSubmit,
  defaultName = "",
  readOnlyName = false,
  existingEntries = [],
}: CakeFormProps) {
  const [name, setName] = useState(defaultName);
  const [date, setDate] = useState(getTodayString());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setName(defaultName);
  }, [defaultName]);

  // Erfolgsmeldung nach 5 Sekunden ausblenden
  useEffect(() => {
    if (!success) {
      return;
    }
    const timer = window.setTimeout(() => setSuccess(null), 5000);
    return () => window.clearTimeout(timer);
  }, [success]);

  function handleDateChange(val: string) {
    setDate(val);
    if (error) setError(null);
    if (success) setSuccess(null);
  }

  function handleNameChange(val: string) {
    setName(val);
    if (error) setError(null);
    if (success) setSuccess(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Bitte einen Namen eingeben.");
      setSuccess(null);
      return;
    }

    // Vorab-Prüfung: Hat derselbe Benutzer für diesen Tag bereits einen Eintrag?
    const isDuplicate = existingEntries.some(
      (entry) =>
        entry.date === date && entry.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setError("Du hast für diesen Tag bereits einen Kuchen eingetragen.");
      setSuccess(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await onSubmit(trimmedName, date);
      const isToday = date === getTodayString();
      const dateText = isToday ? "heute" : formatDisplayDate(date);
      setSuccess(`Kuchen für ${dateText} erfolgreich eingetragen! 🍰`);
      setName(defaultName);
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
        <input type="date" value={date} onChange={(event) => handleDateChange(event.target.value)} />
      </label>
      <label className="cake-form-field">
        <span>Name</span>
        <input
          type="text"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          placeholder="Wer bringt den Kuchen?"
          readOnly={readOnlyName}
          className={readOnlyName ? "input-readonly" : undefined}
          title={readOnlyName ? "Der Name wird über die Anmeldung festgelegt" : undefined}
          required
        />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? "Speichern…" : "Absenden"}
      </button>
      {success && (
        <p className="form-success" role="status">
          {success}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
