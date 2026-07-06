import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
}

const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ className, error, id, label, ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor={fieldId}
        >
          {label}
        </label>
        <input
          className={cn(
            "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all duration-fast ease-standard placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-background/85 focus-visible:glass focus-visible:backdrop-blur-[12px] motion-reduce:transition-none",
            error
              ? "border-negative focus-visible:ring-negative"
              : "border-input hover:border-foreground/20",
            className,
          )}
          id={fieldId}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="text-xs text-negative" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

AuthField.displayName = "AuthField";

export { AuthField };
