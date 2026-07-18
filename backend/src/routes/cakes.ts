import { Router } from "express";
import pool from "../db.js";
import { rowToEntry, type CakeRow } from "../types.js";
import { parseCookies, verifySession } from "../utils/auth.js";

const router = Router();
const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";

function getTodayBerlin(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
  }).format(new Date());
}

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query<CakeRow>(
      "SELECT id, date, name, created_at FROM cake_entries ORDER BY date DESC, created_at DESC"
    );
    res.json(result.rows.map(rowToEntry));
  } catch (error) {
    console.error("GET /api/cakes failed:", error);
    res.status(500).json({ error: "Einträge konnten nicht geladen werden." });
  }
});

router.post("/", async (req, res) => {
  if (AUTH_ENABLED) {
    const cookies = parseCookies(req.headers.cookie);
    const session = cookies["kuchometer_session"];
    const user = session ? verifySession(session) : null;
    if (!user) {
      res.status(401).json({ error: "Bitte melde dich zuerst an." });
      return;
    }
  }

  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const date =
    typeof req.body?.date === "string" && req.body.date.trim()
      ? req.body.date.trim()
      : getTodayBerlin();

  if (!name) {
    res.status(400).json({ error: "Name ist Pflicht." });
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "Ungültiges Datum." });
    return;
  }

  try {
    const result = await pool.query<CakeRow>(
      "INSERT INTO cake_entries (date, name) VALUES ($1::date, $2) RETURNING id, date, name, created_at",
      [date, name]
    );
    res.status(201).json(rowToEntry(result.rows[0]));
  } catch (error) {
    console.error("POST /api/cakes failed:", error);
    res.status(500).json({ error: "Eintrag konnte nicht gespeichert werden." });
  }
});

export default router;
