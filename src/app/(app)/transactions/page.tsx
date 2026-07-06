import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { TransactionsPageClient } from "@/features/transactions/components/transactions-page-client";

export const metadata: Metadata = {
  title: "Transactions",
};

export default function TransactionsPage() {
  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="font-heading text-xl font-medium text-foreground">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage all your transactions.
        </p>
      </div>

      <TransactionsPageClient />
    </PageContainer>
  );
}
