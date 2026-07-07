"use client";

import { useMemo, useState } from "react";
import { CheckCheck, Search, Sparkles } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { useInsights } from "@/features/insights/hooks/use-insights";
import { useMarkAllRead } from "@/features/insights/hooks/use-mark-all-read";
import { InsightCard } from "@/features/insights/components/insight-card";
import { InsightDetailDialog } from "@/features/insights/components/insight-detail-dialog";

import type { InsightRow, InsightFilterKind, ReadFilter, SortOption } from "@/features/insights/types";
import { FILTER_KIND_OPTIONS } from "@/features/insights/types";

function InsightCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <Skeleton className="size-8 shrink-0 rounded-md" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-5 w-24 rounded-full" />
    </div>
  );
}

function InsightGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <InsightCardSkeleton key={i} />
      ))}
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-background/30 px-6 py-16 text-center backdrop-blur-sm">
      <div className="grid size-14 place-items-center rounded-full bg-investment/10 ring-1 ring-investment/20">
        <Sparkles aria-hidden="true" className="size-6 text-investment" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-medium text-foreground">
          {hasFilters ? "No matching insights" : "No insights yet"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? "Try adjusting your filters to see more insights."
            : "Insights will appear here as the AI analyzes your spending patterns."}
        </p>
      </div>
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
          Failed to load insights
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

export function InsightsPageClient() {
  const { data: insights, isLoading, error, refetch } = useInsights();
  const markAllRead = useMarkAllRead();

  const [searchQuery, setSearchQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<InsightFilterKind>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const [selectedInsight, setSelectedInsight] = useState<InsightRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const unreadCount = useMemo(
    () => insights?.filter((i) => !i.is_read).length ?? 0,
    [insights],
  );

  const processedInsights = useMemo(() => {
    if (!insights) return [];

    let filtered = [...insights];

    if (kindFilter !== "all") {
      filtered = filtered.filter((i) => i.kind === kindFilter);
    }

    if (readFilter === "read") {
      filtered = filtered.filter((i) => i.is_read);
    } else if (readFilter === "unread") {
      filtered = filtered.filter((i) => !i.is_read);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.body.toLowerCase().includes(q),
      );
    }

    filtered.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    return filtered;
  }, [insights, kindFilter, readFilter, searchQuery, sortOption]);

  const handleSelectInsight = (insight: InsightRow) => {
    setSelectedInsight(insight);
    setDetailOpen(true);
  };

  let content: React.ReactNode;

  if (isLoading) {
    content = <InsightGridSkeleton />;
  } else if (error) {
    content = <ErrorState error={error} onRetry={() => refetch()} />;
  } else if (!insights || insights.length === 0) {
    content = <EmptyState hasFilters={false} />;
  } else if (processedInsights.length === 0) {
    content = <EmptyState hasFilters={true} />;
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {processedInsights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onSelect={handleSelectInsight}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "All caught up"}
            </span>
          </div>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => markAllRead.mutate()}
              isLoading={markAllRead.isPending}
            >
              <CheckCheck className="size-3.5" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search insights..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTER_KIND_OPTIONS.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={kindFilter === option.value ? "default" : "ghost"}
              onClick={() => setKindFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant={readFilter === "all" ? "ghost" : "default"}
              onClick={() =>
                setReadFilter(readFilter === "unread" ? "all" : "unread")
              }
            >
              {readFilter === "unread" ? "Unread" : "All"}
            </Button>

            <Select
              value={sortOption}
              onValueChange={(v) => setSortOption(v as SortOption)}
            >
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectPopup>
                <SelectList>
                  {(["newest", "oldest"] as SortOption[]).map((option) => (
                    <SelectItem key={option} value={option}>
                      <SelectItemText>
                        {option === "newest" ? "Newest" : "Oldest"}
                      </SelectItemText>
                    </SelectItem>
                  ))}
                </SelectList>
              </SelectPopup>
            </Select>
          </div>
        </div>
      </div>

      {content}

      <InsightDetailDialog
        insight={selectedInsight}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
