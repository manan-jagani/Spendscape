"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "@/lib/query-keys";
import { getTransactionsPage } from "@/lib/queries/transactions";
import { createClient } from "@/lib/supabase/client";

export function useRecentTransactions(limit = 4) {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: queryKeys.transactions({ limit }),
    queryFn: () => getTransactionsPage(supabase, { limit, offset: 0 }),
  });
}
