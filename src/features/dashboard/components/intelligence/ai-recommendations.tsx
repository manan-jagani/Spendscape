"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { MOTION_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { InsightRow } from "@/features/insights/types";

/* ─── Types ──────────────────────────────────────────────────── */

interface Recommendation {
  icon: string;
  key: string;
  title: string;
  reason: string;
  impact: string;
  tone: "income" | "expense" | "savings" | "transfer";
}

/* ─── Icon map ────────────────────────────────────────────────── */

const INSIGHT_ICON: Record<string, string> = {
  pattern: "◈",
  anomaly: "⚠",
  forecast: "▸",
  achievement: "✦",
  subscription: "↻",
};

const INSIGHT_TONE: Record<string, Recommendation["tone"]> = {
  pattern: "transfer",
  anomaly: "expense",
  forecast: "savings",
  achievement: "income",
  subscription: "expense",
};

/* ─── Component ───────────────────────────────────────────────── */

export function AIRecommendations({
  insights,
}: {
  insights: readonly InsightRow[];
}) {
  const reduce = !!useReducedMotion();

  const recommendations = useMemo(() => {
    return insights
      .filter((i) => !i.is_read)
      .slice(0, 5)
      .map((i): Recommendation => ({
        icon: INSIGHT_ICON[i.kind] ?? "◇",
        key: i.id,
        title: i.title,
        reason: i.body,
        impact: i.data && typeof i.data === "object" && "impact" in (i.data as Record<string, unknown>)
          ? ((i.data as Record<string, string>).impact ?? "Track your progress")
          : "Track your progress",
        tone: INSIGHT_TONE[i.kind] ?? "transfer",
      }));
  }, [insights]);

  if (recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          description="Personalized suggestions for your finances"
          title="Recommendations"
        />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {recommendations.map((r, i) => (
            <motion.li
              key={r.key}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-start gap-3 rounded-lg p-3 transition-colors duration-fast ease-standard motion-reduce:transition-none",
                "hover:bg-muted/30",
              )}
              initial={reduce ? { opacity: 1 } : { opacity: 0, x: -8 }}
              transition={{ ...MOTION_TRANSITION.normal, delay: i * 0.06 }}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-md text-xs",
                  r.tone === "income" && "bg-income/10 text-income",
                  r.tone === "expense" && "bg-expense/10 text-expense",
                  r.tone === "savings" && "bg-savings/10 text-savings",
                  r.tone === "transfer" && "bg-transfer/10 text-transfer",
                )}
              >
                {r.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {r.reason}
                </p>
                <p className="mt-1 text-xs font-medium text-savings">
                  {r.impact}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
