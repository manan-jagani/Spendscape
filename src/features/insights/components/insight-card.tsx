"use client";

import { memo } from "react";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { InsightRow } from "@/features/insights/types";
import { INSIGHT_KIND_LABELS } from "@/features/insights/types";

interface InsightCardProps {
  insight: InsightRow;
  onSelect: (insight: InsightRow) => void;
}

export const InsightCard = memo(function InsightCard({
  insight,
  onSelect,
}: InsightCardProps) {
  const kindLabel = INSIGHT_KIND_LABELS[insight.kind] ?? insight.kind;

  return (
    <Card
      size="sm"
      className={cn(
        "relative flex cursor-pointer flex-col transition-all duration-fast hover:-translate-y-0.5 hover:shadow-lg hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
        !insight.is_read && "border-l-[3px] border-l-investment",
      )}
      onClick={() => onSelect(insight)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(insight);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${kindLabel}: ${insight.title}`}
    >
      <CardContent className="flex flex-col gap-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-md",
                insight.is_read
                  ? "bg-muted text-muted-foreground"
                  : "bg-investment/15 text-investment",
              )}
            >
              <Sparkles aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">
                {kindLabel}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!insight.is_read && (
              <span className="size-2 rounded-full bg-investment" aria-label="Unread" />
            )}
            <span className="text-xs tabular-nums text-muted-foreground">
              {new Date(insight.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h3
            className={cn(
              "font-heading text-sm font-medium leading-snug",
              insight.is_read ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {insight.title}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {insight.body}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={insight.is_read ? "default" : "transfer"} className="text-[10px]">
            {kindLabel}
          </Badge>
          {insight.is_read && (
            <Badge variant="outline" className="text-[10px]">
              Read
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
