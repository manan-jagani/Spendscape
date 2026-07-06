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
        className="hidden h-9 w-64 items-center gap-3 rounded-md border border-border bg-background/60 px-3 text-sm text-muted-foreground shadow-sm outline-none transition-all duration-fast hover:border-border-strong hover:bg-background/85 hover:text-foreground hover:glass hover:backdrop-blur-[12px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:glass focus-visible:backdrop-blur-[12px] md:flex motion-reduce:transition-none"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search aria-hidden="true" className="size-4" />
        <span>Search anything</span>
        <kbd className="ml-auto rounded-sm border border-border bg-muted/60 px-1.5 py-0.5 font-sans text-[0.6875rem] text-muted-foreground backdrop-blur-sm">
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
