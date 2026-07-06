import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { InsightsPageClient } from "@/features/insights/components/insights-page-client";

export const metadata: Metadata = {
  title: "Insights",
};

export default function InsightsPage() {
  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="font-heading text-xl font-medium text-foreground">
          Insights
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered insights about your spending patterns, opportunities, and
          financial behaviour.
        </p>
      </div>

      <InsightsPageClient />
    </PageContainer>
  );
}
