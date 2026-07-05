import { throwQueryError } from "@/lib/queries/query-error";
import type { DatabaseClient } from "@/lib/supabase/types";

export async function getCategories(client: DatabaseClient) {
  const { data, error } = await client
    .from("categories")
    .select("*")
    .order("name");

  throwQueryError(error);
  return data;
}
