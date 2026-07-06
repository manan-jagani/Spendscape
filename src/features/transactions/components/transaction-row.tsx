"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

import type { TransactionPageRow } from "@/types/api.types";

const KIND_STYLES = {
  income: { className: "bg-income/10 text-income", icon: ArrowDownLeft },
  expense: { className: "bg-expense/10 text-expense", icon: ArrowUpRight },
  transfer: { className: "bg-transfer/10 text-transfer", icon: ArrowLeftRight },
} as const;

interface TransactionRowProps {
  transaction: TransactionPageRow;
  onEdit: (transaction: TransactionPageRow) => void;
  onDelete: (transaction: TransactionPageRow) => void;
}

export function TransactionRow({
  transaction,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const { className, icon: Icon } = KIND_STYLES[transaction.kind];

  return (
    <div className="group relative flex items-center gap-3 px-4 py-3 transition-all duration-fast hover:bg-muted/20 motion-reduce:transition-none">
      <div
        aria-hidden="true"
        className="absolute inset-y-2 left-0 w-0.5 rounded-r-md bg-foreground/10 opacity-0 transition-all duration-fast group-hover:opacity-100 motion-reduce:opacity-0"
      />

      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-md transition-transform duration-fast group-hover:scale-105 motion-reduce:transition-none",
          className,
        )}
      >
        <Icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {transaction.merchant ?? "Untitled"}
          </span>
          {transaction.is_recurring && (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              Recurring
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{transaction.category_name ?? "Uncategorized"}</span>
          <span aria-hidden="true">·</span>
          <span>{transaction.account_name}</span>
          <span aria-hidden="true">·</span>
          <span>{formatRelativeTime(transaction.occurred_at)}</span>
        </div>
      </div>

      <span
        className={cn(
          "text-sm font-medium tabular-nums transition-all duration-fast group-hover:mr-0.5 motion-reduce:transition-none",
          transaction.kind === "income" && "text-income",
          transaction.kind === "expense" && "text-foreground",
          transaction.kind === "transfer" && "text-transfer",
        )}
      >
        {formatCurrencyWithSign(transaction.amount, transaction.kind)}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all duration-fast hover:bg-muted group-hover:translate-x-0 group-hover:opacity-100 translate-x-1 focus-visible:translate-x-0 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:translate-x-0 motion-reduce:opacity-100">
          <span className="sr-only">Actions</span>
          <svg
            aria-hidden="true"
            className="size-4"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(transaction)}>
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(transaction)}
            className="text-negative"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function formatCurrencyWithSign(
  amount: number,
  kind: "income" | "expense" | "transfer",
  currency = "INR",
): string {
  const formatted = formatCurrency(amount, currency);
  if (kind === "income") return `+${formatted}`;
  if (kind === "expense") return `−${formatted}`;
  return formatted;
}
