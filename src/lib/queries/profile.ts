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

export async function updateProfile(
  client: DatabaseClient,
  userId: string,
  values: { full_name: string; currency: string },
) {
  const { error } = await client
    .from("profiles")
    .update(values)
    .eq("id", userId)
    .throwOnError();

  throwQueryError(error);
}
