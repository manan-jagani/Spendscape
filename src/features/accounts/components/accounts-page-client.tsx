"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  Plus,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { PremiumHover } from "@/components/motion/premium-hover";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastContainer } from "@/components/ui/toast";
import { MOTION_TRANSITION, SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AccountCard } from "@/features/accounts/components/account-card";
import { AccountForm } from "@/features/accounts/components/account-form";
import { AccountSheet as AccountDetailSheet } from "@/features/accounts/components/account-sheet";
import { useArchiveAccount } from "@/features/accounts/hooks/use-archive-account";
import { useCreateAccount } from "@/features/accounts/hooks/use-create-account";
import { useDeleteAccount } from "@/features/accounts/hooks/use-delete-account";
import { useRestoreAccount } from "@/features/accounts/hooks/use-restore-account";
import { useUpdateAccount } from "@/features/accounts/hooks/use-update-account";
import { useAccounts } from "@/features/dashboard/hooks/use-accounts";

import type { AccountFormValues, AccountRow, AccountType, SortOption } from "@/features/accounts/types";
import {
  ACCOUNT_TYPE_COLORS,
  ACCOUNT_TYPE_ICONS,
  ACCOUNT_TYPE_LABELS,
  SORT_OPTIONS,
} from "@/features/accounts/types";

/* ─── Helpers ─── */

const currencyFormatter = (currency: string, frac = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: frac,
    maximumFractionDigits: frac,
  });

const INR = currencyFormatter("INR");

/* ─── Skeleton ─── */

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <Skeleton className="size-9 rounded-lg" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-3 w-24" />
      <div className="h-px bg-border/50" />
      <Skeleton className="h-7 w-28" />
    </div>
  );
}

function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-12 w-36 rounded-md" />
    </div>
  );
}

function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── Donut Chart ─── */

function PortfolioDonut({
  segments,
}: {
  segments: { type: AccountType; value: number; color: string; label: string }[];
}) {
  const total = segments.reduce((s, s_) => s + s_.value, 0) || 1;
  const cx = 60;
  const cy = 60;
  const r = 48;
  const circumference = 2 * Math.PI * r;

  const arcs: { type: AccountType; value: number; color: string; label: string; fraction: number; length: number; offset: number }[] = [];
  for (const seg of segments) {
    const fraction = seg.value / total;
    const length = fraction * circumference;
    const offset = arcs.length > 0 ? arcs[arcs.length - 1]!.offset + arcs[arcs.length - 1]!.length : 0;
    arcs.push({ ...seg, fraction, length, offset });
  }

  return (
    <svg viewBox="0 0 120 120" className="size-28 shrink-0" aria-label="Portfolio allocation">
      {arcs.map((arc) => (
        <circle
          key={arc.type}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth="10"
          strokeDasharray={`${arc.length} ${circumference - arc.length}`}
          strokeDashoffset={-arc.offset}
          transform="rotate(-90 60 60)"
          className="transition-all duration-charts ease-standard motion-reduce:transition-none"
        />
      ))}
      <circle cx={cx} cy={cy} r={r - 8} fill="transparent" className="fill-background/50 backdrop-blur-sm" />
    </svg>
  );
}

/* ─── Insight Card ─── */

function InsightCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: typeof TrendingUp;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <PremiumHover
      mode="card"
      className="flex items-start gap-3 rounded-xl border p-3.5 motion-reduce:transition-none"
      style={{ borderColor: `${color}20`, backgroundColor: `${color}08` }}
    >
      <div
        className="grid size-9 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="size-4" style={{ color }} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </PremiumHover>
  );
}

/* ─── Metric Card ─── */

function MetricCard({
  icon: Icon,
  label,
  value,
  delay,
  className,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  delay: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...MOTION_TRANSITION.normal, delay }}
      whileHover={{ y: -4, scale: 1.015, transition: SPRING.card }}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/30 bg-background/20 p-4 backdrop-blur-sm motion-reduce:transition-none",
        className,
      )}
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted/30">
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-heading text-lg font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Main ─── */

type ConfirmAction = "archive" | "restore" | "delete";

