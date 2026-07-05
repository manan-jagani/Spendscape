import type {
  ShellNotification,
  ShellUser,
} from "@/components/layout/types";

export const dashboardMock = {
  shell: {
    user: {
      name: "Aarav Mehta",
      email: "aarav@example.com",
      initials: "AM",
    } satisfies ShellUser,
    insightCount: 3,
    notifications: [
      {
        id: "insight-weekend",
        title: "Weekend spending shifted",
        description: "Dining spend is 18% lower than your four-week average.",
        time: "12 min ago",
        unread: true,
      },
      {
        id: "budget-travel",
        title: "Travel budget is on track",
        description: "You have ₹12,400 available for the rest of this month.",
        time: "2 hours ago",
        unread: true,
      },
    ] satisfies readonly ShellNotification[],
  },
  welcome: {
    eyebrow: "Sunday, 5 July",
    title: "Good evening, Aarav.",
    description:
      "Your spending softened this week while savings continued to climb.",
  },
  metrics: [
    {
      id: "net-worth",
      label: "Net worth",
      value: "₹12,84,620",
      change: "+₹42,180",
      context: "this month",
      tone: "neutral",
    },
    {
      id: "income",
      label: "Income",
      value: "₹1,42,000",
      change: "+8.2%",
      context: "vs last month",
      tone: "income",
    },
    {
      id: "expense",
      label: "Expenses",
      value: "₹68,420",
      change: "−6.4%",
      context: "vs last month",
      tone: "expense",
    },
    {
      id: "savings",
      label: "Savings",
      value: "₹73,580",
      change: "51.8%",
      context: "savings rate",
      tone: "savings",
    },
  ] as const,
  recentTransactions: [
    {
      id: "txn-1",
      merchant: "Blue Tokai",
      category: "Dining",
      time: "Today, 9:42 AM",
      amount: "−₹680",
      kind: "expense",
    },
    {
      id: "txn-2",
      merchant: "Acme Studios",
      category: "Salary",
      time: "Yesterday",
      amount: "+₹1,20,000",
      kind: "income",
    },
    {
      id: "txn-3",
      merchant: "Cult.fit",
      category: "Wellness",
      time: "4 Jul",
      amount: "−₹2,499",
      kind: "expense",
    },
    {
      id: "txn-4",
      merchant: "Savings transfer",
      category: "Transfer",
      time: "3 Jul",
      amount: "₹20,000",
      kind: "transfer",
    },
  ] as const,
  accounts: [
    {
      id: "account-1",
      name: "Primary",
      institution: "HDFC Bank · 2841",
      balance: "₹3,48,240",
      tone: "transfer",
    },
    {
      id: "account-2",
      name: "Rainy day",
      institution: "Savings · 9012",
      balance: "₹5,10,000",
      tone: "savings",
    },
    {
      id: "account-3",
      name: "Everyday card",
      institution: "Credit · 4438",
      balance: "−₹24,620",
      tone: "expense",
    },
  ] as const,
  budgets: [
    {
      id: "budget-1",
      name: "Dining",
      detail: "₹8,200 of ₹14,000",
      progress: 59,
      tone: "income",
    },
    {
      id: "budget-2",
      name: "Travel",
      detail: "₹7,600 of ₹20,000",
      progress: 38,
      tone: "transfer",
    },
    {
      id: "budget-3",
      name: "Shopping",
      detail: "₹9,100 of ₹12,000",
      progress: 76,
      tone: "warning",
    },
  ] as const,
  insight: {
    eyebrow: "Pattern found",
    title: "Your quieter weekends are becoming a habit.",
    description:
      "You spent 18% less on dining over the last three weekends, without shifting that spend into another category.",
    action: "Explore this pattern",
  },
  visualization: {
    eyebrow: "Coming into focus",
    title: "Your Financial Galaxy",
    question: "How is your money distributed across the life you’re building?",
    description:
      "A relationship view of accounts, categories, and goals will live here once visualization data is connected.",
  },
} as const;
