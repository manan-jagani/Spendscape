"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { MOTION_TRANSITION } from "@/lib/motion";
import { formatCurrency } from "@/lib/formatters";
import type { MonthlySummary } from "@/types/api.types";

/* ─── Types ──────────────────────────────────────────────────── */

interface TopCategory {
  name: string;
  amount: number;
  budget: number;
  color: string;
}

/* ─── Component ───────────────────────────────────────────────── */

export function TopCategories({
  summary,
}: {
  summary: MonthlySummary;
}) {
  const reduce = !!useReducedMotion();

  const categories = useMemo(() => {
    const cats = (summary.categories ?? [])
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((c): TopCategory => ({
        name: c.category_name ?? "Uncategorized",
        amount: c.total,
        budget: 0,
        color: c.color ?? "var(--muted-foreground)",
      }));

    return cats;
  }, [summary]);

  if (categories.length === 0) return null;

  const maxAmount = categories[0]?.amount ?? 1;

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          description="Where your money went this month"
          title="Top Categories"
        />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          {categories.map((c, i) => (
            <motion.li
              key={c.name}
              animate={{ opacity: 1, x: 0 }}
              initial={reduce ? { opacity: 1 } : { opacity: 0, x: -8 }}
              transition={{ ...MOTION_TRANSITION.fast, delay: i * 0.05 }}
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="block size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-sm font-medium">{c.name}</span>
                </div>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {formatCurrency(c.amount)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  animate={{ width: `${(c.amount / maxAmount) * 100}%` }}
                  className="h-full rounded-full"
                  initial={{ width: "0%" }}
                  style={{ backgroundColor: c.color }}
                  transition={{ ...MOTION_TRANSITION.normal, delay: i * 0.05 }}
                />
              </div>
              {c.budget > 0 && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatCurrency(c.budget)} budgeted
                </p>
              )}
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
