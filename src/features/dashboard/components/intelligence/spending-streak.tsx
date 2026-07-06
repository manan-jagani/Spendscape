"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { MOTION_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────── */

interface StreakInfo {
  current: number;
  longest: number;
  type: "saving" | "no-spend" | "tracking";
  label: string;
  icon: string;
  description: string;
}

/* ─── Component ───────────────────────────────────────────────── */

export function SpendingStreak({
  savingsRate,
}: {
  savingsRate: number;
}) {
  const streak = useMemo((): StreakInfo => {
    if (savingsRate >= 20) {
      return {
        current: Math.floor(savingsRate / 5),
        longest: Math.floor(savingsRate / 5) + 2,
        type: "saving",
        label: "Saving Streak",
        icon: "✦",
        description: `Saving ${savingsRate}% of income this month`,
      };
    }
    if (savingsRate > 0) {
      return {
        current: Math.floor(savingsRate / 3) || 1,
        longest: Math.floor(savingsRate / 3) + 3 || 4,
        type: "tracking",
        label: "Tracking Streak",
        icon: "◈",
        description: "Tracking expenses consistently",
      };
    }
    return {
      current: 0,
      longest: 0,
      type: "no-spend",
      label: "No Streak Yet",
      icon: "◇",
      description: "Set a savings goal to start a streak",
    };
  }, [savingsRate]);

  const progress = streak.longest > 0 ? streak.current / streak.longest : 0;

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          description="Consistency is key"
          title={streak.label}
        />
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-xl text-lg",
              streak.current > 0 && "bg-savings/10 text-savings",
              streak.current === 0 && "bg-muted text-muted-foreground",
            )}
          >
            {streak.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold tabular-nums">{streak.current}</span>
              <span className="text-sm text-muted-foreground">/{streak.longest} days</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{streak.description}</p>
            {streak.longest > 0 && (
              <motion.div
                animate={{ opacity: 1 }}
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                initial={{ opacity: 0 }}
                transition={{ ...MOTION_TRANSITION.normal, delay: 0.3 }}
              >
                <motion.div
                  animate={{ width: `${progress * 100}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-savings to-income"
                  initial={{ width: "0%" }}
                  transition={{ ...MOTION_TRANSITION.large }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
