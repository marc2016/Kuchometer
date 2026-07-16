# Code-Konventionen 

## 1) Benennung

- `camelCase` für Variablen und Funktionen
- `PascalCase` für Komponenten, Klassen, Typen und Interfaces
- `UPPER_SNAKE_CASE` nur für echte Konstanten
- Booleans beginnen mit `is`, `has`, `can` oder `should`
- Funktionsnamen sind Verben und beschreiben die Aktion klar (z. B. `loadEntries`, `createCake`)

## 2) Format

- Einheitliche Formatierung wird per Formatter erzwungen (keine individuellen Sonderstile)
- Imports werden konsistent gruppiert: externe Imports vor internen Imports
- Datei- und Symbolnamen bleiben konsistent, sprechend und fachlich eindeutig

## 3) Kommentare

- Sprache: Kommentare immer auf Deutsch oder immer auf Englisch (nicht mischen)
- Zweck: Kommentare erklären das Warum, nicht das offensichtliche Was
- Kürze: 1-2 präzise Sätze, keine langen Absätze
- Platzierung: Kommentar direkt über den betroffenen Block oder die Funktion, nicht verstreut

## 4) Frontend/Backend

- API-Verträge sind verbindlich: Änderungen an Request/Response immer in Frontend und Backend synchron anpassen
- Fachlogik bleibt im Backend oder in geteilten Services/Utils, UI-Komponenten enthalten nur Darstellung und Interaktion
- Fehlerobjekte und Fehlermeldungen werden konsistent behandelt (klarer Status, kurze verständliche Nachricht)
- Datums- und Zeitformate werden über die Schnittstelle einheitlich übertragen und im Frontend nur für Anzeige formatiert

