"use client";

import {
  forceSimulation,
  forceCollide,
  forceManyBody,
  forceCenter,
  forceX,
  forceY,
} from "d3-force";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  CircleDollarSign,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Plane,
  Receipt,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import { SPRING } from "@/lib/motion";
import { ChartTooltip } from "@/visualizations/lib/chart-tooltip";
import { useChartDimensions } from "@/visualizations/lib/chart-dimensions";
import { formatChartCurrency, formatPercentage } from "@/visualizations/lib/formats";
import type { TreemapCategory } from "@/visualizations/treemap/types";

const RADIUS_MIN = 32;
const RADIUS_MAX = 78;
const STAR_COUNT = 55;
const PARTICLE_COUNT = 35;

const CATEGORY_COLORS: Record<string, string> = {
  food: "var(--color-amber-500)",
  dining: "var(--color-amber-500)",
  groceries: "var(--color-amber-500)",
  restaurant: "var(--color-amber-500)",
  shopping: "var(--color-rose-500)",
  retail: "var(--color-rose-500)",
  clothing: "var(--color-rose-500)",
  bills: "var(--color-blue-500)",
  utilities: "var(--color-blue-500)",
  rent: "var(--color-blue-500)",
  mortgage: "var(--color-blue-500)",
  health: "var(--color-emerald-500)",
  medical: "var(--color-emerald-500)",
  pharmacy: "var(--color-emerald-500)",
  fitness: "var(--color-emerald-500)",
  entertainment: "var(--color-violet-500)",
  movies: "var(--color-violet-500)",
  games: "var(--color-violet-500)",
  travel: "var(--color-orange-500)",
  transport: "var(--color-orange-500)",
  flights: "var(--color-orange-500)",
  hotel: "var(--color-orange-500)",
  education: "var(--color-indigo-500)",
  tuition: "var(--color-indigo-500)",
  books: "var(--color-indigo-500)",
  courses: "var(--color-indigo-500)",
  investments: "var(--color-yellow-500)",
  stocks: "var(--color-yellow-500)",
  dividend: "var(--color-yellow-500)",
  salary: "var(--color-teal-500)",
  income: "var(--color-teal-500)",
};

const DEFAULT_COLOR = "var(--color-neutral-500)";

function getCategoryColor(name: string): string {
  const normalized = name.toLowerCase().trim();
  const firstWord = normalized.split(/\s+/)[0] ?? "";
  return CATEGORY_COLORS[firstWord] ?? CATEGORY_COLORS[normalized] ?? DEFAULT_COLOR;
}

function CategoryIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const key = name.toLowerCase().trim();
  const firstWord = key.split(/\s+/)[0] ?? "";
  const lookup = firstWord || key;

  switch (lookup) {
    case "food": case "dining": case "groceries": case "restaurant":
      return <UtensilsCrossed className={className} style={style} />;
    case "shopping": case "retail": case "clothing":
      return <ShoppingBag className={className} style={style} />;
    case "bills": case "utilities": case "rent": case "mortgage":
      return <Receipt className={className} style={style} />;
    case "health": case "medical": case "pharmacy": case "fitness":
      return <HeartPulse className={className} style={style} />;
    case "entertainment": case "movies": case "games":
      return <Gamepad2 className={className} style={style} />;
    case "travel": case "transport": case "flights": case "hotel":
      return <Plane className={className} style={style} />;
    case "education": case "tuition": case "books": case "courses":
      return <GraduationCap className={className} style={style} />;
    case "investments": case "stocks": case "dividend": case "salary": case "income":
      return <TrendingUp className={className} style={style} />;
    default:
      return <CircleDollarSign className={className} style={style} />;
  }
}

function createPRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function clampPRNG(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

interface LayoutNode {
  name: string;
  value: number;
  color: string;
  x: number;
  y: number;
  radius: number;
  percentage: number;
  displayAmount: string;
  displayPercentage: string;
  iconSize: number;
  showName: boolean;
  showAmount: boolean;
  showPercentage: boolean;
}

function useForceLayout(
  categories: readonly TreemapCategory[],
  width: number,
  height: number,
): LayoutNode[] {
  return useMemo(() => {
    if (width === 0 || height === 0 || categories.length === 0) return [];

    const centerX = width / 2;
    const centerY = height / 2;
    const total = categories.reduce((s, c) => s + c.value, 0);
    const maxValue = Math.max(...categories.map((c) => c.value), 1);

    interface ForceNode {
      name: string;
      value: number;
      color: string;
      radius: number;
      percentage: number;
      index?: number;
      x?: number;
      y?: number;
      vx?: number;
      vy?: number;
    }

    const initialRadius = Math.min(width, height) * 0.3;
    const nodes: ForceNode[] = categories.map((c, i) => {
      const angle = (i / categories.length) * 2 * Math.PI - Math.PI / 2;
      const radiusVal =
        RADIUS_MIN + (c.value / maxValue) * (RADIUS_MAX - RADIUS_MIN);
      return {
        name: c.name,
        value: c.value,
        color: getCategoryColor(c.name),
        radius: radiusVal,
        percentage: total > 0 ? (c.value / total) * 100 : 0,
        x: centerX + Math.cos(angle) * initialRadius,
        y: centerY + Math.sin(angle) * initialRadius,
      };
    });

    const sim = forceSimulation<ForceNode>(nodes)
      .force(
        "charge",
        forceManyBody<ForceNode>().strength((d) => -(d.radius * 5)),
      )
      .force(
        "collide",
        forceCollide<ForceNode>().radius((d) => d.radius + 8),
      )
      .force("center", forceCenter<ForceNode>(centerX, centerY))
      .force("x", forceX<ForceNode>(centerX).strength(0.06))
      .force("y", forceY<ForceNode>(centerY).strength(0.06))
      .stop();

    for (let i = 0; i < 200; i++) sim.tick();

    const padding = 12;
    return nodes.map((d) => {
      const clampedX = Math.max(
        d.radius + padding,
        Math.min(width - d.radius - padding, d.x ?? centerX),
      );
      const clampedY = Math.max(
        d.radius + padding,
        Math.min(height - d.radius - padding, d.y ?? centerY),
      );
      const sizeTier =
        d.radius >= 60 ? "large" : d.radius >= 45 ? "medium" : "small";

      return {
        name: d.name,
        value: d.value,
        color: d.color,
        x: clampedX,
        y: clampedY,
        radius: d.radius,
        percentage: d.percentage,
        displayAmount: formatChartCurrency(d.value),
        displayPercentage: formatPercentage(d.percentage),
        iconSize: sizeTier === "large" ? 20 : 16,
        showName: sizeTier !== "small",
        showAmount: sizeTier === "large",
        showPercentage: sizeTier === "large",
      };
    });
  }, [categories, width, height]);
}

function useConstellationData(width: number, height: number) {
  return useMemo(() => {
    const rng = createPRNG(42);
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      cx: clampPRNG(rng, 0, width),
      cy: clampPRNG(rng, 0, height),
      r: clampPRNG(rng, 0.3, 1.8),
      opacity: clampPRNG(rng, 0.15, 0.7),
      twinkleDelay: clampPRNG(rng, 0, 6),
      twinkleDuration: clampPRNG(rng, 2, 5),
    }));

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: clampPRNG(rng, 0, width),
      y: clampPRNG(rng, 0, height),
      dx: clampPRNG(rng, -60, 60),
      dy: clampPRNG(rng, -60, 60),
      r: clampPRNG(rng, 1, 2.5),
      delay: clampPRNG(rng, 0, 12),
      duration: clampPRNG(rng, 8, 18),
    }));

    const ambientGlows = Array.from({ length: 3 }, () => ({
      cx: clampPRNG(rng, width * 0.15, width * 0.85),
      cy: clampPRNG(rng, height * 0.15, height * 0.85),
      r: clampPRNG(rng, 60, 150),
      opacity: clampPRNG(rng, 0.04, 0.1),
    }));

    return { stars, particles, ambientGlows };
  }, [width, height]);
}

