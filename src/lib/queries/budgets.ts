import { throwQueryError } from "@/lib/queries/query-error";
import type { DatabaseClient } from "@/lib/supabase/types";

export async function getBudgets(client: DatabaseClient) {
  const { data, error } = await client
    .from("budgets")
    .select("*, categories(name)")
    .order("created_at");

  throwQueryError(error);
  return data;
}
