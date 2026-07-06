"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { MOTION_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

/* ─── Types ──────────────────────────────────────────────────── */

interface DailyDataPoint {
  date: string;
  total: number;
}

/* ─── Component ───────────────────────────────────────────────── */

export function CashFlowTrend({
  dailyExpenses,
}: {
  dailyExpenses: readonly DailyDataPoint[];
}) {
  const chartData = useMemo(() => {
    return dailyExpenses.slice(-30);
  }, [dailyExpenses]);

  const maxValue = useMemo(() => {
    return Math.max(...chartData.map((d) => Math.abs(d.total)), 1);
  }, [chartData]);

  if (chartData.length === 0) return null;

  const barWidth = Math.max(4, Math.min(12, 320 / chartData.length));

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          description="Daily spending trend (last 30 days)"
          title="Cash Flow"
        />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-[2px] h-24" role="img" aria-label="Daily spending trend chart">
          {chartData.map((d, i) => {
            const height = (Math.abs(d.total) / maxValue) * 100;
            const isPositive = d.total >= 0;

            return (
              <motion.div
                key={d.date}
                animate={{ height: `${Math.max(2, height)}%` }}
                className={cn(
                  "w-full rounded-sm transition-colors",
                  isPositive ? "bg-income/60" : "bg-expense/60",
                )}
                initial={{ height: "0%" }}
                style={{ maxWidth: barWidth }}
                title={`${d.date}: ${formatCurrency(d.total)}`}
                transition={{ ...MOTION_TRANSITION.fast, delay: i * 0.01 }}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
