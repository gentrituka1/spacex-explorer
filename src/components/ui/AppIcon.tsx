import clsx from "clsx";
import { StarIcon } from "@/components/ui/StarIcon";

export type AppIconName =
  | "home"
  | "rocket"
  | "star"
  | "chart"
  | "compare"
  | "menu"
  | "close"
  | "chevron-right"
  | "check"
  | "image"
  | "wrench"
  | "map-pin"
  | "link"
  | "alert"
  | "clock"
  | "clipboard"
  | "package"
  | "tag"
  | "info"
  | "swap"
  | "search";

interface AppIconProps {
  name: AppIconName;
  size?: number;
  className?: string;
  starFilled?: boolean;
}

function IconSvg({
  size,
  className,
  children,
}: {
  size: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={clsx("shrink-0", className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function AppIcon({
  name,
  size = 18,
  className,
  starFilled = false,
}: AppIconProps) {
  if (name === "star") {
    return (
      <StarIcon
        filled={starFilled}
        size={size}
        className={className}
      />
    );
  }

  const stroke = "currentColor";
  const sw = 1.75;

  switch (name) {
    case "home":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "rocket":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M12 3c3 2.5 5 6 5 10.5 0 2.5-.8 4.5-2 6.5M12 3C9 5.5 7 9.5 7 13.5c0 2.5.8 4.5 2 6.5M12 3v4M9 20h6"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="2" stroke={stroke} strokeWidth={sw} />
        </IconSvg>
      );
    case "chart":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M4 20V10M10 20V4M16 20v-6M22 20H2"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "compare":
      return (
        <IconSvg size={size} className={className}>
          <rect
            x="3"
            y="5"
            width="7"
            height="14"
            rx="1.5"
            stroke={stroke}
            strokeWidth={sw}
          />
          <rect
            x="14"
            y="5"
            width="7"
            height="14"
            rx="1.5"
            stroke={stroke}
            strokeWidth={sw}
          />
        </IconSvg>
      );
    case "menu":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </IconSvg>
      );
    case "close":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </IconSvg>
      );
    case "chevron-right":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M9 6l6 6-6 6"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "check":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M5 12l4 4 10-10"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "image":
      return (
        <IconSvg size={size} className={className}>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke={stroke}
            strokeWidth={sw}
          />
          <circle cx="9" cy="10" r="1.5" fill={stroke} />
          <path
            d="M3 16l5-5 4 4 3-3 6 6"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "wrench":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-3.2-3.2 2.1-2.1z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "map-pin":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="2" stroke={stroke} strokeWidth={sw} />
        </IconSvg>
      );
    case "link":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M10 14a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1M14 10a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "alert":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M12 4 3 20h18L12 4z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path
            d="M12 10v4M12 17h.01"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </IconSvg>
      );
    case "clock":
      return (
        <IconSvg size={size} className={className}>
          <circle cx="12" cy="12" r="8" stroke={stroke} strokeWidth={sw} />
          <path
            d="M12 8v4l3 2"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "clipboard":
      return (
        <IconSvg size={size} className={className}>
          <rect
            x="6"
            y="5"
            width="12"
            height="15"
            rx="2"
            stroke={stroke}
            strokeWidth={sw}
          />
          <path
            d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"
            stroke={stroke}
            strokeWidth={sw}
          />
        </IconSvg>
      );
    case "package":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M12 3 3 7.5 12 12l9-4.5L12 3z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path
            d="M3 7.5V16.5L12 21l9-4.5V7.5M12 12v9"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "tag":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M4 12V5a1 1 0 0 1 1-1h7l8 8-7 7-8-8z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="8.5" r="1" fill={stroke} />
        </IconSvg>
      );
    case "info":
      return (
        <IconSvg size={size} className={className}>
          <circle cx="12" cy="12" r="8" stroke={stroke} strokeWidth={sw} />
          <path
            d="M12 11v4M12 8h.01"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </IconSvg>
      );
    case "swap":
      return (
        <IconSvg size={size} className={className}>
          <path
            d="M16 4l3 3-3 3M8 20l-3-3 3-3M19 7H9M5 17h10"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "search":
      return (
        <IconSvg size={size} className={className}>
          <circle cx="11" cy="11" r="7" stroke={stroke} strokeWidth={sw} />
          <path
            d="M16 16l4 4"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </IconSvg>
      );
    default:
      return null;
  }
}

export function MissionPatchPlaceholder({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <AppIcon
      name="rocket"
      size={size}
      className={clsx("text-slate-500", className)}
    />
  );
}
