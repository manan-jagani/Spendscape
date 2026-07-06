import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
              <li key={budget.id}>
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
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-large ease-standard motion-reduce:transition-none",
                        index < filledSegments
                          ? TONE_STYLES[budget.tone]
                          : "bg-muted",
                        index < filledSegments &&
                          "hover:opacity-80 hover:scale-110",
                      )}
                      key={index}
                      style={{
                        transitionDelay: `${index * 30}ms`,
                      }}
                    />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