export function AccountsPageClient() {
  const { data: accounts, isLoading, error, refetch } = useAccounts();

  /* Create / Edit state */
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountRow | null>(null);

  /* Detail sheet state */
  const [selectedAccount, setSelectedAccount] = useState<AccountRow | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  /* Confirm dialog state */
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmAccount, setConfirmAccount] = useState<AccountRow | null>(null);

  /* Filters */
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("active");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showArchived, setShowArchived] = useState(false);
  const [insightsDismissed, setInsightsDismissed] = useState(false);

  /* Mutations */
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const archiveMutation = useArchiveAccount();
  const restoreMutation = useRestoreAccount();
  const deleteMutation = useDeleteAccount();

  /* ── Derived data ── */

  const allActive = useMemo(
    () => (accounts ?? []).filter((a) => a.is_active),
    [accounts],
  );
  const allArchived = useMemo(
    () => (accounts ?? []).filter((a) => !a.is_active),
    [accounts],
  );
  const totalBal = useMemo(
    () => (accounts ?? []).reduce((s, a) => s + a.current_balance, 0),
    [accounts],
  );

  const filtered = useMemo(() => {
    const source = statusFilter === "all" ? accounts ?? [] : statusFilter === "archived" ? allArchived : allActive;

    let result = source;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.institution ?? "").toLowerCase().includes(q),
      );
    }
    if (typeFilter !== "all") {
      result = result.filter((a) => a.type === typeFilter);
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "highest-balance": return b.current_balance - a.current_balance;
        case "lowest-balance": return a.current_balance - b.current_balance;
        case "alphabetical": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
  }, [accounts, searchQuery, typeFilter, statusFilter, sortBy, allActive, allArchived]);

  const typeBalances = useMemo(() => {
    const map: Partial<Record<AccountType, number>> = {};
    for (const a of accounts ?? []) {
      map[a.type] = (map[a.type] ?? 0) + a.current_balance;
    }
    return map as Record<AccountType, number>;
  }, [accounts]);

  const typeSegments = useMemo(
    () =>
      (Object.entries(typeBalances) as [AccountType, number][])
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([type, value]) => ({
          type,
          value,
          color: ACCOUNT_TYPE_COLORS[type],
          label: ACCOUNT_TYPE_LABELS[type],
        })),
    [typeBalances],
  );

  const insights = useMemo(() => {
    const list: { icon: typeof TrendingUp; title: string; description: string; color: string }[] = [];
    const checkingBal = allActive.filter((a) => a.type === "checking").reduce((s, a) => s + a.current_balance, 0);
    const totalActiveBal = allActive.reduce((s, a) => s + a.current_balance, 0);

    if (totalActiveBal > 0 && checkingBal / totalActiveBal > 0.5) {
      list.push({
        icon: TrendingUp,
        title: `${Math.round((checkingBal / totalActiveBal) * 100)}% of your money is sitting idle.`,
        description: "Consider moving excess cash into savings or investments.",
        color: ACCOUNT_TYPE_COLORS.checking,
      });
    }
    if (allActive.filter((a) => a.type === "investment").length === 0 && totalActiveBal > 50000) {
      list.push({
        icon: TrendingUp,
        title: "No investment accounts yet.",
        description: "Start building wealth with a diversified portfolio.",
        color: ACCOUNT_TYPE_COLORS.investment,
      });
    }
    return list;
  }, [allActive]);

  /* ── Handlers ── */

  const handleCreate = () => {
    setEditingAccount(null);
    setFormSheetOpen(true);
  };

  const handleEdit = (account: AccountRow) => {
    setEditingAccount(account);
    setDetailSheetOpen(false);
    setFormSheetOpen(true);
  };

  const handleSelect = (account: AccountRow) => {
    setSelectedAccount(account);
    setDetailSheetOpen(true);
  };

  const handleArchive = (account: AccountRow) => {
    setConfirmAction("archive");
    setConfirmAccount(account);
  };

  const handleRestore = (account: AccountRow) => {
    setConfirmAction("restore");
    setConfirmAccount(account);
  };

  const handleDelete = (account: AccountRow) => {
    setConfirmAction("delete");
    setConfirmAccount(account);
  };

  const handleConfirm = async () => {
    if (!confirmAccount) return;
    try {
      if (confirmAction === "archive") {
        await archiveMutation.mutateAsync(confirmAccount.id);
      } else if (confirmAction === "restore") {
        await restoreMutation.mutateAsync(confirmAccount.id);
      } else if (confirmAction === "delete") {
        await deleteMutation.mutateAsync(confirmAccount);
      }
    } catch { /* toast handles it */ }
    setConfirmAction(null);
    setConfirmAccount(null);
  };

  const handleFormSubmit = async (values: AccountFormValues) => {
    if (editingAccount) {
      await updateMutation.mutateAsync({
        id: editingAccount.id,
        name: values.name,
        institution: values.institution || null,
        type: values.type,
        currency: values.currency,
        current_balance: values.current_balance ? Number(values.current_balance) : undefined,
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        institution: values.institution || null,
        type: values.type,
        currency: values.currency,
        current_balance: values.current_balance ? Number(values.current_balance) : 0,
      });
    }
    setFormSheetOpen(false);
  };

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  /* ── Loading ── */

  if (isLoading) {
    return <GridSkeleton />;
  }

  /* ── Error ── */

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-background/30 px-6 py-16 text-center backdrop-blur-sm">
        <div className="grid size-14 place-items-center rounded-full bg-negative/10 ring-1 ring-negative/20">
          <span aria-hidden="true" className="text-lg text-negative">!</span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-medium text-foreground">Failed to load accounts</h3>
          <p className="text-sm text-muted-foreground">{error.message || "Something went wrong."}</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  /* ── Empty ── */

  if (!accounts || accounts.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center gap-6 rounded-xl border border-border/30 bg-background/20 px-6 py-20 text-center backdrop-blur-sm">
          <div className="grid size-20 place-items-center rounded-2xl bg-muted/30 ring-1 ring-border/30">
            <Wallet className="size-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-xl font-medium text-foreground">Create your first account</h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              Start tracking your finances by adding a bank account, credit card, or investment portfolio.
            </p>
          </div>
          <Button onClick={handleCreate} size="lg">
            <Plus className="size-4" aria-hidden="true" />
            Add account
          </Button>
        </div>

        <AccountDetailSheet
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
          account={selectedAccount}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
        <CreateEditSheet
          open={formSheetOpen}
          onOpenChange={setFormSheetOpen}
          account={editingAccount}
          onSubmit={handleFormSubmit}
          isSubmitting={isFormSubmitting}
        />
        <ToastContainer />
      </>
    );
  }

  /* ── Normal content ── */

  return (
    <>
      <div className="flex flex-col gap-8">

        {/* Page Header */}
        <Reveal delay={0}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                Accounts
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your money across every institution.
              </p>
            </div>
            <Button onClick={handleCreate} size="lg">
              <Plus className="size-4" aria-hidden="true" />
              Add account
            </Button>
          </div>
        </Reveal>

        {/* Metrics Row */}
        <Reveal delay={0.04}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
            <MetricCard icon={Wallet} label="Total Balance" value={INR.format(Math.round(totalBal))} delay={0.04} />
            <MetricCard
              icon={Landmark}
              label="Accounts"
              value={`${allActive.length} active${allArchived.length > 0 ? ` / ${allArchived.length} archived` : ""}`}
              delay={0.08}
            />
            <MetricCard
              icon={TrendingUp}
              label="Net Worth"
              value={INR.format(Math.round(totalBal))}
              delay={0.12}
              className="col-span-2 sm:col-span-1"
            />
          </div>
        </Reveal>

        {/* Portfolio Donut + Type Summary */}
        {typeSegments.length > 1 && (
          <Reveal delay={0.16}>
            <div className="flex items-center gap-6 rounded-xl border border-border/30 bg-background/20 p-4 backdrop-blur-sm sm:p-5">
              <PortfolioDonut segments={typeSegments} />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Portfolio</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {typeSegments.map((seg) => (
                    <div key={seg.type} className="flex items-center gap-2">
                      <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span className="truncate text-sm text-foreground">{seg.label}</span>
                      <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                        {totalBal > 0 ? Math.round((seg.value / totalBal) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Summary Cards */}
        <Reveal delay={0.2}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {(Object.entries(typeBalances) as [AccountType, number][])
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([type, value], i) => {
                const Icon = ACCOUNT_TYPE_ICONS[type];
                const color = ACCOUNT_TYPE_COLORS[type];
                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...MOTION_TRANSITION.normal, delay: 0.24 + i * 0.04 }}
                    whileHover={{ y: -4, scale: 1.015, transition: SPRING.card }}
                    className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-border/30 bg-background/20 p-4 backdrop-blur-sm motion-reduce:transition-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-8 place-items-center rounded-lg" style={{ backgroundColor: `${color}15` }}>
                        <Icon className="size-4" style={{ color }} aria-hidden="true" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{ACCOUNT_TYPE_LABELS[type]}</span>
                    </div>
                    <p className="font-heading text-xl font-semibold tabular-nums tracking-tight text-foreground">
                      {currencyFormatter("INR").format(Math.round(value))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {totalBal > 0 ? Math.round((value / totalBal) * 100) : 0}% of portfolio
                    </p>
                  </motion.div>
                );
              })}
          </div>
        </Reveal>

        {/* Insights */}
        {insights.length > 0 && !insightsDismissed && (
          <Reveal delay={0.32}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Insights</p>
                <button
                  type="button"
                  onClick={() => setInsightsDismissed(true)}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Dismiss
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {insights.map((insight, i) => (
                  <InsightCard key={i} {...insight} />
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Search + Filters */}
        <Reveal delay={0.36}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search accounts"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AccountType | "all")}>
                <SelectTrigger className="w-32" aria-label="Filter by type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectList>
                    <SelectItem value="all"><SelectItemText>All types</SelectItemText></SelectItem>
                    {(Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}><SelectItemText>{label}</SelectItemText></SelectItem>
                    ))}
                  </SelectList>
                </SelectPopup>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-32" aria-label="Filter by status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectList>
                    <SelectItem value="active"><SelectItemText>Active</SelectItemText></SelectItem>
                    <SelectItem value="archived"><SelectItemText>Archived</SelectItemText></SelectItem>
                    <SelectItem value="all"><SelectItemText>All</SelectItemText></SelectItem>
                  </SelectList>
                </SelectPopup>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-36" aria-label="Sort by">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectList>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}><SelectItemText>{opt.label}</SelectItemText></SelectItem>
                    ))}
                  </SelectList>
                </SelectPopup>
              </Select>
            </div>
          </div>
        </Reveal>

        {/* Accounts Grid */}
        <Reveal delay={0.4}>
          {filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((account, i) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...MOTION_TRANSITION.normal, delay: 0.44 + i * 0.04 }}
                >
                  <AccountCard
                    account={account}
                    portfolioFraction={totalBal > 0 ? account.current_balance / totalBal : 0}
                    onSelect={handleSelect}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/50 px-6 py-12 text-center">
              <Wallet className="size-8 text-muted-foreground/50" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || typeFilter !== "all"
                  ? "No accounts match your filters."
                  : "No accounts yet."}
              </p>
              {(searchQuery || typeFilter !== "all") && (
                <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setTypeFilter("all"); }}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </Reveal>

        {/* Archived Section */}
        {allArchived.length > 0 && statusFilter !== "archived" && (
          <Reveal delay={0.48}>
            <div className="rounded-xl border border-border/20">
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-expanded={showArchived}
                aria-controls="archived-section"
              >
                <span>{allArchived.length} archived {allArchived.length === 1 ? "account" : "accounts"}</span>
                <motion.svg
                  animate={{ rotate: showArchived ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m18 15-6-6-6 6" />
                </motion.svg>
              </button>
              {showArchived && (
                <div id="archived-section" className="border-t border-border/20 p-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {allArchived.map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        portfolioFraction={totalBal > 0 ? account.current_balance / totalBal : 0}
                        onSelect={handleSelect}
                        onEdit={handleEdit}
                        onArchive={handleArchive}
                        onRestore={handleRestore}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>

      {/* Detail Sheet */}
      <AccountDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        account={selectedAccount}
        onEdit={handleEdit}
        onArchive={handleArchive}
        onRestore={handleRestore}
        onDelete={handleDelete}
      />

      {/* Create / Edit Form Sheet */}
      <CreateEditSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        account={editingAccount}
        onSubmit={handleFormSubmit}
        isSubmitting={isFormSubmitting}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) { setConfirmAction(null); setConfirmAccount(null); }
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "delete" ? "Delete account" : confirmAction === "archive" ? "Archive account" : "Restore account"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "delete"
                ? `Are you sure you want to delete "${confirmAccount?.name}"? If transactions exist, it will be archived instead.`
                : confirmAction === "archive"
                  ? `Are you sure you want to archive "${confirmAccount?.name}"? It will be hidden from most views.`
                  : `Are you sure you want to restore "${confirmAccount?.name}"? It will reappear in account lists.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => { setConfirmAction(null); setConfirmAccount(null); }}
              disabled={archiveMutation.isPending || restoreMutation.isPending || deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === "restore" ? "default" : "danger"}
              onClick={handleConfirm}
              isLoading={
                confirmAction === "archive" ? archiveMutation.isPending
                  : confirmAction === "restore" ? restoreMutation.isPending
                    : deleteMutation.isPending
              }
            >
              {confirmAction === "delete" ? "Delete" : confirmAction === "archive" ? "Archive" : "Restore"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toasts */}
      <ToastContainer />
    </>
  );
}

/* ─── Create/Edit Sheet (inline form) ─── */

function CreateEditSheet({
  open,
  onOpenChange,
  account,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountRow | null;
  onSubmit: (values: AccountFormValues) => Promise<void>;
  isSubmitting: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(24rem,92vw)]">
        <SheetHeader>
          <SheetTitle>{account ? "Edit account" : "Add account"}</SheetTitle>
          <SheetDescription>
            {account ? "Update the account details below." : "Enter the details of your new account."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <AccountForm
            account={account}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
