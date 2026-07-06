export interface MoonNode {
  id: string
  name: string
  value: number
  color: string
  radius: number
  orbitRadius: number
  angle: number
  budgetId: string | null
  budgetAmount: number | null
  spentAmount: number
}

export interface PlanetNode {
  id: string
  name: string
  value: number
  color: string
  radius: number
  orbitRadius: number
  angle: number
  moons: MoonNode[]
}

export interface GalaxyData {
  centerX: number
  centerY: number
  sunRadius: number
  netWorth: number
  netWorthColor: string
  planets: PlanetNode[]
  maxAccountBalance: number
  maxCategorySpend: number
}

export type DetailState = {
  type: "planet"
  data: PlanetNode
  transactions?: Array<{ id: string; description: string | null; amount: number; category_name: string | null; occurred_at: string }>
} | {
  type: "moon"
  data: MoonNode & { planetName: string }
} | null

export interface TooltipState {
  text: string
  subtext: string
  detail: string
  x: number
  y: number
}
