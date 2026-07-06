"use client";

import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ACCOUNT_TYPE_COLORS,
  ACCOUNT_TYPE_LABELS,
} from "@/features/accounts/types";

import type { AccountRow } from "@/features/accounts/types";

interface AccountCardProps {
  account: AccountRow;
  onEdit: (account: AccountRow) => void;
  onArchive: (account: AccountRow) => void;
  onRestore: (account: AccountRow) => void;
}

const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export function AccountCard({
  account,
  onEdit,
  onArchive,
  onRestore,
}: AccountCardProps) {
  const accentColor = ACCOUNT_TYPE_COLORS[account.type];
  const isArchived = !account.is_active;

  return (
    <Card
      size="sm"
      className="relative flex flex-col transition-all duration-fast hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none"
    >
      <div
        className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl"
        style={{ backgroundColor: accentColor }}
      />

      <CardContent className="flex flex-1 flex-col gap-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider"
                style={{
                  borderColor: accentColor,
                  color: accentColor,
                }}
              >
                {ACCOUNT_TYPE_LABELS[account.type]}
              </Badge>
              {isArchived && (
                <Badge variant="warning">Archived</Badge>
              )}
            </div>
            <h3
              className={`font-heading text-base font-medium leading-snug text-foreground ${isArchived ? "text-muted-foreground" : ""}`}
            >
              {account.name}
            </h3>
            {account.institution && (
              <p className="text-xs text-muted-foreground">
                {account.institution}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 shrink-0"
                />
              }
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Account actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={2}>
              <DropdownMenuItem onClick={() => onEdit(account)}>
                Edit
              </DropdownMenuItem>
              {isArchived ? (
                <DropdownMenuItem onClick={() => onRestore(account)}>
                  Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onArchive(account)}
                >
                  Archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-auto">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p
            className={`font-heading text-2xl font-semibold tracking-tight ${isArchived ? "text-muted-foreground" : "text-foreground"}`}
          >
            {currencyFormatter(account.currency).format(account.current_balance)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
