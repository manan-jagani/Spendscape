import { throwQueryError } from "@/lib/queries/query-error";
import type { DatabaseClient } from "@/lib/supabase/types";

export async function getProfile(client: DatabaseClient) {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .limit(1)
    .maybeSingle();

  throwQueryError(error);
  return data;
}
