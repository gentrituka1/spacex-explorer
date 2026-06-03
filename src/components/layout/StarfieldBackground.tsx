"use client";

import { useMemo } from "react";

type StarKind = "dust" | "soft" | "bright" | "flare";

interface Star {
  id: number;
  top: number;
  left: number;
  kind: StarKind;
  size: number;
  delay: number;
  duration: number;
  hue: "white" | "cyan" | "violet";
}

const HUE = {
  white: {
    core: "#ffffff",
    glow: "rgba(255, 255, 255, 0.95)",
    outer: "rgba(255, 255, 255, 0.35)",
  },
  cyan: {
    core: "#e0f2fe",
    glow: "rgba(125, 211, 252, 0.9)",
    outer: "rgba(56, 189, 248, 0.45)",
  },
  violet: {
    core: "#ede9fe",
    glow: "rgba(196, 181, 253, 0.85)",
    outer: "rgba(139, 92, 246, 0.4)",
  },
} as const;

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12_989.5083) * 43_758.5453;
  return x - Math.floor(x);
}

function generateStars(count: number): Star[] {
  const kinds: StarKind[] = [
    "dust",
    "dust",
    "dust",
    "soft",
    "soft",
    "soft",
    "bright",
    "bright",
    "flare",
  ];
  const hues: Star["hue"][] = ["white", "white", "cyan", "violet"];

  return Array.from({ length: count }, (_, i) => {
    const kind = kinds[Math.floor(seededRandom(i * 7) * kinds.length)]!;
    const size =
      kind === "dust"
        ? 2 + seededRandom(i * 3) * 2.5
        : kind === "soft"
          ? 4 + seededRandom(i * 5) * 3
          : kind === "bright"
            ? 5 + seededRandom(i * 11) * 5
            : 7 + seededRandom(i * 13) * 5;

    return {
      id: i,
      top: seededRandom(i * 17) * 98 + 1,
      left: seededRandom(i * 23) * 98 + 1,
      kind,
      size,
      delay: seededRandom(i * 31) * 5,
      duration: 2.5 + seededRandom(i * 41) * 4.5,
      hue: hues[Math.floor(seededRandom(i * 53) * hues.length)]!,
    };
  });
}

function StarDot({ star }: { star: Star }) {
  const colors = HUE[star.hue];
  const glowSpread = star.size * (star.kind === "flare" ? 3 : star.kind === "bright" ? 2.5 : 1.8);
  const outerSpread = star.size * (star.kind === "flare" ? 5 : 3.5);

  if (star.kind === "flare") {
    return (
      <span
        className="star-flare absolute"
        style={{
          top: `${star.top}%`,
          left: `${star.left}%`,
          width: star.size,
          height: star.size,
          animation: `star-twinkle-bright ${star.duration}s ease-in-out infinite`,
          animationDelay: `${star.delay}s`,
          ["--star-core" as string]: colors.core,
          ["--star-glow" as string]: colors.glow,
          ["--star-outer" as string]: colors.outer,
          ["--star-size" as string]: `${star.size}px`,
        }}
      />
    );
  }

  const opacity =
    star.kind === "dust" ? 0.55 : star.kind === "soft" ? 0.75 : 0.95;
  const animation =
    star.kind === "bright" ? "star-twinkle-bright" : "star-twinkle";

  return (
    <span
      className="absolute rounded-full"
      style={{
        top: `${star.top}%`,
        left: `${star.left}%`,
        width: star.size,
        height: star.size,
        opacity,
        background: `radial-gradient(circle at 35% 35%, ${colors.core} 0%, ${colors.glow} 45%, transparent 72%)`,
        boxShadow: `0 0 ${glowSpread}px ${colors.glow}, 0 0 ${outerSpread}px ${colors.outer}`,
        animation: `${animation} ${star.duration}s ease-in-out infinite`,
        animationDelay: `${star.delay}s`,
      }}
    />
  );
}

export function StarfieldBackground() {
  const stars = useMemo(() => generateStars(72), []);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(56,189,248,0.14)_0%,transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_85%_15%,rgba(139,92,246,0.12)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_10%_80%,rgba(14,165,233,0.08)_0%,transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.4)_100%)]" />

      {stars.map((star) => (
        <StarDot key={star.id} star={star} />
      ))}
    </div>
  );
}
