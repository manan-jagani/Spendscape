export function formatChartCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${Math.round(amount)}`;
}

export function formatChartDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatShortDay(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "short" });
}

export function formatShortMonth(date: Date): string {
  return date.toLocaleDateString("en-IN", { month: "short" });
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
