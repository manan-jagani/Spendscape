"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "@/lib/query-keys";
import { getTransactionsPage } from "@/lib/queries/transactions";
import { createClient } from "@/lib/supabase/client";

export interface DailyExpense {
  date: string;
  total: number;
  count: number;
}

function aggregateByDay(
  rows: Array<{ amount: number; occurred_at: string }>,
): DailyExpense[] {
  const map = new Map<string, { total: number; count: number }>();

  for (const row of rows) {
    const day = row.occurred_at.slice(0, 10);
    const entry = map.get(day) ?? { total: 0, count: 0 };
    entry.total += row.amount;
    entry.count += 1;
    map.set(day, entry);
  }

  return Array.from(map.entries())
    .map(([date, { total, count }]) => ({ date, total, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getMonthRange(monthsBack: number, monthsForward = 0) {
  const now = new Date();
  const fromDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const toDate = new Date(now.getFullYear(), now.getMonth() + 1 + monthsForward, 0);
  const from = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-01`;
  const to = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;
  return { from, to };
}

export function useDailyExpenses(monthsBack = 0) {
  const supabase = useMemo(() => createClient(), []);
  const dateRange = useMemo(() => getMonthRange(monthsBack), [monthsBack]);

  return useQuery({
    queryKey: [...queryKeys.transactions({ kind: "expense" }), "daily", dateRange],
    queryFn: async () => {
      const result = await getTransactionsPage(supabase, {
        kind: "expense",
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        limit: 500,
      });
      return aggregateByDay(result.rows ?? []);
    },
  });
}

export function fillDailyData(
  data: DailyExpense[],
  year: number,
  month: number,
): DailyExpense[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dataMap = new Map(data.map((d) => [d.date, d]));
  const filled: DailyExpense[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const existing = dataMap.get(dateStr);
    filled.push(existing ?? { date: dateStr, total: 0, count: 0 });
  }

  return filled;
}
