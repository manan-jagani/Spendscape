"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { useTheme } from "next-themes";

/* ─── 3-layer star system (dark mode only) ───────── */

const LAYERS = [
  { count: 300, minR: 0.5, maxR: 1.5, minO: 0.12, maxO: 0.4, drift: 0.3, twinkleFrac: 0.06 },
  { count: 80, minR: 1.5, maxR: 2.5, minO: 0.15, maxO: 0.5, drift: 0.6, twinkleFrac: 0.1 },
  { count: 12, minR: 3, maxR: 5, minO: 0.05, maxO: 0.15, drift: 1, twinkleFrac: 0.2 },
];

interface CelestialDot {
  id: number
  x: number
  y: number
  r: number
  opacity: number
  twinkle: boolean
  twinkleDuration: number
  twinkleDelay: number
}

function generateLayer(
  layerIndex: number,
  config: (typeof LAYERS)[number],
  ww: number,
  wh: number,
): CelestialDot[] {
  const dots: CelestialDot[] = [];
  const seed = layerIndex * 137.508;
  for (let i = 0; i < config.count; i++) {
    const id = layerIndex * 10000 + i;
    const h1 = ((id + seed) * 97.321) % 1;
    const h2 = ((id + seed) * 181.739) % 1;
    const h3 = ((id + seed) * 269.361) % 1;
    const h4 = ((id + seed) * 73.927) % 1;
    dots.push({
      id,
      x: h1 * ww,
      y: h2 * wh,
      r: config.minR + h3 * (config.maxR - config.minR),
      opacity: config.minO + h4 * (config.maxO - config.minO),
      twinkle: h2 < config.twinkleFrac,
      twinkleDuration: 5 + h3 * 10,
      twinkleDelay: h4 * 8,
    });
  }
  return dots;
}

/* ─── Light mode floating dust particles ─────────── */

function generateDustParticles() {
  const particles: Array<{
    id: number
    x: number
    y: number
    size: number
    blur: number
    opacity: number
    dur: number
    delay: number
    dx: number
    dy: number
  }> = [];
  for (let i = 0; i < 25; i++) {
    const s = (i * 31.417) % 1;
    const s2 = (i * 73.927) % 1;
    const s3 = (i * 137.508) % 1;
    const s4 = (i * 53.671) % 1;
    const s5 = (i * 97.321) % 1;
    particles.push({
      id: i,
      x: s * 100,
      y: s2 * 100,
      size: 1 + s3 * 2,
      blur: 2 + s4 * 4,
      opacity: 0.01 + s5 * 0.015,
      dur: 22 + s4 * 18,
      delay: -s2 * 45,
      dx: (s - 0.5) * 30,
      dy: (-0.5 + s2 * 0.8) * 20,
    });
  }
  return particles;
}

const dustParticles = generateDustParticles();

/* ─── Theme-adaptive layers ─────────────────────── */

function useThemeGradients(isLight: boolean) {
  return useMemo(() => {
    if (isLight) {
      return [
        {
          key: "soft-white",
          style: {
            width: "900px",
            height: "900px",
            top: "-250px",
            left: "-150px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 65%)",
            filter: "blur(220px)",
            pointerEvents: "none" as const,
          },
        },
        {
          key: "warm-gray",
          style: {
            width: "700px",
            height: "700px",
            top: "25%",
            right: "-100px",
            background:
              "radial-gradient(circle, rgba(235,235,242,0.12) 0%, transparent 65%)",
            filter: "blur(280px)",
            pointerEvents: "none" as const,
          },
        },
        {
          key: "cool-gray",
          style: {
            width: "550px",
            height: "550px",
            bottom: "-80px",
            left: "20%",
            background:
              "radial-gradient(circle, rgba(240,240,248,0.08) 0%, transparent 65%)",
            filter: "blur(240px)",
            pointerEvents: "none" as const,
          },
        },
      ];
    }
    return [
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
    ];
  }, [isLight]);
}

const NEBULA_DRIFT = {
  duration: 90,
  ease: "easeInOut" as const,
  repeat: Infinity,
};

function useThemeNebulae(isLight: boolean) {
  return useMemo(() => {
    if (isLight) return [];
    return [
      {
        key: "nebula-indigo",
        width: "70%",
        height: "65%",
        top: "10%",
        left: "0%",
        background:
          "radial-gradient(ellipse at 40% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)",
        blur: "180px",
        drift: { x: [0, 12, 0, -8, 0], y: [0, -6, 0, 10, 0], delay: 0 },
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
        drift: { x: [0, -10, 0, 8, 0], y: [0, 8, 0, -4, 0], delay: 25 },
      },
      {
        key: "nebula-emerald",
        width: "40%",
        height: "40%",
        top: "50%",
        left: "10%",
        background:
          "radial-gradient(ellipse at 50% 50%, rgba(15,157,118,0.035) 0%, transparent 70%)",
        blur: "200px",
        drift: { x: [0, -5, 0, 6, 0], y: [0, 4, 0, -8, 0], delay: 10 },
      },
      {
        key: "nebula-gold",
        width: "35%",
        height: "35%",
        top: "20%",
        left: "55%",
        background:
          "radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.025) 0%, transparent 70%)",
        blur: "220px",
        drift: { x: [0, 8, 0, -6, 0], y: [0, -4, 0, 6, 0], delay: 40 },
      },
    ];
  }, [isLight]);
}

