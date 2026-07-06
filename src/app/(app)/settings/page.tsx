import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/server";
import { SettingsPageClient } from "@/features/settings/components/settings-page-client";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireUser();

  return <SettingsPageClient email={user.email ?? ""} />;
}
