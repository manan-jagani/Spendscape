import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { cn } from "@/lib/utils";

type TransactionKind = "income" | "expense" | "transfer";

interface TransactionItem {
  amount: string;
  category: string;
  id: string;
  kind: TransactionKind;
  merchant: string;
  time: string;
}

const KIND_STYLES: Record<
  TransactionKind,
  { className: string; icon: typeof ArrowDownLeft }
> = {
  income: { className: "bg-income/10 text-income", icon: ArrowDownLeft },
  expense: { className: "bg-expense/10 text-expense", icon: ArrowUpRight },
  transfer: { className: "bg-transfer/10 text-transfer", icon: ArrowLeftRight },
};

export function RecentTransactions({
  transactions,
}: {
  transactions: readonly TransactionItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          actionHref="/transactions"
          actionLabel="View all"
          description="Your latest movement"
          title="Recent transactions"
        />
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {transactions.map((transaction) => {
            const { className, icon: Icon } = KIND_STYLES[transaction.kind];

            return (
              <li
                className="flex items-center gap-3 py-4 first:pt-2 last:pb-0"
                key={transaction.id}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-md",
                    className,
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className="size-4"
                    strokeWidth={1.8}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {transaction.merchant}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {transaction.category} · {transaction.time}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-sm font-medium tabular-nums",
                    transaction.kind === "income" && "text-income",
                    transaction.kind === "expense" && "text-foreground",
                    transaction.kind === "transfer" && "text-transfer",
                  )}
                >
                  {transaction.amount}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
