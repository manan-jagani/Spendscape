"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Archive,
  Pencil,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import {
  ACCOUNT_TYPE_COLORS,
  ACCOUNT_TYPE_ICONS,
  ACCOUNT_TYPE_LABELS,
} from "@/features/accounts/types";

import type { AccountRow } from "@/features/accounts/types";

interface AccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountRow | null;
  onEdit: (account: AccountRow) => void;
  onArchive: (account: AccountRow) => void;
  onRestore: (account: AccountRow) => void;
  onDelete: (account: AccountRow) => void;
}

const currencyFormatter = (currency: string, frac = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: frac,
    maximumFractionDigits: frac,
  });

function useAccountTransactions(accountId: string | null) {
  const supabase = useMemo(() => createClient(), []);

  return useQuery({
    queryKey: ["account-transactions", accountId],
    queryFn: async () => {
      if (!accountId) return { inflow: 0, outflow: 0, recent: [] };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: monthly, error: monthlyError } = await supabase
        .from("transactions")
        .select("amount, kind")
        .eq("account_id", accountId)
        .gte("occurred_at", thirtyDaysAgo.toISOString());

      if (monthlyError) throw monthlyError;

      const inflow = (monthly ?? [])
        .filter((t) => t.kind === "income")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const outflow = (monthly ?? [])
        .filter((t) => t.kind === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const { data: recent, error: recentError } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", accountId)
        .order("occurred_at", { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      return { inflow, outflow, recent: recent ?? [] };
    },
    enabled: !!accountId,
  });
}

export function AccountSheet({
  open,
  onOpenChange,
  account,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: AccountSheetProps) {
  const { data: txnData, isLoading: txnLoading } = useAccountTransactions(account?.id ?? null);
  const isArchived = account ? !account.is_active : false;

  if (!account) return null;

  const accentColor = ACCOUNT_TYPE_COLORS[account.type];
  const Icon = ACCOUNT_TYPE_ICONS[account.type];
  const fmt = currencyFormatter(account.currency);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(28rem,92vw)] overflow-y-auto">
        <SheetHeader className="pb-0">
          <SheetTitle className="sr-only">{account.name}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-6 pb-6">
          {/* Account identity */}
          <div className="flex items-center gap-3">
            <div
              className="grid size-10 place-items-center rounded-xl"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Icon className="size-5" style={{ color: accentColor }} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-heading text-lg font-medium text-foreground">
                  {account.name}
                </h2>
                {isArchived && <Badge variant="warning">Archived</Badge>}
              </div>
              {account.institution && (
                <p className="truncate text-sm text-muted-foreground">{account.institution}</p>
              )}
            </div>
          </div>

          {/* Large balance */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current Balance
            </p>
            <p className="mt-1 font-heading text-4xl font-semibold tracking-tight tabular-nums text-foreground">
              {fmt.format(account.current_balance)}
            </p>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/30 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Account Type</p>
              <Badge
                variant="outline"
                className="mt-1 border-none p-0 text-sm font-medium text-foreground"
              >
                {ACCOUNT_TYPE_LABELS[account.type]}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Currency</p>
              <p className="mt-1 text-sm font-medium text-foreground">{account.currency}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {new Date(account.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Monthly cashflow */}
          <div>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Monthly Cashflow
            </h3>
            {txnLoading ? (
              <div className="flex gap-4">
                <Skeleton className="h-16 flex-1 rounded-xl" />
                <Skeleton className="h-16 flex-1 rounded-xl" />
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex flex-1 items-center gap-3 rounded-xl bg-positive/5 p-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-positive/10">
                    <TrendingUp className="size-4 text-positive" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Inflow</p>
                    <p className="font-heading text-base font-semibold tabular-nums text-positive">
                      +{fmt.format(txnData?.inflow ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-3 rounded-xl bg-negative/5 p-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-negative/10">
                    <TrendingDown className="size-4 text-negative" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outflow</p>
                    <p className="font-heading text-base font-semibold tabular-nums text-negative">
                      -{fmt.format(txnData?.outflow ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent transactions */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recent transactions
              </h3>
              <span className="text-xs text-muted-foreground">{txnData?.recent.length ?? 0} this month</span>
            </div>
            {txnLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : txnData?.recent.length ? (
              <div className="flex flex-col gap-1">
                {txnData.recent.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {txn.description || txn.merchant || "Transaction"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(txn.occurred_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-medium tabular-nums ${
                        txn.kind === "income" ? "text-positive" : "text-negative"
                      }`}
                    >
                      {txn.kind === "income" ? "+" : "-"}
                      {fmt.format(Math.abs(txn.amount))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No transactions this month
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2">
            {isArchived ? (
              <Button
                variant="outline"
                onClick={() => { onRestore(account); onOpenChange(false); }}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Restore account
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => { onArchive(account); onOpenChange(false); }}
              >
                <Archive className="size-4" aria-hidden="true" />
                Archive account
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="glass"
                className="flex-1"
                onClick={() => { onEdit(account); onOpenChange(false); }}
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => { onDelete(account); onOpenChange(false); }}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
