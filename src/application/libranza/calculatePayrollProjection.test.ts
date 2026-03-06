import { describe, expect, it } from 'vitest'
import { calculatePayrollProjection } from './calculatePayrollProjection'

describe('calculatePayrollProjection', () => {
  it('lanza error cuando principal es invalido', () => {
    expect(() =>
      calculatePayrollProjection({
        principal: 0,
        annualEffectiveRate: 0.14,
        termMonths: 60,
      }),
    ).toThrow()
  })

  it('calcula cuota teorica y diferencia contra cuota banco cuando se provee', () => {
    const projection = calculatePayrollProjection({
      principal: 40_000_000,
      annualEffectiveRate: 0.14,
      termMonths: 60,
      bankMonthlyPayment: 1_000_000,
    })

    expect(projection.theoreticalInstallmentExInsurance).toBeGreaterThan(0)
    expect(projection.bankComparisonAvailable).toBe(true)
    expect(projection.bankInstallmentNormalized).toBe(1_000_000)
  })

  it('omite comparacion con banco cuando no se provee cuota banco', () => {
    const projection = calculatePayrollProjection({
      principal: 40_000_000,
      annualEffectiveRate: 0.14,
      termMonths: 60,
    })

    expect(projection.bankComparisonAvailable).toBe(false)
    expect(projection.installmentDifference).toBe(0)
    expect(projection.installmentDifferencePct).toBe(0)
  })

  it('reduce plazo e intereses con abonos', () => {
    const baseline = calculatePayrollProjection({
      principal: 40_000_000,
      annualEffectiveRate: 0.14,
      termMonths: 60,
      bankMonthlyPayment: 1_000_000,
    })

    const withPrepayments = calculatePayrollProjection({
      principal: 40_000_000,
      annualEffectiveRate: 0.14,
      termMonths: 60,
      bankMonthlyPayment: 1_000_000,
      constantExtraPayment: { amount: 100_000, everyNMonths: 2 },
      extraordinaryExtraPayments: [{ month: 8, amount: 1_500_000 }],
    })

    expect(withPrepayments.resultingTermMonths).toBeLessThan(
      baseline.resultingTermMonths,
    )
    expect(withPrepayments.monthsReduced).toBeGreaterThan(0)
    expect(withPrepayments.interestSavingsFromPrepayments).toBeGreaterThan(0)
  })

  it('incorpora seguros en cuota teorica y normaliza cuota banco cuando aplica', () => {
    const projection = calculatePayrollProjection({
      principal: 40_000_000,
      annualEffectiveRate: 0.14,
      termMonths: 60,
      bankMonthlyPayment: 1_200_000,
      monthlyInsurance: 30_000,
      monthlyLifeInsuranceRate: 0.0012,
      bankPaymentIncludesInsurance: true,
    })

    const expectedInsurance =
      30_000 + 40_000_000 * 0.0012

    expect(projection.theoreticalInstallmentInclInsurance).toBeCloseTo(
      projection.theoreticalInstallmentExInsurance + expectedInsurance,
      6,
    )
    expect(projection.bankInstallmentNormalized).toBeCloseTo(
      1_200_000 - expectedInsurance,
      6,
    )
  })
})
