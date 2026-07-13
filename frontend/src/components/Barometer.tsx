import { useEffect, useRef, useState } from "react";
import needleIcon from "../assets/barometer-needle-cake.png";

interface BarometerProps {
  days: number | null;
  introFromDays?: number | null;
  ready?: boolean;
}

const DOWN_DURATION_MS = 3200;
const UP_DURATION_MS = 5000;

function toPosition(days: number | null): number {
  const capped = days === null ? 30 : Math.min(Math.max(days, 0), 30);
  return (capped / 30) * 100;
}

// Feste Kantenlänge der Loch-Grafik in Pixeln. Das Loch wird nur positioniert,
// nie skaliert – so verzerrt es auch bei breiterem Barometer nicht.
const HOLE_BOX = 48;

// Zufälliger Riss-Farbton: Schwarz-, Grau- oder Weißton.
function crackTone(): string {
  const g = Math.floor(Math.random() * 256);
  return `rgba(${g}, ${g}, ${g}, 0.85)`;
}

interface GlassHole {
  holePath: string;
  cracks: string[];
  stroke: string;
  leftPct: number;
  topPct: number;
}

// Erzeugt ein zerborstenes Loch an einer zufälligen Stelle des Glases:
// unregelmäßiger Rand + ausstrahlende Risse, gezeichnet in einer festen
// HOLE_BOX×HOLE_BOX-Box, plus zufällige Prozent-Position im Glas.
function generateGlassHole(): GlassHole {
  const center = HOLE_BOX / 2;
  const clamp = (v: number) => Math.max(3, Math.min(HOLE_BOX - 3, v));
  const base = 4 + Math.random() * 2;

  const points = 11;
  let holePath = "";
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = base * (0.75 + Math.random() * 0.5);
    const x = clamp(center + Math.cos(angle) * r);
    const y = clamp(center + Math.sin(angle) * r);
    holePath += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  holePath += "Z";

  const count = 6 + Math.floor(Math.random() * 3);
  const cracks: string[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const jitter = (Math.random() - 0.5) * 0.5;
    const r0 = base * 1.1;
    const len = 6 + Math.random() * 13;
    const x0 = clamp(center + Math.cos(angle) * r0);
    const y0 = clamp(center + Math.sin(angle) * r0);
    const xm = clamp(center + Math.cos(angle + jitter) * (r0 + len * 0.5));
    const ym = clamp(center + Math.sin(angle + jitter) * (r0 + len * 0.5));
    const xe = clamp(center + Math.cos(angle + jitter * 1.5) * (r0 + len));
    const ye = clamp(center + Math.sin(angle + jitter * 1.5) * (r0 + len));
    cracks.push(
      `M${x0.toFixed(1)} ${y0.toFixed(1)} L${xm.toFixed(1)} ${ym.toFixed(1)} L${xe.toFixed(1)} ${ye.toFixed(1)}`
    );
  }

  return {
    holePath,
    cracks,
    stroke: crackTone(),
    leftPct: 12 + Math.random() * 76,
    topPct: 34 + Math.random() * 32,
  };
}

// Erzeugt 5 bis 10 Löcher an zufälligen Stellen, ohne dass sie sich überlagern.
// Der Abstand wird gegen eine schmale Referenzbreite geprüft, damit die Löcher
// auch auf kleinen Barometern getrennt bleiben (auf breiteren erst recht).
function generateGlassHoles(): GlassHole[] {
  const target = 5 + Math.floor(Math.random() * 6);
  const refWidth = 340;
  const refHeight = 76;
  const minDist = 30;

  const placed: GlassHole[] = [];
  let attempts = 0;
  while (placed.length < target && attempts < target * 60) {
    attempts++;
    const hole = generateGlassHole();
    const cx = (hole.leftPct / 100) * refWidth;
    const cy = (hole.topPct / 100) * refHeight;
    const overlaps = placed.some((other) => {
      const dx = (other.leftPct / 100) * refWidth - cx;
      const dy = (other.topPct / 100) * refHeight - cy;
      return Math.hypot(dx, dy) < minDist;
    });
    if (!overlaps) {
      placed.push(hole);
    }
  }

  return placed;
}

// Feste Box eines einzelnen Riss-Clusters (Pixel). Wird nur positioniert.
const CRACK_BOX_W = 64;
const CRACK_BOX_H = 76;
const CRACK_COUNT = 18;

