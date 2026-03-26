import { describe, expect, it } from 'vitest'
import type { CreditCardInput } from './loan.types'
import { simulateCreditCard } from './simulator'

function baseInput(overrides: Partial<CreditCardInput> = {}): CreditCardInput {
  return {
    id: 'tc-1',
    name: 'TC 1',
    currentDebt: 2_000_000,
    termMonths: 120,
    rateType: 'effectiveAnnual',
    rateValuePct: 24,
    minimumPaymentAmount: 250_000,
    hasHandlingFee: false,
    hasInsurance: false,
    ...overrides,
  }
}

describe('simulateCreditCard', () => {
  it('reduces payoff months and interests when extra payments are configured', () => {
    const baseline = simulateCreditCard(baseInput())
    const withExtras = simulateCreditCard(
      baseInput({
        constantExtraPayment: { amount: 80_000, everyNMonths: 1 },
        extraordinaryExtraPayments: [{ month: 2, amount: 120_000 }],
      }),
    )

    expect(baseline.monthsToPayoff).not.toBeNull()
    expect(withExtras.monthsToPayoff).not.toBeNull()
    expect(withExtras.monthsToPayoff!).toBeLessThan(baseline.monthsToPayoff!)
    expect(withExtras.interestSavingsFromPrepayments).toBeGreaterThan(0)
    expect(withExtras.schedule[withExtras.schedule.length - 1].endingDebt).toBeCloseTo(0, 6)
  })

  it('applies handling fee and insurance and exposes cupo metrics', () => {
    const projection = simulateCreditCard(
      baseInput({
        currentDebt: 1_000_000,
        rateType: 'nominalDue',
        rateValuePct: 24,
        minimumPaymentAmount: 200_000,
        hasHandlingFee: true,
        monthlyHandlingFee: 10_000,
        hasInsurance: true,
        monthlyInsurance: 5_000,
        creditLimit: 2_000_000,
      }),
    )

    expect(projection.schedule[0].interest).toBeCloseTo(20_000, 4)
    expect(projection.schedule[0].handlingFee).toBe(10_000)
    expect(projection.schedule[0].insurance).toBe(5_000)
    expect(projection.schedule[0].endingDebt).toBeCloseTo(835_000, 4)
    expect(projection.schedule[0].usedLimitPct).toBeCloseTo(41.75, 4)
    expect(projection.totalHandlingFee).toBeGreaterThan(0)
    expect(projection.totalInsurance).toBeGreaterThan(0)
  })

  it('flags negative amortization and no payoff when payment is insufficient', () => {
    const projection = simulateCreditCard(
      baseInput({
        currentDebt: 1_000_000,
        rateType: 'effectiveAnnual',
        rateValuePct: 60,
        minimumPaymentAmount: 20_000,
        hasHandlingFee: true,
        monthlyHandlingFee: 25_000,
        hasInsurance: true,
        monthlyInsurance: 15_000,
        termMonths: 18,
      }),
    )

    expect(projection.alerts.hasNegativeAmortization).toBe(true)
    expect(projection.alerts.noPayoffWithinHorizon).toBe(true)
    expect(projection.monthsToPayoff).toBeNull()
    expect(projection.schedule[projection.schedule.length - 1].endingDebt).toBeGreaterThan(
      projection.schedule[0].beginningDebt,
    )
  })

  it('accepts extra contribution injected by consolidated simulation', () => {
    const withoutGlobalExtra = simulateCreditCard(baseInput(), { maxMonths: 120 })
    const withGlobalExtra = simulateCreditCard(baseInput(), {
      maxMonths: 120,
      additionalMonthlyExtra: 100_000,
    })

    expect(withGlobalExtra.monthsToPayoff).not.toBeNull()
    expect(withoutGlobalExtra.monthsToPayoff).not.toBeNull()
    expect(withGlobalExtra.monthsToPayoff!).toBeLessThan(
      withoutGlobalExtra.monthsToPayoff!,
    )
  })

  it('uses termMonths as payoff horizon when maxMonths is not provided', () => {
    const projection = simulateCreditCard(
      baseInput({
        termMonths: 6,
        minimumPaymentAmount: 50_000,
      }),
    )

    expect(projection.schedule).toHaveLength(6)
    expect(projection.alerts.noPayoffWithinHorizon).toBe(true)
    expect(projection.monthsToPayoff).toBeNull()
  })

  it('auto-calculates minimum payment when it is omitted', () => {
    const projection = simulateCreditCard(
      baseInput({
        currentDebt: 1_200_000,
        termMonths: 12,
        minimumPaymentAmount: undefined,
        hasHandlingFee: false,
        hasInsurance: false,
      }),
    )

    expect(projection.alerts.noPayoffWithinHorizon).toBe(false)
    expect(projection.monthsToPayoff).toBe(12)
    expect(projection.schedule[projection.schedule.length - 1].endingDebt).toBeCloseTo(0, 3)
    expect(projection.minimumPaymentComparison.comparisonAvailable).toBe(false)
  })

  it('builds minimum payment comparison and raises alert above 1%', () => {
    const projection = simulateCreditCard(
      baseInput({
        minimumPaymentAmount: 350_000,
        termMonths: 24,
      }),
    )

    expect(projection.minimumPaymentComparison.comparisonAvailable).toBe(true)
    expect(projection.minimumPaymentComparison.reportedMinimumPayment).toBe(350_000)
    expect(projection.minimumPaymentComparison.theoreticalMinimumPayment).toBeGreaterThan(0)
    expect(projection.alerts.minimumPaymentDifferenceAbove1Pct).toBe(true)
  })
})
