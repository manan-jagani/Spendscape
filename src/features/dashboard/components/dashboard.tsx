"use client";

import { useMemo } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Reveal } from "@/components/motion/reveal";
import { AccountsOverview } from "@/features/dashboard/components/accounts-overview";
import { BudgetOverview } from "@/features/dashboard/components/budget-overview";
import { DashboardError } from "@/features/dashboard/components/dashboard-error";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { InsightPreview } from "@/features/dashboard/components/insight-preview";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions";
import { VisualizationPlaceholder } from "@/features/dashboard/components/visualization-placeholder";
import { useAccounts } from "@/features/dashboard/hooks/use-accounts";
import { useBudgets } from "@/features/dashboard/hooks/use-budgets";
import { useInsights } from "@/features/dashboard/hooks/use-insight";
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

export function Dashboard() {
  const currentMonth = useMemo(() => getCurrentMonthFirst(), []);
  const summary = useMonthlySummary(currentMonth);
  const accounts = useAccounts();
  const transactions = useRecentTransactions(4);
  const budgets = useBudgets();
  const insights = useInsights();

  const isAnyLoading =
    summary.isLoading ||
    accounts.isLoading ||
    transactions.isLoading ||
    budgets.isLoading ||
    insights.isLoading;

  const isAnyError =
    summary.isError ||
    accounts.isError ||
    transactions.isError ||
    budgets.isError ||
    insights.isError;

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
          insights.refetch();
        }}
      />
    );
  }

  const summaryData = summary.data!;
  const accountsData = accounts.data ?? [];
  const transactionsData = transactions.data;
  const budgetsData = budgets.data ?? [];
  const insightsData = insights.data ?? [];

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

  const latestInsight = insightsData.find((i) => !i.is_read) ?? insightsData[0];
  const insightPreview = latestInsight
    ? {
        eyebrow: latestInsight.kind.charAt(0).toUpperCase() + latestInsight.kind.slice(1),
        title: latestInsight.title,
        description: latestInsight.body,
        action: "Explore this insight",
      }
    : undefined;

  return (
    <PageContainer>
      <Reveal>
        <header className="max-w-3xl">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {dateStr}
          </p>
          <h1 className="mt-3 font-heading text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
            {greeting}.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {summaryData.savings_rate > 0
              ? `You're saving ${summaryData.savings_rate}% of your income this month.`
              : summaryData.expense > 0
                ? `You've spent ${formatCurrency(summaryData.expense)} so far this month.`
                : "Add transactions to see your financial overview."}
          </p>
        </header>
      </Reveal>

      <section aria-labelledby="financial-summary" className="mt-10">
        <h2 className="sr-only" id="financial-summary">
          Financial summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => (
            <Reveal delay={index * 0.04} key={metric.id}>
              <MetricCard {...metric} />
            </Reveal>
          ))}
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Reveal className="xl:col-span-8" delay={0.08}>
          <VisualizationPlaceholder
            description="A relationship view of accounts, categories, and goals will live here once visualization data is connected."
            eyebrow="Coming into focus"
            question={`How is your money distributed across the life you're building?`}
            title="Your Financial Galaxy"
          />
        </Reveal>

        {insightPreview ? (
          <Reveal className="xl:col-span-4" delay={0.12}>
            <InsightPreview {...insightPreview} />
          </Reveal>
        ) : null}

        {recentTransactionItems.length > 0 ? (
          <Reveal className="xl:col-span-7" delay={0.12}>
            <RecentTransactions transactions={recentTransactionItems} />
          </Reveal>
        ) : null}

        <div className="grid gap-6 xl:col-span-5">
          {accountItems.length > 0 ? (
            <Reveal delay={0.16}>
              <AccountsOverview accounts={accountItems} />
            </Reveal>
          ) : null}
          {budgetItems.length > 0 ? (
            <Reveal delay={0.2}>
              <BudgetOverview budgets={budgetItems} />
            </Reveal>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
