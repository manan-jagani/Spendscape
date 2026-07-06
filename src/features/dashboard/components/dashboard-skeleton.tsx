import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <PageContainer aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card className="min-h-44" key={index}>
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
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="min-h-96 animate-pulse rounded-xl bg-muted/30 motion-reduce:animate-none xl:col-span-8" />
        <div className="min-h-80 animate-pulse rounded-xl bg-muted/30 motion-reduce:animate-none xl:col-span-4" />
        <Skeleton className="h-96 rounded-xl xl:col-span-7" />
        <div className="grid gap-6 xl:col-span-5">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </PageContainer>
  );
}
