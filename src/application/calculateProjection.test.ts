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
      bankPaymentIncludesInsurance: true,
    })

    expect(projection.theoreticalInstallmentExInsurance).toBeCloseTo(
      2_117_246.7,
      2,
    )
    expect(projection.bankInstallmentNormalized).toBe(2_200_000)
    expect(projection.installmentDifference).toBeCloseTo(82_753.3, 2)
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
})