interface GlassCrack {
  paths: string[];
  stroke: string;
  leftPct: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

// Ein zufälliger, verzweigter Riss innerhalb einer festen Box.
// Verläuft mal überwiegend vertikal, mal überwiegend horizontal.
function generateCrack(): GlassCrack {
  const clampX = (v: number) => Math.max(6, Math.min(CRACK_BOX_W - 6, v));
  const clampY = (v: number) => Math.max(4, Math.min(CRACK_BOX_H - 4, v));

  const horizontal = Math.random() < 0.45;
  const segments = 3 + Math.floor(Math.random() * 3);

  let x: number;
  let y: number;
  const main: Array<[number, number]> = [];

  if (horizontal) {
    x = 4 + Math.random() * 8;
    y = 12 + Math.random() * (CRACK_BOX_H - 24);
    main.push([clampX(x), clampY(y)]);
    for (let i = 0; i < segments; i++) {
      x += ((CRACK_BOX_W - x) / (segments - i)) * (0.5 + Math.random() * 0.9);
      y += (Math.random() - 0.5) * 26;
      main.push([clampX(x), clampY(y)]);
    }
  } else {
    x = 12 + Math.random() * 40;
    y = 4 + Math.random() * 10;
    main.push([clampX(x), clampY(y)]);
    for (let i = 0; i < segments; i++) {
      x += (Math.random() - 0.5) * 30;
      y += ((CRACK_BOX_H - y) / (segments - i)) * (0.5 + Math.random() * 0.9);
      main.push([clampX(x), clampY(y)]);
    }
  }

  const paths: string[] = [
    "M" + main.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(" L"),
  ];

  const points: Array<[number, number]> = [...main];
  const branches = 1 + Math.floor(Math.random() * 2);
  for (let b = 0; b < branches; b++) {
    const [bx, by] = main[1 + Math.floor(Math.random() * (main.length - 1))];
    const ex = clampX(bx + (Math.random() - 0.5) * 26);
    const ey = clampY(by + (Math.random() - 0.5) * 22);
    paths.push(`M${bx.toFixed(1)} ${by.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`);
    points.push([ex, ey]);
  }

  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);

  return {
    paths,
    stroke: crackTone(),
    leftPct: 0,
    xMin: Math.min(...xs),
    xMax: Math.max(...xs),
    yMin: Math.min(...ys),
    yMax: Math.max(...ys),
  };
}

// Verteilt unterschiedliche Risse über die Breite, ohne dass sie ein Loch überlagern.
function generateCracks(holes: GlassHole[]): GlassCrack[] {
  const refWidth = 340;
  const refHeight = 76;
  const holeRadius = 16;
  const margin = 2;

  const result: GlassCrack[] = [];
  let attempts = 0;
  while (result.length < CRACK_COUNT && attempts < CRACK_COUNT * 50) {
    attempts++;
    const crack = generateCrack();
    const leftPct = 2 + Math.random() * 96;
    const centerPx = (leftPct / 100) * refWidth;
    const left = centerPx + (crack.xMin - CRACK_BOX_W / 2) - margin;
    const right = centerPx + (crack.xMax - CRACK_BOX_W / 2) + margin;
    const top = crack.yMin - margin;
    const bottom = crack.yMax + margin;

    const hitsHole = holes.some((hole) => {
      const hx = (hole.leftPct / 100) * refWidth;
      const hy = (hole.topPct / 100) * refHeight;
      return (
        left < hx + holeRadius &&
        right > hx - holeRadius &&
        top < hy + holeRadius &&
        bottom > hy - holeRadius
      );
    });

    if (!hitsHole) {
      crack.leftPct = leftPct;
      result.push(crack);
    }
  }

  return result;
}

