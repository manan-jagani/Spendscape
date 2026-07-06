"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountCard } from "@/features/accounts/components/account-card";
import { AccountSheet } from "@/features/accounts/components/account-sheet";
import { useArchiveAccount } from "@/features/accounts/hooks/use-archive-account";
import { useRestoreAccount } from "@/features/accounts/hooks/use-restore-account";
import { useAccounts } from "@/features/dashboard/hooks/use-accounts";

import type { AccountRow } from "@/features/accounts/types";

type ConfirmAction = "archive" | "restore";

function AccountCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="size-8 shrink-0 rounded-md" />
      </div>
      <div className="mt-auto flex flex-col gap-1">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-7 w-28" />
      </div>
    </div>
  );
}

function AccountGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <AccountCardSkeleton key={i} />
      ))}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-background/30 px-6 py-16 text-center backdrop-blur-sm">
      <div className="grid size-14 place-items-center rounded-full bg-background/80 ring-1 ring-border/50">
        <span className="text-lg">💰</span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-medium text-foreground">
          No accounts yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Create your first account to start tracking your finances.
        </p>
      </div>
      <Button onClick={onCreate}>Add account</Button>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-background/30 px-6 py-16 text-center backdrop-blur-sm">
      <div className="grid size-14 place-items-center rounded-full bg-negative/10 ring-1 ring-negative/20">
        <span className="text-lg text-negative">!</span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-medium text-foreground">
          Failed to load accounts
        </h3>
        <p className="text-sm text-muted-foreground">
          {error.message || "Something went wrong. Please try again."}
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export function AccountsPageClient() {
  const { data: accounts, isLoading, error, refetch } = useAccounts();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountRow | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmAccount, setConfirmAccount] = useState<AccountRow | null>(null);

  const archiveMutation = useArchiveAccount();
  const restoreMutation = useRestoreAccount();

  const activeAccounts =
    accounts?.filter((a) => a.is_active) ?? [];
  const archivedAccounts =
    accounts?.filter((a) => !a.is_active) ?? [];

  const handleCreate = () => {
    setEditingAccount(null);
    setSheetOpen(true);
  };

  const handleEdit = (account: AccountRow) => {
    setEditingAccount(account);
    setSheetOpen(true);
  };

  const handleArchive = (account: AccountRow) => {
    setConfirmAction("archive");
    setConfirmAccount(account);
  };

  const handleRestore = (account: AccountRow) => {
    setConfirmAction("restore");
    setConfirmAccount(account);
  };

  const handleConfirm = async () => {
    if (!confirmAccount) return;

    try {
      if (confirmAction === "archive") {
        await archiveMutation.mutateAsync(confirmAccount.id);
      } else {
        await restoreMutation.mutateAsync(confirmAccount.id);
      }
    } catch {
      // Error state is handled by the query invalidation
    }

    setConfirmAction(null);
    setConfirmAccount(null);
  };

  let content: React.ReactNode;

  if (isLoading) {
    content = <AccountGridSkeleton />;
  } else if (error) {
    content = <ErrorState error={error} onRetry={() => refetch()} />;
  } else if (!accounts || accounts.length === 0) {
    content = <EmptyState onCreate={handleCreate} />;
  } else {
    content = (
      <>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {activeAccounts.length} active
            {archivedAccounts.length > 0
              ? ` · ${archivedAccounts.length} archived`
              : ""}
          </p>
          <Button onClick={handleCreate} size="sm">
            Add account
          </Button>
        </div>

        {activeAccounts.length > 0 && (
          <section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                />
              ))}
            </div>
          </section>
        )}

        {archivedAccounts.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 font-heading text-sm font-medium text-muted-foreground">
              Archived
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {archivedAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                />
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  return (
    <>
      {content}

      <AccountSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        account={editingAccount}
      />

      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
            setConfirmAccount(null);
          }
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "archive" ? "Archive account" : "Restore account"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "archive"
                ? `Are you sure you want to archive "${confirmAccount?.name}"? It will be hidden from most views, but historical transactions will remain intact.`
                : `Are you sure you want to restore "${confirmAccount?.name}"? It will reappear in account lists and selectors.`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setConfirmAction(null);
                setConfirmAccount(null);
              }}
              disabled={archiveMutation.isPending || restoreMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === "archive" ? "danger" : "default"}
              onClick={handleConfirm}
              isLoading={
                confirmAction === "archive"
                  ? archiveMutation.isPending
                  : restoreMutation.isPending
              }
            >
              {confirmAction === "archive" ? "Archive" : "Restore"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
