import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { AccountsPageClient } from "@/features/accounts/components/accounts-page-client";

export const metadata: Metadata = {
  title: "Accounts",
  description: "Manage your bank accounts, credit cards, and investment portfolios.",
};

export default function AccountsPage() {
  return (
    <PageContainer>
      <AccountsPageClient />
    </PageContainer>
  );
}
