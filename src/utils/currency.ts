import { roundTo } from './rounding'

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 2,
})

export function formatCop(value: number): string {
  return copFormatter.format(roundTo(value, 2))
}

export function formatPercent(value: number): string {
  return `${roundTo(value, 2).toFixed(2)}%`
}
