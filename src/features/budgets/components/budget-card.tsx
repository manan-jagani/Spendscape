"use client";

import { memo, useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PremiumHover } from "@/components/motion/premium-hover";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

import type { BudgetRow } from "@/features/budgets/types";
import {
  BUDGET_STATUS_CONFIG,
  getBudgetStatus,
  getDailyAllowance,
  getDaysRemaining,
  getRemainingSafeSpending,
} from "@/features/budgets/types";

interface BudgetCardProps {
  budget: BudgetRow & { categories?: { name: string; icon?: string; color?: string } | null };
  spent: number;
  periodName: string;
  onEdit: (budget: BudgetRow) => void;
  onDelete: (budget: BudgetRow) => void;
  onArchive?: (budget: BudgetRow) => void;
}

function Sparkline({ data, accentColor }: { data: number[]; accentColor: string }) {
  if (data.length === 0) return null;
  const width = 56;
  const height = 24;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  });
  const pathD = `M${points.join(" L")}`;

  return (
    <svg aria-hidden="true" className="shrink-0" height={height} width={width}>
      <defs>
        <linearGradient id={`sparkline-budget-${accentColor.replace(/\W/g, "")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${pathD} L${width},${height} L0,${height} Z`} fill={`url(#sparkline-budget-${accentColor.replace(/\W/g, "")})`} />
      <path d={pathD} fill="none" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useAnimatedNumber(target: number, duration = 500) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = value;
    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - t) * (1 - t);
      setValue(from + (target - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

export const BudgetCard = memo(function BudgetCard({
  budget,
  spent,
  periodName,
  onEdit,
  onDelete,
  onArchive,
}: BudgetCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const categoryName = budget.categories?.name ?? "Uncategorized";
  const progress = budget.amount > 0
    ? Math.min(Math.round((spent / budget.amount) * 100), 100)
    : 0;
  const remaining = Math.max(budget.amount - spent, 0);
  const status = getBudgetStatus(progress);
  const config = BUDGET_STATUS_CONFIG[status];
  const daysRemaining = getDaysRemaining(budget.start_date, budget.period);
  const dailyAllowance = getDailyAllowance(budget.amount, budget.start_date, budget.period);
  const projectedEndSpend = dailyAllowance > 0
    ? spent + dailyAllowance * daysRemaining
    : spent;
  const projectedPercent = budget.amount > 0
    ? Math.round((projectedEndSpend / budget.amount) * 100)
    : 0;
  const isOverBudget = progress >= 100;
  const safeDaily = getRemainingSafeSpending(budget.amount, spent, budget.start_date, budget.period);

  const animatedSpent = useAnimatedNumber(spent);
  const animatedProgress = useAnimatedNumber(progress);

  return (
    <PremiumHover>
      <div
        className="group/card relative flex flex-col overflow-hidden rounded-xl border text-card-foreground glass-premium hover:glass-premium-hover hover:z-10 motion-reduce:transition-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top accent strip */}
        <div className="absolute inset-x-0 top-0 z-10 h-1 rounded-t-xl" style={{ backgroundColor: config.color }} />

        {/* Hover glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-normal motion-reduce:transition-none"
          style={{
            boxShadow: isHovered ? `inset 0 0 40px -12px ${config.color}` : undefined,
            opacity: isHovered ? 0.5 : 0,
          }}
        />

        {/* Reflection sweep */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-full w-1/2 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent transition-all duration-normal motion-reduce:transition-none"
          style={{
            transform: isHovered ? "translateX(200%) skewX(-20deg)" : "translateX(-100%) skewX(-20deg)",
            opacity: isHovered ? 1 : 0,
          }}
        />

        <div className="relative z-10 flex flex-col gap-3 p-4">
          {/* Row 1: Icon + Category + Status + Menu */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className="grid size-9 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: `${config.color}15` }}
              >
                <TrendingUp className="size-4" style={{ color: config.color }} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-foreground">
                  {categoryName}
                </h3>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="h-5 border-none px-0 text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{periodName}</span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0"
                  />
                }
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Budget actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={2}>
                <DropdownMenuItem onClick={() => onEdit(budget)}>
                  Edit
                </DropdownMenuItem>
                {onArchive && (
                  <DropdownMenuItem onClick={() => onArchive(budget)}>
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(budget)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Row 2: Spent / Budget / Remaining */}
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] text-muted-foreground">Spent</p>
              <p className={cn(
                "font-heading text-lg font-semibold tabular-nums tracking-tight",
                isOverBudget ? "text-negative" : "text-foreground",
              )}>
                {formatCurrency(Math.round(animatedSpent))}
              </p>
            </div>
            <div className="flex flex-col gap-0.5 text-right">
              <p className="text-[10px] text-muted-foreground">Budget</p>
              <p className="font-heading text-lg font-semibold tabular-nums tracking-tight text-foreground">
                {formatCurrency(budget.amount)}
              </p>
            </div>
          </div>

          {/* Row 3: Progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{Math.round(animatedProgress)}% used</span>
              <span className={cn(
                isOverBudget ? "text-negative font-medium" : "text-muted-foreground",
              )}>
                {isOverBudget
                  ? `${formatCurrency(spent - budget.amount)} over`
                  : `${formatCurrency(remaining)} left`}
              </span>
            </div>
            <div
              aria-label={`${progress}% used`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={progress}
              className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
            >
              <div
                aria-hidden="true"
                className="h-full rounded-full transition-all duration-500 motion-reduce:transition-none"
                style={{
                  width: `${Math.min(Math.round(animatedProgress), 100)}%`,
                  backgroundColor: config.color,
                }}
              />
              {/* Shimmer on hover */}
              <div
                className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-normal group-hover/card:opacity-100 motion-reduce:opacity-0"
                style={{
                  transform: isHovered ? "translateX(100%)" : "translateX(-100%)",
                  transition: "transform 0.6s ease, opacity 0.4s ease",
                }}
              />
            </div>
          </div>

          {/* Row 4: Metrics + Sparkline */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <TrendingDown className="size-3" />
                <span>
                  {formatCurrency(Math.round(dailyAllowance))}/day
                </span>
              </div>
              {daysRemaining > 0 && !isOverBudget && (
                <div className="flex items-center gap-1 text-[10px]">
                  <TrendingUp className="size-3 text-positive" />
                  <span className="text-positive">
                    {formatCurrency(Math.round(safeDaily))}/day safe
                  </span>
                </div>
              )}
            </div>
            <Sparkline
              data={[
                Math.max(spent * 0.2, 10),
                Math.max(spent * 0.4, 20),
                Math.max(spent * 0.6, 30),
                Math.max(spent * 0.8, 40),
                spent,
              ]}
              accentColor={config.color}
            />
          </div>

          {/* Row 5: Projected end + days */}
          <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Projected:</span>
              <span className={cn(
                projectedPercent > 100 ? "text-negative font-medium" : "text-foreground",
              )}>
                {projectedPercent}%
              </span>
            </div>
            {daysRemaining > 0 && (
              <span>{daysRemaining}d remaining</span>
            )}
          </div>
        </div>
      </div>
    </PremiumHover>
  );
});
