"use client";

import { useMemo } from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/components/ui/toast";

import type { CreateBudgetInput } from "@/features/budgets/types";

export function useCreateBudget() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (input: CreateBudgetInput) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("budgets")
        .insert({ ...input, user_id: user.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
      addToast({
        type: "success",
        title: "Budget created",
        description: "Your budget has been set up successfully.",
      });
    },
    onError: () => {
      addToast({
        type: "error",
        title: "Failed to create budget",
        description: "Something went wrong. Please try again.",
      });
    },
  });
}
