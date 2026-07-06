"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
] as const;

export function AppearanceSection() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const currentTheme = theme ?? "system";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how Spendscape looks on your device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium text-foreground">
            Theme
          </legend>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = mounted && currentTheme === option.value;
              return (
                <button
                  key={option.value}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm transition-all duration-fast focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
                    isSelected
                      ? "border-ring bg-accent text-accent-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground hover:shadow-sm",
                  )}
                  onClick={() => setTheme(option.value)}
                  type="button"
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}
