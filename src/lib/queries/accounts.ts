import { throwQueryError } from "@/lib/queries/query-error";
import type { DatabaseClient } from "@/lib/supabase/types";

export async function getAccounts(client: DatabaseClient) {
  const { data, error } = await client
    .from("accounts")
    .select("*")
    .order("name");

  throwQueryError(error);
  return data;
}
