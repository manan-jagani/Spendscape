"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { createClient } from "@/lib/supabase/client";

export function useSignOut() {
  const router = useRouter();

  return useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    router.push("/login");
    router.refresh();
  }, [router]);
}
