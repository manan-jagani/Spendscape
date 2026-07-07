"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  BarChart3,
  ChevronDown,
  CircleOff,
  Plus,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumHover } from "@/components/motion/premium-hover";
import { Reveal } from "@/components/motion/reveal";
import { ToastContainer } from "@/components/ui/toast";
import { SPRING, MOTION_TRANSITION } from "@/lib/motion";
import { formatCurrency } from "@/lib/formatters";
import { useBudgets } from "@/features/budgets/hooks/use-budgets";
import { useDeleteBudget } from "@/features/budgets/hooks/use-delete-budget";
import { useMonthlySpending } from "@/features/budgets/hooks/use-monthly-spending";
import { BudgetCard } from "@/features/budgets/components/budget-card";
import { BudgetSheet } from "@/features/budgets/components/budget-sheet";
import { getCurrentMonthFirst } from "@/lib/formatters";

import type { BudgetRow, SortOption } from "@/features/budgets/types";
import {
  BUDGET_STATUS_CONFIG,
  getBudgetHealthScore,
  getBudgetStatus,
  getEndDate,
  isBudgetArchived,
  SORT_OPTIONS,
} from "@/features/budgets/types";
import type { Tables } from "@/types/database.types";

type BudgetWithCategory = Tables<"budgets"> & {
  categories: { name: string; icon: string; color: string } | null;
};

type ViewFilter = "all" | "active" | "archived";

/* ─── Helpers ─── */

function getPeriodLabel(startDate: string, period: string): string {
  switch (period) {
    case "monthly":
      return new Date(startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    case "weekly": {
      const end = getEndDate(startDate, period as "weekly" | "monthly" | "yearly");
      return `${new Date(startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${new Date(end).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
    }
    case "yearly":
      return new Date(startDate).getFullYear().toString();
    default:
      return startDate;
  }
}

/* ─── Animated Counter ─── */

function AnimatedCounter({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = display;
    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - t) * (1 - t);
      setDisplay(from + (value - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <>{Math.round(display)}</>;
}

/* ─── Skeleton ─── */

function BudgetCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="size-8 rounded-md" />
      </div>
      <div className="flex items-end justify-between gap-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

function BudgetGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <BudgetCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─── Health Score Ring ─── */

function HealthRing({ score, max = 100 }: { score: number; max?: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / max) * circumference;
  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedOffset(offset), 300);
    return () => clearTimeout(timer);
  }, [offset]);

  const tone = score >= 80 ? "oklch(0.55 0.18 155)" : score >= 60 ? "oklch(0.7 0.15 80)" : score >= 40 ? "oklch(0.65 0.18 45)" : "oklch(0.55 0.2 25)";

  return (
    <div className="relative grid size-24 place-items-center">
      <svg aria-hidden="true" className="absolute inset-0 -rotate-90" height="96" width="96">
        <circle cx="48" cy="48" fill="none" r={radius} stroke="oklch(0.5 0 0 / 0.1)" strokeWidth="6" />
        <motion.circle
          cx="48" cy="48" fill="none" r={radius}
          stroke={tone} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: animatedOffset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="font-heading text-xl font-semibold tabular-nums tracking-tight" style={{ color: tone }}>
        <AnimatedCounter value={score} />
      </span>
    </div>
  );
}

/* ─── Summary Card ─── */

function SummaryCard({
  icon: Icon,
  label,
  value,
  subtext,
  tone,
  delay,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  subtext: string;
  tone: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay} className="flex flex-col [&>*]:flex-1">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...MOTION_TRANSITION.normal, delay }}
        whileHover={{ y: -4, scale: 1.015, transition: SPRING.card }}
        className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/20 p-4 backdrop-blur-sm motion-reduce:transition-none"
      >
        <div className="grid size-10 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${tone}15` }}>
          <Icon className="size-5" style={{ color: tone }} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate font-heading text-lg font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          <p className="text-[10px] text-muted-foreground">{subtext}</p>
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ─── Insight Card ─── */

function InsightCard({
  icon: Icon,
  title,
  description,
  color,
  onDismiss,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  color: string;
  onDismiss?: () => void;
}) {
  return (
    <PremiumHover mode="card" className="relative flex items-start gap-3 rounded-xl border p-3.5 motion-reduce:transition-none">
      <div
        className="grid size-9 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="size-4" style={{ color }} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-sm p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 motion-reduce:opacity-100"
          aria-label="Dismiss insight"
        >
          <X className="size-3.5" />
        </button>
      )}
    </PremiumHover>
  );
}

