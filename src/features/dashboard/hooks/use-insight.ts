"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "@/lib/query-keys";
import { getInsights } from "@/lib/queries/insights";
import { createClient } from "@/lib/supabase/client";

export function useInsights() {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: queryKeys.insights(),
    queryFn: () => getInsights(supabase),
  });
}
