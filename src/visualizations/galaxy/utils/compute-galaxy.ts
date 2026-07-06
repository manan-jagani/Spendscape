import { scaleSqrt } from "d3-scale"

import type { GalaxyData, MoonNode, PlanetNode } from "@/visualizations/galaxy/types"
import { ACCOUNT_COLORS, DEFAULT_MOON_COLOR } from "@/visualizations/galaxy/utils/colors"

const PLANET_RADIUS_RANGE: [number, number] = [20, 50]
const MOON_RADIUS_RANGE: [number, number] = [4, 14]
const SUN_BASE_RADIUS = 36

type CategoryInput = {
  category_id: string | null
  category_name: string | null
  total: number
  color: string | null
}

function distributeCategoriesToAccounts(
  accounts: ReadonlyArray<{ id: string }>,
  categories: ReadonlyArray<CategoryInput>,
): Map<string, CategoryInput[]> {
  const map = new Map<string, CategoryInput[]>()
  if (accounts.length === 0 || categories.length === 0) return map
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    if (!category) continue
    const accountIndex = i % accounts.length
    const accountId = accounts[accountIndex]?.id ?? ""
    const existing = map.get(accountId) ?? []
    existing.push(category)
    map.set(accountId, existing)
  }
  return map
}

export function computeGalaxyData(
  accounts: ReadonlyArray<{
    id: string
    name: string
    current_balance: number
    type: string
  }>,
  categories: ReadonlyArray<CategoryInput>,
  budgets: ReadonlyArray<{
    id: string
    amount: number
    category_id: string | null
    categories: { name: string } | null
  }>,
  netWorth: number,
  width: number,
  height: number,
): GalaxyData {
  const centerX = width / 2
  const centerY = height / 2
  const maxDim = Math.min(width, height)
  const scaleFactor = Math.min(1, maxDim / 640)

  const positiveAccounts = accounts.filter((a) => a.current_balance > 0)
  const balanceValues = positiveAccounts.map((a) => a.current_balance)
  const maxBalance = balanceValues.length > 0 ? Math.max(...balanceValues) : 1
  const planetScale = scaleSqrt().domain([0, maxBalance]).range(PLANET_RADIUS_RANGE)

  const categoryMap = distributeCategoriesToAccounts(
    positiveAccounts,
    categories.filter((c) => c.total > 0 && c.category_name),
  )

  const allCategoryValues = categories.filter((c) => c.total > 0).map((c) => c.total)
  const maxCategorySpend = allCategoryValues.length > 0 ? Math.max(...allCategoryValues) : 1
  const moonScale = scaleSqrt().domain([0, maxCategorySpend]).range(MOON_RADIUS_RANGE)

  const budgetByCategory = new Map<string, (typeof budgets)[number]>()
  for (const b of budgets) {
    if (b.category_id) budgetByCategory.set(b.category_id, b)
  }

  const accountOrbitRadius = 160 * scaleFactor
  const angleCount = positiveAccounts.length
  const angleStep = angleCount > 0 ? (Math.PI * 2) / angleCount : Math.PI * 2

  const planets: PlanetNode[] = positiveAccounts.map((account, pi) => {
    const accountCategories = categoryMap.get(account.id) ?? []
    const moonCount = accountCategories.length
    const moonAngleStep = moonCount > 0 ? (Math.PI * 2) / moonCount : 0
    const angle = pi * angleStep
    const planetRadius = planetScale(account.current_balance)
    const moonOrbitR = planetRadius + 12 + Math.min(moonCount, 6) * 5 * scaleFactor

    const moons: MoonNode[] = accountCategories.map((cat, mi) => {
      const budget = cat.category_id ? budgetByCategory.get(cat.category_id) : undefined
      return {
        id: `moon-${cat.category_id ?? mi}`,
        name: cat.category_name ?? "Unknown",
        value: cat.total,
        color: cat.color ?? DEFAULT_MOON_COLOR,
        radius: Math.max(moonScale(cat.total), 2.5),
        orbitRadius: moonOrbitR,
        angle: moonAngleStep * mi,
        budgetId: budget?.id ?? null,
        budgetAmount: budget?.amount ?? null,
        spentAmount: cat.total,
      }
    })

    return {
      id: account.id,
      name: account.name,
      value: account.current_balance,
      color: ACCOUNT_COLORS[account.type] ?? DEFAULT_MOON_COLOR,
      radius: planetRadius,
      orbitRadius: accountOrbitRadius,
      angle,
      moons,
    }
  })

  return {
    centerX,
    centerY,
    sunRadius: SUN_BASE_RADIUS * scaleFactor,
    netWorth,
    netWorthColor: "hsl(var(--color-savings))",
    planets,
    maxAccountBalance: maxBalance,
    maxCategorySpend,
  }
}
