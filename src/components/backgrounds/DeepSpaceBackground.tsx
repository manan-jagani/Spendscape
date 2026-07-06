"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

const STAR_COUNT = 400;

interface Star {
  id: number;
  x: number;
  y: number;
  r: number;
  opacity: number;
  twinkle: boolean;
  twinkleDuration: number;
  twinkleDelay: number;
}

function generateStars(ww: number, wh: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const hash = (i * 137.508) % 1;
    const hash2 = (i * 269.361) % 1;
    const hash3 = (i * 73.927) % 1;
    stars.push({
      id: i,
      x: ((i * 97.321) % 1) * ww,
      y: ((i * 181.739) % 1) * wh,
      r: hash < 0.7 ? 1 : hash < 0.95 ? 2 : 3,
      opacity: 0.08 + hash2 * 0.25,
      twinkle: hash3 < 0.08,
      twinkleDuration: 6 + hash2 * 9,
      twinkleDelay: hash3 * 6,
    });
  }
  return stars;
}

/* ─── Layer 2: Large radial gradients ───────────────────────── */

const GRADIENTS = [
  {
    key: "indigo",
    style: {
      width: "800px",
      height: "800px",
      top: "-200px",
      left: "-200px",
      background:
        "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)",
      filter: "blur(200px)",
      pointerEvents: "none" as const,
    },
  },
  {
    key: "violet",
    style: {
      width: "900px",
      height: "900px",
      top: "-300px",
      right: "-200px",
      background:
        "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 65%)",
      filter: "blur(250px)",
      pointerEvents: "none" as const,
    },
  },
  {
    key: "cyan",
    style: {
      width: "700px",
      height: "700px",
      bottom: "-150px",
      right: "-100px",
      background:
        "radial-gradient(circle, rgba(34,211,238,0.035) 0%, transparent 65%)",
      filter: "blur(300px)",
      pointerEvents: "none" as const,
    },
  },
  {
    key: "deep-blue",
    style: {
      width: "1000px",
      height: "800px",
      bottom: "-200px",
      left: "-100px",
      background:
        "radial-gradient(circle, rgba(29,78,216,0.045) 0%, transparent 65%)",
      filter: "blur(250px)",
      pointerEvents: "none" as const,
    },
  },
];

/* ─── Layer 3: Soft nebula clouds ────────────────────────────── */

const NEBULA_DRIFT = {
  duration: 90,
  ease: "easeInOut" as const,
  repeat: Infinity,
};

const NEBULAE = [
  {
    key: "nebula-indigo",
    width: "70%",
    height: "65%",
    top: "10%",
    left: "0%",
    background:
      "radial-gradient(ellipse at 40% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)",
    blur: "180px",
    drift: {
      x: [0, 12, 0, -8, 0],
      y: [0, -6, 0, 10, 0],
      delay: 0,
    },
  },
  {
    key: "nebula-violet",
    width: "60%",
    height: "60%",
    top: "30%",
    left: "30%",
    background:
      "radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.03) 0%, transparent 70%)",
    blur: "220px",
    drift: {
      x: [0, -10, 0, 8, 0],
      y: [0, 8, 0, -4, 0],
      delay: 25,
    },
  },
  {
    key: "nebula-cyan",
    width: "50%",
    height: "50%",
    top: "45%",
    left: "50%",
    background:
      "radial-gradient(ellipse at 50% 50%, rgba(34,211,238,0.025) 0%, transparent 70%)",
    blur: "200px",
    drift: {
      x: [0, 6, 0, -12, 0],
      y: [0, -10, 0, 6, 0],
      delay: 50,
    },
  },
];

/* ─── Light sources ──────────────────────────────────────────── */

const LIGHT_SOURCES = [
  {
    key: "warm",
    style: {
      width: "600px",
      height: "600px",
      top: "25%",
      left: "45%",
      background:
        "radial-gradient(circle, rgba(251,191,36,0.045) 0%, transparent 60%)",
      filter: "blur(250px)",
      pointerEvents: "none" as const,
    },
  },
  {
    key: "cool-blue",
    style: {
      width: "500px",
      height: "500px",
      top: "30%",
      left: "10%",
      background:
        "radial-gradient(circle, rgba(56,189,248,0.035) 0%, transparent 60%)",
      filter: "blur(220px)",
      pointerEvents: "none" as const,
    },
  },
  {
    key: "purple",
    style: {
      width: "500px",
      height: "500px",
      bottom: "10%",
      right: "12%",
      background:
        "radial-gradient(circle, rgba(192,132,252,0.035) 0%, transparent 60%)",
      filter: "blur(220px)",
      pointerEvents: "none" as const,
    },
  },
];

/* ─── Component ──────────────────────────────────────────────── */

export function DeepSpaceBackground() {
  const shouldReduceMotion = useReducedMotion();
  const stars = useMemo(() => generateStars(1920, 1080), []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{ backgroundColor: "#09090B" }}
    >
      {/* Layer 2: Large radial gradients ─────────── */}
      {GRADIENTS.map((g) => (
        <div key={g.key} className="absolute" style={g.style} />
      ))}

      {/* Layer 3: Nebula clouds (drift) ──────────── */}
      {!shouldReduceMotion &&
        NEBULAE.map((nebula) => (
          <motion.div
            key={nebula.key}
            animate={{ x: nebula.drift.x, y: nebula.drift.y }}
            className="absolute"
            initial={{ x: 0, y: 0 }}
            style={{
              width: nebula.width,
              height: nebula.height,
              top: nebula.top,
              left: nebula.left,
              background: nebula.background,
              filter: `blur(${nebula.blur})`,
              pointerEvents: "none",
            }}
            transition={{
              ...NEBULA_DRIFT,
              delay: nebula.drift.delay * -1,
            }}
          />
        ))}

      {/* Light sources ─────────────────────────── */}
      {LIGHT_SOURCES.map((s) => (
        <div key={s.key} className="absolute" style={s.style} />
      ))}

      {/* Layer 4: Star field ────────────────────── */}
      <svg
        className="relative h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1920 1080"
      >
        {stars.map((star) =>
          star.twinkle && !shouldReduceMotion ? (
            <motion.circle
              key={star.id}
              animate={{
                opacity: [star.opacity, star.opacity * 0.2, star.opacity],
              }}
              cx={star.x}
              cy={star.y}
              fill="white"
              initial={{ opacity: star.opacity }}
              r={star.r}
              transition={{
                duration: star.twinkleDuration,
                ease: "easeInOut",
                repeat: Infinity,
                delay: star.twinkleDelay,
              }}
            />
          ) : (
            <circle
              key={star.id}
              cx={star.x}
              cy={star.y}
              fill="white"
              opacity={star.opacity}
              r={star.r}
            />
          ),
        )}
      </svg>

      {/* Layer 5: Noise texture ──────────────────── */}
      <div className="pointer-events-none absolute inset-0 glass-noise-subtle" />

      {/* Layer 6: Vignette ───────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(9,9,11,0.35) 100%)",
        }}
      />
    </div>
  );
}
