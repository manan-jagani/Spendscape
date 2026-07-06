"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "@/lib/query-keys";
import { getCategories } from "@/lib/queries/categories";
import { createClient } from "@/lib/supabase/client";

export function useCategories() {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => getCategories(supabase),
  });
}
