"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

import { useChartDimensions } from "@/visualizations/lib/chart-dimensions";

const STAR_COUNT = 400
const PARTICLE_COUNT = 60

interface Star {
  x: number
  y: number
  r: number
  opacity: number
  twinkleDuration: number
  twinkleDelay: number
}

interface Particle {
  x: number
  y: number
  r: number
  opacity: number
  driftDuration: number
  driftDelay: number
}

function generateStars(w: number, h: number): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < STAR_COUNT; i++) {
    const x = (i * 137.508) % 1
    const y = (i * 269.361) % 1
    stars.push({
      x: x * w,
      y: y * h,
      r: 0.3 + ((i * 7.1) % 1) * 1.7,
      opacity: 0.08 + ((i * 3.7) % 1) * 0.5,
      twinkleDuration: 2.5 + ((i * 5.3) % 1) * 4,
      twinkleDelay: ((i * 11.7) % 1) * 4,
    })
  }
  return stars
}

function generateParticles(w: number, h: number): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (i * 89.053) % 1
    const y = (i * 157.423) % 1
    particles.push({
      x: x * w,
      y: y * h,
      r: 0.5 + ((i * 3.1) % 1) * 1,
      opacity: 0.015 + ((i * 7.3) % 1) * 0.04,
      driftDuration: 18 + ((i * 13.7) % 1) * 30,
      driftDelay: ((i * 19.3) % 1) * 10,
    })
  }
  return particles
}

interface NebulaDef {
  cx: number
  cy: number
  r: number
  colorVar: string
  opacity: number
}

function generateNebulae(w: number, h: number): NebulaDef[] {
  const maxDim = Math.min(w, h)
  return [
    {
      cx: w * 0.22,
      cy: h * 0.28,
      r: maxDim * 0.45,
      colorVar: "var(--color-savings)",
      opacity: 0.12,
    },
    {
      cx: w * 0.78,
      cy: h * 0.65,
      r: maxDim * 0.38,
      colorVar: "var(--color-investment)",
      opacity: 0.1,
    },
    {
      cx: w * 0.5,
      cy: h * 0.85,
      r: maxDim * 0.3,
      colorVar: "var(--color-income)",
      opacity: 0.08,
    },
  ]
}

