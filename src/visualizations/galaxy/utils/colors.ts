export const ACCOUNT_COLORS: Record<string, string> = {
  checking: "hsl(var(--color-transfer))",
  savings: "hsl(var(--color-savings))",
  credit_card: "hsl(var(--color-expense))",
  cash: "hsl(var(--color-income))",
  investment: "hsl(var(--color-investment))",
  loan: "hsl(var(--color-negative))",
}

export const PLANET_GLOW_COLORS: Record<string, string> = {
  checking: "hsla(255, 58%, 55%, 0.4)",
  savings: "hsla(165, 58%, 55%, 0.4)",
  credit_card: "hsla(25, 68%, 55%, 0.4)",
  cash: "hsla(151, 58%, 55%, 0.4)",
  investment: "hsla(305, 58%, 55%, 0.4)",
  loan: "hsla(25, 68%, 55%, 0.4)",
}

export const DEFAULT_PLANET_COLOR = "hsl(var(--color-muted-foreground))"
export const DEFAULT_MOON_COLOR = "hsl(var(--color-muted-foreground))"

export function getBudgetProgressColor(spent: number, budget: number): string {
  const ratio = spent / budget
  if (ratio >= 1) return "hsl(var(--color-negative))"
  if (ratio >= 0.8) return "hsl(var(--color-warning))"
  if (ratio >= 0.5) return "hsl(38, 92%, 50%)"
  return "hsl(var(--color-positive))"
}
