import { describe, expect, it } from 'vitest'
import { calculateVehicleProjection } from './calculateVehicleProjection'

describe('calculateVehicleProjection', () => {
  it('lanza error cuando principal es invalido', () => {
    expect(() =>
      calculateVehicleProjection({
        principal: 0,
        annualEffectiveRate: 0.16,
        termMonths: 72,
      }),
    ).toThrow()
  })

  it('calcula cuota teorica y diferencia contra cuota banco cuando se provee', () => {
    const projection = calculateVehicleProjection({
      principal: 90_000_000,
      annualEffectiveRate: 0.16,
      termMonths: 72,
      bankMonthlyPayment: 2_050_000,
    })

    expect(projection.theoreticalInstallmentExInsurance).toBeGreaterThan(0)
    expect(projection.bankComparisonAvailable).toBe(true)
    expect(projection.bankInstallmentNormalized).toBe(2_050_000)
  })

  it('omite comparacion con banco cuando no se provee cuota banco', () => {
    const projection = calculateVehicleProjection({
      principal: 90_000_000,
      annualEffectiveRate: 0.16,
      termMonths: 72,
    })

    expect(projection.bankComparisonAvailable).toBe(false)
    expect(projection.installmentDifference).toBe(0)
    expect(projection.installmentDifferencePct).toBe(0)
  })

  it('reduce plazo e intereses con abonos', () => {
    const baseline = calculateVehicleProjection({
      principal: 90_000_000,
      annualEffectiveRate: 0.16,
      termMonths: 72,
      bankMonthlyPayment: 2_050_000,
    })

    const withPrepayments = calculateVehicleProjection({
      principal: 90_000_000,
      annualEffectiveRate: 0.16,
      termMonths: 72,
      bankMonthlyPayment: 2_050_000,
      constantExtraPayment: { amount: 150_000, everyNMonths: 3 },
      extraordinaryExtraPayments: [{ month: 12, amount: 2_000_000 }],
    })

    expect(withPrepayments.resultingTermMonths).toBeLessThan(
      baseline.resultingTermMonths,
    )
    expect(withPrepayments.monthsReduced).toBeGreaterThan(0)
    expect(withPrepayments.interestSavingsFromPrepayments).toBeGreaterThan(0)
  })

  it('incorpora seguros en cuota teorica y normaliza cuota banco cuando aplica', () => {
    const projection = calculateVehicleProjection({
      principal: 90_000_000,
      annualEffectiveRate: 0.16,
      termMonths: 72,
      bankMonthlyPayment: 2_500_000,
      monthlyInsurance: 50_000,
      monthlyLifeInsuranceRate: 0.001,
      bankPaymentIncludesInsurance: true,
    })

    const expectedInsurance =
      50_000 + 90_000_000 * 0.001

    expect(projection.theoreticalInstallmentInclInsurance).toBeCloseTo(
      projection.theoreticalInstallmentExInsurance + expectedInsurance,
      6,
    )
    expect(projection.bankInstallmentNormalized).toBeCloseTo(
      2_500_000 - expectedInsurance,
      6,
    )
  })
})
