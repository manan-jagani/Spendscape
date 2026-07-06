"use client";

import { useMemo } from "react";

import { Reveal } from "@/components/motion/reveal";
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
      color: c.color ?? "hsl(var(--muted-foreground))",
    }));

  return (
    <div className="px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
      <div className="grid grid-cols-12 gap-6">

        {/* ── Row 1: Greeting ── */}
        <Reveal className="col-span-12" delay={0}>
          <header className="max-w-3xl">
            <p className="text-[0.625rem] font-medium tracking-[0.15em] text-muted-foreground uppercase">
              {dateStr}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
              {greeting}.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {summaryData.savings_rate > 0
                ? `You're saving ${summaryData.savings_rate}% of your income this month.`
                : summaryData.expense > 0
                  ? `You've spent ${formatCurrency(summaryData.expense)} so far this month.`
                  : "Add transactions to see your financial overview."}
            </p>
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
            className="[&_[data-slot=card-content]>div]:bg-black/15"
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
