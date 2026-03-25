import manifestData from './manifest.json'
import {
  faCalculator,
  faCar,
  faChartLine,
  faGraduationCap,
  faHouse,
  faMoneyBillWave,
  faReceipt,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'

export type UseCaseIconKey =
  | 'house'
  | 'receipt'
  | 'car'
  | 'chart-line'
  | 'graduation-cap'
  | 'money-bill-wave'
  | 'calculator'

export interface UseCase {
  id: string
  title: string
  description: string
  iconKey: UseCaseIconKey
  calculatorPath: string
}

export interface UseCaseManifestItem {
  id: string
  title: string
  description: string
  iconKey: UseCaseIconKey
  calculatorPath: string
}

const iconMapping: Record<UseCaseIconKey, IconDefinition> = {
  house: faHouse,
  receipt: faReceipt,
  car: faCar,
  'chart-line': faChartLine,
  'graduation-cap': faGraduationCap,
  'money-bill-wave': faMoneyBillWave,
  calculator: faCalculator,
}

export function getAllUseCases(): UseCase[] {
  return (manifestData as UseCaseManifestItem[]).map((item) => ({
    ...item,
  }))
}

export function getIconByKey(key: UseCaseIconKey): IconDefinition {
  return iconMapping[key]
}
