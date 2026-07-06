"use client";

import { Reveal } from "@/components/motion/reveal";

import { AIRecommendations } from "./ai-recommendations";
import { CashFlowTrend } from "./cash-flow-trend";
import { ActivityFeed } from "./activity-feed";
import { FinancialHealthScore } from "./financial-health-score";
import { SpendingStreak } from "./spending-streak";
import { TodaysHighlights } from "./todays-highlights";
import { TopCategories } from "./top-categories";
import { UpcomingEvents } from "./upcoming-events";
import type { InsightRow } from "@/features/insights/types";
import type { MonthlySummary, TransactionPageRow } from "@/types/api.types";

/* ─── Types ──────────────────────────────────────────────────── */

interface AccountItem {
  current_balance: number;
  id: string;
  type: string;
}

interface BudgetItem {
  id: string;
  name: string;
  progress: number;
}

interface DailyDataPoint {
  date: string;
  total: number;
}

export interface DashboardIntelligenceProps {
  accounts: readonly AccountItem[];
  budgets: readonly BudgetItem[];
  dailyExpenses: readonly DailyDataPoint[];
  insights: readonly InsightRow[];
  summary: MonthlySummary;
  transactions: readonly TransactionPageRow[];
}

/* ─── Component ───────────────────────────────────────────────── */

export function DashboardIntelligence(props: DashboardIntelligenceProps) {
  const { accounts, budgets, dailyExpenses, insights, summary, transactions } = props;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Reveal className="col-span-1 row-span-1" delay={0}>
          <FinancialHealthScore
            accounts={accounts}
            budgets={budgets}
            summary={summary}
          />
        </Reveal>

        <Reveal className="col-span-1 row-span-1" delay={0.05}>
          <TodaysHighlights
            budgets={budgets}
            summary={summary}
            transactions={transactions}
          />
        </Reveal>

        <Reveal className="col-span-1 row-span-1" delay={0.1}>
          <AIRecommendations insights={insights} />
        </Reveal>

        <Reveal className="col-span-1 row-span-1" delay={0.15}>
          <UpcomingEvents transactions={transactions} />
        </Reveal>

        <Reveal className="col-span-1 row-span-1" delay={0.2}>
          <SpendingStreak savingsRate={summary.savings_rate} />
        </Reveal>

        <Reveal className="col-span-1 row-span-1" delay={0.25}>
          <TopCategories summary={summary} />
        </Reveal>

        <Reveal className="col-span-2 row-span-1" delay={0.3}>
          <CashFlowTrend dailyExpenses={dailyExpenses} />
        </Reveal>

        <Reveal className="col-span-1 row-span-1" delay={0.35}>
          <ActivityFeed transactions={transactions} />
        </Reveal>
      </div>
    </section>
  );
}
