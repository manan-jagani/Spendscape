"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/client";

export function useProfile() {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: () => getProfile(supabase),
  });
}
