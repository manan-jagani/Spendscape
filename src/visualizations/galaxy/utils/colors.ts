export const ACCOUNT_COLORS: Record<string, string> = {
  checking: "var(--color-transfer)",
  savings: "var(--color-savings)",
  credit_card: "var(--color-expense)",
  cash: "var(--color-income)",
  investment: "var(--color-investment)",
  loan: "var(--color-negative)",
}

export const PLANET_GLOW_COLORS: Record<string, string> = {
  checking: "hsla(165, 70%, 45%, 0.4)",
  savings: "hsla(45, 80%, 50%, 0.4)",
  credit_card: "hsla(0, 0%, 35%, 0.4)",
  cash: "hsla(165, 70%, 45%, 0.4)",
  investment: "hsla(165, 60%, 35%, 0.4)",
  loan: "hsla(35, 70%, 45%, 0.4)",
}

export const DEFAULT_PLANET_COLOR = "var(--color-muted-foreground)"
export const DEFAULT_MOON_COLOR = "var(--color-muted-foreground)"

export function getBudgetProgressColor(spent: number, budget: number): string {
  const ratio = spent / budget
  if (ratio >= 1) return "var(--color-negative)"
  if (ratio >= 0.8) return "var(--color-warning)"
  if (ratio >= 0.5) return "var(--color-warning)"
  return "var(--color-positive)"
}
