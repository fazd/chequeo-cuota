import { describe, expect, it } from 'vitest'
import { calculateProjection } from './calculateProjection'

describe('calculateProjection', () => {
  it('normalizes bank installment when bank payment includes insurance', () => {
    const projection = calculateProjection({
      principal: 200_000_000,
      annualEffectiveRate: 0.12,
      termMonths: 240,
      bankMonthlyPayment: 2_320_000,
      monthlyInsurance: 120_000,
      monthlyLifeInsuranceRate: 0.0005,
      bankPaymentIncludesInsurance: true,
    })

    expect(projection.theoreticalInstallmentExInsurance).toBeCloseTo(
      2_117_246.7,
      2,
    )
    expect(projection.bankInstallmentNormalized).toBe(2_100_000)
    expect(projection.installmentDifference).toBeCloseTo(-17_246.7, 2)
    expect(projection.schedule[239].endingBalance).toBeCloseTo(0, 6)
  })

  it('keeps bank installment as-is when payment excludes insurance', () => {
    const projection = calculateProjection({
      principal: 200_000_000,
      annualEffectiveRate: 0.12,
      termMonths: 240,
      bankMonthlyPayment: 2_200_000,
      monthlyInsurance: 120_000,
      bankPaymentIncludesInsurance: false,
    })

    expect(projection.bankInstallmentNormalized).toBe(2_200_000)
  })

  it('reduces term and saves interests when prepayments are configured', () => {
    const baseline = calculateProjection({
      principal: 200_000_000,
      annualEffectiveRate: 0.12,
      termMonths: 240,
      bankMonthlyPayment: 2_200_000,
      monthlyInsurance: 120_000,
      bankPaymentIncludesInsurance: false,
    })

    const withPrepayments = calculateProjection({
      principal: 200_000_000,
      annualEffectiveRate: 0.12,
      termMonths: 240,
      bankMonthlyPayment: 2_200_000,
      monthlyInsurance: 120_000,
      bankPaymentIncludesInsurance: false,
      constantExtraPayment: { amount: 300_000, everyNMonths: 6 },
      extraordinaryExtraPayments: [
        { month: 12, amount: 5_000_000 },
        { month: 36, amount: 4_000_000 },
      ],
    })

    expect(withPrepayments.resultingTermMonths).toBeLessThan(
      baseline.resultingTermMonths,
    )
    expect(withPrepayments.monthsReduced).toBeGreaterThan(0)
    expect(withPrepayments.interestSavingsFromPrepayments).toBeGreaterThan(0)
  })
})
