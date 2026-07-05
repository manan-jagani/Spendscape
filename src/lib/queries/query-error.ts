import type { PostgrestError } from "@supabase/supabase-js";

export function throwQueryError(error: PostgrestError | null) {
  if (error) {
    throw error;
  }
}
