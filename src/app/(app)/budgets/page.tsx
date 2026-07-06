import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { BudgetsPageClient } from "@/features/budgets/components/budgets-page-client";

export const metadata: Metadata = {
  title: "Budgets",
};

export default function BudgetsPage() {
  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="font-heading text-xl font-medium text-foreground">
          Budgets
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set spending limits and track your progress across categories.
        </p>
      </div>

      <BudgetsPageClient />
    </PageContainer>
  );
}
