"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "@/lib/query-keys";
import { getTransactionsPage } from "@/lib/queries/transactions";
import { createClient } from "@/lib/supabase/client";

import type { TransactionFiltersState } from "@/features/transactions/types";

export function useTransactions(filters: TransactionFiltersState) {
  const supabase = useMemo(() => createClient(), []);

  const queryKey = queryKeys.transactions({
    kind: filters.kind,
    categoryId: filters.categoryId,
    accountId: filters.accountId,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    search: filters.search || null,
    limit: filters.limit,
    offset: filters.offset,
  });

  return useQuery({
    queryKey,
    queryFn: () =>
      getTransactionsPage(supabase, {
        kind: filters.kind ?? undefined,
        categoryId: filters.categoryId ?? undefined,
        accountId: filters.accountId ?? undefined,
        dateFrom: filters.dateFrom ?? undefined,
        dateTo: filters.dateTo ?? undefined,
        search: filters.search || undefined,
        limit: filters.limit,
        offset: filters.offset,
      }),
    placeholderData: (previousData) => previousData,
  });
}
