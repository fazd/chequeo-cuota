import { roundTo } from './rounding'

const copNumberFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCop(value: number): string {
  return `$ ${copNumberFormatter.format(roundTo(value, 2))}`
}

export function formatPercent(value: number): string {
  return `${roundTo(value, 2).toFixed(2)}%`
}
