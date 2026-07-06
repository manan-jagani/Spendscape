"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background transition-all duration-fast ease-standard placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none data-invalid:border-negative data-invalid:focus-visible:ring-negative focus-visible:glass-premium focus-visible:shadow-[inset_0_1px_2px_oklch(0_0_0/0.2)]",
  {
    variants: {
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface InputProps extends Omit<InputPrimitive.Props, "size"> {
  size?: "default" | "sm" | "lg";
}

function Input({
  className,
  size = "default",
  ...props
}: InputProps) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(inputVariants({ size, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
