"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  dashboard: "Overview",
  transactions: "Transactions",
  accounts: "Accounts",
  budgets: "Budgets",
  insights: "Insights",
  settings: "Settings",
  profile: "Profile",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm">
        <li className="hidden text-muted-foreground sm:block">
          <Link
            className="rounded-sm outline-none transition-all duration-fast hover:text-foreground hover:bg-muted/50 hover:px-1.5 hover:-mx-1.5 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            href="/dashboard"
          >
            Workspace
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isCurrent = index === segments.length - 1;

          return (
            <li className="flex items-center gap-2" key={href}>
              <ChevronRight
                aria-hidden="true"
                className="hidden size-3 text-muted-foreground/50 sm:block"
              />
              {isCurrent ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {LABELS[segment] ?? segment}
                </span>
              ) : (
                <Link
                  className="rounded-sm outline-none transition-all duration-fast hover:bg-muted/50 hover:px-1.5 hover:-mx-1.5 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  href={href}
                >
                  {LABELS[segment] ?? segment}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
