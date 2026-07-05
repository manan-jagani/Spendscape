"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "@/lib/query-keys";
import { getBudgets } from "@/lib/queries/budgets";
import { createClient } from "@/lib/supabase/client";

export function useBudgets() {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: queryKeys.budgets(),
    queryFn: () => getBudgets(supabase),
  });
}
