"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { ChartTooltip } from "@/visualizations/lib/chart-tooltip";
import { useChartDimensions } from "@/visualizations/lib/chart-dimensions";
import { formatChartCurrency, formatChartDate } from "@/visualizations/lib/formats";
import type { DailyExpense } from "@/visualizations/lib/use-daily-expenses";

const CELL_SIZE = 14;
const CELL_GAP = 3;
const DAY_LABEL_WIDTH = 24;
const MONTH_LABEL_HEIGHT = 18;
const PADDING = 8;

export function CalendarHeatmap({
  data,
  months,
}: {
  data: DailyExpense[];
  months: number;
}) {
  const [containerRef, dimensions] = useChartDimensions();
  const [hovered, setHovered] = useState<{
    cell: { date: string; value: number };
    x: number;
    y: number;
  } | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const { cells, maxValue, monthLabels } = useMemo(() => {
    const dataMap = new Map(data.map((d) => [d.date, d.total]));
    const allCells: Array<{
      date: string;
      value: number;
      dayOfWeek: number;
      week: number;
      month: number;
      col: number;
      row: number;
    }> = [];
    const labels: Array<{ label: string; x: number }> = [];
    let maxVal = 0;

    let globalWeekOffset = 0;

    for (let m = 0; m < months; m++) {
      const targetMonth = currentMonth - m;
      const yearOffset = targetMonth <= 0 ? -1 : 0;
      const adjustedMonth = targetMonth <= 0 ? targetMonth + 12 : targetMonth;
      const y = currentYear + yearOffset;

      const daysInMonth = new Date(y, adjustedMonth, 0).getDate();
      const firstDayOfWeek = new Date(y, adjustedMonth - 1, 1).getDay();

      let lastDate: Date | null = null;

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${y}-${String(adjustedMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const date = new Date(dateStr + "T00:00:00");
        lastDate = date;
        const dayOfWeek = date.getDay();
        const dayOfMonth = date.getDate();
        const week = Math.floor((dayOfMonth - 1 + firstDayOfWeek) / 7);
        const value = dataMap.get(dateStr) ?? 0;

        if (value > maxVal) maxVal = value;

        allCells.push({
          date: dateStr,
          value,
          dayOfWeek,
          week: globalWeekOffset + week,
          month: adjustedMonth,
          col: globalWeekOffset + week,
          row: dayOfWeek,
        });
      }

      // Calculate total weeks for this month for label positioning
      const totalDays = daysInMonth + firstDayOfWeek;
      const totalWeeks = Math.ceil(totalDays / 7);
      labels.push({
        label: (lastDate ?? new Date()).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
        x: globalWeekOffset,
      });

      globalWeekOffset += totalWeeks + 1; // +1 gap between months
    }

    return { cells: allCells, maxValue: maxVal, monthLabels: labels };
  }, [data, months, currentYear, currentMonth]);

  const getCellColor = (value: number) => {
    if (value === 0) return "hsl(var(--muted))";
    const intensity = Math.min(value / (maxValue || 1), 1);
    const opacity = 0.2 + intensity * 0.8;
    return `hsla(var(--expense-hsl), ${opacity})`;
  };

  const totalWidth =
    PADDING * 2 + DAY_LABEL_WIDTH + (globalWeekCount(monthLabels) + months) * (CELL_SIZE + CELL_GAP);

  if (cells.length === 0) {
    return (
      <div className="flex min-h-[150px] items-center justify-center rounded-lg border border-border/30 bg-background/20 text-sm text-muted-foreground backdrop-blur-sm">
        No daily data to display
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto" ref={containerRef}>
      <svg
        aria-label="Spending calendar heatmap"
        height={
          PADDING * 2 + MONTH_LABEL_HEIGHT + 7 * (CELL_SIZE + CELL_GAP)
        }
        role="img"
        width={Math.max(totalWidth, dimensions.width || 400)}
      >
        {/* Month labels */}
        {monthLabels.map((ml) => (
          <text
            fill="hsl(var(--muted-foreground))"
            fontSize={10}
            key={`month-${ml.label}`}
            x={PADDING + DAY_LABEL_WIDTH + ml.x * (CELL_SIZE + CELL_GAP)}
            y={PADDING + MONTH_LABEL_HEIGHT - 4}
          >
            {ml.label}
          </text>
        ))}

        {/* Day labels */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
          <text
            fill="hsl(var(--muted-foreground))"
            fontSize={9}
            key={day}
            textAnchor="end"
            x={PADDING + DAY_LABEL_WIDTH - 4}
            y={PADDING + MONTH_LABEL_HEIGHT + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
          >
            {day}
          </text>
        ))}

        {/* Cells */}
        {cells.map((cell) => {
          const x =
            PADDING +
            DAY_LABEL_WIDTH +
            cell.col * (CELL_SIZE + CELL_GAP);
          const y =
            PADDING +
            MONTH_LABEL_HEIGHT +
            cell.row * (CELL_SIZE + CELL_GAP);

          return (
            <motion.rect
              animate={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }
              }
              fill={getCellColor(cell.value)}
              height={CELL_SIZE}
              initial={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }
              }
              key={cell.date}
              onMouseEnter={(e) => {
                const rect = (
                  e.currentTarget as SVGRectElement
                ).getBoundingClientRect();
                setHovered({
                  cell: { date: cell.date, value: cell.value },
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setHovered(null)}
              rx={3}
              ry={3}
              tabIndex={0}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.4,
              }}
              width={CELL_SIZE}
              x={x}
              y={y}
              onFocus={(e) => {
                const rect = (
                  e.currentTarget as SVGRectElement
                ).getBoundingClientRect();
                setHovered({
                  cell: { date: cell.date, value: cell.value },
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onBlur={() => setHovered(null)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setHovered(null);
              }}
            >
              <title>{`${cell.date}: ${formatChartCurrency(cell.value)}`}</title>
            </motion.rect>
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
            <p className="font-medium text-foreground">
              {formatChartDate(new Date(hovered.cell.date + "T00:00:00"))}
            </p>
            <p className="text-muted-foreground">
              {formatChartCurrency(hovered.cell.value)}
            </p>
          </div>
        )}
      </ChartTooltip>
    </div>
  );
}

function globalWeekCount(
  labels: Array<{ label: string; x: number }>,
): number {
  if (labels.length === 0) return 0;
  const last = labels[labels.length - 1]!;
  return last.x + 5;
}