function ConstellationBackground({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const data = useConstellationData(width, height);

  return (
    <g>
      <defs>
        <radialGradient id="nebula-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="oklch(0.7 0.05 280 / 0.12)" />
          <stop offset="50%" stopColor="oklch(0.5 0.03 260 / 0.06)" />
          <stop offset="100%" stopColor="oklch(0 0 0 / 0)" />
        </radialGradient>
        <radialGradient id="nebula-bg-light" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="oklch(0.8 0.04 200 / 0.08)" />
          <stop offset="100%" stopColor="oklch(0 0 0 / 0)" />
        </radialGradient>
        <linearGradient id="node-shade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0 0 0 / 0)" />
          <stop offset="100%" stopColor="oklch(0 0 0 / 0.25)" />
        </linearGradient>
        <linearGradient id="node-highlight" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(1 0 0 / 0.2)" />
          <stop offset="100%" stopColor="oklch(1 0 0 / 0)" />
        </linearGradient>
        <filter id="node-glow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="node-shadow">
          <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="oklch(0 0 0 / 0.3)" />
        </filter>
      </defs>

      <rect fill="var(--background)" height={height} width={width} />

      <rect fill="url(#nebula-bg)" height={height} width={width} />
      <rect
        className="hidden dark:block"
        fill="url(#nebula-bg)"
        height={height}
        width={width}
      />
      <rect
        className="block dark:hidden"
        fill="url(#nebula-bg-light)"
        height={height}
        width={width}
      />

      {data.ambientGlows.map((g, i) => (
        <circle
          cx={g.cx}
          cy={g.cy}
          fill="oklch(0.5 0.1 260 / 0.06)"
          key={`glow-${i}`}
          opacity={g.opacity}
          r={g.r}
        />
      ))}

      <style>{`
        @keyframes const-twinkle {
          0%, 100% { opacity: var(--star-opacity); }
          50% { opacity: calc(var(--star-opacity) * 0.2); }
        }
        .const-star {
          animation: const-twinkle var(--twinkle-dur) ease-in-out var(--twinkle-delay) infinite;
        }
        @keyframes const-particle {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translate(var(--pdx), var(--pdy)); opacity: 0; }
        }
        .const-particle {
          animation: const-particle var(--particle-dur) ease-in-out var(--particle-delay) infinite;
        }
        @keyframes const-node-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        .const-node-float {
          animation: const-node-float var(--float-dur) ease-in-out var(--float-delay) infinite;
        }
        @keyframes const-pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.15; }
        }
        .const-pulse-ring {
          animation: const-pulse-ring 2s ease-in-out infinite;
        }
      `}</style>

      {data.stars.map((s, i) => (
        <circle
          className="const-star"
          cx={s.cx}
          cy={s.cy}
          fill="oklch(1 0 0 / 0.6)"
          key={`star-${i}`}
          r={s.r}
          style={
            {
              "--star-opacity": s.opacity,
              "--twinkle-dur": `${s.twinkleDuration}s`,
              "--twinkle-delay": `${s.twinkleDelay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {data.particles.map((p, i) => (
        <circle
          className="const-particle"
          cx={p.x}
          cy={p.y}
          fill="oklch(0.6 0.08 260 / 0.3)"
          key={`particle-${i}`}
          r={p.r}
          style={
            {
              "--pdx": `${p.dx}px`,
              "--pdy": `${p.dy}px`,
              "--particle-dur": `${p.duration}s`,
              "--particle-delay": `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </g>
  );
}

function ConstellationConnectingLines({
  hoveredIndex,
  nodes,
}: {
  hoveredIndex: number | null;
  nodes: LayoutNode[];
}) {
  if (hoveredIndex === null) return null;

  const hovered = nodes[hoveredIndex];
  if (!hovered) return null;

  const nearbyNodes = nodes.filter(
    (n, i) =>
      i !== hoveredIndex &&
      Math.hypot(n.x - hovered.x, n.y - hovered.y) < 200,
  );

  return (
    <g>
      {nearbyNodes.map((n, i) => {
        const dx = n.x - hovered.x;
        const dy = n.y - hovered.y;
        const dist = Math.hypot(dx, dy);
        const nx = dx / dist;
        const ny = dy / dist;
        const x1 = hovered.x + nx * hovered.radius;
        const y1 = hovered.y + ny * hovered.radius;
        const x2 = n.x - nx * n.radius;
        const y2 = n.y - ny * n.radius;

        return (
          <motion.line
            animate={{ opacity: 0.15 + (1 - Math.min(dist / 200, 1)) * 0.25 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key={`line-${i}`}
            stroke={hovered.color === "var(--color-neutral-500)" ? "oklch(0.6 0 0 / 0.3)" : hovered.color}
            strokeWidth={0.5}
            transition={{ duration: 0.3, ease: "easeOut" }}
            x1={x1}
            x2={x2}
            y1={y1}
            y2={y2}
          />
        );
      })}
    </g>
  );
}

function SingleCategoryNode({
  category,
  total,
}: {
  category: TreemapCategory;
  total: number;
}) {
  const color = getCategoryColor(category.name);

  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center gap-4">
      <div
        className="flex size-20 items-center justify-center rounded-full"
        style={{ backgroundColor: `oklch(from ${color} l c h / 0.15)` }}
      >
        <CategoryIcon name={category.name} className="size-8" style={{ color }} />
      </div>
      <p className="text-lg font-semibold text-foreground">{category.name}</p>
      <p className="text-3xl font-bold text-foreground">
        {formatChartCurrency(total)}
      </p>
      <p className="text-sm text-muted-foreground">
        All spending in this category
      </p>
    </div>
  );
}

export function SpendingTreemap({
  categories,
}: {
  categories: readonly TreemapCategory[];
}) {
  const [containerRef, dimensions] = useChartDimensions();
  const [hovered, setHovered] = useState<{
    node: LayoutNode;
    x: number;
    y: number;
    nodeIndex: number;
  } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const nodes = useForceLayout(categories, dimensions.width, dimensions.height);
  const total = useMemo(
    () => categories.reduce((s, c) => s + c.value, 0),
    [categories],
  );

  if (categories.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-border/30 bg-background/20 text-sm text-muted-foreground backdrop-blur-sm">
        No spending data to display
      </div>
    );
  }

  if (categories.length === 1) {
    return (
      <div className="relative min-h-[250px]" ref={containerRef}>
        <SingleCategoryNode category={categories[0]!} total={total} />
      </div>
    );
  }

  const handleMouseEnter = (e: React.MouseEvent, node: LayoutNode, index: number) => {
    const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
    setHovered({
      node,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      nodeIndex: index,
    });
  };

  const handleMouseLeave = () => setHovered(null);

  return (
    <div className="relative min-h-[250px]" ref={containerRef}>
      <svg
        aria-label="Category constellation showing spending distribution"
        height={dimensions.height}
        role="img"
        width={dimensions.width}
      >
        <ConstellationBackground
          height={dimensions.height}
          width={dimensions.width}
        />

        <ConstellationConnectingLines
          hoveredIndex={hovered?.nodeIndex ?? null}
          nodes={nodes}
        />

        {nodes.map((node, i) => {
          const floatDelay = (i * 0.21) % 4;
          const floatDuration = 3.5 + (i % 3) * 0.6;

          const nameMaxChars = Math.max(
            1,
            Math.floor((node.radius * 1.6) / (node.radius >= 60 ? 7 : 6)),
          );
          const displayName =
            node.name.length > nameMaxChars
              ? node.name.slice(0, Math.max(2, nameMaxChars - 1)) + "\u2026"
              : node.name;

          return (
            <motion.g
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              className="cursor-pointer"
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.3, y: 40 }
              }
              key={`${node.name}-${i}`}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSelectedIndex(null);
                  handleMouseLeave();
                }
              }}
              onClick={() =>
                setSelectedIndex(selectedIndex === i ? null : i)
              }
              onMouseEnter={(e) => handleMouseEnter(e, node, i)}
              onMouseLeave={handleMouseLeave}
              role="img"
              style={{ originX: `${node.x}px`, originY: `${node.y}px` }}
              tabIndex={0}
              transition={{
                opacity: {
                  duration: shouldReduceMotion ? 0 : 0.6,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.05,
                },
                scale: { ...SPRING.card, delay: i * 0.05 },
                y: { ...SPRING.gentle, delay: i * 0.05 },
                default: { ...SPRING.card },
              }}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: 1.05,
                      y: -4,
                      transition: SPRING.card,
                    }
              }
              whileFocus={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: 1.05,
                      y: -4,
                      transition: SPRING.card,
                    }
              }
            >
              <g
                className="const-node-float"
                style={
                  {
                    "--float-dur": `${floatDuration}s`,
                    "--float-delay": `${floatDelay}s`,
                  } as React.CSSProperties
                }
              >
                {selectedIndex === i && (
                  <circle
                    className="const-pulse-ring"
                    cx={node.x}
                    cy={node.y}
                    fill="none"
                    r={node.radius + 6}
                    stroke={node.color}
                    strokeWidth={2.5}
                  />
                )}

                {selectedIndex !== i && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    fill="oklch(0 0 0 / 0.2)"
                    filter="url(#node-shadow)"
                    r={node.radius}
                    transform={`translate(${2}, ${4})`}
                  />
                )}

                <circle
                  cx={node.x}
                  cy={node.y}
                  fill={node.color}
                  filter={selectedIndex === i ? "url(#node-glow)" : undefined}
                  opacity={selectedIndex === i ? 1 : 0.15}
                  r={node.radius * 1.3}
                />

                <circle
                  cx={node.x}
                  cy={node.y}
                  fill={node.color}
                  r={node.radius}
                />

                <circle
                  cx={node.x}
                  cy={node.y}
                  fill="url(#node-shade)"
                  r={node.radius}
                />

                <circle
                  cx={node.x - node.radius * 0.25}
                  cy={node.y - node.radius * 0.25}
                  fill="url(#node-highlight)"
                  r={node.radius * 0.7}
                />

                <path
                  d={`M ${node.x - node.radius * 0.75} ${node.y - node.radius * 0.2} Q ${node.x} ${node.y - node.radius * 1.1} ${node.x + node.radius * 0.75} ${node.y - node.radius * 0.2}`}
                  fill="none"
                  stroke="oklch(1 0 0 / 0.06)"
                  strokeWidth={node.radius * 0.15}
                  strokeLinecap="round"
                />

                <circle
                  cx={node.x}
                  cy={node.y}
                  fill="oklch(1 0 0 / 0.04)"
                  r={node.radius}
                />

                <circle
                  cx={node.x}
                  cy={node.y}
                  fill="none"
                  r={node.radius}
                  stroke="oklch(1 0 0 / 0.08)"
                  strokeWidth={0.5}
                />

                <foreignObject
                  height={node.iconSize + 4}
                  style={{ overflow: "visible" }}
                  width={node.iconSize + 4}
                  x={node.x - (node.iconSize + 4) / 2}
                  y={
                    node.y -
                    node.iconSize / 2 -
                    (node.showName || node.showAmount ? 4 : 0)
                  }
                >
                  <span
                    className="flex items-center justify-center"
                    style={{ height: node.iconSize + 4, width: node.iconSize + 4 }}
                  >
                    <CategoryIcon
                      name={node.name}
                      className="size-4"
                      style={{ color: "oklch(1 0 0 / 0.9)" }}
                    />
                  </span>
                </foreignObject>

                {node.showName && (
                  <text
                    fill="oklch(1 0 0 / 0.75)"
                    fontSize={node.radius >= 60 ? 11 : 9}
                    fontWeight={500}
                    textAnchor="middle"
                    x={node.x}
                    y={node.y + node.radius * 0.32}
                  >
                    {displayName}
                  </text>
                )}

                {node.showAmount && (
                  <text
                    fill="oklch(1 0 0 / 0.95)"
                    fontSize={15}
                    fontWeight={700}
                    textAnchor="middle"
                    x={node.x}
                    y={node.y + node.radius * 0.52}
                  >
                    {node.displayAmount}
                  </text>
                )}

                {node.showPercentage && (
                  <text
                    fill="oklch(1 0 0 / 0.5)"
                    fontSize={10}
                    fontWeight={500}
                    textAnchor="middle"
                    x={node.x}
                    y={node.y + node.radius * 0.65}
                  >
                    {node.displayPercentage}
                  </text>
                )}
              </g>
            </motion.g>
          );
        })}
      </svg>

      <ChartTooltip
        active={hovered !== null}
        parentRef={containerRef}
        position={hovered ? { x: hovered.x, y: hovered.y } : { x: 0, y: 0 }}
      >
        {hovered && (
          <div className="w-48 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: hovered.node.color }}
              />
              <p className="text-sm font-medium text-foreground">
                {hovered.node.name}
              </p>
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatChartCurrency(hovered.node.value)}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background/20">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${hovered.node.percentage}%`,
                    backgroundColor: hovered.node.color,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {formatPercentage(hovered.node.percentage)}
              </span>
            </div>
          </div>
        )}
      </ChartTooltip>
    </div>
  );
}
