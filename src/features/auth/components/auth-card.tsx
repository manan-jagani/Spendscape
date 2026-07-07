import { WalletCards } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function AuthCard({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative grid min-h-dvh place-items-center px-4 py-12",
        className,
      )}
      {...props}
    >
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            aria-label="Spendscape home"
            className="inline-flex items-center gap-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            href="/"
          >
            <WalletCards
              aria-hidden="true"
              className="size-6"
              strokeWidth={1.8}
            />
            <span className="text-lg font-semibold tracking-tight">
              Spendscape
            </span>
          </Link>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/80 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
