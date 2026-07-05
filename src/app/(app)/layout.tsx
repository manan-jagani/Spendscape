import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/server";

export default async function AuthenticatedLayout({
  children,
}: PropsWithChildren) {
  const user = await requireUser();

  const shellUser = {
    name: user.user_metadata.full_name as string,
    email: user.email ?? "",
    initials: ((user.user_metadata.full_name as string) ?? "?")
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
  };

  return (
    <AppShell
      insightCount={0}
      notifications={[]}
      user={shellUser}
    >
      {children}
    </AppShell>
  );
}
