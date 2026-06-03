import clsx from "clsx";

const SIZES = {
  sm: 18,
  md: 24,
  lg: 28,
  xl: 40,
} as const;

export type StarIconSize = keyof typeof SIZES;

interface StarIconProps {
  filled?: boolean;
  size?: StarIconSize | number;
  className?: string;
}

export function StarIcon({
  filled = false,
  size = "md",
  className,
}: StarIconProps) {
  const px = typeof size === "number" ? size : SIZES[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className={clsx("shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.7L12 16.8 6.8 18.9l1-5.7-4.2-4.1 5.8-.8L12 3z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.75}
        strokeLinejoin="round"
      />
    </svg>
  );
}
