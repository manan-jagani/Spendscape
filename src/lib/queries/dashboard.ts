import { monthlySummarySchema } from "@/lib/queries/api-schemas";
import { throwQueryError } from "@/lib/queries/query-error";
import type { DatabaseClient } from "@/lib/supabase/types";

export async function getMonthlySummary(
  client: DatabaseClient,
  month: string,
) {
  const { data, error } = await client.rpc("get_monthly_summary", {
    p_month: month,
  });

  throwQueryError(error);
  return monthlySummarySchema.parse(data);
}
