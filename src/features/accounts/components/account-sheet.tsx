"use client";

import { useCallback } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AccountForm } from "@/features/accounts/components/account-form";
import { useCreateAccount } from "@/features/accounts/hooks/use-create-account";
import { useUpdateAccount } from "@/features/accounts/hooks/use-update-account";

import type { AccountFormValues, AccountRow } from "@/features/accounts/types";

interface AccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: AccountRow | null;
}

export function AccountSheet({
  open,
  onOpenChange,
  account,
}: AccountSheetProps) {
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  const handleSubmit = useCallback(
    async (values: AccountFormValues) => {
      if (account) {
        await updateMutation.mutateAsync({
          id: account.id,
          name: values.name,
          institution: values.institution || null,
          type: values.type,
          currency: values.currency,
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          institution: values.institution || null,
          type: values.type,
          currency: values.currency,
          current_balance: values.current_balance
            ? Number(values.current_balance)
            : 0,
        });
      }

      onOpenChange(false);
    },
    [account, createMutation, updateMutation, onOpenChange],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(24rem,92vw)]">
        <SheetHeader>
          <SheetTitle>
            {account ? "Edit account" : "Add account"}
          </SheetTitle>
          <SheetDescription>
            {account
              ? "Update the account details below."
              : "Enter the details of your new account."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <AccountForm
            account={account}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
