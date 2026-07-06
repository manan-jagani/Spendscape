"use client";

import { treemap as d3Treemap, treemapSquarify } from "d3-hierarchy";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { ChartTooltip } from "@/visualizations/lib/chart-tooltip";
import { useChartDimensions } from "@/visualizations/lib/chart-dimensions";
import { formatChartCurrency, formatPercentage } from "@/visualizations/lib/formats";
import type { TreemapCategory, TreemapNode } from "@/visualizations/treemap/types";

const PADDING = 3;
const MIN_SIZE = 20;

interface HierarchyLeaf {
  data: TreemapCategory;
  value: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export function SpendingTreemap({
  categories,
}: {
  categories: readonly TreemapCategory[];
}) {
  const [containerRef, dimensions] = useChartDimensions();
  const [hovered, setHovered] = useState<{
    node: TreemapNode;
    x: number;
    y: number;
  } | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const nodes = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || categories.length === 0) {
      return [];
    }

    const root = {
      children: categories as TreemapCategory[],
      value: categories.reduce((s, c) => s + c.value, 0),
    };

    const layout = d3Treemap<TreemapCategory>()
      .size([dimensions.width, dimensions.height])
      .padding(PADDING)
      .round(true)
      .tile(treemapSquarify);

    const layoutRoot = layout(root as never);

    return (layoutRoot.leaves() as unknown as HierarchyLeaf[])
      .filter((n) => (n.x1 - n.x0) >= MIN_SIZE && (n.y1 - n.y0) >= MIN_SIZE)
      .map((n) => ({
        name: n.data.name,
        value: n.data.value,
        color: n.data.color,
        x: n.x0,
        y: n.y0,
        width: n.x1 - n.x0,
        height: n.y1 - n.y0,
      }));
  }, [categories, dimensions]);

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

  return (
    <div className="relative" ref={containerRef}>
      <svg
        aria-label="Spending treemap showing category distribution"
        height={dimensions.height}
        role="img"
        width={dimensions.width}
      >
        {nodes.map((node) => (
          <motion.rect
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1 }
            }
            className="cursor-pointer transition-transform duration-fast hover:scale-[1.02] motion-reduce:transition-none"
            fill={node.color || "hsl(var(--muted-foreground))"}
            height={node.height}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.8 }
            }
            key={node.name}
            onMouseEnter={(e) => {
              const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
              setHovered({
                node,
                x: rect.left + rect.width / 2,
                y: rect.top,
              });
            }}
            onMouseLeave={() => setHovered(null)}
            rx={4}
            ry={4}
            tabIndex={0}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            width={node.width}
            x={node.x}
            y={node.y}
            onFocus={(e) => {
              const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
              setHovered({
                node,
                x: rect.left + rect.width / 2,
                y: rect.top,
              });
            }}
            onBlur={() => setHovered(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setHovered(null);
            }}
          >
            <title>{`${node.name}: ${formatChartCurrency(node.value)}`}</title>
          </motion.rect>
        ))}
        {nodes.map((node) => {
          const fontSize = Math.min(node.width, node.height) / 4;
          if (fontSize < 8) return null;
          const maxChars = Math.floor((node.width - 12) / (fontSize * 0.6));
          const label = node.name.length <= maxChars ? node.name : node.name.slice(0, Math.max(0, maxChars - 1)) + "…";
          return (
            <motion.text
              animate={{ opacity: 1 }}
              fill="hsl(var(--card))"
              fontSize={fontSize}
              fontWeight={500}
              initial={{ opacity: 0 }}
              key={`label-${node.name}`}
              textAnchor="start"
              transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: 0.1 }}
              x={node.x + 6}
              y={node.y + fontSize + 4}
            >
              {label}
            </motion.text>
          );
        })}
      </svg>
      <ChartTooltip
        active={hovered !== null}
        parentRef={containerRef}
        position={hovered ? { x: hovered.x, y: hovered.y } : { x: 0, y: 0 }}
      >
        {hovered && (
          <div className="space-y-1">
            <p className="font-medium text-foreground">{hovered.node.name}</p>
            <p className="text-muted-foreground">
              {formatChartCurrency(hovered.node.value)}
            </p>
            <p className="text-muted-foreground">
              {formatPercentage((hovered.node.value / total) * 100)} of total
            </p>
          </div>
        )}
      </ChartTooltip>
    </div>
  );
}
