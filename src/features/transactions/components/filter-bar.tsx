"use client";

import { Search, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/features/dashboard/hooks/use-accounts";
import { useCategories } from "@/features/transactions/hooks/use-categories";

import type { TransactionFiltersState, TransactionKind } from "@/features/transactions/types";

interface FilterBarProps {
  filters: TransactionFiltersState;
  onFiltersChange: (filters: Partial<TransactionFiltersState>) => void;
  onReset: () => void;
}

const KIND_ITEMS = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "transfer", label: "Transfer" },
] as const;

export function FilterBar({
  filters,
  onFiltersChange,
  onReset,
}: FilterBarProps) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  const hasActiveFilters =
    filters.kind !== null ||
    filters.categoryId !== null ||
    filters.accountId !== null ||
    filters.dateFrom !== null ||
    filters.dateTo !== null ||
    filters.search !== "";

  const accountItems =
    accounts?.map((a) => ({ value: a.id, label: a.name })) ?? [];
  const categoryItems =
    categories?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Search transactions"
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value, offset: 0 })}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.kind ?? ""}
          onValueChange={(value) =>
            onFiltersChange({
              kind: (value || null) as TransactionKind | null,
              offset: 0,
            })
          }
          items={[{ value: "", label: "All types" }, ...KIND_ITEMS]}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              <SelectItem value="">
                <SelectItemText>All types</SelectItemText>
              </SelectItem>
              {KIND_ITEMS.map((kind) => (
                <SelectItem key={kind.value} value={kind.value}>
                  <SelectItemText>{kind.label}</SelectItemText>
                </SelectItem>
              ))}
            </SelectList>
          </SelectPopup>
        </Select>

        <Select
          value={filters.accountId ?? ""}
          onValueChange={(value) =>
            onFiltersChange({
              accountId: (value as string) || null,
              offset: 0,
            })
          }
          items={[{ value: "", label: "All accounts" }, ...accountItems]}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All accounts" />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              <SelectItem value="">
                <SelectItemText>All accounts</SelectItemText>
              </SelectItem>
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <SelectItemText>{account.name}</SelectItemText>
                </SelectItem>
              ))}
            </SelectList>
          </SelectPopup>
        </Select>

        <Select
          value={filters.categoryId ?? ""}
          onValueChange={(value) =>
            onFiltersChange({
              categoryId: (value as string) || null,
              offset: 0,
            })
          }
          items={[{ value: "", label: "All categories" }, ...categoryItems]}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              <SelectItem value="">
                <SelectItemText>All categories</SelectItemText>
              </SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <SelectItemText>{category.name}</SelectItemText>
                </SelectItem>
              ))}
            </SelectList>
          </SelectPopup>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={onReset} title="Reset filters">
            <RotateCcw aria-hidden="true" className="size-4" />
            <span className="sr-only">Reset filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}
