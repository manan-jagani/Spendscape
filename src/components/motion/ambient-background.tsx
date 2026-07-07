"use client";

import { useMemo } from "react";

/* ─── Deterministic pseudo-random hash ──────────────────── */

function pmod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function seed(i: number): number {
  return pmod(i * 16807, 2147483647) / 2147483647;
}

/* ─── Particles ─────────────────────────────────────────── */

function Particles({
  count = 20,
  mode,
}: {
  count?: number;
  mode: "light" | "dark";
}) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      left: seed(i * 7 + 1) * 100,
      top: seed(i * 7 + 2) * 100,
      delay: seed(i * 7 + 3) * 8,
      duration: 6 + seed(i * 7 + 4) * 8,
      driftX: (seed(i * 7 + 5) - 0.5) * 30,
      driftY: (seed(i * 7 + 6) - 0.5) * 30,
    }));
  }, [count]);

  const size = mode === "dark" ? 1.5 : 2;
  const color = mode === "dark"
    ? "oklch(1 0 0 / 0.3)"
    : "oklch(0.5 0.02 85 / 0.08)";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full motion-reduce:hidden"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: color,
            boxShadow: mode === "dark" ? `0 0 4px ${color}` : "none",
            animation: `particle-float-slow ${p.duration}s ease-in-out ${p.delay}s infinite`,
            willChange: "transform, opacity",
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */

export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Light mode ambient glow */}
      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-0 motion-reduce:animate-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 30% 20%, oklch(0.9 0.03 85 / 0.3), transparent 70%), radial-gradient(ellipse 60% 40% at 70% 80%, oklch(0.92 0.02 75 / 0.2), transparent 60%)",
          animation: "light-dance 20s ease-in-out infinite",
        }}
      />

      {/* Dark mode nebula clouds */}
      <div
        className="absolute inset-0 hidden dark:block motion-reduce:animate-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 15% 25%, oklch(0.4 0.1 165 / 0.08), transparent 65%), radial-gradient(ellipse 50% 50% at 80% 60%, oklch(0.35 0.08 255 / 0.06), transparent 60%), radial-gradient(ellipse 40% 35% at 50% 15%, oklch(0.38 0.06 330 / 0.05), transparent 55%)",
          animation: "nebula-drift 40s ease-in-out infinite",
        }}
      />

      {/* Dark mode secondary nebula (reverse drift) */}
      <div
        className="absolute inset-0 hidden dark:block motion-reduce:animate-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 60% 30%, oklch(0.35 0.08 200 / 0.05), transparent 60%), radial-gradient(ellipse 40% 50% at 30% 70%, oklch(0.4 0.06 330 / 0.04), transparent 55%)",
          animation: "nebula-drift-reverse 55s ease-in-out infinite",
        }}
      />

      {/* Star field (dark mode only) */}
      <div
        className="absolute inset-0 hidden dark:block ambient-stars motion-reduce:hidden"
        style={{
          animation: "star-twinkle 3s ease-in-out infinite",
          willChange: "opacity",
        }}
      />

      {/* Volumetric fog */}
      <div
        className="absolute inset-0"
        style={{
          background: "var(--ambient-vignette)",
        }}
      />

      {/* Floating particles */}
      <Particles count={24} mode="dark" />
    </div>
  );
}
