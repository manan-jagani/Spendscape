import { throwQueryError } from "@/lib/queries/query-error";
import type { DatabaseClient } from "@/lib/supabase/types";

export async function getInsights(client: DatabaseClient) {
  const { data, error } = await client
    .from("insights")
    .select("*")
    .order("created_at", { ascending: false });

  throwQueryError(error);
  return data;
}

export async function getUnreadInsightIds(client: DatabaseClient) {
  const { data, error } = await client
    .from("insights")
    .select("id")
    .eq("is_read", false);

  throwQueryError(error);
  return data;
}
