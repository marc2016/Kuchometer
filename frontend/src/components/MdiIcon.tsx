interface MdiIconProps {
  path: string;
  className?: string;
  size?: number;
}

export function MdiIcon({ path, className, size = 20 }: MdiIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path d={path} fill="currentColor" />
    </svg>
  );
}
