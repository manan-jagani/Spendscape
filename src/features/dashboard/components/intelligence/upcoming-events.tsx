"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { MOTION_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { TransactionPageRow } from "@/types/api.types";

/* ─── Types ──────────────────────────────────────────────────── */

interface EventItem {
  dateLabel: string;
  key: string;
  label: string;
  amount: string;
  group: "today" | "tomorrow" | "week";
}

/* ─── Event detection ─────────────────────────────────────────── */

function detectEvents(transactions: readonly TransactionPageRow[]): EventItem[] {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  const weekEnd = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);

  const items: EventItem[] = [];

  for (const txn of transactions) {
    if (!txn.is_recurring) continue;
    const dateStr = txn.occurred_at.slice(0, 10);

    if (dateStr === today) {
      items.push({
        group: "today",
        key: `today-${txn.id}`,
        label: txn.merchant ?? txn.description ?? "Recurring payment",
        amount: formatCurrency(txn.amount),
        dateLabel: "Today",
      });
    } else if (dateStr === tomorrow) {
      items.push({
        group: "tomorrow",
        key: `tomorrow-${txn.id}`,
        label: txn.merchant ?? txn.description ?? "Recurring payment",
        amount: formatCurrency(txn.amount),
        dateLabel: "Tomorrow",
      });
    } else if (dateStr > today && dateStr <= weekEnd) {
      items.push({
        group: "week",
        key: `week-${txn.id}`,
        label: txn.merchant ?? txn.description ?? "Recurring payment",
        amount: formatCurrency(txn.amount),
        dateLabel: new Date(dateStr).toLocaleDateString("en-IN", { weekday: "long" }),
      });
    }
  }

  return items;
}

/* ─── Group labels ────────────────────────────────────────────── */

const GROUP_LABELS = {
  today: "Today",
  tomorrow: "Tomorrow",
  week: "This Week",
} as const;

/* ─── Component ───────────────────────────────────────────────── */

export function UpcomingEvents({
  transactions,
}: {
  transactions: readonly TransactionPageRow[];
}) {
  const reduce = !!useReducedMotion();

  const events = useMemo(() => detectEvents(transactions), [transactions]);

  const grouped = useMemo(() => {
    const map: Record<string, EventItem[]> = { today: [], tomorrow: [], week: [] };
    for (const e of events) {
      map[e.group]?.push(e);
    }
    return map;
  }, [events]);

  const hasEvents = events.length > 0;

  if (!hasEvents) return null;

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          description="Scheduled payments and renewals"
          title="Upcoming"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(["today", "tomorrow", "week"] as const).map((group, gi) => {
            const items = grouped[group];
            if (!items?.length) return null;

            return (
              <div key={group}>
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {GROUP_LABELS[group]}
                </p>
                <ul className="space-y-1">
                  {items.map((e, ei) => (
                    <motion.li
                      key={e.key}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 transition-colors duration-fast ease-standard motion-reduce:transition-none",
                        "hover:bg-muted/30",
                      )}
                      initial={reduce ? { opacity: 1 } : { opacity: 0, x: -8 }}
                      transition={{ ...MOTION_TRANSITION.fast, delay: gi * 0.08 + ei * 0.04 }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "grid size-7 shrink-0 place-items-center rounded-md text-xs font-medium",
                            group === "today" && "bg-expense/10 text-expense",
                            group === "tomorrow" && "bg-warning/10 text-warning",
                            group === "week" && "bg-transfer/10 text-transfer",
                          )}
                        >
                          {group === "today" ? "•" : group === "tomorrow" ? "○" : "◇"}
                        </span>
                        <span className="text-sm font-medium">{e.label}</span>
                      </div>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {e.amount}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
