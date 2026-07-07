"use client";

import dynamic from "next/dynamic";
import type { PropsWithChildren } from "react";

import { CommandPalette } from "@/components/layout/command-palette";
import { MobileSidebar, Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import type {
  ShellNotification,
  ShellUser,
} from "@/components/layout/types";
import { PageTransition } from "@/components/motion/page-transition";

const DeepSpaceBackground = dynamic(
  () =>
    import("@/components/backgrounds/DeepSpaceBackground").then(
      (m) => m.DeepSpaceBackground,
    ),
  { ssr: false },
);

interface AppShellProps extends PropsWithChildren {
  insightCount: number;
  notifications: readonly ShellNotification[];
  user: ShellUser;
}

function SkipToContentLink() {
  return (
    <a
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      href="#main-content"
    >
      Skip to content
    </a>
  );
}

export function AppShell({
  children,
  insightCount,
  notifications,
  user,
}: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      <SkipToContentLink />
      <DeepSpaceBackground />
      <Sidebar insightCount={insightCount} />
      <MobileSidebar insightCount={insightCount} />
      <div className="relative z-10 min-h-dvh lg:pl-64">
        <TopNavigation notifications={notifications} user={user} />
        <main id="main-content">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
