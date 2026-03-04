import { describe, expect, it } from 'vitest'
import { calculateProjection } from './calculateProjection'
import { buildLoanSummary } from './loanSummary'

describe('buildLoanSummary', () => {
  it('returns totals, percentages, and alert flag', () => {
    const projection = calculateProjection({
      principal: 200_000_000,
      annualEffectiveRate: 0.12,
      termMonths: 240,
      bankMonthlyPayment: 2_500_000,
      monthlyInsurance: 100_000,
      bankPaymentIncludesInsurance: false,
    })

    const summary = buildLoanSummary(projection)

    expect(summary.totalPaid).toBeCloseTo(
      projection.theoreticalInstallmentInclInsurance * 239 +
        projection.schedule[239].totalPayment,
      2,
    )
    expect(summary.interestPct + summary.principalPct + summary.insurancePct).toBeCloseTo(
      100,
      8,
    )
    expect(summary.alertDifferenceAbove1Pct).toBe(true)
  })
})
