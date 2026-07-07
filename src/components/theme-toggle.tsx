"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <Button
        aria-label="Change color theme"
        className={cn("size-9", className)}
        disabled
        size="icon"
        variant="ghost"
      >
        <Moon aria-hidden="true" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className={cn("size-9", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size="icon"
      variant="ghost"
    >
      <span className="relative size-4">
        <Sun
          aria-hidden="true"
          className={`absolute inset-0 size-4 transition-all duration-500 motion-reduce:transition-none ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"}`}
          style={{ transitionTimingFunction: "var(--ease-standard)" }}
        />
        <Moon
          aria-hidden="true"
          className={`absolute inset-0 size-4 transition-all duration-500 motion-reduce:transition-none ${isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
          style={{ transitionTimingFunction: "var(--ease-standard)" }}
        />
      </span>
    </Button>
  );
}
