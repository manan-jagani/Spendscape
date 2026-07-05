import type { TransactionFilters } from "@/types/api.types";

export const queryKeys = {
  profile: () => ["profile"] as const,
  accounts: () => ["accounts"] as const,
  categories: () => ["categories"] as const,
  insights: () => ["insights"] as const,
  insightsUnread: () => ["insights", "unread"] as const,
  transactions: (filters: TransactionFilters) =>
    ["transactions", filters] as const,
  monthlySummary: (month: string) => ["monthly-summary", month] as const,
} as const;
