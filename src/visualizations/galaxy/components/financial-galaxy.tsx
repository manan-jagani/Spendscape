"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";

import { formatCurrency } from "@/lib/formatters";
import { useChartDimensions } from "@/visualizations/lib/chart-dimensions";
import { useGalaxyData } from "@/visualizations/galaxy/hooks/use-galaxy-data";
import type { DetailState, MoonNode, PlanetNode } from "@/visualizations/galaxy/types";
import { getBudgetProgressColor } from "@/visualizations/galaxy/utils/colors";

/* ─── Props ──────────────────────────────────────────────────── */

interface FinancialGalaxyProps {
  accounts: ReadonlyArray<{
    id: string
    name: string
    current_balance: number
    type: string
  }>
  categories: ReadonlyArray<{
    category_id: string | null
    category_name: string | null
    total: number
    color: string | null
  }>
  budgets: ReadonlyArray<{
    id: string
    amount: number
    category_id: string | null
    categories: { name: string } | null
  }>
  netWorth: number
  recentTransactions?: ReadonlyArray<{
    id: string
    account_id: string
    amount: number
    description: string | null
    category_name: string | null
    occurred_at: string
  }>
}

/* ─── Types ──────────────────────────────────────────────────── */

interface TooltipData {
  text: string
  subtext: string
  x: number
  y: number
}

/* ─── Position on a rotated ellipse ──────────────────────────── */

function posOnEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angleRad: number,
  tiltRad: number,
) {
  const ex = rx * Math.cos(angleRad);
  const ey = ry * Math.sin(angleRad);
  return {
    x: cx + ex * Math.cos(tiltRad) - ey * Math.sin(tiltRad),
    y: cy + ex * Math.sin(tiltRad) + ey * Math.cos(tiltRad),
  };
}

/* ─── Random sun particles ───────────────────────────────────── */

const SUN_PARTICLE_COUNT = 14;

function generateSunParticles(centerX: number, centerY: number, sunR: number) {
  const particles: Array<{
    cx: number; cy: number; r: number; dur: number; delay: number;
    opacity: number; dx: number; dy: number;
  }> = [];
  for (let i = 0; i < SUN_PARTICLE_COUNT; i++) {
    const angle = (i / SUN_PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.5;
    const dist = sunR * (0.7 + Math.random() * 1.2);
    particles.push({
      cx: centerX + Math.cos(angle) * dist,
      cy: centerY + Math.sin(angle) * dist,
      r: 0.5 + Math.random() * 1.2,
      dur: 6 + Math.random() * 8,
      delay: Math.random() * 5,
      opacity: 0.03 + Math.random() * 0.08,
      dx: (Math.random() - 0.5) * 20,
      dy: (Math.random() - 0.5) * 16,
    });
  }
  return particles;
}

/* ─── Readable account type label ────────────────────────────── */

const TYPE_LABELS: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit Card",
  cash: "Cash",
  investment: "Investment",
  loan: "Loan",
};

function accountTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

/* ─── Constants ───────────────────────────────────────────────── */

const ORBIT_TILT = 15 * (Math.PI / 180);
const ORBIT_DURATIONS = [120, 90, 70];
const MOON_ORBIT_MIN = 18;
const SPEED_VARIATIONS = [0.02, -0.015, 0.01];
const PLANET_ROTATION_DURATIONS = [220, 190, 200];
const PARALLAX_MAX = 8;

/* ─── Animation snapshot state ────────────────────── */

interface AnimSnapshot {
  planetAngles: number[]
  planetRotations: number[]
  moonAngles: Record<string, number>
  pausedAngles: Record<string, number>
}

/* ─── Main component ─────────────────────────────────────────── */

export function FinancialGalaxy(props: FinancialGalaxyProps) {
  const shouldReduceMotion = !!useReducedMotion();
  const [containerRef, { width, height }] = useChartDimensions();
  const ready = width > 0 && height > 0;

  return (
    <div className="relative" ref={containerRef}>
      {!ready ? (
        <div className="h-[440px] w-full" />
      ) : (
        <GalaxyBody
          {...props}
          height={height}
          shouldReduceMotion={shouldReduceMotion}
          width={width}
        />
      )}
    </div>
  );
}

