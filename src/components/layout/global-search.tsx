"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useShellStore } from "@/stores/shell-store";

export function GlobalSearch() {
  const setOpen = useShellStore((state) => state.setCommandPaletteOpen);

  return (
    <>
      <button
        aria-label="Search Spendscape"
        className="group hidden h-9 w-64 items-center gap-3 rounded-md border border-border bg-background/60 px-3 text-sm text-muted-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.06)] outline-none transition-all duration-fast ease-standard hover:border-border-strong hover:bg-background/85 hover:text-foreground hover:shadow-[inset_0_1px_0_oklch(1_0_0/0.1),_0_2px_8px_oklch(0_0_0/0.04)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:shadow-[inset_0_1px_0_oklch(1_0_0/0.12),_0_0_0_2px_var(--ring)] md:flex motion-reduce:transition-none"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search aria-hidden="true" className="size-4 transition-transform duration-fast group-hover:scale-105 group-focus-visible:scale-105" />
        <span>Search anything</span>
        <kbd className="ml-auto rounded-sm border border-border bg-muted/60 px-1.5 py-0.5 font-sans text-[0.6875rem] text-muted-foreground backdrop-blur-sm transition-all duration-fast group-hover:bg-muted/80 group-focus-visible:bg-muted/80">
          ⌘K
        </kbd>
      </button>
      <Button
        aria-label="Search Spendscape"
        className="size-9 md:hidden"
        onClick={() => setOpen(true)}
        size="icon"
        variant="ghost"
      >
        <Search aria-hidden="true" />
      </Button>
    </>
  );
}
