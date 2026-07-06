"use client";

import { Field } from "@base-ui/react/field";

import { cn } from "@/lib/utils";

function Label({
  className,
  nativeLabel = true,
  ...props
}: Field.Label.Props) {
  return (
    <Field.Label
      data-slot="label"
      nativeLabel={nativeLabel}
      className={cn(
        "text-sm font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
