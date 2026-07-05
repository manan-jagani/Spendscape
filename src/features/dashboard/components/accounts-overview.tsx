import { Landmark } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { cn } from "@/lib/utils";

type AccountTone = "transfer" | "savings" | "expense";

interface AccountItem {
  balance: string;
  id: string;
  institution: string;
  name: string;
  tone: AccountTone;
}

const TONE_STYLES: Record<AccountTone, string> = {
  transfer: "bg-transfer",
  savings: "bg-savings",
  expense: "bg-expense",
};

export function AccountsOverview({
  accounts,
}: {
  accounts: readonly AccountItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          actionHref="/accounts"
          actionLabel="Manage"
          title="Accounts"
        />
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {accounts.map((account) => (
            <li className="flex items-center gap-3" key={account.id}>
              <span className="relative grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <Landmark
                  aria-hidden="true"
                  className="size-4"
                  strokeWidth={1.8}
                />
                <span
                  className={cn(
                    "absolute right-0 bottom-0 size-2 rounded-full ring-2 ring-card",
                    TONE_STYLES[account.tone],
                  )}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {account.name}
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {account.institution}
                </span>
              </span>
              <span className="text-sm font-medium tabular-nums">
                {account.balance}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
