import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

interface InsightPreviewProps {
  action: string;
  description: string;
  eyebrow: string;
  title: string;
}

export function InsightPreview({
  action,
  description,
  eyebrow,
  title,
}: InsightPreviewProps) {
  return (
    <Card className="relative h-full overflow-hidden border-investment/20 bg-investment/5">
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 size-48 rounded-full bg-investment/10 blur-3xl"
      />
      <CardContent className="relative flex h-full min-h-80 flex-col">
        <span className="grid size-10 place-items-center rounded-md bg-investment/15 text-investment">
          <Sparkles aria-hidden="true" className="size-4" strokeWidth={1.8} />
        </span>
        <div className="mt-auto pt-12">
          <p className="text-xs font-medium tracking-[0.14em] text-investment uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-3 max-w-md font-heading text-xl font-medium tracking-[-0.03em]">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <Link
            className="mt-6 inline-flex items-center gap-2 rounded-sm text-sm font-medium outline-none transition-colors duration-fast hover:text-investment focus-visible:ring-2 focus-visible:ring-ring"
            href="/insights"
          >
            {action}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
