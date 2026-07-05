"use client";

import type { PropsWithChildren } from "react";

import { CommandPalette } from "@/components/layout/command-palette";
import { MobileSidebar, Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import type {
  ShellNotification,
  ShellUser,
} from "@/components/layout/types";
import { PageTransition } from "@/components/motion/page-transition";

interface AppShellProps extends PropsWithChildren {
  insightCount: number;
  notifications: readonly ShellNotification[];
  user: ShellUser;
}

export function AppShell({
  children,
  insightCount,
  notifications,
  user,
}: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar insightCount={insightCount} />
      <MobileSidebar insightCount={insightCount} />
      <div className="min-h-dvh lg:pl-64">
        <TopNavigation notifications={notifications} user={user} />
        <main id="main-content">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
