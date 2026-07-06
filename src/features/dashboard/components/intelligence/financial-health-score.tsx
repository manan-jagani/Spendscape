"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useMemo } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { MOTION_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { MonthlySummary } from "@/types/api.types";

/* ─── Types ──────────────────────────────────────────────────── */

interface BudgetItem {
  id: string;
  progress: number;
}

interface AccountItem {
  current_balance: number;
  id: string;
  type: string;
}

interface Contributor {
  key: string;
  label: string;
  score: number;
  max: number;
  color: "income" | "savings" | "transfer" | "expense";
}

interface HealthResult {
  contributors: Contributor[];
  label: string;
  labelTone: "income" | "savings" | "warning" | "expense";
  score: number;
}

/* ─── Score calculation ──────────────────────────────────────── */

function computeHealth(
  summary: MonthlySummary,
  budgets: readonly BudgetItem[],
  accounts: readonly AccountItem[],
): HealthResult {
  const savingsRaw = Math.min(summary.savings_rate, 50);
  const savingsScore = Math.round((savingsRaw / 50) * 35);

  const onTrack = budgets.filter((b) => b.progress < 100).length;
  const totalBudgets = budgets.length;
  const disciplineScore = totalBudgets > 0 ? Math.round((onTrack / totalBudgets) * 25) : 15;

  const cashRatio = summary.income > 0 ? summary.net / summary.income : 0;
  const cashScore = Math.round(Math.min(Math.max(cashRatio, 0), 0.5) * 25);

  const monthlyExpense = summary.expense || 1;
  const savingsBalance = accounts
    .filter((a) => a.type === "savings")
    .reduce((s, a) => s + a.current_balance, 0);
  const monthsCovered = savingsBalance / monthlyExpense;
  const emergencyScore = Math.round(Math.min(monthsCovered / 6, 1) * 15);

  const total = Math.min(savingsScore + disciplineScore + cashScore + emergencyScore, 100);

  return {
    contributors: [
      { key: "savings", label: "Savings Rate", score: savingsScore, max: 35, color: "savings" },
      { key: "discipline", label: "Budget Discipline", score: disciplineScore, max: 25, color: "income" },
      { key: "cashflow", label: "Cash Flow", score: cashScore, max: 25, color: "transfer" },
      { key: "emergency", label: "Emergency Fund", score: emergencyScore, max: 15, color: "expense" },
    ],
    label: total >= 80 ? "Excellent" : total >= 60 ? "Good" : total >= 40 ? "Fair" : "Needs Attention",
    labelTone: total >= 80 ? "savings" : total >= 60 ? "income" : total >= 40 ? "warning" : "expense",
    score: total,
  };
}

/* ─── Animated counter ────────────────────────────────────────── */

function AnimatedCounter({
  from = 0,
  to,
  duration = 0.8,
}: {
  duration?: number;
  from?: number;
  to: number;
}) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, Math.round);
  const reduce = !!useReducedMotion();

  useEffect(() => {
    if (reduce) {
      count.set(to);
      return;
    }
    count.set(from);
    const controls = animate(count, to, { duration, ease: MOTION_TRANSITION.normal.ease as [number, number, number, number] });
    return () => controls.stop();
  }, [count, from, to, duration, reduce]);

  return <motion.span>{rounded}</motion.span>;
}

/* ─── Ring progress ──────────────────────────────────────────── */

function ProgressRing({
  className,
  score,
  size = 140,
  strokeWidth = 8,
}: {
  className?: string;
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const reduce = !!useReducedMotion();
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 80
      ? "stroke-savings"
      : score >= 60
        ? "stroke-income"
        : score >= 40
          ? "stroke-warning"
          : "stroke-expense";

  return (
    <svg
      aria-hidden="true"
      className={cn("shrink-0", className)}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        fill="none"
        r={r}
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        animate={{ strokeDashoffset: offset }}
        cx={size / 2}
        cy={size / 2}
        fill="none"
        initial={{ strokeDashoffset: reduce ? offset : circ }}
        r={r}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        className={color}
        style={{ strokeDasharray: circ, rotate: "-90deg", transformOrigin: "center" }}
        transition={reduce ? { duration: 0 } : { ...MOTION_TRANSITION.large, delay: 0.3 }}
      />
    </svg>
  );
}

/* ─── Component ───────────────────────────────────────────────── */

export function FinancialHealthScore({
  accounts,
  budgets,
  summary,
}: {
  accounts: readonly AccountItem[];
  budgets: readonly BudgetItem[];
  summary: MonthlySummary;
}) {
  const health = useMemo(() => computeHealth(summary, budgets, accounts), [summary, budgets, accounts]);

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          description="Your financial wellness score"
          title="Financial Health"
        />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-5">
          {/* Ring + score */}
          <div className="relative flex items-center justify-center">
            <ProgressRing score={health.score} />
            <div className="absolute flex flex-col items-center">
              <span className="font-heading text-4xl font-medium tracking-tight tabular-nums">
                <AnimatedCounter to={health.score} />
              </span>
              <span
                className={cn(
                  "mt-0.5 text-xs font-medium tracking-wide",
                  health.labelTone === "savings" && "text-savings",
                  health.labelTone === "income" && "text-income",
                  health.labelTone === "warning" && "text-warning",
                  health.labelTone === "expense" && "text-expense",
                )}
              >
                {health.label}
              </span>
            </div>
          </div>

          {/* Contributors */}
          <ul className="w-full space-y-2.5">
            {health.contributors.map((c) => (
              <li key={c.key} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      c.color === "savings" && "bg-savings",
                      c.color === "income" && "bg-income",
                      c.color === "transfer" && "bg-transfer",
                      c.color === "expense" && "bg-expense",
                    )}
                  />
                  <span className="font-medium text-foreground">{c.label}</span>
                </div>
                <span className="tabular-nums text-muted-foreground">
                  {c.score}/{c.max}
                </span>
              </li>
            ))}
          </ul>

          {/* Mini bar indicators */}
          <div className="flex w-full gap-1.5">
            {health.contributors.map((c) => (
              <div
                key={c.key}
                className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label={`${c.label}: ${c.score}/${c.max}`}
                aria-valuemax={c.max}
                aria-valuemin={0}
                aria-valuenow={c.score}
              >
                <motion.div
                  animate={{ width: `${(c.score / c.max) * 100}%` }}
                  className={cn(
                    "h-full rounded-full transition-colors",
                    c.color === "savings" && "bg-savings",
                    c.color === "income" && "bg-income",
                    c.color === "transfer" && "bg-transfer",
                    c.color === "expense" && "bg-expense",
                  )}
                  initial={{ width: 0 }}
                  transition={{ ...MOTION_TRANSITION.normal, delay: 0.5 + health.contributors.indexOf(c) * 0.1 }}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
