import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative overflow-hidden rounded-xl bg-muted/30 motion-reduce:animate-none", className)}
    >
      <div className="shimmer-premium absolute inset-0" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <PageContainer aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-3" style={{ animation: "float-up 0.4s ease-out both" }}>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            style={{ animation: `float-up 0.4s ease-out ${index * 0.06}s both` }}
          >
            <Card className="min-h-44">
              <CardContent className="flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="size-8 rounded-md" />
                </div>
                <div className="mt-8 space-y-3">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8" style={{ animation: "float-up 0.4s ease-out 0.3s both" }}>
          <ShimmerBlock className="min-h-96" />
        </div>
        <div className="xl:col-span-4" style={{ animation: "float-up 0.4s ease-out 0.36s both" }}>
          <ShimmerBlock className="min-h-80" />
        </div>
        <div className="xl:col-span-7" style={{ animation: "float-up 0.4s ease-out 0.42s both" }}>
          <ShimmerBlock className="h-96" />
        </div>
        <div className="grid gap-6 xl:col-span-5">
          <div style={{ animation: "float-up 0.4s ease-out 0.48s both" }}>
            <ShimmerBlock className="h-64" />
          </div>
          <div style={{ animation: "float-up 0.4s ease-out 0.54s both" }}>
            <ShimmerBlock className="h-64" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
