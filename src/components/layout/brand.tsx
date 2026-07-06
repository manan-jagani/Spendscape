import Link from "next/link";

import { PRODUCT_MARK_ICON } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

interface BrandProps {
  className?: string;
  compact?: boolean;
}

export function Brand({ className, compact = false }: BrandProps) {
  const Mark = PRODUCT_MARK_ICON;

  return (
    <Link
      aria-label="Spendscape dashboard"
      className={cn(
        "inline-flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      href="/dashboard"
    >
      <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm transition-transform duration-fast hover:scale-105 motion-reduce:transition-none">
        <Mark aria-hidden="true" className="size-4" strokeWidth={1.8} />
      </span>
      {!compact ? (
        <span className="font-heading text-base font-semibold tracking-[-0.03em]">
          Spendscape
        </span>
      ) : null}
    </Link>
  );
}
