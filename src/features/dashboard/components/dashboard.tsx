import { PageContainer } from "@/components/layout/page-container";
import { Reveal } from "@/components/motion/reveal";
import { AccountsOverview } from "@/features/dashboard/components/accounts-overview";
import { BudgetOverview } from "@/features/dashboard/components/budget-overview";
import { InsightPreview } from "@/features/dashboard/components/insight-preview";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions";
import { VisualizationPlaceholder } from "@/features/dashboard/components/visualization-placeholder";
import { dashboardMock } from "@/features/dashboard/mock";

export function Dashboard() {
  return (
    <PageContainer>
      <Reveal>
        <header className="max-w-3xl">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {dashboardMock.welcome.eyebrow}
          </p>
          <h1 className="mt-3 font-heading text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
            {dashboardMock.welcome.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {dashboardMock.welcome.description}
          </p>
        </header>
      </Reveal>

      <section aria-labelledby="financial-summary" className="mt-10">
        <h2 className="sr-only" id="financial-summary">
          Financial summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardMock.metrics.map((metric, index) => (
            <Reveal delay={index * 0.04} key={metric.id}>
              <MetricCard {...metric} />
            </Reveal>
          ))}
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Reveal className="xl:col-span-8" delay={0.08}>
          <VisualizationPlaceholder {...dashboardMock.visualization} />
        </Reveal>
        <Reveal className="xl:col-span-4" delay={0.12}>
          <InsightPreview {...dashboardMock.insight} />
        </Reveal>

        <Reveal className="xl:col-span-7" delay={0.12}>
          <RecentTransactions
            transactions={dashboardMock.recentTransactions}
          />
        </Reveal>
        <div className="grid gap-6 xl:col-span-5">
          <Reveal delay={0.16}>
            <AccountsOverview accounts={dashboardMock.accounts} />
          </Reveal>
          <Reveal delay={0.2}>
            <BudgetOverview budgets={dashboardMock.budgets} />
          </Reveal>
        </div>
      </div>
    </PageContainer>
  );
}
