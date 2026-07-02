import { useEffect } from "react";
import type { CakeEntry } from "../types/cake";
import { formatHistoryDate } from "../utils/dateUtils";
import { sortEntries } from "../utils/cakeLogic";

interface HistoryModalProps {
  entries: CakeEntry[];
  open: boolean;
  onClose: () => void;
}

export function HistoryModal({ entries, open, onClose }: HistoryModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const sorted = sortEntries(entries);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="history-title">Kuchen-Historie</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Schließen">
            ×
          </button>
        </div>
        {sorted.length === 0 ? (
          <p className="modal-empty">Noch keine Einträge vorhanden.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatHistoryDate(entry.date)}</td>
                  <td>{entry.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
