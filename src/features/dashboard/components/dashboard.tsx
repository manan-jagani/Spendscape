"use client";

import { useEffect, useMemo, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { AmbientBackground } from "@/components/motion/ambient-background";
import { AccountsOverview } from "@/features/dashboard/components/accounts-overview";
import { BudgetOverview } from "@/features/dashboard/components/budget-overview";
import { DashboardError } from "@/features/dashboard/components/dashboard-error";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions";
import { FinancialHealthScore } from "@/features/dashboard/components/intelligence/financial-health-score";
import { SpendingStreak } from "@/features/dashboard/components/intelligence/spending-streak";
import { TodaysHighlights } from "@/features/dashboard/components/intelligence/todays-highlights";
import { FinancialGalaxy } from "@/visualizations/galaxy/components/financial-galaxy";
import { useAccounts } from "@/features/dashboard/hooks/use-accounts";
import { useBudgets } from "@/features/dashboard/hooks/use-budgets";
import { useMonthlySummary } from "@/features/dashboard/hooks/use-monthly-summary";
import { useRecentTransactions } from "@/features/dashboard/hooks/use-recent-transactions";
import {
  formatCurrency,
  formatCurrencyWithSign,
  formatRelativeTime,
  getCurrentMonthFirst,
  getFormattedDate,
  getGreeting,
} from "@/lib/formatters";
import type { Tables } from "@/types/database.types";
import { ChartCard } from "@/visualizations/lib/chart-card";
import { useDailyExpenses } from "@/visualizations/lib/use-daily-expenses";
import { CalendarHeatmap } from "@/visualizations/heatmap/components/calendar-heatmap";
import { MonthlyTimeline } from "@/visualizations/timeline/components/monthly-timeline";
import { SpendingTreemap } from "@/visualizations/treemap/components/spending-treemap";

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="tabular-nums">
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

export function Dashboard() {
  const currentMonth = useMemo(() => getCurrentMonthFirst(), []);
  const summary = useMonthlySummary(currentMonth);
  const accounts = useAccounts();
  const transactions = useRecentTransactions(4);
  const budgets = useBudgets();
  const dailyExpenses = useDailyExpenses(0);
  const dailyExpensesMulti = useDailyExpenses(3);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;

  const isAnyLoading =
    summary.isLoading ||
    accounts.isLoading ||
    transactions.isLoading ||
    budgets.isLoading ||
    dailyExpenses.isLoading ||
    dailyExpensesMulti.isLoading;

  const isAnyError =
    summary.isError ||
    accounts.isError ||
    transactions.isError ||
    budgets.isError ||
    dailyExpenses.isError ||
    dailyExpensesMulti.isError;

  if (isAnyLoading) {
    return <DashboardSkeleton />;
  }

  if (isAnyError) {
    return (
      <DashboardError
        onRetry={() => {
          summary.refetch();
          accounts.refetch();
          transactions.refetch();
          budgets.refetch();
          dailyExpenses.refetch();
          dailyExpensesMulti.refetch();
        }}
      />
    );
  }

  const summaryData = summary.data!;
  const accountsData = accounts.data ?? [];
  const transactionsData = transactions.data;
  const budgetsData = budgets.data ?? [];

  const greeting = getGreeting();
  const dateStr = getFormattedDate();

  const metrics = [
    {
      id: "net-worth",
      label: "Net worth",
      value: formatCurrency(summaryData.total_balance),
      change: "",
      context: "current balance",
      tone: "neutral" as const,
    },
    {
      id: "income",
      label: "Income",
      value: formatCurrency(summaryData.income),
      change: "",
      context: "this month",
      tone: "income" as const,
    },
    {
      id: "expense",
      label: "Expenses",
      value: formatCurrency(summaryData.expense),
      change: "",
      context: "this month",
      tone: "expense" as const,
    },
    {
      id: "savings",
      label: "Savings",
      value: formatCurrency(summaryData.net),
      change: `${summaryData.savings_rate}%`,
      context: "savings rate",
      tone: "savings" as const,
    },
  ];

  const recentTransactionItems = (transactionsData?.rows ?? []).slice(0, 4).map((txn) => ({
    id: txn.id,
    merchant: txn.merchant ?? "Unknown",
    category: txn.category_name ?? "Uncategorized",
    time: formatRelativeTime(txn.occurred_at),
    amount: formatCurrencyWithSign(txn.amount, txn.kind, txn.currency),
    kind: txn.kind,
  }));

  const accountItems = accountsData.map((account) => {
    const tone =
      account.type === "savings"
        ? ("savings" as const)
        : account.type === "credit_card" || account.type === "loan"
          ? ("expense" as const)
          : ("transfer" as const);

    return {
      id: account.id,
      name: account.name,
      institution: account.institution ?? "",
      balance: formatCurrency(account.current_balance, account.currency),
      tone,
    };
  });

  const budgetItems: Array<{
    detail: string;
    id: string;
    name: string;
    progress: number;
    tone: "income" | "transfer" | "warning";
  }> = budgetsData.map((budget) => {
    const b = budget as Tables<"budgets"> & {
      categories: { name: string } | null;
    };
    const categoryName = b.categories?.name ?? "Budget";
    const categoryTotal =
      summaryData.categories.find((c) => c.category_id === b.category_id)?.total ?? 0;
    const progress = b.amount > 0
      ? Math.min(Math.round((categoryTotal / b.amount) * 100), 100)
      : 0;

    return {
      id: b.id,
      name: categoryName,
      detail: formatCurrency(b.amount),
      progress,
      tone: progress >= 100 ? "warning" : "transfer",
    };
  });

  const treemapCategories = summaryData.categories
    .filter((c) => c.total > 0 && c.category_name)
    .map((c) => ({
      name: c.category_name ?? "Uncategorized",
      value: c.total,
      color: c.color ?? "var(--muted-foreground)",
    }));

  return (
    <div className="px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
      {/* Ambient background — replaces the old section lighting */}
      <AmbientBackground />

      {/* Ambient gradient blobs (kept for colored atmosphere) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/4 h-[500px] w-[500px] opacity-[0.03] dark:opacity-[0.04] motion-reduce:animate-none"
          style={{
            background: "radial-gradient(circle, #F59E0B 0%, transparent 65%)",
            filter: "blur(150px)",
            animation: "glow-breathe 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-40 right-1/4 h-[600px] w-[600px] opacity-[0.02] dark:opacity-[0.03] motion-reduce:animate-none"
          style={{
            background: "radial-gradient(circle, #6366F1 0%, transparent 65%)",
            filter: "blur(180px)",
            animation: "glow-breathe 10s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] opacity-[0.015] dark:opacity-[0.02] motion-reduce:animate-none"
          style={{
            background: "radial-gradient(circle, #0F9D76 0%, transparent 65%)",
            filter: "blur(200px)",
            animation: "glow-breathe 12s ease-in-out infinite 2s",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] grid grid-cols-12 gap-4 md:gap-6">

        {/* ── Row 1: Greeting ── */}
        <Reveal className="col-span-12" delay={0}>
          <header className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-2xs font-medium tracking-[0.15em] text-muted-foreground uppercase">
                {dateStr}
              </p>
              <span className="text-2xs text-muted-foreground/40" aria-hidden="true">·</span>
              <p className="text-2xs font-medium tabular-nums text-muted-foreground">
                <LiveClock />
              </p>
              <span className="text-2xs text-muted-foreground/40" aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-positive/10 px-2 py-0.5 text-[10px] font-medium text-positive">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-positive" />
                {summaryData.savings_rate > 20 ? "On fire" : "Active"}
              </span>
            </div>
            <h1 className="mt-3 font-heading text-4xl font-medium tracking-[-0.045em] sm:text-4xl md:text-5xl">
              {greeting}.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg max-w-2xl">
              {summaryData.savings_rate > 0
                ? `You're saving ${summaryData.savings_rate}% of your income this month.`
                : summaryData.expense > 0
                  ? `You've spent ${formatCurrency(summaryData.expense)} so far this month.`
                  : "Add transactions to see your financial overview."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {summaryData.savings_rate > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-positive/20 bg-positive/5 px-3 py-1 text-[11px] font-medium text-positive">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-positive" />
                  Saving {summaryData.savings_rate}%
                </span>
              )}
              {summaryData.savings_rate > 20 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-income/20 bg-income/5 px-3 py-1 text-[11px] font-medium text-income">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-income" />
                  Above average
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/30 bg-background/40 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-sm">
                Net worth: {formatCurrency(summaryData.total_balance)}
              </span>
            </div>
          </header>
        </Reveal>

        {/* ── Row 2: 4 KPI cards (3+3+3+3) ── */}
        {metrics.map((metric, index) => (
          <Reveal
            className="col-span-3 flex flex-col [&>*]:flex-1"
            delay={index * 0.04}
            key={metric.id}
          >
            <MetricCard {...metric} />
          </Reveal>
        ))}

        {/* ── Row 3: Financial Galaxy (8) + Accounts (4) ── */}
        <Reveal className="col-span-8 flex flex-col [&>*]:flex-1" delay={0.08}>
          <ChartCard
            className="glass-hero"
            description="How your money is distributed across accounts, categories, and budgets"
            minHeight={440}
            title="Financial Galaxy"
          >
            <FinancialGalaxy
              accounts={accountsData}
              budgets={budgetsData}
              categories={summaryData.categories}
              netWorth={summaryData.total_balance}
              recentTransactions={transactionsData?.rows ?? []}
            />
          </ChartCard>
        </Reveal>

        <Reveal className="col-span-4 flex flex-col [&>*]:flex-1" delay={0.12}>
          <AccountsOverview accounts={accountItems} />
        </Reveal>

        {/* ── Row 4: Recent Transactions (8) + Budget Pace (4) ── */}
        <Reveal className="col-span-8 flex flex-col [&>*]:flex-1" delay={0.12}>
          <RecentTransactions transactions={recentTransactionItems} />
        </Reveal>

        <Reveal className="col-span-4 flex flex-col [&>*]:flex-1" delay={0.16}>
          <BudgetOverview budgets={budgetItems} />
        </Reveal>

        {/* ── Row 5: Financial Health + Highlights + Streak (4+4+4) ── */}
        <Reveal className="col-span-4 flex flex-col [&>*]:flex-1" delay={0.2}>
          <FinancialHealthScore
            accounts={accountsData}
            budgets={budgetItems}
            summary={summaryData}
          />
        </Reveal>

        <Reveal className="col-span-4 flex flex-col [&>*]:flex-1" delay={0.24}>
          <TodaysHighlights
            budgets={budgetItems}
            summary={summaryData}
            transactions={transactionsData?.rows ?? []}
          />
        </Reveal>

        <Reveal className="col-span-4 flex flex-col [&>*]:flex-1" delay={0.28}>
          <SpendingStreak savingsRate={summaryData.savings_rate} />
        </Reveal>

        {/* ── Row 6: Spending By Category (12) ── */}
        <Reveal className="col-span-12 flex flex-col [&>*]:flex-1" delay={0.32}>
          <ChartCard
            description="Where your money went this month"
            title="Spending by Category"
          >
            <SpendingTreemap categories={treemapCategories} />
          </ChartCard>
        </Reveal>

        {/* ── Row 7: Monthly Timeline (6) + Spending Heatmap (6) ── */}
        <Reveal className="col-span-6 flex flex-col [&>*]:flex-1" delay={0.36}>
          <ChartCard
            description="Your daily spending pattern"
            title="Monthly Timeline"
          >
            <MonthlyTimeline
              data={dailyExpenses.data ?? []}
              month={currentMonthNum}
              year={currentYear}
            />
          </ChartCard>
        </Reveal>

        <Reveal className="col-span-6 flex flex-col [&>*]:flex-1" delay={0.4}>
          <ChartCard
            description="Expense intensity over time"
            title="Spending Heatmap"
          >
            <CalendarHeatmap
              data={dailyExpensesMulti.data ?? []}
              months={4}
            />
          </ChartCard>
        </Reveal>

      </div>
    </div>
  );
}
