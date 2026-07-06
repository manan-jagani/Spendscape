"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getMonthlyCategorySpending } from "@/lib/queries/budgets";
import { createClient } from "@/lib/supabase/client";

export function useMonthlySpending(month: string) {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: ["monthly-spending", month] as const,
    queryFn: () => getMonthlyCategorySpending(supabase, month),
    staleTime: 60 * 1000,
  });
}
