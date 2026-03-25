import {
  calculatorsManifest,
  type CalculatorId,
  type CalculatorManifestItem,
} from './manifest'

export type { CalculatorId }

export interface CalculatorModule {
  id: CalculatorId
  name: string
  description: string
  path: string
  enabled: boolean
}

function toCalculatorModule(item: CalculatorManifestItem): CalculatorModule {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    path: item.path,
    enabled: item.enabled,
  }
}

export const calculatorsRegistry: CalculatorModule[] = calculatorsManifest.map(
  toCalculatorModule,
)