export function Barometer({ days, introFromDays = null, ready = true }: BarometerProps) {
  const targetPosition = toPosition(days);
  const cappedDays = days === null ? 30 : Math.min(days, 30);
  const wobble = 0.12 + (cappedDays / 30) * 0.88;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [displayPosition, setDisplayPosition] = useState(() => {
    if (prefersReducedMotion) {
      return targetPosition;
    }
    return introFromDays !== null ? toPosition(introFromDays) : 0;
  });
  const [transition, setTransition] = useState<string | undefined>(undefined);
  const [holes] = useState(generateGlassHoles);
  const [cracks] = useState(() => generateCracks(holes));
  const introDone = useRef(prefersReducedMotion);

  // Intro-Animation, sobald die Daten geladen sind: Gab es heute einen Kuchen,
  // startet der Zeiger auf dem letzten Stand und gleitet langsam nach unten.
  useEffect(() => {
    if (introDone.current || !ready) {
      return;
    }
    introDone.current = true;

    const isDown = introFromDays !== null;
    const startPosition = isDown ? toPosition(introFromDays) : 0;
    const durationMs = isDown ? DOWN_DURATION_MS : UP_DURATION_MS;
    const easing = isDown
      ? "cubic-bezier(0.34, 1.12, 0.44, 1)"
      : "cubic-bezier(0.22, 1, 0.36, 1)";

    setTransition("none");
    setDisplayPosition(startPosition);

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setTransition(
          `left ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}`
        );
        setDisplayPosition(toPosition(days));
      });
    });
    const clearTransition = window.setTimeout(() => setTransition(undefined), durationMs + 120);

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      window.clearTimeout(clearTransition);
    };
    // Läuft einmalig, sobald die Daten bereitstehen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Nach der Intro-Animation folgt der Zeiger normalen Änderungen.
  useEffect(() => {
    if (!introDone.current) {
      return;
    }
    setDisplayPosition(targetPosition);
  }, [targetPosition]);

  return (
    <div className="barometer" aria-label="Kuchometer Barometer">
      <div className="barometer-frame">
        <span className="barometer-ornament barometer-ornament--tl" aria-hidden="true" />
        <span className="barometer-ornament barometer-ornament--tr" aria-hidden="true" />
        <span className="barometer-ornament barometer-ornament--bl" aria-hidden="true" />
        <span className="barometer-ornament barometer-ornament--br" aria-hidden="true" />

        <div className="barometer-damage" aria-hidden="true">
          <span className="barometer-scorch barometer-scorch--bl" />
          <span className="barometer-scorch barometer-scorch--tr" />
          <span className="barometer-scorch barometer-scorch--r" />
          {(["tl", "tr", "bl", "br"] as const).map((corner) => (
            <svg
              key={corner}
              className={`barometer-frame-crack barometer-frame-crack--${corner}`}
              width="58"
              height="58"
              viewBox="0 0 58 58"
            >
              <path className="barometer-frame-chip" d="M30 0 L34 7 L42 3 L47 0 Z" />
              <path className="barometer-frame-chip" d="M0 26 L8 22 L4 31 L0 34 Z" />
              <g className="barometer-frame-crack-lines">
                <path d="M21 0 L17 10 L25 16 L19 27" />
                <path d="M0 21 L10 17 L6 26 L15 30" />
                <path d="M17 10 L7 8 M25 16 L35 13" />
              </g>
            </svg>
          ))}
        </div>
        <div className="barometer-track-wrap">
          <div className="barometer-track">
            <div className="barometer-zone barometer-zone--green" />
            <div className="barometer-zone barometer-zone--yellow" />
            <div className="barometer-zone barometer-zone--red" />
          </div>
          <span
            className="barometer-indicator"
            style={{
              left: `${displayPosition}%`,
              transform: `translate(-${displayPosition}%, -50%)`,
              transition,
              ["--wobble" as string]: wobble,
            }}
            aria-hidden="true"
          >
            <img className="barometer-indicator-cake" src={needleIcon} alt="" />
          </span>
          <div className="barometer-glass" aria-hidden="true">
            <span className="barometer-glass-shine" />
          </div>
          <div className="barometer-cracks" aria-hidden="true">
            {cracks.map((crack, ci) => (
              <svg
                key={ci}
                className="barometer-crack"
                width={CRACK_BOX_W}
                height={CRACK_BOX_H}
                viewBox={`0 0 ${CRACK_BOX_W} ${CRACK_BOX_H}`}
                style={{
                  left: `${crack.leftPct}%`,
                  ["--t" as string]: ci / cracks.length,
                }}
              >
                <g className="barometer-cracks-lines" style={{ stroke: crack.stroke }}>
                  {crack.paths.map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </g>
              </svg>
            ))}
          </div>
          {holes.map((hole, holeIndex) => (
            <svg
              key={holeIndex}
              className="barometer-hole"
              width={HOLE_BOX}
              height={HOLE_BOX}
              viewBox={`0 0 ${HOLE_BOX} ${HOLE_BOX}`}
              style={{
                left: `${hole.leftPct}%`,
                top: `${hole.topPct}%`,
                ["--t" as string]: holeIndex / holes.length,
              }}
              aria-hidden="true"
            >
              <defs>
                <radialGradient
                  id={`barometer-hole-shadow-${holeIndex}`}
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="0" stopColor="#000" stopOpacity="0.12" />
                  <stop offset="0.65" stopColor="#000" stopOpacity="0.42" />
                  <stop offset="1" stopColor="#000" stopOpacity="0.72" />
                </radialGradient>
              </defs>
              <g className="barometer-cracks-lines" style={{ stroke: hole.stroke }}>
                {hole.cracks.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
              <path
                className="barometer-hole-fill"
                d={hole.holePath}
                fill={`url(#barometer-hole-shadow-${holeIndex})`}
              />
              <path className="barometer-hole-rim" d={hole.holePath} />
            </svg>
          ))}
        </div>

        <div className="barometer-steam" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="barometer-steam-slot"
              style={{ ["--i" as string]: i, ["--t" as string]: i / 5 }}
            >
              <span className="barometer-steam-wisp" />
            </span>
          ))}
        </div>

        <div className="barometer-flames" aria-hidden="true">
          <span
            className="barometer-flame-slot barometer-flame-slot--bottom"
            style={{ ["--t" as string]: 0 }}
          >
            <span className="barometer-flame" style={{ ["--i" as string]: 0 }} />
          </span>
          <span
            className="barometer-flame-slot barometer-flame-slot--top"
            style={{ ["--t" as string]: 1 / 3 }}
          >
            <span className="barometer-flame" style={{ ["--i" as string]: 1 }} />
          </span>
          <span
            className="barometer-flame-slot barometer-flame-slot--side"
            style={{ ["--t" as string]: 2 / 3 }}
          >
            <span className="barometer-flame" style={{ ["--i" as string]: 2 }} />
          </span>
        </div>
      </div>
    </div>
  );
}
