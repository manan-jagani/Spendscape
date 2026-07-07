import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { requireUser } from "@/lib/auth/server";
import { SettingsPageClient } from "@/features/settings/components/settings-page-client";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="font-heading text-xl font-medium text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences.
        </p>
      </div>

      <SettingsPageClient email={user.email ?? ""} />
    </PageContainer>
  );
}
