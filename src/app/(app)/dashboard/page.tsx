import type { Metadata } from "next";

import { Dashboard } from "@/features/dashboard/components/dashboard";

export const metadata: Metadata = {
  title: "Overview",
};

export default function DashboardPage() {
  return <Dashboard />;
}
