import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/features/dashboard/components/section-heading";

interface ChartCardProps {
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
  title: string;
  minHeight?: number;
  variant?: "default" | "glass";
}

export function ChartCard({
  actionHref,
  actionLabel,
  children,
  className,
  description,
  title,
  minHeight = 300,
  variant = "default",
}: ChartCardProps) {
  return (
    <Card variant={variant} className={className}>
      <CardHeader>
        <SectionHeading
          actionHref={actionHref}
          actionLabel={actionLabel}
          description={description}
          title={title}
        />
      </CardHeader>
      <CardContent>
        <div className="w-full" style={{ minHeight }}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
