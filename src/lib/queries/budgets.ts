import { throwQueryError } from "@/lib/queries/query-error";
import type { DatabaseClient } from "@/lib/supabase/types";

export async function getBudgets(client: DatabaseClient) {
  const { data, error } = await client
    .from("budgets")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  throwQueryError(error);
  return data;
}

export async function getBudgetById(client: DatabaseClient, id: string) {
  const { data, error } = await client
    .from("budgets")
    .select("*, categories(name)")
    .eq("id", id)
    .single();

  throwQueryError(error);
  return data;
}

export async function getMonthlyCategorySpending(client: DatabaseClient, month: string) {
  const { data, error } = await client
    .from("transactions")
    .select("category_id, amount")
    .eq("kind", "expense")
    .gte("occurred_at", month)
    .lte("occurred_at", getMonthEnd(month));

  throwQueryError(error);
  return data ?? [];
}

function getMonthEnd(month: string): string {
  const parts = month.split("-");
  const year = Number(parts[0]);
  const mon = Number(parts[1]);
  const end = new Date(year, mon, 0);
  return end.toISOString().slice(0, 10);
}
