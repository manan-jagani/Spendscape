"use client";

import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { COMMAND_NAVIGATION } from "@/components/layout/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useShellStore } from "@/stores/shell-store";

export function CommandPalette() {
  const router = useRouter();
  const isOpen = useShellStore((state) => state.isCommandPaletteOpen);
  const setOpen = useShellStore((state) => state.setCommandPaletteOpen);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!isOpen);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <Dialog onOpenChange={setOpen} open={isOpen}>
      <DialogContent className="overflow-hidden p-0" showCloseButton={false}>
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search and navigate through Spendscape.
        </DialogDescription>
        <CommandPrimitive className="flex max-h-[60dvh] flex-col sm:max-h-[28rem]">
          <div className="flex h-14 items-center gap-3 border-b border-border px-4">
            <Search
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            <CommandPrimitive.Input
              aria-label="Search commands"
              autoFocus
              className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-inset"
              placeholder="Search pages and actions…"
            />
            <kbd className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-sans text-[0.6875rem] text-muted-foreground">
              Esc
            </kbd>
          </div>
          <CommandPrimitive.List className="overflow-y-auto p-2">
            <CommandPrimitive.Empty className="px-3 py-12 text-center text-sm text-muted-foreground">
              No matching destination.
            </CommandPrimitive.Empty>
            <CommandPrimitive.Group
              className="text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
              heading="Navigate"
            >
              {COMMAND_NAVIGATION.map((item) => {
                const Icon = item.icon;

                return (
                  <CommandPrimitive.Item
                    className="flex h-10 cursor-default items-center gap-3 rounded-md px-3 text-sm font-normal text-foreground outline-none transition-colors duration-fast data-[selected=true]:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none"
                    key={item.href}
                    onSelect={() => navigate(item.href)}
                    value={item.label}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                      strokeWidth={1.8}
                    />
                    {item.label}
                  </CommandPrimitive.Item>
                );
              })}
            </CommandPrimitive.Group>
          </CommandPrimitive.List>
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <span>Spendscape quick navigation</span>
            <span>↑↓ to move · ↵ to open</span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
