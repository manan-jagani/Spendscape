import {
  ArrowLeftRight,
  ChartPie,
  Landmark,
  LayoutDashboard,
  Settings,
  Sparkles,
  WalletCards,
} from "lucide-react";

export const PRIMARY_NAVIGATION = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Accounts", href: "/accounts", icon: Landmark },
  { label: "Budgets", href: "/budgets", icon: ChartPie },
  { label: "Insights", href: "/insights", icon: Sparkles },
] as const;

export const SECONDARY_NAVIGATION = [
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export const COMMAND_NAVIGATION = [
  ...PRIMARY_NAVIGATION,
  ...SECONDARY_NAVIGATION,
] as const;

export const PRODUCT_MARK_ICON = WalletCards;