/* ─── Spending Breakdown Donut ─── */

function SpendingBreakdown({
  categories,
}: {
  categories: { name: string; amount: number; color: string; budgetAmount: number }[];
}) {
  const total = categories.reduce((s, c) => s + c.amount, 0);
  if (total === 0) return null;

  const segments: { name: string; amount: number; color: string; budgetAmount: number; startAngle: number; endAngle: number }[] = [];
  let accumulated = 0;
  for (const c of categories) {
    if (c.amount <= 0) continue;
    const startAngle = (accumulated / total) * 360;
    accumulated += c.amount;
    const endAngle = (accumulated / total) * 360;
    segments.push({ ...c, startAngle, endAngle });
  }

  const radius = 60;
  const cx = 80;
  const cy = 80;
  const center = { x: cx, y: cy };

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center.x + radius * Math.cos(rad),
      y: center.y + radius * Math.sin(rad),
    };
  }

  function describeArc(startAngle: number, endAngle: number) {
    const start = polarToCartesian(endAngle);
    const end = polarToCartesian(startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} L ${center.x} ${center.y} Z`;
  }

  return (
    <div className="flex items-center gap-6">
      <svg aria-hidden="true" className="shrink-0" height={160} viewBox="0 0 160 160" width={160}>
        {segments.map((seg) => (
          <motion.path
            key={seg.name}
            d={describeArc(seg.startAngle, seg.endAngle)}
            fill={seg.color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="transition-all duration-normal hover:opacity-80 hover:brightness-110"
          />
        ))}
        <circle cx={cx} cy={cy} fill="var(--background)" r={28} />
      </svg>
      <div className="flex flex-col gap-1.5">
        {segments.map((seg) => (
          <div key={seg.name} className="flex items-center gap-2 text-xs">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{seg.name}</span>
            <span className="tabular-nums text-foreground">{Math.round((seg.amount / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export function BudgetsPageClient() {
  const { data: budgets, isLoading, error, refetch } = useBudgets();
  const currentMonth = useMemo(() => getCurrentMonthFirst(), []);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetRow | null>(null);
  const [deleteBudget, setDeleteBudget] = useState<BudgetRow | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("active");
  const [sortOption, setSortOption] = useState<SortOption>("health");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [hideArchived, setHideArchived] = useState(true);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  const deleteMutation = useDeleteBudget();
  const spending = useMonthlySpending(currentMonth);

  const categoryTotals = useMemo(() => {
    const spendingData = spending.data ?? [];
    const map = new Map<string, number>();
    for (const txn of spendingData) {
      const catId = txn.category_id ?? "";
      map.set(catId, (map.get(catId) ?? 0) + txn.amount);
    }
    return map;
  }, [spending.data]);

  const spentByCategoryId = useMemo(() => {
    if (!budgets) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const budget of budgets) {
      const categoryId = budget.category_id ?? "";
      const spent = categoryTotals.get(categoryId) ?? 0;
      map.set(budget.id, spent);
    }
    return map;
  }, [budgets, categoryTotals]);

  const summaryTotals = useMemo(() => {
    if (!budgets) return { totalBudget: 0, totalSpent: 0, totalRemaining: 0 };
    let totalBudget = 0;
    let totalSpent = 0;
    for (const budget of budgets) {
      if (isBudgetArchived(budget.start_date, budget.period)) continue;
      totalBudget += budget.amount;
      totalSpent += spentByCategoryId.get(budget.id) ?? 0;
    }
    return {
      totalBudget,
      totalSpent,
      totalRemaining: Math.max(totalBudget - totalSpent, 0),
    };
  }, [budgets, spentByCategoryId]);

  const healthScore = useMemo(() => {
    if (!budgets) return { score: 100, label: "Excellent", tone: "emerald" as const };
    const active = budgets.filter((b) => !isBudgetArchived(b.start_date, b.period));
    const scores = active.map((b) => ({
      progress: b.amount > 0 ? Math.min((spentByCategoryId.get(b.id) ?? 0) / b.amount, 1) : 0,
      amount: b.amount,
    }));
    return getBudgetHealthScore(scores);
  }, [budgets, spentByCategoryId]);

  const spendingBreakdown = useMemo(() => {
    if (!budgets) return [];
    const active = budgets.filter((b) => !isBudgetArchived(b.start_date, b.period));
    return active.map((b) => {
      const spent = spentByCategoryId.get(b.id) ?? 0;
      const color = (b.categories as { color?: string } | null)?.color ?? BUDGET_STATUS_CONFIG[getBudgetStatus(b.amount > 0 ? Math.min(spent / b.amount * 100, 100) : 0)].color;
      return {
        name: b.categories?.name ?? "Uncategorized",
        amount: spent,
        color,
        budgetAmount: b.amount,
      };
    }).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);
  }, [budgets, spentByCategoryId]);

  const insights = useMemo(() => {
    if (!budgets) return [];
    const active = budgets.filter((b) => !isBudgetArchived(b.start_date, b.period));
    const results: { id: string; icon: typeof Sparkles; title: string; description: string; color: string }[] = [];

    for (const budget of active) {
      const spent = spentByCategoryId.get(budget.id) ?? 0;
      const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const status = getBudgetStatus(progress);
      const config = BUDGET_STATUS_CONFIG[status];
      const remaining = budget.amount - spent;
      const name = budget.categories?.name ?? "Uncategorized";

      if (status === "over_budget") {
        results.push({
          id: `over-${budget.id}`,
          icon: TrendingUp,
          title: `${name} exceeded by ${formatCurrency(Math.abs(remaining))}`,
          description: `Reduce spending or adjust your ${name} budget.`,
          color: config.color,
        });
      }
      if (status === "healthy" && progress > 0) {
        results.push({
          id: `under-${budget.id}`,
          icon: TrendingDown,
          title: `You'll likely finish ${formatCurrency(Math.round(remaining * 0.7))} under budget`,
          description: `${name} spending is tracking well below your limit.`,
          color: config.color,
        });
      }
    }

    return results.slice(0, 4);
  }, [budgets, spentByCategoryId]);

  const visibleInsights = insights.filter((i) => !dismissedInsights.has(i.id));

  const processedBudgets = useMemo(() => {
    if (!budgets) return [];

    let filtered = [...budgets] as BudgetWithCategory[];

    if (viewFilter === "active") {
      filtered = filtered.filter((b) => !isBudgetArchived(b.start_date, b.period));
    } else if (viewFilter === "archived") {
      filtered = filtered.filter((b) => isBudgetArchived(b.start_date, b.period));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) => (b.categories?.name ?? "Uncategorized").toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => {
        const spent = spentByCategoryId.get(b.id) ?? 0;
        const progress = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0;
        return getBudgetStatus(progress) === statusFilter;
      });
    }

    filtered.sort((a, b) => {
      const spentA = spentByCategoryId.get(a.id) ?? 0;
      const spentB = spentByCategoryId.get(b.id) ?? 0;
      const progressA = a.amount > 0 ? spentA / a.amount : 0;
      const progressB = b.amount > 0 ? spentB / b.amount : 0;

      switch (sortOption) {
        case "highest_spent":
          return spentB - spentA;
        case "lowest_spent":
          return spentA - spentB;
        case "budget_amount":
          return b.amount - a.amount;
        case "health":
          return progressA - progressB;
        case "alphabetical": {
          const nameA = a.categories?.name ?? "Uncategorized";
          const nameB = b.categories?.name ?? "Uncategorized";
          return nameA.localeCompare(nameB);
        }
        case "recently_updated":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [budgets, viewFilter, sortOption, spentByCategoryId, searchQuery, statusFilter]);

  const activeCount = budgets
    ? budgets.filter((b) => !isBudgetArchived(b.start_date, b.period)).length
    : 0;
  const archivedCount = budgets
    ? budgets.filter((b) => isBudgetArchived(b.start_date, b.period)).length
    : 0;

  const handleCreate = useCallback(() => {
    setEditingBudget(null);
    setSheetOpen(true);
  }, []);

  const handleEdit = useCallback((budget: BudgetRow) => {
    setEditingBudget(budget);
    setSheetOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteBudget) return;
    try {
      await deleteMutation.mutateAsync(deleteBudget.id);
    } catch {
      // Handled by toast
    }
    setDeleteBudget(null);
  }, [deleteBudget, deleteMutation]);

  const dismissInsight = useCallback((id: string) => {
    setDismissedInsights((prev) => new Set(prev).add(id));
  }, []);

  let content: React.ReactNode;

  if (isLoading) {
    content = <BudgetGridSkeleton />;
  } else if (error) {
    content = (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-background/30 px-6 py-16 text-center backdrop-blur-sm">
        <div className="grid size-14 place-items-center rounded-full bg-negative/10 ring-1 ring-negative/20">
          <span className="text-lg text-negative">!</span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-medium text-foreground">
            Failed to load budgets
          </h3>
          <p className="text-sm text-muted-foreground">
            {error.message || "Something went wrong. Please try again."}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  } else if (!budgets || budgets.length === 0) {
    content = (
      <Reveal delay={0.3}>
        <div className="flex flex-col items-center gap-5 rounded-xl border border-border/30 bg-background/20 px-8 py-20 text-center backdrop-blur-sm">
          <div className="grid size-16 place-items-center rounded-full bg-positive/10 ring-1 ring-positive/20">
            <BarChart3 className="size-7 text-positive" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading text-lg font-medium text-foreground">
              No budgets yet
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Create your first budget to track your spending and stay on top of your financial goals.
              Try categories like Food, Shopping, or Entertainment.
            </p>
          </div>
          <Button onClick={handleCreate} size="lg">
            <Plus className="size-4" />
            Create budget
          </Button>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {["Food", "Shopping", "Entertainment", "Transport"].map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-border/40 bg-background/40 px-3 py-1 text-[11px] text-muted-foreground"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    );
  } else {
    content = (
      <div className="flex flex-col gap-8">
        {/* Summary Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Wallet}
            label="Total Budget"
            value={formatCurrency(summaryTotals.totalBudget)}
            subtext={`Across ${activeCount} budgets`}
            tone="oklch(0.55 0.18 155)"
            delay={0}
          />
          <SummaryCard
            icon={TrendingUp}
            label="Total Spent"
            value={formatCurrency(summaryTotals.totalSpent)}
            subtext={summaryTotals.totalBudget > 0
              ? `${Math.round((summaryTotals.totalSpent / summaryTotals.totalBudget) * 100)}% of budget`
              : "No budgets set"}
            tone="oklch(0.55 0.2 25)"
            delay={0.04}
          />
          <SummaryCard
            icon={TrendingDown}
            label="Remaining"
            value={formatCurrency(summaryTotals.totalRemaining)}
            subtext={summaryTotals.totalRemaining > 0
              ? `${formatCurrency(Math.round(summaryTotals.totalRemaining / Math.max(1, activeCount)))} per budget`
              : "Over budget"}
            tone="oklch(0.55 0.18 155)"
            delay={0.08}
          />
          <Reveal delay={0.12} className="flex flex-col [&>*]:flex-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...MOTION_TRANSITION.normal, delay: 0.12 }}
              whileHover={{ y: -4, scale: 1.015, transition: SPRING.card }}
              className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/20 p-4 backdrop-blur-sm motion-reduce:transition-none"
            >
              <HealthRing score={healthScore.score} />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Health Score</p>
                <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
                  {healthScore.label}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {healthScore.score >= 80
                    ? `You're spending ${summaryTotals.totalBudget > 0 ? Math.round(100 - (summaryTotals.totalSpent / summaryTotals.totalBudget) * 100) : 0}% below budget.`
                    : "Review your spending to improve."}
                </p>
              </div>
            </motion.div>
          </Reveal>
        </div>

        {/* Spending Breakdown */}
        {spendingBreakdown.length > 0 && (
          <Reveal delay={0.16}>
            <div className="rounded-xl border border-border/30 bg-background/20 p-4 backdrop-blur-sm">
              <h3 className="mb-3 font-heading text-sm font-medium text-foreground">
                Spending by Category
              </h3>
              <SpendingBreakdown categories={spendingBreakdown} />
            </div>
          </Reveal>
        )}

        {/* AI Insights */}
        {visibleInsights.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-investment" />
              <p className="text-xs font-medium text-muted-foreground">Smart Insights</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleInsights.map((insight, i) => (
                <Reveal key={insight.id} delay={0.2 + i * 0.04}>
                  <InsightCard
                    icon={insight.icon as typeof Sparkles}
                    title={insight.title}
                    description={insight.description}
                    color={insight.color}
                    onDismiss={() => dismissInsight(insight.id)}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search budgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-[180px] pl-8 text-xs lg:w-[220px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="h-9 w-[120px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectPopup>
                <SelectList>
                  <SelectItem value="all">
                    <SelectItemText>All status</SelectItemText>
                  </SelectItem>
                  {(["healthy", "near_limit", "critical", "over_budget"] as const).map((s) => (
                    <SelectItem key={s} value={s}>
                      <SelectItemText>{BUDGET_STATUS_CONFIG[s].label}</SelectItemText>
                    </SelectItem>
                  ))}
                </SelectList>
              </SelectPopup>
            </Select>
            <Select
              value={sortOption}
              onValueChange={(v) => setSortOption(v as SortOption)}
            >
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectPopup>
                <SelectList>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <SelectItemText>{option.label}</SelectItemText>
                    </SelectItem>
                  ))}
                </SelectList>
              </SelectPopup>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {archivedCount > 0 && (
              <Button
                size="sm"
                variant={hideArchived ? "outline" : "secondary"}
                onClick={() => setHideArchived(!hideArchived)}
                className="h-9 text-xs"
              >
                <Archive className="size-3.5" />
                {hideArchived ? "Show archived" : "Hide archived"}
              </Button>
            )}
            <Button
              size="sm"
              variant={viewFilter === "active" ? "default" : "ghost"}
              onClick={() => setViewFilter(viewFilter === "active" ? "all" : "active")}
              className="h-9 text-xs"
            >
              {viewFilter === "active" ? "Active" : "All"}
              {viewFilter === "active" && activeCount > 0 && (
                <span className="ml-1 text-xs opacity-70">({activeCount})</span>
              )}
            </Button>
            <Button onClick={handleCreate} size="sm" className="h-9">
              <Plus className="size-3.5" />
              Create budget
            </Button>
          </div>
        </div>

        {/* Budget Grid */}
        {processedBudgets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {processedBudgets
              .filter((b) => !hideArchived || !isBudgetArchived(b.start_date, b.period))
              .map((budget, i) => (
                <Reveal key={budget.id} delay={0.24 + i * 0.04}>
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    spent={spentByCategoryId.get(budget.id) ?? 0}
                    periodName={getPeriodLabel(budget.start_date, budget.period)}
                    onEdit={() => handleEdit(budget)}
                    onDelete={() => setDeleteBudget(budget)}
                  />
                </Reveal>
              ))}
            {processedBudgets.filter((b) => !hideArchived || !isBudgetArchived(b.start_date, b.period)).length === 0 && (
              <div className="col-span-full flex flex-col items-center gap-3 rounded-xl border border-border/30 bg-background/20 px-6 py-12 text-center backdrop-blur-sm">
                <CircleOff className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {viewFilter === "archived"
                    ? "No archived budgets."
                    : "No budgets match your filters."}
                </p>
                {(viewFilter !== "archived" || searchQuery || statusFilter !== "all") && (
                  <Button size="sm" variant="outline" onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setViewFilter("active");
                  }}>
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border/30 bg-background/20 px-6 py-12 text-center backdrop-blur-sm">
            <CircleOff className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {viewFilter === "archived"
                ? "No archived budgets."
                : "No budgets match your filters."}
            </p>
            <Button size="sm" variant="outline" onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setViewFilter("active");
            }}>
              Clear filters
            </Button>
          </div>
        )}

        {/* Archived Section */}
        {hideArchived && archivedCount > 0 && (
          <Reveal delay={0.5}>
            <details className="group rounded-xl border border-border/20 bg-background/10 backdrop-blur-sm">
              <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground">
                <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
                Archived budgets ({archivedCount})
              </summary>
              <div className="grid gap-4 border-t border-border/20 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
                {budgets
                  .filter((b) => isBudgetArchived(b.start_date, b.period))
                  .map((budget, i) => (
                    <Reveal key={budget.id} delay={0.52 + i * 0.04}>
                      <BudgetCard
                        budget={budget}
                        spent={spentByCategoryId.get(budget.id) ?? 0}
                        periodName={getPeriodLabel(budget.start_date, budget.period)}
                        onEdit={() => handleEdit(budget)}
                        onDelete={() => setDeleteBudget(budget)}
                      />
                    </Reveal>
                  ))}
              </div>
            </details>
          </Reveal>
        )}
      </div>
    );
  }

  return (
    <>
      {content}

      <BudgetSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        budget={editingBudget}
      />

      <Dialog
        open={!!deleteBudget}
        onOpenChange={(open) => {
          if (!open) setDeleteBudget(null);
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the budget for{" "}
              <strong>{deleteBudget?.categories?.name ?? "Uncategorized"}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteBudget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </>
  );
}
