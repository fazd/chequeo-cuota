import { describe, expect, it } from 'vitest'
import { calculatePayrollProjection } from './calculatePayrollProjection'
import { buildPayrollLoanSummary } from './payrollLoanSummary'

describe('buildPayrollLoanSummary', () => {
  it('construye metricas y alerta cuando aplica diferencia > 1%', () => {
    const projection = calculatePayrollProjection({
      principal: 40_000_000,
      annualEffectiveRate: 0.14,
      termMonths: 60,
      bankMonthlyPayment: 1_600_000,
    })

    const summary = buildPayrollLoanSummary(projection)

    expect(summary.totalPaid).toBeGreaterThan(0)
    expect(summary.totalInterest).toBeGreaterThan(0)
    expect(summary.alertDifferenceAbove1Pct).toBe(true)
  })
})
