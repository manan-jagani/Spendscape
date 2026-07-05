import { Orbit } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface VisualizationPlaceholderProps {
  description: string;
  eyebrow: string;
  question: string;
  title: string;
}

export function VisualizationPlaceholder({
  description,
  eyebrow,
  question,
  title,
}: VisualizationPlaceholderProps) {
  return (
    <Card className="relative min-h-96 overflow-hidden bg-surface">
      <CardContent className="grid h-full min-h-96 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] lg:items-center">
        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-medium tracking-[0.14em] text-transfer uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground">
            {question}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground">
            <Orbit aria-hidden="true" className="size-3.5 text-transfer" />
            Visualization foundation reserved
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative mx-auto grid aspect-square w-full max-w-80 place-items-center"
        >
          <span className="absolute size-full rounded-full border border-border/60" />
          <span className="absolute size-3/4 rounded-full border border-border" />
          <span className="absolute size-1/2 rounded-full border border-border/80" />
          <span className="size-16 rounded-full border border-transfer/30 bg-transfer/10 shadow-card-hover" />
          <span className="absolute top-10 left-1/2 size-4 -translate-x-1/2 rounded-full bg-income shadow-sm" />
          <span className="absolute right-8 bottom-1/3 size-6 rounded-full bg-investment shadow-sm" />
          <span className="absolute bottom-8 left-1/3 size-3 rounded-full bg-savings shadow-sm" />
        </div>
      </CardContent>
    </Card>
  );
}