function useThemeLightSources(isLight: boolean) {
  return useMemo(() => {
    if (isLight) {
      return [
        {
          key: "gray-orb-1",
          style: {
            width: "500px",
            height: "500px",
            top: "10%",
            left: "25%",
            background:
              "radial-gradient(circle, rgba(220,220,230,0.05) 0%, transparent 60%)",
            filter: "blur(220px)",
            pointerEvents: "none" as const,
          },
        },
        {
          key: "gray-orb-2",
          style: {
            width: "400px",
            height: "400px",
            bottom: "15%",
            right: "20%",
            background:
              "radial-gradient(circle, rgba(230,230,240,0.04) 0%, transparent 60%)",
            filter: "blur(200px)",
            pointerEvents: "none" as const,
          },
        },
        {
          key: "gray-orb-3",
          style: {
            width: "350px",
            height: "350px",
            top: "40%",
            left: "60%",
            background:
              "radial-gradient(circle, rgba(240,240,245,0.03) 0%, transparent 60%)",
            filter: "blur(180px)",
            pointerEvents: "none" as const,
          },
        },
      ];
    }
    return [
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
  }, [isLight]);
}

/* ─── Component ──────────────────────────────────── */

export function DeepSpaceBackground() {
  const shouldReduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const starLayers = useMemo(
    () =>
      isLight
        ? []
        : LAYERS.map((cfg, i) => generateLayer(i, cfg, 1920, 1080)),
    [isLight],
  );

  const gradients = useThemeGradients(isLight);
  const nebulae = useThemeNebulae(isLight);
  const lightSources = useThemeLightSources(isLight);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Layer 1: Volumetric fog (dark) ──────────── */}
      {!isLight && (
        <div
          className="absolute inset-0"
          style={{
            background: [
              "radial-gradient(ellipse at 50% 100%, rgba(9,9,11,0.3) 0%, transparent 60%)",
              "radial-gradient(ellipse at 80% 20%, rgba(9,9,11,0.15) 0%, transparent 50%)",
            ].join(","),
            pointerEvents: "none",
          }}
        />
      )}

      {/* Layer 2: Radial gradients ──────────────── */}
      {gradients.map((g) => (
        <div key={g.key} className="absolute" style={g.style} />
      ))}

      {/* Layer 3: Nebula (dark) ────────────────── */}
      {!shouldReduceMotion &&
        !isLight &&
        nebulae.map((nebula) => (
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

      {/* Light sources ──────────────────────────── */}
      {lightSources.map((s) => (
        <div key={s.key} className="absolute" style={s.style} />
      ))}

      {/* Layer 4: Three independent star fields (dark) ── */}
      {!isLight &&
        starLayers.map((layer, li) => (
          <svg
            key={`star-layer-${li}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid slice"
            style={{ transform: shouldReduceMotion ? "none" : `translateY(${li * 4}px)` }}
            viewBox="0 0 1920 1080"
          >
            {layer.map((dot) =>
              dot.twinkle && !shouldReduceMotion ? (
                <motion.circle
                  key={dot.id}
                  animate={{
                    opacity: [dot.opacity, dot.opacity * 0.15, dot.opacity],
                  }}
                  cx={dot.x}
                  cy={dot.y}
                  fill="white"
                  initial={{ opacity: dot.opacity }}
                  r={dot.r}
                  transition={{
                    duration: dot.twinkleDuration,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: dot.twinkleDelay,
                  }}
                />
              ) : (
                <circle
                  key={dot.id}
                  cx={dot.x}
                  cy={dot.y}
                  fill="white"
                  opacity={dot.opacity}
                  r={dot.r}
                />
              ),
            )}
          </svg>
        ))}

      {/* Layer 5: Floating dust particles (light) ── */}
      {isLight && !shouldReduceMotion && (
        <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
          {dustParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
                background: "rgba(200,200,210,0.06)",
                filter: `blur(${p.blur}px)`,
                opacity: p.opacity,
                animation: `dust-float ${p.dur}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Layer 6: Paper grain (light) / Noise (dark) ── */}
      {isLight ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
            opacity: "0.015",
            backgroundBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 glass-noise-subtle" />
      )}

      {/* Layer 7: Vignette ──────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: isLight
            ? "radial-gradient(ellipse at center, transparent 40%, rgba(246,247,249,0.35) 100%)"
            : "radial-gradient(ellipse at center, transparent 30%, rgba(9,9,11,0.4) 100%)",
        }}
      />
    </div>
  );
}