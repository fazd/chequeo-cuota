import manifestData from './manifest.json'

export type CalculatorPageKind =
  | 'single-loan'
  | 'credit-card-portfolio'
  | 'investment'
  | 'savings'

export type CalculatorId =
  | 'hipotecario'
  | 'vehicular'
  | 'libranza'
  | 'tarjeta-credito'
  | 'cdt'
  | 'alto-rendimiento'

export type CalculatorRouteComponentKey =
  | 'mortgage'
  | 'vehicle'
  | 'payroll'
  | 'creditCard'

export type CalculatorIconKey =
  | 'house'
  | 'car'
  | 'percent'
  | 'credit-card'
  | 'calculator'

export interface CalculatorManifestItem {
  id: CalculatorId
  name: string
  description: string
  path: string
  enabled: boolean
  pageKind: CalculatorPageKind
  routeComponent: CalculatorRouteComponentKey | null
  iconKey: CalculatorIconKey
  nav: {
    visible: boolean
    label: string
    order: number
  }
  homeCard: {
    visible: boolean
    ctaLabel: string
  }
  seo: {
    title: string
    description: string
    ogType?: 'website' | 'article'
  }
  blogSuggestions: string[]
}

function toSortedCopy(items: readonly CalculatorManifestItem[]): CalculatorManifestItem[] {
  return [...items].sort((a, b) => a.nav.order - b.nav.order)
}

function ensureUniqueField(
  items: readonly CalculatorManifestItem[],
  field: 'id' | 'path',
): void {
  const values = new Set<string>()
  for (const item of items) {
    const value = item[field]
    if (values.has(value)) {
      throw new Error(`Duplicate calculator ${field}: ${value}`)
    }
    values.add(value)
  }
}

const typedManifest = manifestData as CalculatorManifestItem[]
ensureUniqueField(typedManifest, 'id')
ensureUniqueField(typedManifest, 'path')

export const calculatorsManifest: readonly CalculatorManifestItem[] = typedManifest

export function getCalculatorById(id: CalculatorId): CalculatorManifestItem {
  const calculator = calculatorsManifest.find((item) => item.id === id)
  if (!calculator) {
    throw new Error(`Calculator not found: ${id}`)
  }

  return calculator
}

export function getEnabledCalculators(): CalculatorManifestItem[] {
  return toSortedCopy(calculatorsManifest).filter((calculator) => calculator.enabled)
}

export function getUpcomingCalculators(): CalculatorManifestItem[] {
  return toSortedCopy(calculatorsManifest).filter((calculator) => !calculator.enabled)
}

export function getNavbarCalculators(): CalculatorManifestItem[] {
  return getEnabledCalculators().filter((calculator) => calculator.nav.visible)
}

export function getHomeEnabledCalculators(): CalculatorManifestItem[] {
  return getEnabledCalculators().filter((calculator) => calculator.homeCard.visible)
}

export function getHomeUpcomingCalculators(): CalculatorManifestItem[] {
  return getUpcomingCalculators().filter((calculator) => calculator.homeCard.visible)
}

export function getPrimaryCalculator(): CalculatorManifestItem | null {
  return getEnabledCalculators()[0] ?? null
}
