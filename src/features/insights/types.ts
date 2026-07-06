import type { Enums, Tables } from "@/types/database.types";

export type InsightKind = Enums<"insight_kind">;

export type InsightRow = Tables<"insights">;

export type InsightFilterKind = InsightKind | "all";

export type SortOption = "newest" | "oldest";

export type ReadFilter = "all" | "read" | "unread";

export const INSIGHT_KIND_LABELS: Record<InsightKind, string> = {
  pattern: "Spending Pattern",
  anomaly: "Anomaly",
  forecast: "Forecast",
  achievement: "Achievement",
  subscription: "Subscription",
};

export const INSIGHT_KIND_ICONS: Record<InsightKind, string> = {
  pattern: "trending-up",
  anomaly: "alert-triangle",
  forecast: "bar-chart-3",
  achievement: "trophy",
  subscription: "repeat",
};

export const FILTER_KIND_OPTIONS: { value: InsightFilterKind; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pattern", label: "Spending" },
  { value: "anomaly", label: "Anomaly" },
  { value: "forecast", label: "Forecast" },
  { value: "achievement", label: "Achievement" },
  { value: "subscription", label: "Subscription" },
];
