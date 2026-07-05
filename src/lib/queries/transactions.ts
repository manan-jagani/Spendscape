import { transactionsPageSchema } from "@/lib/queries/api-schemas";
import { throwQueryError } from "@/lib/queries/query-error";
import type { DatabaseClient } from "@/lib/supabase/types";
import type { TransactionFilters } from "@/types/api.types";

const DEFAULT_PAGE_SIZE = 50;

export async function getTransactionsPage(
  client: DatabaseClient,
  filters: TransactionFilters = {},
) {
  const { data, error } = await client.rpc("get_transactions_page", {
    p_kind: filters.kind ?? undefined,
    p_category_id: filters.categoryId ?? undefined,
    p_account_id: filters.accountId ?? undefined,
    p_date_from: filters.dateFrom ?? undefined,
    p_date_to: filters.dateTo ?? undefined,
    p_search: filters.search ?? undefined,
    p_limit: filters.limit ?? DEFAULT_PAGE_SIZE,
    p_offset: filters.offset ?? 0,
  });

  throwQueryError(error);
  return transactionsPageSchema.parse(data);
}
