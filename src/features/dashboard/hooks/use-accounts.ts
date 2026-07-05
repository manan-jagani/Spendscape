"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "@/lib/query-keys";
import { getAccounts } from "@/lib/queries/accounts";
import { createClient } from "@/lib/supabase/client";

export function useAccounts() {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: queryKeys.accounts(),
    queryFn: () => getAccounts(supabase),
  });
}
