"use client";

import { Menu } from "lucide-react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import type {
  ShellNotification,
  ShellUser,
} from "@/components/layout/types";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useShellStore } from "@/stores/shell-store";

interface TopNavigationProps {
  notifications: readonly ShellNotification[];
  user: ShellUser;
}

export function TopNavigation({
  notifications,
  user,
}: TopNavigationProps) {
  const setMobileNavigationOpen = useShellStore(
    (state) => state.setMobileNavigationOpen,
  );

  return (
    <header className="sticky top-0 z-20 glass-premium-nav">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          aria-label="Open navigation"
          className="size-9 lg:hidden"
          onClick={() => setMobileNavigationOpen(true)}
          size="icon"
          variant="ghost"
        >
          <Menu aria-hidden="true" />
        </Button>
        <Breadcrumbs />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <GlobalSearch />
          <NotificationsMenu notifications={notifications} />
          <ThemeToggle />
          <div className="ml-1 border-l border-border pl-2 sm:ml-2 sm:pl-3">
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}
