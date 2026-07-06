"use client";

import { useMemo } from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getUnreadInsightIds } from "@/lib/queries/insights";
import { createClient } from "@/lib/supabase/client";

export function useMarkAllRead() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const unreadIds = await getUnreadInsightIds(supabase);
      if (!unreadIds || unreadIds.length === 0) return;

      const ids = unreadIds.map((i) => i.id);

      const { error } = await supabase.rpc("mark_insights_read", {
        p_ids: ids,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insights() });
    },
  });
}
