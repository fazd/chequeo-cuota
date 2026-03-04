import { describe, expect, it } from 'vitest'
import {
  buildFrenchAmortizationSchedule,
  calculateFrenchInstallment,
} from './frenchAmortization'
import { effectiveAnnualToMonthly } from './rate'

describe('french amortization', () => {
  it('calculates stable installment for long terms', () => {
    const monthlyRate = effectiveAnnualToMonthly(0.12)
    const installment = calculateFrenchInstallment(200_000_000, monthlyRate, 240)
    expect(installment).toBeCloseTo(2_117_246.7, 2)
  })

  it('builds a decreasing-balance schedule and closes at zero', () => {
    const monthlyRate = effectiveAnnualToMonthly(0.12)
    const installment = calculateFrenchInstallment(200_000_000, monthlyRate, 240)
    const schedule = buildFrenchAmortizationSchedule({
      principal: 200_000_000,
      monthlyRate,
      termMonths: 240,
      installmentExInsurance: installment,
      monthlyBaseInsurance: 120_000,
      monthlyLifeInsuranceRate: 0.0005,
    })

    expect(schedule).toHaveLength(240)
    expect(schedule[0].beginningBalance).toBeCloseTo(200_000_000, 6)
    expect(schedule[0].lifeInsurance).toBeCloseTo(100_000, 6)
    expect(schedule[1].beginningBalance).toBeLessThan(schedule[0].beginningBalance)
    expect(schedule[239].endingBalance).toBeCloseTo(0, 6)
  })
})
