"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Brand } from "@/components/layout/brand";
import {
  PRIMARY_NAVIGATION,
  SECONDARY_NAVIGATION,
} from "@/components/layout/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useShellStore } from "@/stores/shell-store";

function NavigationLinks({
  insightCount,
  onNavigate,
}: {
  insightCount: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="flex flex-1 flex-col">
      <div className="space-y-1">
        {PRIMARY_NAVIGATION.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-all duration-fast ease-standard outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring motion-reduce:transition-none",
                isActive
                  ? "bg-sidebar-accent/20 text-sidebar-foreground shadow-[inset_0_0_0_1px_oklch(1_0_0/0.08)] backdrop-blur-[8px]"
                  : "text-muted-foreground hover:bg-sidebar-accent/12 hover:backdrop-blur-[8px] hover:text-sidebar-foreground hover:shadow-[inset_0_0_0_1px_oklch(1_0_0/0.06)] hover:scale-[1.02]",
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              {isActive ? (
                <div
                  aria-hidden="true"
                  className="absolute inset-y-1 left-0 w-0.5 rounded-r-md bg-sidebar-accent-foreground shadow-[0_0_8px_var(--sidebar-accent-foreground)]"
                />
              ) : null}
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-4 transition-all duration-fast group-hover:scale-110 group-hover:rotate-[2deg] motion-reduce:transition-none",
                  isActive
                    ? "text-sidebar-accent-foreground"
                    : "text-muted-foreground group-hover:text-sidebar-foreground",
                )}
                strokeWidth={1.8}
              />
              <span>{item.label}</span>
              {item.label === "Insights" ? (
                <span className="ml-auto rounded-full bg-investment/15 px-2 py-0.5 text-[0.6875rem] font-medium text-investment ring-1 ring-inset ring-investment/20">
                  {insightCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-1 pt-8">
        {SECONDARY_NAVIGATION.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-all duration-fast ease-standard outline-none hover:bg-sidebar-accent/12 hover:backdrop-blur-[8px] hover:text-sidebar-foreground hover:shadow-[inset_0_0_0_1px_oklch(1_0_0/0.06)] hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-sidebar-ring motion-reduce:transition-none",
                isActive && "bg-sidebar-accent/20 text-sidebar-foreground shadow-[inset_0_0_0_1px_oklch(1_0_0/0.08)] backdrop-blur-[8px]",
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              {isActive ? (
                <div
                  aria-hidden="true"
                  className="absolute inset-y-1 left-0 w-0.5 rounded-r-md bg-sidebar-accent-foreground shadow-[0_0_8px_var(--sidebar-accent-foreground)]"
                />
              ) : null}
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-4 transition-all duration-fast group-hover:scale-110 group-hover:rotate-[2deg] motion-reduce:transition-none",
                  isActive
                    ? "text-sidebar-accent-foreground"
                    : "text-muted-foreground group-hover:text-sidebar-foreground",
                )}
                strokeWidth={1.8}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function SidebarContent({ insightCount }: { insightCount: number }) {
  return (
    <>
      <div className="px-6 pt-6 pb-10">
        <Brand />
      </div>
      <div className="flex flex-1 flex-col px-3 pb-4">
        <NavigationLinks insightCount={insightCount} />
        <div className="mx-3 mt-4 border-t border-sidebar-border pt-4">
          <p className="text-xs font-medium text-sidebar-foreground">
            Personal workspace
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Private and encrypted
          </p>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ insightCount }: { insightCount: number }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col glass-premium-sidebar lg:flex">
      <SidebarContent insightCount={insightCount} />
    </aside>
  );
}

export function MobileSidebar({ insightCount }: { insightCount: number }) {
  const isOpen = useShellStore((state) => state.isMobileNavigationOpen);
  const setOpen = useShellStore((state) => state.setMobileNavigationOpen);

  return (
    <Sheet onOpenChange={setOpen} open={isOpen}>
      <SheetContent>
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Navigate between Spendscape pages.</SheetDescription>
        </SheetHeader>
        <div className="px-6 pt-6 pb-10">
          <Brand />
        </div>
        <div className="flex flex-1 flex-col px-3 pb-4">
          <NavigationLinks
            insightCount={insightCount}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
