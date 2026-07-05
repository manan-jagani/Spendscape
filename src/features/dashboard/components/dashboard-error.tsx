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
      <Card className="mx-auto mt-20 max-w-md text-center">
        <CardContent className="py-12">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-negative/10 text-negative">
            <AlertTriangle aria-hidden="true" className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            Could not load dashboard
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong while fetching your financial data. Please try
            again.
          </p>
          {onRetry ? (
            <Button
              className="mt-6"
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
