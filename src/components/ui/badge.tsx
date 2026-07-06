import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors duration-fast motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        income: "bg-income/10 text-income",
        expense: "bg-expense/10 text-expense",
        transfer: "bg-transfer/10 text-transfer",
        success: "bg-positive/10 text-positive",
        warning: "bg-warning/10 text-warning",
        danger: "bg-negative/10 text-negative",
        outline: "border border-border text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