/* ─── GalaxyBody ─────────────────────────────────────────────── */

function GalaxyBody({
  accounts,
  budgets,
  categories,
  height,
  netWorth,
  recentTransactions = [],
  shouldReduceMotion,
  width,
}: FinancialGalaxyProps & {
  height: number
  shouldReduceMotion: boolean
  width: number
}) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const galaxy = useGalaxyData({ accounts, categories, budgets, netWorth, width, height });

  const [detail, setDetail] = useState<DetailState>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [animSnapshot, setAnimSnapshot] = useState<AnimSnapshot | null>(null);
  const galaxyRef = useRef<HTMLDivElement>(null);

  const isSelected = detail !== null;

  /* ─── RAF animation loop ──────────────────────────── */
  useEffect(() => {
    if (!galaxy || shouldReduceMotion) return;

    const planetAngles = galaxy.planets.map((p) => p.angle);
    const planetRotations = [0, 0, 0];
    const moonAngles: Record<string, number> = {};
    const pausedAngles: Record<string, number> = {};
    const startTime = performance.now();

    galaxy.planets.forEach((p) => {
      p.moons.forEach((m, mi) => {
        const total = p.moons.length;
        moonAngles[m.id] = (2 * Math.PI * mi) / total + Math.random() * 0.3;
      });
    });

    let rafId: number;
    let lastTime = startTime;

    const tick = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const elapsed = (now - startTime) / 1000;

      galaxy.planets.forEach((p, i) => {
        if (hoveredId === p.id) {
          pausedAngles[p.id] = planetAngles[i]!;
          return;
        }
        const duration = ORBIT_DURATIONS[i] ?? 120;
        const speed = (2 * Math.PI) / duration;
        const sv = SPEED_VARIATIONS[i] ?? 0.02;
        const variation = 1 + sv * Math.sin(elapsed * 0.12 + i * 2.1);
        planetAngles[i] = p.angle + speed * variation * elapsed;

        planetRotations[i] = (planetRotations[i] ?? 0) + (2 * Math.PI / (PLANET_ROTATION_DURATIONS[i] ?? 200)) * dt;
      });

      galaxy.planets.forEach((p) => {
        p.moons.forEach((m, mi) => {
          const moonDur = MOON_ORBIT_MIN + (mi % 5) * 3 + Math.sin(mi * 1.7) * 1.5;
          const moonSpeed = (2 * Math.PI) / moonDur;
          moonAngles[m.id] = (moonAngles[m.id] ?? 0) + moonSpeed * dt;
        });
      });

      setAnimSnapshot({
        planetAngles: [...planetAngles],
        planetRotations: [...planetRotations],
        moonAngles: { ...moonAngles },
        pausedAngles: { ...pausedAngles },
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [galaxy, shouldReduceMotion, hoveredId]);

  /* ─── ESC dismiss ─────────────────────────────────── */
  useEffect(() => {
    if (!isSelected) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDetail(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSelected]);

  const handleCloseDetail = useCallback(() => setDetail(null), []);

  /* ─── Click handlers ──────────────────────────────── */
  const handlePlanetClick = useCallback(
    (planet: PlanetNode) => {
      if (detail?.type === "planet" && detail.data.id === planet.id) {
        setDetail(null);
      } else {
        setDetail({ type: "planet", data: planet });
      }
      setTooltip(null);
    },
    [detail],
  );

  const handleMoonClick = useCallback(
    (moon: MoonNode, planetName: string) => {
      if (detail?.type === "moon" && detail.data.id === moon.id) {
        setDetail(null);
      } else {
        setDetail({ type: "moon", data: { ...moon, planetName } });
      }
      setTooltip(null);
    },
    [detail],
  );

  /* ─── Mouse parallax ──────────────────────────────── */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = galaxyRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  /* ─── Geometry ────────────────────────────────────── */
  const dim = Math.min(width, height);
  const s = Math.min(1, dim / 500);
  const sunR = 88 * s;

  const planetOrbitR = galaxy?.planets[0]?.orbitRadius ?? 140 * s;
  const planetOrbitRx = planetOrbitR;
  const planetOrbitRy = planetOrbitR * 0.69;

  /* ─── Bounding-box-based composition ─────────────── */
  const cx = width / 2;
  const cy = height * 0.47;

  /* ─── Orbits ──────────────────────────────────────── */
  const orbits = useMemo(
    () => [
      { rx: planetOrbitR * 0.42, ry: planetOrbitRy * 0.42, dur: 120, tilt: 15 },
      { rx: planetOrbitR * 0.68, ry: planetOrbitRy * 0.68, dur: 90, tilt: -10 },
      { rx: planetOrbitR, ry: planetOrbitRy, dur: 70, tilt: 15 },
    ],
    [planetOrbitR, planetOrbitRy],
  );

  const hCx = (cx / width) * 100;
  const hCy = (cy / height) * 100;

  /* ─── Sun particles ───────────────────────────────── */
  const sunParticles = useMemo(() => generateSunParticles(cx, cy, sunR), [cx, cy, sunR]);

  /* ─── Parallax transform ──────────────────────────── */
  const parallaxX = mousePos.x * PARALLAX_MAX;
  const parallaxY = mousePos.y * PARALLAX_MAX;

  return (
    <div
      ref={galaxyRef}
      className="relative overflow-hidden"
      onMouseMove={!shouldReduceMotion ? handleMouseMove : undefined}
      onMouseLeave={!shouldReduceMotion ? handleMouseLeave : undefined}
    >
      <svg height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
        <defs>
          {/* Sun gradients */}
          <radialGradient id="sg-core" cx="32%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="20%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="80%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </radialGradient>
          <radialGradient id="sg-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE047" stopOpacity={0.28} />
            <stop offset="40%" stopColor="#F59E0B" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="sg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF9C3" stopOpacity={0.4} />
            <stop offset="50%" stopColor="#FDE047" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="sg-corona" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE047" stopOpacity={0.1} />
            <stop offset="45%" stopColor="#F59E0B" stopOpacity={0.05} />
            <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
          </radialGradient>

          {/* Orbit depth gradient — fades at top, brighter at bottom */}
          <linearGradient id="orbit-depth" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--galaxy-orbit)" stopOpacity={0.25} />
            <stop offset="50%" stopColor="var(--galaxy-orbit)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--galaxy-orbit)" stopOpacity={0.9} />
          </linearGradient>

          {/* Planet material gradients */}
          {galaxy?.planets.map((p) => (
            <radialGradient
              key={`pm-${p.id}`}
              id={`pm-${p.id}`}
              cx="35%"
              cy="35%"
              r="65%"
            >
              {isLight ? (
                <>
                  <stop offset="0%" stopColor="#F0F1F3" />
                  <stop offset="45%" stopColor="#E2E4E8" />
                  <stop offset="100%" stopColor="#D0D3D8" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#4A4E58" />
                  <stop offset="35%" stopColor="#2A2D35" />
                  <stop offset="100%" stopColor="#0E1014" />
                </>
              )}
            </radialGradient>
          ))}

          {/* Atmosphere gradient for each planet */}
          {galaxy?.planets.map((p) => (
            <radialGradient
              key={`pa-${p.id}`}
              id={`pa-${p.id}`}
              cx="35%"
              cy="35%"
              r="65%"
            >
              <stop offset="0%" stopColor={p.color} stopOpacity={isLight ? 0.25 : 0.35} />
              <stop offset="60%" stopColor={p.color} stopOpacity={isLight ? 0.08 : 0.12} />
              <stop offset="100%" stopColor={p.color} stopOpacity={0} />
            </radialGradient>
          ))}

          <style>{`
            @keyframes sun-breathe {
              0%, 100% { transform-origin: ${hCx}% ${hCy}%; transform: scale(1); }
              50%      { transform-origin: ${hCx}% ${hCy}%; transform: scale(1.03); }
            }
            @keyframes halo-breathe {
              0%, 100% { opacity: 0.75; }
              50%      { opacity: 1; }
            }
            @keyframes corona-pulse {
              0%, 100% { opacity: 0.4; transform: scale(1); }
              50%      { opacity: 0.7; transform: scale(1.04); }
            }
            @keyframes flicker {
              0%, 100% { opacity: 0.85; }
              25%      { opacity: 0.92; }
              50%      { opacity: 0.8; }
              75%      { opacity: 0.95; }
            }
            @keyframes particle-drift {
              0%   { transform: translate(0, 0); opacity: 0; }
              20%  { opacity: var(--p-opacity, 0.08); }
              50%  { transform: translate(var(--dx, 12px), var(--dy, -8px)); opacity: var(--p-opacity, 0.08); }
              80%  { opacity: var(--p-opacity, 0.08); }
              100% { transform: translate(0, 0); opacity: 0; }
            }
            @keyframes orbit-glow {
              0%, 100% { opacity: 0.5; }
              50%      { opacity: 0.85; }
            }
            @keyframes sun-flicker {
              0%, 100% { opacity: 1; }
              15%      { opacity: 0.92; }
              30%      { opacity: 1; }
              55%      { opacity: 0.88; }
              70%      { opacity: 0.96; }
              90%      { opacity: 1; }
            }
            .sun-core      { animation: sun-breathe ${shouldReduceMotion ? "0" : "6"}s ease-in-out infinite; }
            .halo-glow     { animation: halo-breathe ${shouldReduceMotion ? "0" : "6"}s ease-in-out infinite; }
            .corona-pulse  { animation: corona-pulse ${shouldReduceMotion ? "0" : "8"}s ease-in-out infinite; }
            .sun-flicker   { animation: sun-flicker ${shouldReduceMotion ? "0" : "3.5"}s ease-in-out infinite; }
            .particle {
              animation: particle-drift var(--dur, 8s) ease-in-out infinite;
              animation-delay: var(--delay, 0s);
            }
            .orbit-glow    { animation: orbit-glow ${shouldReduceMotion ? "0" : "12"}s ease-in-out infinite; }
          `}</style>
        </defs>

        <rect fill="var(--galaxy-bg)" height={height} width={width} />

        <g
          style={{
            transform: shouldReduceMotion ? "none" : `translate(${parallaxX}px, ${parallaxY}px)`,
          }}
        >
          {/* ── Orbits ──────────────────────────────── */}
          {orbits.map((o) => (
            <ellipse
              key={`orb-${o.rx}`}
              cx={cx}
              cy={cy}
              fill="none"
              rx={o.rx}
              ry={o.ry}
              stroke="url(#orbit-depth)"
              strokeWidth={0.35}
              transform={`rotate(${o.tilt} ${cx} ${cy})`}
              className="orbit-glow"
            />
          ))}

          {/* ── Sun ─────────────────────────────────── */}
          <g className="sun-core">
            {/* Corona */}
            <motion.circle
              animate={{ opacity: isSelected ? 0.15 : 0.4 }}
              className={shouldReduceMotion ? "" : "corona-pulse"}
              cx={cx}
              cy={cy}
              fill="url(#sg-corona)"
              initial={{ opacity: 0.4 }}
              r={sunR * 5}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            {/* Halo */}
            <motion.circle
              animate={{ opacity: isSelected ? 0.25 : 0.8 }}
              className={shouldReduceMotion ? "" : "halo-glow"}
              cx={cx}
              cy={cy}
              fill="url(#sg-halo)"
              initial={{ opacity: 0.8 }}
              r={sunR * 3.5}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* Glow */}
            <motion.circle
              animate={{ opacity: isSelected ? 0.25 : 0.8 }}
              className={shouldReduceMotion ? "" : "halo-glow"}
              cx={cx}
              cy={cy}
              fill="url(#sg-glow)"
              initial={{ opacity: 0.8 }}
              r={sunR * 2.2}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* Core */}
            <motion.circle
              animate={{ opacity: isSelected ? 0.35 : 1 }}
              className={shouldReduceMotion ? "" : "sun-flicker"}
              cx={cx}
              cy={cy}
              fill="url(#sg-core)"
              initial={{ opacity: 1 }}
              r={sunR}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* Soft specular blur */}
            <ellipse
              cx={cx - sunR * 0.25}
              cy={cy - sunR * 0.25}
              fill="url(#sg-core)"
              opacity={0.12}
              rx={sunR * 0.45}
              ry={sunR * 0.3}
              style={{ filter: "blur(6px)" }}
              transform={`rotate(-30 ${cx - sunR * 0.25} ${cy - sunR * 0.25})`}
            />
            {/* Rim rings */}
            <circle
              cx={cx}
              cy={cy}
              fill="none"
              r={sunR - 0.5}
              stroke="var(--galaxy-orbit)"
              strokeWidth={1.5}
            />
            <circle
              cx={cx}
              cy={cy}
              fill="none"
              r={sunR + 1.5}
              stroke="var(--galaxy-orbit)"
              strokeWidth={0.5}
            />
          </g>

          {/* ── Sun particles ─────────────────────── */}
          {!shouldReduceMotion && sunParticles.map((p, i) => (
            <circle
              key={`sp-${i}`}
              className="particle"
              cx={p.cx}
              cy={p.cy}
              fill="#FDE047"
              r={p.r}
              style={{
                "--dur": `${p.dur}s`,
                "--delay": `${p.delay}s`,
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                "--p-opacity": p.opacity,
                filter: "blur(1.5px)",
              } as React.CSSProperties}
            />
          ))}

          {/* ── Planets & Moons ─────────────────────── */}
          {galaxy?.planets.map((planet, i) => {
            const currentAngle = shouldReduceMotion
              ? planet.angle
              : hoveredId === planet.id
                ? animSnapshot?.pausedAngles[planet.id] ?? planet.angle
                : animSnapshot?.planetAngles[i] ?? planet.angle;
            const rotationAngle = animSnapshot?.planetRotations[i] ?? 0;
            const pos = posOnEllipse(cx, cy, planetOrbitRx, planetOrbitRy, currentAngle, ORBIT_TILT);
            const isHovered = hoveredId === planet.id;
            const isDimmed = isSelected && detail?.type === "planet" && detail.data.id !== planet.id;

            /* ─ Depth (z-index derived from y) ───── */
            const depthFactor = (pos.y - (cy - planetOrbitRy)) / (planetOrbitRy * 2);
            const depthScale = 0.92 + depthFactor * 0.08;
            const depthBlur = 4 + depthFactor * 4;
            const depthGlow = 0.1 + depthFactor * 0.08;
            const depthOpacity = 0.85 + depthFactor * 0.15;
            const scaledR = planet.radius * depthScale;

            /* ─ Smart label positioning ────────── */
            const labelOnLeft = pos.x < cx;
            const labelAbove = pos.y < cy;
            const labelX = labelOnLeft ? pos.x - scaledR - 20 : pos.x + scaledR + 20;
            const labelY = pos.y + (labelAbove ? -scaledR - 8 : scaledR + 14);

            /* ─ Shadow opposite sun ────────────── */
            const shadowDx =
              pos.x >= cx
                ? pos.x + Math.abs(pos.x - cx) * 0.04 + scaledR * 0.08
                : pos.x - Math.abs(cx - pos.x) * 0.04 - scaledR * 0.08;
            const shadowDy =
              pos.y >= cy
                ? pos.y + Math.abs(pos.y - cy) * 0.04 + scaledR * 0.08
                : pos.y - Math.abs(cy - pos.y) * 0.04 - scaledR * 0.08;

            /* ─ Rotate specular ────────────────── */
            const specRotate = rotationAngle * (180 / Math.PI);
            const specDX = Math.cos(rotationAngle) * scaledR * 0.25;
            const specDY = Math.sin(rotationAngle) * scaledR * 0.25;
            const specX = pos.x - specDX;
            const specY = pos.y - specDY;
            const specRX = scaledR * 0.42;
            const specRY = scaledR * 0.2;

            return (
              <g key={planet.id}>
                {/* ── Drop shadow ─────────────────── */}
                <motion.circle
                  animate={{
                    opacity: isDimmed ? 0.04 : 0.2 * depthFactor + 0.08,
                    r: isHovered ? scaledR * 1.08 : scaledR,
                  }}
                  cx={shadowDx}
                  cy={shadowDy}
                  fill="rgba(0,0,0,0.3)"
                  initial={false}
                  style={{ filter: `blur(${depthBlur * 1.5}px)` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />

                {/* ── Subsurface glow ────────────── */}
                <motion.circle
                  animate={{
                    opacity: isDimmed ? 0.01 : depthGlow * 0.5,
                    r: scaledR * 2.5,
                  }}
                  cx={pos.x}
                  cy={pos.y}
                  fill={planet.color}
                  initial={false}
                  style={{ filter: `blur(${depthBlur * 3}px)` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />

                {/* ── Atmosphere glow ─────────────── */}
                <motion.circle
                  animate={{
                    opacity: isDimmed
                      ? 0.02
                      : isHovered
                        ? 0.3 * depthOpacity
                        : depthGlow * 1.5,
                    r: isHovered ? scaledR * 1.5 : scaledR * 1.4,
                  }}
                  cx={pos.x}
                  cy={pos.y}
                  fill={planet.color}
                  initial={false}
                  style={{ filter: `blur(${depthBlur * 2.5}px)` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />

                {/* ── Planet body ── */}
                <motion.circle
                  animate={{
                    r: isHovered ? scaledR * 1.08 : scaledR,
                    opacity: isDimmed ? 0.2 : depthOpacity,
                  }}
                  cx={pos.x}
                  cy={pos.y}
                  fill={`url(#pm-${planet.id})`}
                  initial={false}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  onMouseEnter={() => {
                    setHoveredId(planet.id);
                    setTooltip({
                      text: planet.name,
                      subtext: formatCurrency(planet.value),
                      x: pos.x,
                      y: pos.y + (labelAbove ? -scaledR - 32 : scaledR + 32),
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredId(null);
                    setTooltip(null);
                  }}
                  onClick={() => handlePlanetClick(planet)}
                  style={{ cursor: "pointer" }}
                />

                {/* ── Colored edge ───────────────── */}
                <motion.circle
                  animate={{
                    r: isHovered ? scaledR * 1.08 : scaledR,
                    opacity: isDimmed ? 0.03 : 0.15 * depthOpacity,
                  }}
                  cx={pos.x}
                  cy={pos.y}
                  fill="none"
                  initial={false}
                  stroke={planet.color}
                  strokeWidth={1}
                  style={{ pointerEvents: "none" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />

                {/* ── Rim light ───────────────────── */}
                <motion.circle
                  animate={{
                    r: isHovered ? scaledR * 1.08 - 1 : scaledR - 1,
                    opacity: isDimmed ? 0.03 : 0.25 * depthOpacity,
                  }}
                  cx={pos.x}
                  cy={pos.y}
                  fill="none"
                  initial={false}
                  stroke={isLight ? "var(--galaxy-text)" : "rgba(180,210,255,0.15)"}
                  strokeWidth={1.5}
                  style={{ pointerEvents: "none" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />

                {/* ── Primary specular ───────────── */}
                <motion.ellipse
                  animate={{
                    opacity: isDimmed ? 0.03 : isHovered ? 0.32 * depthOpacity : 0.22 * depthOpacity,
                  }}
                  cx={specX}
                  cy={specY}
                  fill="white"
                  initial={false}
                  rx={specRX}
                  ry={specRY}
                  style={{
                    filter: `blur(${depthBlur * 0.5}px)`,
                    pointerEvents: "none",
                  }}
                  transform={`rotate(${specRotate - 25} ${specX} ${specY})`}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />

                {/* ── Secondary specular ─────────── */}
                <motion.ellipse
                  animate={{
                    opacity: isDimmed ? 0.05 : isHovered ? 0.38 * depthOpacity : 0.25 * depthOpacity,
                  }}
                  cx={pos.x - specDX * 0.3}
                  cy={pos.y - specDY * 1.4}
                  fill="white"
                  initial={false}
                  rx={scaledR * 0.14}
                  ry={scaledR * 0.05}
                  style={{ pointerEvents: "none" }}
                  transform={`rotate(${specRotate - 15} ${pos.x - specDX * 0.3} ${pos.y - specDY * 1.4})`}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />

                {/* ── Ambient occlusion shadow ──── */}
                <motion.circle
                  animate={{
                    opacity: isDimmed ? 0.02 : 0.08 * depthOpacity,
                  }}
                  cx={pos.x + scaledR * 0.3}
                  cy={pos.y + scaledR * 0.35}
                  fill="rgba(0,0,0,0.15)"
                  initial={false}
                  r={scaledR * 0.5}
                  style={{
                    filter: "blur(6px)",
                    pointerEvents: "none",
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />

                {/* ── Label chip ───────────────────── */}
                {!isSelected && (
                  <foreignObject
                    x={labelOnLeft ? labelX - 140 : labelX}
                    y={labelY - 18}
                    width={140}
                    height={40}
                    style={{
                      opacity: isHovered ? 1 : 0.45,
                      transition: "opacity 0.25s ease-out",
                    }}
                  >
                    <div
                      className="flex h-full flex-col justify-center rounded-lg border px-2.5 py-1.5 shadow-sm backdrop-blur-md"
                      style={{
                        backgroundColor: "var(--glass-premium-bg)",
                        borderColor: "var(--glass-premium-border)",
                      }}
                    >
                      <span
                        className="text-[11px] font-medium leading-snug"
                        style={{ color: "var(--galaxy-text)" }}
                      >
                        {planet.name}
                      </span>
                      <span
                        className="text-[10px] leading-snug"
                        style={{ color: "var(--galaxy-text-dim)" }}
                      >
                        {formatCurrency(planet.value)}
                      </span>
                    </div>
                  </foreignObject>
                )}

                {/* ── Moons ────────────────────────── */}
                {planet.moons.map((moon, mi) => {
                  const moonAngle = shouldReduceMotion
                    ? moon.angle
                    : (animSnapshot?.moonAngles[moon.id] ?? (2 * Math.PI * mi) / planet.moons.length);

                  const moonOrbitR = moon.orbitRadius * depthScale;
                  const moonOrbitRy = moonOrbitR * 0.65;
                  const moonPos = posOnEllipse(pos.x, pos.y, moonOrbitR, moonOrbitRy, moonAngle, 0);
                  const moonIsDimmed = isSelected && detail?.type === "moon" && detail.data.id !== moon.id;
                  const moonDepthScale = 0.85 + (moonPos.y - (pos.y - moonOrbitRy)) / (moonOrbitRy * 2) * 0.15;
                  const moonR = moon.radius * moonDepthScale;

                  return (
                    <g key={moon.id}>
                      {/* Moon orbit */}
                      <ellipse
                        cx={pos.x}
                        cy={pos.y}
                        fill="none"
                        rx={moonOrbitR}
                        ry={moonOrbitRy}
                        stroke="var(--galaxy-orbit)"
                        strokeWidth={0.2}
                        style={{ opacity: 0.5 }}
                      />

                      {/* Moon drop shadow */}
                      <motion.circle
                        animate={{
                          r: moonR,
                          opacity: moonIsDimmed ? 0.02 : 0.05,
                        }}
                        cx={moonPos.x + 2}
                        cy={moonPos.y + 2}
                        fill="rgba(0,0,0,0.15)"
                        initial={false}
                        style={{ filter: "blur(3px)" }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      />

                      {/* Moon glow */}
                      <motion.circle
                        animate={{
                          r: moonR * 2.5,
                          opacity: moonIsDimmed ? 0.005 : moonDepthScale * 0.04,
                        }}
                        cx={moonPos.x}
                        cy={moonPos.y}
                        fill={moon.color}
                        initial={false}
                        style={{ filter: "blur(8px)" }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      />

                      {/* Moon body */}
                      <motion.circle
                        animate={{
                          r: moonR,
                          opacity: moonIsDimmed ? 0.12 : 1,
                        }}
                        cx={moonPos.x}
                        cy={moonPos.y}
                        fill={moon.color}
                        initial={false}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        onMouseEnter={() => {
                          setTooltip({
                            text: moon.name,
                            subtext: formatCurrency(moon.value),
                            x: moonPos.x,
                            y: moonPos.y - moonR - 10,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => handleMoonClick(moon, planet.name)}
                        style={{ cursor: "pointer" }}
                      />

                      {/* Moon rim light */}
                      <motion.circle
                        animate={{
                          r: moonR - 0.5,
                          opacity: moonIsDimmed ? 0.02 : 0.1,
                        }}
                        cx={moonPos.x}
                        cy={moonPos.y}
                        fill="none"
                        initial={false}
                        stroke="var(--galaxy-text)"
                        strokeWidth={0.4}
                        style={{ pointerEvents: "none" }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      />

                      {/* Budget health ring */}
                      {moon.budgetAmount != null && moon.budgetAmount > 0 && (
                        <motion.circle
                          animate={{
                            r: moonR + 3,
                            opacity: moonIsDimmed ? 0.08 : 0.7,
                          }}
                          cx={moonPos.x}
                          cy={moonPos.y}
                          fill="none"
                          initial={false}
                          stroke={getBudgetProgressColor(moon.spentAmount, moon.budgetAmount)}
                          strokeWidth={1.5}
                          style={{ pointerEvents: "none" }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>

      {/* ── Tooltip ─────────────────────────────────── */}
      {tooltip && !isSelected && (
        <div
          className="pointer-events-none absolute z-50 -translate-x-1/2"
          style={{
            left: tooltip.x + parallaxX,
            top: tooltip.y + parallaxY,
          }}
        >
          <div className="rounded-lg border border-border bg-popover/95 px-3 py-1.5 text-center backdrop-blur-xl">
            <p className="whitespace-nowrap text-xs font-medium text-foreground">
              {tooltip.text}
            </p>
            <p className="whitespace-nowrap text-[11px] text-muted-foreground">
              {tooltip.subtext}
            </p>
          </div>
        </div>
      )}

      {/* ── Detail Panel ────────────────────────────── */}
      {detail && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center"
          onClick={handleCloseDetail}
        >
          <div
            className="mx-4 w-full max-w-md rounded-2xl border border-border bg-background/95 p-6 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-lg font-medium text-foreground">
                  {detail.type === "planet" ? detail.data.name : detail.data.name}
                </h3>
                {detail.type === "planet" && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {accountTypeLabel(
                      accounts.find((a) => a.id === detail.data.id)?.type ?? "",
                    )}
                  </p>
                )}
              </div>
              <button
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                onClick={handleCloseDetail}
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Balance */}
            <div className="mt-4">
              <p className="text-2xl font-medium tracking-tight text-foreground">
                {formatCurrency(detail.data.value)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {detail.type === "planet" ? "Current balance" : "Total spent"}
              </p>
            </div>

            {/* Planet: categories */}
            {detail.type === "planet" && (
              <>
                {detail.data.moons.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <p className="text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase">
                      Categories
                    </p>
                    <div className="space-y-1.5">
                      {detail.data.moons.slice(0, 6).map((moon) => (
                        <div
                          key={moon.id}
                          className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="size-2 rounded-full"
                              style={{ backgroundColor: moon.color }}
                            />
                            <span className="text-xs text-foreground/80">
                              {moon.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(moon.value)}
                            </span>
                            {moon.budgetAmount != null && moon.budgetAmount > 0 && (
                              <span
                                className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                                style={{
                                  backgroundColor: `${getBudgetProgressColor(moon.spentAmount, moon.budgetAmount)}20`,
                                  color: getBudgetProgressColor(moon.spentAmount, moon.budgetAmount),
                                }}
                              >
                                {Math.round((moon.spentAmount / moon.budgetAmount) * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recentTransactions.filter((t) => t.account_id === detail.data.id).length > 0 && (
                  <div className="mt-5 space-y-2">
                    <p className="text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase">
                      Recent transactions
                    </p>
                    <div className="space-y-1">
                      {recentTransactions
                        .filter((t) => t.account_id === detail.data.id)
                        .slice(0, 5)
                        .map((txn) => (
                          <div
                            key={txn.id}
                            className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5"
                          >
                            <div>
                              <p className="text-xs text-foreground/80">
                                {txn.description ?? "Transaction"}
                              </p>
                              <p className="text-[11px] text-muted-foreground/70">
                                {txn.category_name ?? "Uncategorized"}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(txn.amount)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Moon: planet context */}
            {detail.type === "moon" && (
              <div className="mt-4 rounded-lg bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Part of{" "}
                  <span className="font-medium text-foreground/80">
                    {detail.data.planetName}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
