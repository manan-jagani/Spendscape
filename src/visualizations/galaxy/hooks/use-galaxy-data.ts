import { useMemo } from "react"

import type { GalaxyData } from "@/visualizations/galaxy/types"
import { computeGalaxyData } from "@/visualizations/galaxy/utils/compute-galaxy"

interface UseGalaxyDataParams {
  accounts: ReadonlyArray<{
    id: string
    name: string
    current_balance: number
    type: string
  }>
  categories: ReadonlyArray<{
    category_id: string | null
    category_name: string | null
    total: number
    color: string | null
  }>
  budgets: ReadonlyArray<{
    id: string
    amount: number
    category_id: string | null
    categories: { name: string } | null
  }>
  netWorth: number
  width: number
  height: number
}

export function useGalaxyData(params: UseGalaxyDataParams): GalaxyData | null {
  const { accounts, categories, budgets, netWorth, width, height } = params

  return useMemo(() => {
    if (width === 0 || height === 0) return null
    return computeGalaxyData(accounts, categories, budgets, netWorth, width, height)
  }, [accounts, categories, budgets, netWorth, width, height])
}
