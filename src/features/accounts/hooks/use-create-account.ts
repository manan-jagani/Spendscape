"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "@/lib/query-keys";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/components/ui/toast";

import type { CreateAccountInput } from "@/features/accounts/types";

export function useCreateAccount() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (input: CreateAccountInput) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("accounts")
        .insert({ ...input, user_id: user.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      addToast({ type: "success", title: "Account created" });
    },
    onError: () => {
      addToast({ type: "error", title: "Failed to create account" });
    },
  });
}
