"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: string;
  label: string;
}

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, error, id, label, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor={fieldId}
        >
          {label}
        </label>
        <div className="relative">
          <input
            className={cn(
              "flex h-10 w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm text-foreground outline-none transition-all duration-fast ease-standard placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-background/85 focus-visible:glass focus-visible:backdrop-blur-[12px] motion-reduce:transition-none",
              error
                ? "border-negative focus-visible:ring-negative"
                : "border-input hover:border-foreground/20",
              className,
            )}
            id={fieldId}
            ref={ref}
            type={isVisible ? "text" : "password"}
            {...props}
          />
          <button
            aria-label={isVisible ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground outline-none transition-colors duration-fast hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            onClick={() => setIsVisible(!isVisible)}
            tabIndex={-1}
            type="button"
          >
            {isVisible ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
        {error ? (
          <p className="text-xs text-negative" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

PasswordField.displayName = "PasswordField";

export { PasswordField };
