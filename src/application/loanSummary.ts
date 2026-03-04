import type { LoanProjection } from '../domain/loan.types'

export interface LoanSummary {
  totalInterest: number
  totalPrincipal: number
  totalInsurance: number
  totalPaid: number
  interestPct: number
  principalPct: number
  insurancePct: number
  alertDifferenceAbove1Pct: boolean
  monthsReduced: number
  interestSavingsFromPrepayments: number
}

export function buildLoanSummary(projection: LoanProjection): LoanSummary {
  const totalPrincipal = projection.schedule.reduce(
    (sum, row) => sum + row.principalPayment,
    0,
  )
  const totalInsurance = projection.schedule.reduce(
    (sum, row) => sum + row.insurance,
    0,
  )
  const totalInterest = projection.totalInterest
  const totalPaid = projection.totalPaid

  const interestPct = totalPaid === 0 ? 0 : (totalInterest / totalPaid) * 100
  const principalPct = totalPaid === 0 ? 0 : (totalPrincipal / totalPaid) * 100
  const insurancePct = totalPaid === 0 ? 0 : (totalInsurance / totalPaid) * 100

  return {
    totalInterest,
    totalPrincipal,
    totalInsurance,
    totalPaid,
    interestPct,
    principalPct,
    insurancePct,
    alertDifferenceAbove1Pct: Math.abs(projection.installmentDifferencePct) > 1,
    monthsReduced: projection.monthsReduced,
    interestSavingsFromPrepayments: projection.interestSavingsFromPrepayments,
  }
}
