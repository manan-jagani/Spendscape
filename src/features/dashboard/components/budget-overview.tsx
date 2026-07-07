"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PremiumHover } from "@/components/motion/premium-hover";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { cn } from "@/lib/utils";

type BudgetTone = "income" | "transfer" | "warning";

interface BudgetItem {
  detail: string;
  id: string;
  name: string;
  progress: number;
  tone: BudgetTone;
}

const TONE_STYLES: Record<BudgetTone, string> = {
  income: "bg-income",
  transfer: "bg-transfer",
  warning: "bg-warning",
};

export function BudgetOverview({
  budgets,
}: {
  budgets: readonly BudgetItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          actionHref="/budgets"
          actionLabel="View budgets"
          title="Budget pace"
        />
      </CardHeader>
      <CardContent>
        <ul className="space-y-5">
          {budgets.map((budget) => {
            const filledSegments = Math.round(budget.progress / 10);

            return (
              <PremiumHover key={budget.id} mode="row">
              <li>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="font-medium">{budget.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {budget.detail}
                  </span>
                </div>
                <div
                  aria-label={`${budget.name}: ${budget.progress}% used`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={budget.progress}
                  className="mt-3 grid grid-cols-10 gap-1"
                  role="progressbar"
                >
                  {Array.from({ length: 10 }, (_, index) => (
                    <motion.span
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 rounded-full",
                        index < filledSegments
                          ? TONE_STYLES[budget.tone]
                          : "bg-muted",
                      )}
                      key={index}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: index * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformOrigin: "bottom" }}
                    />
                  ))}
                </div>
              </li>
              </PremiumHover>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
