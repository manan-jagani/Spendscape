"use client";

import { useMemo } from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/components/ui/toast";

export function useDeleteBudget() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.budgets() });
      const previous = queryClient.getQueryData(queryKeys.budgets());
      queryClient.setQueryData(queryKeys.budgets(), (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old.filter((b: { id: string }) => b.id !== id);
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.budgets(), context.previous);
      }
      addToast({
        type: "error",
        title: "Failed to delete budget",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
      addToast({
        type: "success",
        title: "Budget deleted",
        description: "The budget has been permanently removed.",
      });
    },
  });
}
