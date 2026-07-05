import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  WalletCards,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricTone = "neutral" | "income" | "expense" | "savings";

interface MetricCardProps {
  change: string;
  context: string;
  label: string;
  tone: MetricTone;
  value: string;
}

const TONE_STYLES: Record<
  MetricTone,
  { accent: string; icon: typeof WalletCards }
> = {
  neutral: { accent: "text-foreground bg-muted", icon: WalletCards },
  income: { accent: "text-income bg-income/10", icon: ArrowDownLeft },
  expense: { accent: "text-expense bg-expense/10", icon: ArrowUpRight },
  savings: { accent: "text-savings bg-savings/10", icon: PiggyBank },
};

export function MetricCard({
  change,
  context,
  label,
  tone,
  value,
}: MetricCardProps) {
  const { accent, icon: Icon } = TONE_STYLES[tone];

  return (
    <Card className="min-h-44">
      <CardContent className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className={cn("grid size-8 place-items-center rounded-md", accent)}>
            <Icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
          </span>
        </div>
        <div className="mt-8">
          <p className="font-heading text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
            {value}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            <span
              className={cn(
                "font-medium",
                tone === "expense" ? "text-positive" : "text-foreground",
              )}
            >
              {change}
            </span>{" "}
            {context}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
