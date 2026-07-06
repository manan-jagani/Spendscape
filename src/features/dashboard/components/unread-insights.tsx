"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { INSIGHT_KIND_LABELS } from "@/features/insights/types";

import type { InsightRow } from "@/features/insights/types";

interface UnreadInsightsProps {
  insights: InsightRow[];
}

export function UnreadInsights({ insights }: UnreadInsightsProps) {
  const unread = insights.filter((i) => !i.is_read).slice(0, 3);

  if (unread.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          actionHref="/insights"
          actionLabel="View all"
          title="Latest insights"
        />
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {unread.map((insight) => {
            const kindLabel = INSIGHT_KIND_LABELS[insight.kind] ?? insight.kind;
            return (
              <li key={insight.id}>
                <Link
                  className="group flex items-start gap-3 rounded-md outline-none transition-colors duration-fast hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                  href="/insights"
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-investment/15 text-investment">
                    <Sparkles aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {kindLabel}
                    </span>
                    <span className="text-sm font-medium text-foreground group-hover:text-investment transition-colors duration-fast line-clamp-1">
                      {insight.title}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {insight.body}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
