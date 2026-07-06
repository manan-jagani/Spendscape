import type { DailyExpense } from "@/visualizations/lib/use-daily-expenses";

export type TimelineData = DailyExpense;

export interface TimelinePoint {
  date: Date;
  value: number;
}
