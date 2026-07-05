import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { dashboardMock } from "@/features/dashboard/mock";

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
  return (
    <AppShell
      insightCount={dashboardMock.shell.insightCount}
      notifications={dashboardMock.shell.notifications}
      user={dashboardMock.shell.user}
    >
      {children}
    </AppShell>
  );
}
