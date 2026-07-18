// Leitet aus den Tagen seit dem letzten Kuchen die "Druck"-Stimmung der Seite ab.
// 0 Tage (grün) = ruhig, 30 Tage (rot) = maximaler Druck: Risse, Dampf, Flammen.

const MAX_DAYS = 30;

export interface PressureLevels {
  /** Gesamtdruck 0..1 (deckt sich mit der Barometer-Position). */
  pressure: number;
  /** Rötlicher Hitze-/Glut-Schein 0..1. */
  heat: number;
  /** Aufsteigender Dampf 0..1. */
  steam: number;
  /** Risse im Glas 0..1. */
  crack: number;
  /** Flammen am Barometer 0..1. */
  flame: number;
  /** Bildschirm-Beben 0..1. */
  shake: number;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

// Lineare Rampe: unterhalb von `from` ist alles 0, oberhalb von `to` alles 1.
function ramp(value: number, from: number, to: number): number {
  if (to === from) {
    return value >= to ? 1 : 0;
  }
  return clamp01((value - from) / (to - from));
}

export function getPressure(days: number | null): number {
  const capped = days === null ? MAX_DAYS : Math.min(Math.max(days, 0), MAX_DAYS);
  return capped / MAX_DAYS;
}

export function getPressureLevels(days: number | null): PressureLevels {
  const pressure = getPressure(days);

  return {
    pressure,
    heat: ramp(pressure, 0.25, 1),
    steam: ramp(pressure, 0.15, 0.8), // Starts around day 4.5, yielding steam at the end of green (day 9-10)
    crack: ramp(pressure, 0.26, 0.8), // Starts around day 8, yielding ~2 cracks at day 10
    flame: ramp(pressure, 0.6, 1),
    shake: ramp(pressure, 0.82, 1),
  };
}
