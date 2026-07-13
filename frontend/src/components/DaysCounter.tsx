interface DaysCounterProps {
  days: number | null;
}

export function DaysCounter({ days }: DaysCounterProps) {
  if (days === null) {
    return null;
  }

  const valueLabel = days === 1 ? "1 Arbeitstag" : `${days} Arbeitstage`;

  return (
    <div className="days-counter">
      <span className="days-counter-value">{valueLabel}</span>
      <span className="days-counter-label">seit dem letzten Kuchen</span>
    </div>
  );
}
