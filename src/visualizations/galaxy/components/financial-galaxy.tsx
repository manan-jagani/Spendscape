"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const galaxy = useGalaxyData({ accounts, categories, budgets, netWorth, width, height });

  const [detail, setDetail] = useState<DetailState>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const isSelected = detail !== null;

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

  /* ─── Geometry ────────────────────────────────────── */
  const cx = width / 2;
  const cy = height / 2;
  const dim = Math.min(width, height);
  const s = Math.min(1, dim / 500);
  const sunR = 80 * s;

  const planetOrbitR = galaxy?.planets[0]?.orbitRadius ?? 140 * s;
  const planetOrbitRx = planetOrbitR;
  const planetOrbitRy = planetOrbitR * 0.69;
  const ORBIT_TILT = 15 * (Math.PI / 180);

  /* ─── Orbits ──────────────────────────────────────── */
  const orbits = useMemo(
    () => [
      { rx: planetOrbitR * 0.42, ry: planetOrbitRy * 0.42, dur: 60, tilt: 15 },
      { rx: planetOrbitR * 0.68, ry: planetOrbitRy * 0.68, dur: 45, tilt: -10 },
      { rx: planetOrbitR, ry: planetOrbitRy, dur: 30, tilt: 15 },
    ],
    [planetOrbitR, planetOrbitRy],
  );

  const hCx = (cx / width) * 100;
  const hCy = (cy / height) * 100;

  /* ─── Sun gradient IDs are static ─────────────────── */

  return (
    <div className="relative overflow-hidden">
      <svg height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
        <defs>
          {/* Sun gradients */}
          <radialGradient id="sg-core" cx="32%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="30%" stopColor="#FDE047" />
            <stop offset="65%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>
          <radialGradient id="sg-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE047" stopOpacity={0.18} />
            <stop offset="35%" stopColor="#F59E0B" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="sg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF9C3" stopOpacity={0.3} />
            <stop offset="50%" stopColor="#FDE047" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
          </radialGradient>

          {/* Planet dark material gradients */}
          {galaxy?.planets.map((p) => (
            <radialGradient
              key={`pm-${p.id}`}
              id={`pm-${p.id}`}
              cx="35%"
              cy="35%"
              r="65%"
            >
              <stop offset="0%" stopColor="#2E3138" />
              <stop offset="45%" stopColor="#16181D" />
              <stop offset="100%" stopColor="#07080B" />
            </radialGradient>
          ))}

          <style>{`
            @keyframes sun-breathe {
              0%, 100% { transform-origin: ${hCx}% ${hCy}%; transform: scale(1); }
              50%      { transform-origin: ${hCx}% ${hCy}%; transform: scale(1.03); }
            }
            @keyframes halo-breathe {
              0%, 100% { opacity: 0.8; }
              50%      { opacity: 1; }
            }
            .sun-core  { animation: sun-breathe ${shouldReduceMotion ? "0" : "6"}s ease-in-out infinite; }
            .halo-glow { animation: halo-breathe ${shouldReduceMotion ? "0" : "6"}s ease-in-out infinite; }
          `}</style>
        </defs>

        <rect fill="#09090B" height={height} width={width} />

        {/* ── Orbits ──────────────────────────────── */}
        {(
          shouldReduceMotion
            ? orbits.map((o) => (
                <ellipse
                  key={`orb-${o.rx}`}
                  cx={cx}
                  cy={cy}
                  fill="none"
                  rx={o.rx}
                  ry={o.ry}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={0.5}
                  transform={`rotate(${o.tilt} ${cx} ${cy})`}
                />
              ))
            : orbits.map((o) => (
                <g key={`orb-${o.rx}`} transform={`rotate(${o.tilt} ${cx} ${cy})`}>
                  <g>
                    <animateTransform
                      attributeName="transform"
                      dur={`${o.dur}s`}
                      from={`0 ${cx} ${cy}`}
                      repeatCount="indefinite"
                      to={`360 ${cx} ${cy}`}
                      type="rotate"
                    />
                    <ellipse
                      cx={cx}
                      cy={cy}
                      fill="none"
                      rx={o.rx}
                      ry={o.ry}
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth={0.5}
                    />
                  </g>
                </g>
              ))
        )}

        {/* ── Sun ─────────────────────────────────── */}
        <g className="sun-core">
          <motion.circle
            animate={{ opacity: isSelected ? 0.3 : 0.8 }}
            className={shouldReduceMotion ? "" : "halo-glow"}
            cx={cx}
            cy={cy}
            fill="url(#sg-halo)"
            initial={{ opacity: 0.8 }}
            r={sunR * 3.5}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.circle
            animate={{ opacity: isSelected ? 0.3 : 0.8 }}
            className={shouldReduceMotion ? "" : "halo-glow"}
            cx={cx}
            cy={cy}
            fill="url(#sg-glow)"
            initial={{ opacity: 0.8 }}
            r={sunR * 2.2}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.circle
            animate={{ opacity: isSelected ? 0.35 : 1 }}
            cx={cx}
            cy={cy}
            fill="url(#sg-core)"
            initial={{ opacity: 1 }}
            r={sunR}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
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
          <circle
            cx={cx}
            cy={cy}
            fill="none"
            r={sunR - 0.5}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={1.5}
          />
          <circle
            cx={cx}
            cy={cy}
            fill="none"
            r={sunR + 1.5}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={0.5}
          />
        </g>

        {/* ── Planets & Moons ─────────────────────── */}
        {galaxy?.planets.map((planet) => {
          const pos = posOnEllipse(cx, cy, planetOrbitRx, planetOrbitRy, planet.angle, ORBIT_TILT);
          const isHovered = hoveredId === planet.id;
          const isDimmed = isSelected && detail?.type === "planet" && detail.data.id !== planet.id;
          const labelAbove = pos.y < cy;
          const labelDir = labelAbove ? -1 : 1;
          const labelOffset = planet.radius + 14;
          return (
            <g key={planet.id}>
              {/* ── Drop shadow ─────────────────── */}
              <motion.circle
                animate={{
                  opacity: isDimmed ? 0.06 : 0.3,
                  r: isHovered ? planet.radius * 1.08 : planet.radius,
                }}
                cx={pos.x + 3}
                cy={pos.y + 3}
                fill="rgba(0,0,0,0.35)"
                initial={false}
                style={{ filter: "blur(6px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />

              {/* ── Subsurface glow ────────────── */}
              <motion.circle
                animate={{
                  opacity: isDimmed ? 0.01 : 0.06,
                  r: planet.radius * 2.5,
                }}
                cx={pos.x}
                cy={pos.y}
                fill={planet.color}
                initial={false}
                style={{ filter: "blur(20px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />

              {/* ── Atmosphere glow ─────────────── */}
              <motion.circle
                animate={{
                  opacity: isDimmed ? 0.03 : isHovered ? 0.3 : 0.18,
                  r: isHovered ? planet.radius * 1.5 : planet.radius * 1.35,
                }}
                cx={pos.x}
                cy={pos.y}
                fill={planet.color}
                initial={false}
                style={{ filter: "blur(16px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />

              {/* ── Planet body (dark material) ── */}
              <motion.circle
                animate={{
                  r: isHovered ? planet.radius * 1.08 : planet.radius,
                  opacity: isDimmed ? 0.25 : 1,
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
                    y: pos.y + (labelAbove ? -planet.radius - 32 : planet.radius + 32),
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
                  r: isHovered ? planet.radius * 1.08 : planet.radius,
                  opacity: isDimmed ? 0.04 : 0.2,
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
                  r: isHovered ? planet.radius * 1.08 - 1 : planet.radius - 1,
                  opacity: isDimmed ? 0.04 : 0.22,
                }}
                cx={pos.x}
                cy={pos.y}
                fill="none"
                initial={false}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={1.5}
                style={{ pointerEvents: "none" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />

              {/* ── Primary specular ───────────── */}
              <motion.ellipse
                animate={{
                  opacity: isDimmed ? 0.04 : isHovered ? 0.3 : 0.2,
                }}
                cx={pos.x - planet.radius * 0.25}
                cy={pos.y - planet.radius * 0.3}
                fill="white"
                initial={false}
                rx={planet.radius * 0.42}
                ry={planet.radius * 0.2}
                style={{
                  filter: "blur(4px)",
                  pointerEvents: "none",
                }}
                transform={`rotate(-25 ${pos.x - planet.radius * 0.25} ${pos.y - planet.radius * 0.3})`}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />

              {/* ── Secondary specular ─────────── */}
              <motion.ellipse
                animate={{
                  opacity: isDimmed ? 0.06 : isHovered ? 0.4 : 0.28,
                }}
                cx={pos.x - planet.radius * 0.08}
                cy={pos.y - planet.radius * 0.4}
                fill="white"
                initial={false}
                rx={planet.radius * 0.14}
                ry={planet.radius * 0.05}
                style={{ pointerEvents: "none" }}
                transform={`rotate(-15 ${pos.x - planet.radius * 0.08} ${pos.y - planet.radius * 0.4})`}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />

              {/* ── Label ───────────────────────── */}
              {!isSelected && (
                <g>
                  <text
                    fill="rgba(255,255,255,0.75)"
                    fontSize={11}
                    fontWeight={500}
                    textAnchor="middle"
                    x={pos.x}
                    y={pos.y + labelDir * labelOffset}
                  >
                    {planet.name}
                  </text>
                  <text
                    fill="rgba(255,255,255,0.4)"
                    fontSize={10}
                    textAnchor="middle"
                    x={pos.x}
                    y={pos.y + labelDir * (labelOffset + 14)}
                  >
                    {formatCurrency(planet.value)}
                  </text>
                </g>
              )}

              {/* ── Moons ────────────────────────── */}
              {planet.moons.map((moon) => {
                const moonPos = posOnEllipse(pos.x, pos.y, moon.orbitRadius, moon.orbitRadius * 0.65, moon.angle, 0);
                const moonIsDimmed = isSelected && detail?.type === "moon" && detail.data.id !== moon.id;

                return (
                  <g key={moon.id}>
                    {/* Moon orbit */}
                    <ellipse
                      cx={pos.x}
                      cy={pos.y}
                      fill="none"
                      rx={moon.orbitRadius}
                      ry={moon.orbitRadius * 0.65}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={0.3}
                    />

                    {/* Moon body */}
                    <motion.circle
                      animate={{
                        r: moon.radius,
                        opacity: moonIsDimmed ? 0.15 : 1,
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
                          y: moonPos.y - moon.radius - 10,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onClick={() => handleMoonClick(moon, planet.name)}
                      style={{ cursor: "pointer" }}
                    />

                    {/* Budget health ring */}
                    {moon.budgetAmount != null && moon.budgetAmount > 0 && (
                      <motion.circle
                        animate={{
                          r: moon.radius + 3.5,
                          opacity: moonIsDimmed ? 0.1 : 0.85,
                        }}
                        cx={moonPos.x}
                        cy={moonPos.y}
                        fill="none"
                        initial={false}
                        stroke={getBudgetProgressColor(moon.spentAmount, moon.budgetAmount)}
                        strokeWidth={2}
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
      </svg>

      {/* ── Tooltip ─────────────────────────────────── */}
      {tooltip && !isSelected && (
        <div
          className="pointer-events-none absolute z-50 -translate-x-1/2"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="rounded-lg border border-white/10 bg-black/85 px-3 py-1.5 text-center backdrop-blur-md">
            <p className="whitespace-nowrap text-xs font-medium text-white">
              {tooltip.text}
            </p>
            <p className="whitespace-nowrap text-[11px] text-white/50">
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
            className="mx-4 w-full max-w-md rounded-2xl border border-white/8 bg-[#09090B]/95 p-6 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-lg font-medium text-white">
                  {detail.type === "planet" ? detail.data.name : detail.data.name}
                </h3>
                {detail.type === "planet" && (
                  <p className="mt-0.5 text-xs text-white/40">
                    {accountTypeLabel(
                      accounts.find((a) => a.id === detail.data.id)?.type ?? "",
                    )}
                  </p>
                )}
              </div>
              <button
                className="flex size-7 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/5 hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                onClick={handleCloseDetail}
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Balance */}
            <div className="mt-4">
              <p className="text-2xl font-medium tracking-tight text-white">
                {formatCurrency(detail.data.value)}
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                {detail.type === "planet" ? "Current balance" : "Total spent"}
              </p>
            </div>

            {/* Planet: categories */}
            {detail.type === "planet" && (
              <>
                {/* Categories */}
                {detail.data.moons.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <p className="text-[11px] font-medium tracking-wider text-white/30 uppercase">
                      Categories
                    </p>
                    <div className="space-y-1.5">
                      {detail.data.moons.slice(0, 6).map((moon) => (
                        <div
                          key={moon.id}
                          className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="size-2 rounded-full"
                              style={{ backgroundColor: moon.color }}
                            />
                            <span className="text-xs text-white/70">
                              {moon.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/50">
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

                {/* Recent transactions */}
                {recentTransactions.filter((t) => t.account_id === detail.data.id).length > 0 && (
                  <div className="mt-5 space-y-2">
                    <p className="text-[11px] font-medium tracking-wider text-white/30 uppercase">
                      Recent transactions
                    </p>
                    <div className="space-y-1">
                      {recentTransactions
                        .filter((t) => t.account_id === detail.data.id)
                        .slice(0, 5)
                        .map((txn) => (
                          <div
                            key={txn.id}
                            className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5"
                          >
                            <div>
                              <p className="text-xs text-white/70">
                                {txn.description ?? "Transaction"}
                              </p>
                              <p className="text-[11px] text-white/30">
                                {txn.category_name ?? "Uncategorized"}
                              </p>
                            </div>
                            <span className="text-xs text-white/60">
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
              <div className="mt-4 rounded-lg bg-white/[0.03] px-3 py-2">
                <p className="text-xs text-white/40">
                  Part of{" "}
                  <span className="font-medium text-white/70">
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
