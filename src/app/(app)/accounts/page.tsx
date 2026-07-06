import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { AccountsPageClient } from "@/features/accounts/components/accounts-page-client";

export const metadata: Metadata = {
  title: "Accounts",
};

export default function AccountsPage() {
  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="font-heading text-xl font-medium text-foreground">
          Accounts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your bank accounts, credit cards, and more.
        </p>
      </div>

      <AccountsPageClient />
    </PageContainer>
  );
}