export function FinancialGalaxyV2() {
  const shouldReduceMotion = useReducedMotion()
  const [containerRef, { width, height }] = useChartDimensions()

  const stars = useMemo(() => generateStars(width, height), [width, height])
  const particles = useMemo(() => generateParticles(width, height), [width, height])
  const nebulae = useMemo(() => generateNebulae(width, height), [width, height])

  if (width === 0 || height === 0) return null

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-lg"
      ref={containerRef}
    >
      <svg
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <linearGradient id="v2-space-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--color-surface))" stopOpacity={0.4} />
            <stop offset="50%" stopColor="transparent" stopOpacity={0} />
            <stop offset="100%" stopColor="hsl(var(--color-muted))" stopOpacity={0.25} />
          </linearGradient>

          {nebulae.map((n, i) => (
            <radialGradient
              key={`nebula-${i}`}
              id={`v2-nebula-${i}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={`hsl(${n.colorVar})`} stopOpacity={1} />
              <stop offset="100%" stopColor={`hsl(${n.colorVar})`} stopOpacity={0} />
            </radialGradient>
          ))}

          <radialGradient id="v2-vignette" cx="50%" cy="50%" r="75%">
            <stop offset="40%" stopColor="transparent" stopOpacity={0} />
            <stop offset="100%" stopColor="hsl(var(--color-card))" stopOpacity={0.45} />
          </radialGradient>

          <radialGradient id="v2-bloom" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--color-savings))" stopOpacity={0.08} />
            <stop offset="40%" stopColor="hsl(var(--color-savings))" stopOpacity={0.04} />
            <stop offset="100%" stopColor="transparent" stopOpacity={0} />
          </radialGradient>

          <radialGradient id="v2-bloom-amber" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--color-warning))" stopOpacity={0.06} />
            <stop offset="50%" stopColor="hsl(var(--color-warning))" stopOpacity={0.02} />
            <stop offset="100%" stopColor="transparent" stopOpacity={0} />
          </radialGradient>

          <filter id="v2-star-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="v2-particle-blur">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>

        <style>{`
          @keyframes v2-twinkle {
            0%, 100% { opacity: var(--star-opacity-min, 0.08); }
            50% { opacity: var(--star-opacity-max, 0.6); }
          }
          @keyframes v2-drift {
            0%, 100% { transform: translate(0, 0); }
            33% { transform: translate(3px, -2px); }
            66% { transform: translate(-2px, 1px); }
          }
          @keyframes v2-bloom-pulse {
            0%, 100% { opacity: 0.08; transform: scale(1); }
            50% { opacity: 0.16; transform: scale(1.06); }
          }
          @keyframes v2-bloom-amber-pulse {
            0%, 100% { opacity: 0.05; transform: scale(1); }
            50% { opacity: 0.1; transform: scale(1.08); }
          }
          ${shouldReduceMotion ? `
            .v2-star, .v2-particle { animation: none !important; }
            .v2-bloom, .v2-bloom-amber { animation: none !important; }
          ` : ""}
        `}</style>

        <rect
          width={width}
          height={height}
          fill="transparent"
        />

        <rect
          width={width}
          height={height}
          fill="url(#v2-space-bg)"
        />

        {nebulae.map((n, i) => (
          <rect
            key={`nebula-rect-${i}`}
            width={width}
            height={height}
            fill={`url(#v2-nebula-${i})`}
            opacity={n.opacity}
            style={{ mixBlendMode: "screen" as React.CSSProperties["mixBlendMode"] }}
          />
        ))}

        <g>
          {stars.map((star, i) => (
            <circle
              key={`star-${i}`}
              className="v2-star"
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="hsl(var(--color-muted-foreground))"
              style={{
                opacity: shouldReduceMotion ? star.opacity * 0.4 : star.opacity * 0.3,
                "--star-opacity-min": star.opacity * 0.1,
                "--star-opacity-max": star.opacity * 0.8,
                animation: shouldReduceMotion
                  ? "none"
                  : `v2-twinkle ${star.twinkleDuration}s ease-in-out ${star.twinkleDelay}s infinite`,
              } as React.CSSProperties}
            />
          ))}
        </g>

        {particles.length > 0 && (
          <g filter="url(#v2-particle-blur)">
            {particles.map((p, i) => (
              <circle
                key={`particle-${i}`}
                className="v2-particle"
                cx={p.x}
                cy={p.y}
                r={p.r}
                fill="hsl(var(--color-muted-foreground))"
                style={{
                  opacity: p.opacity,
                  animation: shouldReduceMotion
                    ? "none"
                    : `v2-drift ${p.driftDuration}s ease-in-out ${p.driftDelay}s infinite`,
                  transformOrigin: `${p.x}px ${p.y}px`,
                } as React.CSSProperties}
              />
            ))}
          </g>
        )}

        <rect
          width={width}
          height={height}
          fill="url(#v2-vignette)"
          pointerEvents="none"
        />

        <motion.circle
          className="v2-bloom"
          cx={width / 2}
          cy={height / 2}
          fill="url(#v2-bloom)"
          pointerEvents="none"
          r={Math.min(width, height) * 0.35}
          style={{
            transformOrigin: "center",
            animation: shouldReduceMotion ? "none" : "v2-bloom-pulse 6s ease-in-out infinite",
          }}
        />

        <motion.circle
          className="v2-bloom-amber"
          cx={width / 2}
          cy={height / 2}
          fill="url(#v2-bloom-amber)"
          pointerEvents="none"
          r={Math.min(width, height) * 0.28}
          style={{
            transformOrigin: "center",
            animation: shouldReduceMotion ? "none" : "v2-bloom-amber-pulse 8s ease-in-out infinite",
          }}
        />
      </svg>
    </div>
  )
}
