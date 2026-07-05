"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { getMonthlySummary } from "@/lib/queries/dashboard";

export function useMonthlySummary(month: string) {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: queryKeys.monthlySummary(month),
    queryFn: () => getMonthlySummary(supabase, month),
  });
}
