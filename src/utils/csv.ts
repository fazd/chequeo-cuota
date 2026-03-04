import type { AmortizationRow } from '../domain/loan.types'
import { roundTo } from './rounding'

export function scheduleToCsv(rows: AmortizationRow[]): string {
  const header = [
    'Mes',
    'Saldo inicial',
    'Interes',
    'Capital',
    'Seguro',
    'Pago total',
    'Saldo final',
  ]

  const body = rows.map((row) => [
    row.month.toString(),
    roundTo(row.beginningBalance, 2).toFixed(2),
    roundTo(row.interest, 2).toFixed(2),
    roundTo(row.principalPayment, 2).toFixed(2),
    roundTo(row.insurance, 2).toFixed(2),
    roundTo(row.totalPayment, 2).toFixed(2),
    roundTo(row.endingBalance, 2).toFixed(2),
  ])

  return [header, ...body].map((line) => line.join(',')).join('\n')
}
