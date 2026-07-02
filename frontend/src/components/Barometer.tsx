interface BarometerProps {
  days: number | null;
}

export function Barometer({ days }: BarometerProps) {
  const cappedDays = days === null ? 30 : Math.min(days, 30);
  const position = (cappedDays / 30) * 100;
  const wobble = 0.12 + (cappedDays / 30) * 0.88;

  return (
    <div className="barometer" aria-label="Kuchometer Barometer">
      <div className="barometer-frame">
        <span className="barometer-ornament barometer-ornament--tl" aria-hidden="true" />
        <span className="barometer-ornament barometer-ornament--tr" aria-hidden="true" />
        <span className="barometer-ornament barometer-ornament--bl" aria-hidden="true" />
        <span className="barometer-ornament barometer-ornament--br" aria-hidden="true" />
        <div className="barometer-track-wrap">
          <div className="barometer-track">
            <div className="barometer-zone barometer-zone--green" />
            <div className="barometer-zone barometer-zone--yellow" />
            <div className="barometer-zone barometer-zone--red" />
          </div>
          <span
            className="barometer-indicator"
            style={{
              left: `${position}%`,
              transform: `translate(-${position}%, -50%)`,
              ["--wobble" as string]: wobble,
            }}
            aria-hidden="true"
          >
            <span className="barometer-indicator-cake">🍰</span>
          </span>
        </div>
      </div>
    </div>
  );
}
