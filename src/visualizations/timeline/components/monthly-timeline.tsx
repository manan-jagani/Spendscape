"use client";

import { area, curveMonotoneX } from "d3-shape";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { ChartTooltip } from "@/visualizations/lib/chart-tooltip";
import { useChartDimensions } from "@/visualizations/lib/chart-dimensions";
import { formatChartCurrency, formatChartDate } from "@/visualizations/lib/formats";
import type { DailyExpense } from "@/visualizations/lib/use-daily-expenses";
import { fillDailyData } from "@/visualizations/lib/use-daily-expenses";

const MARGIN = { top: 8, right: 8, bottom: 24, left: 48 };

export function MonthlyTimeline({
  data,
  year,
  month,
}: {
  data: DailyExpense[];
  year: number;
  month: number;
}) {
  const [containerRef, dimensions] = useChartDimensions();
  const [hovered, setHovered] = useState<{
    point: { date: Date; value: number };
    x: number;
    y: number;
  } | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { points, areaPath, maxValue, xScale } = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      return { points: [], areaPath: "", maxValue: 0, xScale: null, yScale: null };
    }

    const filled = fillDailyData(data, year, month);
    const pts = filled.map((d) => ({
      date: new Date(d.date + "T00:00:00"),
      value: d.total,
    }));

    const width = dimensions.width - MARGIN.left - MARGIN.right;
    const height = dimensions.height - MARGIN.top - MARGIN.bottom;

    const maxVal = Math.max(...pts.map((p) => p.value), 1);

    // D3 scales as simple linear mappings
    const xMin = new Date(year, month - 1, 1).getTime();
    const xMax = new Date(year, month, 0, 23, 59, 59).getTime();
    const getX = (date: Date) =>
      MARGIN.left + ((date.getTime() - xMin) / (xMax - xMin)) * width;
    const getY = (value: number) =>
      MARGIN.top + height - (value / maxVal) * height;

    // Generate area path using d3-shape
    const areaGenerator = area<{ date: Date; value: number }>()
      .x((d) => getX(d.date))
      .y0(height + MARGIN.top)
      .y1((d) => getY(d.value))
      .curve(curveMonotoneX);

    const path = areaGenerator(pts) || "";

    return {
      points: pts,
      areaPath: path,
      maxValue: maxVal,
      xScale: { min: xMin, max: xMax },
    };
  }, [data, year, month, dimensions]);

  const tickValues = useMemo(() => {
    if (!points.length) return [];
    const daysInMonth = new Date(year, month, 0).getDate();
    const ticks: Array<{ label: string; x: number }> = [];
    const width = dimensions.width - MARGIN.left - MARGIN.right;
    const xMin = new Date(year, month - 1, 1).getTime();
    const xMax = new Date(year, month, 0, 23, 59, 59).getTime();

    // Show ~5 ticks
    const step = Math.max(1, Math.floor(daysInMonth / 5));
    for (let d = 1; d <= daysInMonth; d += step) {
      const date = new Date(year, month - 1, d);
      const x = MARGIN.left + ((date.getTime() - xMin) / (xMax - xMin)) * width;
      ticks.push({
        label: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        x,
      });
    }
    return ticks;
  }, [points, year, month, dimensions]);

  const yTicks = useMemo(() => {
    if (!maxValue) return [];
    const height = dimensions.height - MARGIN.top - MARGIN.bottom;
    const ticks = [];
    const niceMax = Math.ceil(maxValue / 1000) * 1000 || 1000;
    const step = niceMax / 4;
    for (let v = 0; v <= niceMax; v += step) {
      const y = MARGIN.top + height - (v / niceMax) * height;
      ticks.push({ label: formatChartCurrency(v), y });
    }
    return ticks;
  }, [maxValue, dimensions]);

  if (data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-border/30 bg-background/20 text-sm text-muted-foreground backdrop-blur-sm">
        No transaction data for this period
      </div>
    );
  }

  return (
    <div className="relative min-h-[250px]" ref={containerRef}>
      <svg
        aria-label="Monthly spending timeline"
        height={dimensions.height}
        role="img"
        width={dimensions.width}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--expense)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--expense)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Y-axis ticks */}
        {yTicks.map((tick) => (
          <g key={`y-${tick.label}`}>
            <text
              fill="var(--muted-foreground)"
              fontSize={10}
              textAnchor="end"
              x={MARGIN.left - 4}
              y={tick.y + 3}
            >
              {tick.label}
            </text>
            <line
              stroke="var(--border)"
              strokeDasharray="2,2"
              strokeWidth={1}
              x1={MARGIN.left}
              x2={dimensions.width - MARGIN.right}
              y1={tick.y}
              y2={tick.y}
            />
          </g>
        ))}

        {/* Area fill */}
        <motion.path
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
          d={areaPath}
          fill="url(#areaGradient)"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
        />

        {/* Area stroke */}
        <motion.path
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
          d={areaPath}
          fill="none"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
          stroke="var(--expense)"
          strokeWidth={2}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: 0.1 }}
        />

        {/* Hover area */}
        {points.length > 1 && (
          <rect
            fill="transparent"
            height={dimensions.height - MARGIN.top - MARGIN.bottom}
            onMouseMove={(e) => {
              const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
              const mouseX = e.clientX - rect.left;
              const width = dimensions.width - MARGIN.left - MARGIN.right;
              const xMin = new Date(year, month - 1, 1).getTime();
              const xMax = new Date(year, month, 0, 23, 59, 59).getTime();
              const dataX = xMin + (mouseX / width) * (xMax - xMin);

              const closest = points.reduce<{
                point: (typeof points)[number];
                diff: number;
              }>(
                (best, p) => {
                  const diff = Math.abs(p.date.getTime() - dataX);
                  return diff < best.diff ? { point: p, diff } : best;
                },
                { point: points[0]!, diff: Infinity },
              );

              const getX = (date: Date) =>
                MARGIN.left + ((date.getTime() - xMin) / (xMax - xMin)) * width;
              const getY = (value: number) => {
                const height = dimensions.height - MARGIN.top - MARGIN.bottom;
                return MARGIN.top + height - (value / maxValue) * height;
              };

              setHovered({
                point: closest.point,
                x: rect.left + getX(closest.point.date),
                y: rect.top + getY(closest.point.value),
              });
            }}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "pointer" }}
            width={dimensions.width - MARGIN.left - MARGIN.right}
            x={MARGIN.left}
            y={MARGIN.top}
          />
        )}

        {/* Hover indicator */}
        {hovered && (
          <>
            <line
              stroke="var(--muted-foreground)"
              strokeDasharray="3,3"
              strokeWidth={1}
              x1={
                MARGIN.left +
                ((hovered.point.date.getTime() - (xScale?.min ?? 0)) /
                  ((xScale?.max ?? 1) - (xScale?.min ?? 0))) *
                  (dimensions.width - MARGIN.left - MARGIN.right)
              }
              x2={
                MARGIN.left +
                ((hovered.point.date.getTime() - (xScale?.min ?? 0)) /
                  ((xScale?.max ?? 1) - (xScale?.min ?? 0))) *
                  (dimensions.width - MARGIN.left - MARGIN.right)
              }
              y1={MARGIN.top}
              y2={dimensions.height - MARGIN.bottom}
            />
            <circle
              cx={
                MARGIN.left +
                ((hovered.point.date.getTime() - (xScale?.min ?? 0)) /
                  ((xScale?.max ?? 1) - (xScale?.min ?? 0))) *
                  (dimensions.width - MARGIN.left - MARGIN.right)
              }
              cy={
                MARGIN.top +
                (dimensions.height - MARGIN.top - MARGIN.bottom) -
                (hovered.point.value / (maxValue || 1)) *
                  (dimensions.height - MARGIN.top - MARGIN.bottom)
              }
              fill="var(--expense)"
              r={4}
              stroke="var(--card)"
              strokeWidth={2}
            />
          </>
        )}

        {/* X-axis ticks */}
        {tickValues.map((tick) => (
          <text
            fill="var(--muted-foreground)"
            fontSize={10}
            key={tick.label}
            textAnchor="middle"
            x={tick.x}
            y={dimensions.height - 4}
          >
            {tick.label}
          </text>
        ))}
      </svg>

      <ChartTooltip
        active={hovered !== null}
        parentRef={containerRef}
        position={hovered ? { x: hovered.x, y: hovered.y } : { x: 0, y: 0 }}
      >
        {hovered && (
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              {formatChartDate(hovered.point.date)}
            </p>
            <p className="text-muted-foreground">
              {formatChartCurrency(hovered.point.value)}
            </p>
          </div>
        )}
      </ChartTooltip>
    </div>
  );
}
