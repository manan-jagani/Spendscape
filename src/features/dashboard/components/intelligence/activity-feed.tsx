"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { formatRelativeTime } from "@/lib/formatters";
import { MOTION_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { TransactionPageRow } from "@/types/api.types";

/* ─── Kind styles ─────────────────────────────────────────────── */

const KIND_STYLES = {
  income: { badge: "bg-income/10 text-income", icon: "↓" },
  expense: { badge: "bg-expense/10 text-expense", icon: "↑" },
  transfer: { badge: "bg-transfer/10 text-transfer", icon: "↔" },
} as const;

/* ─── Component ───────────────────────────────────────────────── */

export function ActivityFeed({
  transactions,
}: {
  transactions: readonly TransactionPageRow[];
}) {
  const reduce = !!useReducedMotion();

  if (transactions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          description="Your latest transactions"
          title="Activity"
        />
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {transactions.map((txn, i) => {
            const style = KIND_STYLES[txn.kind as keyof typeof KIND_STYLES] ?? KIND_STYLES.expense;

            return (
              <motion.li
                key={txn.id}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors duration-fast ease-standard motion-reduce:transition-none",
                  "hover:bg-muted/30",
                )}
                initial={reduce ? { opacity: 1 } : { opacity: 0, x: -8 }}
                transition={{ ...MOTION_TRANSITION.fast, delay: i * 0.04 }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-md text-xs font-medium",
                      style.badge,
                    )}
                  >
                    {style.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {txn.merchant ?? txn.description ?? "Transaction"}
                    </p>
                    {txn.occurred_at && (
                      <p className="text-[11px] text-muted-foreground">
                        {formatRelativeTime(txn.occurred_at)}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-sm tabular-nums shrink-0 ml-2",
                    style.badge.replace("bg-", "text-").replace("/10", ""),
                  )}
                >
                  {txn.amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0, signDisplay: "exceptZero" })}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
