import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function PageContainer({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-360 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12",
        className,
      )}
      {...props}
    />
  );
}
