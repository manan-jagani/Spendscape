"use client";

import { AppearanceSection } from "@/features/settings/components/appearance-section";
import { NotificationsSection } from "@/features/settings/components/notifications-section";
import { PreferencesSection } from "@/features/settings/components/preferences-section";
import { ProfileSection } from "@/features/settings/components/profile-section";
import { SecuritySection } from "@/features/settings/components/security-section";

interface SettingsPageClientProps {
  email: string;
}

export function SettingsPageClient({ email }: SettingsPageClientProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6 sm:py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <ProfileSection email={email} />
      <AppearanceSection />
      <PreferencesSection />
      <NotificationsSection />
      <SecuritySection />
    </div>
  );
}
