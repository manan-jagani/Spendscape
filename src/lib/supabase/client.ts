"use client";

import { createBrowserClient } from "@supabase/ssr";

import { publicEnvironment } from "@/lib/env";
import type { Database } from "@/types/database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  browserClient ??= createBrowserClient<Database>(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    publicEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return browserClient;
}
