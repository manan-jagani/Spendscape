"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

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
