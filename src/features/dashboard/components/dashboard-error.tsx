import { AlertTriangle, RefreshCcw } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardError({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  return (
    <PageContainer>
      <Card className="mx-auto mt-20 max-w-md text-center" variant="glass">
        <CardContent className="py-16">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-negative/10 text-negative ring-1 ring-negative/20">
            <AlertTriangle aria-hidden="true" className="size-6" strokeWidth={1.5} />
          </span>
          <h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
            Could not load dashboard
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Something went wrong while fetching your financial data.
            <br />
            Please try again.
          </p>
          {onRetry ? (
            <Button
              className="mt-8"
              onClick={onRetry}
              variant="outline"
            >
              <RefreshCcw aria-hidden="true" className="size-4" />
              Try again
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
