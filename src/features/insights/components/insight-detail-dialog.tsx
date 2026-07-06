"use client";

import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMarkRead } from "@/features/insights/hooks/use-mark-read";

import type { InsightRow } from "@/features/insights/types";
import { INSIGHT_KIND_LABELS } from "@/features/insights/types";

interface InsightDetailDialogProps {
  insight: InsightRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InsightDetailDialog({
  insight,
  open,
  onOpenChange,
}: InsightDetailDialogProps) {
  const markRead = useMarkRead();

  if (!insight) return null;

  const kindLabel = INSIGHT_KIND_LABELS[insight.kind] ?? insight.kind;

  const handleMarkRead = async () => {
    if (!insight.is_read) {
      await markRead.mutateAsync(insight.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "grid size-10 place-items-center rounded-lg",
                insight.is_read
                  ? "bg-muted text-muted-foreground"
                  : "bg-investment/15 text-investment",
              )}
            >
              <Sparkles aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </span>
            <div className="flex flex-col">
              <DialogTitle className="text-base">{insight.title}</DialogTitle>
              <DialogDescription className="text-xs">
                {kindLabel} ·{" "}
                {new Date(insight.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          <p className="text-sm leading-relaxed text-foreground">{insight.body}</p>

          <div className="mt-6 flex items-center gap-2">
            <Badge variant={insight.is_read ? "default" : "transfer"}>
              {kindLabel}
            </Badge>
            {insight.is_read ? (
              <Badge variant="outline">Read</Badge>
            ) : (
              <Badge variant="success">New</Badge>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            {!insight.is_read && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkRead}
                isLoading={markRead.isPending}
              >
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
