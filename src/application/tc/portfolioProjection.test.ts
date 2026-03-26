import { describe, expect, it } from 'vitest'
import type { CreditCardInput } from '../../domain/tc/loan.types'
import { calculateCreditCardPortfolio } from './portfolioProjection'

function makeCard(overrides: Partial<CreditCardInput>): CreditCardInput {
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

describe('calculateCreditCardPortfolio', () => {
  it('builds snowball and optimization ranking', () => {
    const cards: CreditCardInput[] = [
      makeCard({ id: 'a', name: 'A', currentDebt: 900_000, rateValuePct: 18 }),
      makeCard({
        id: 'b',
        name: 'B',
        currentDebt: 1_500_000,
        rateValuePct: 28,
        hasHandlingFee: true,
        monthlyHandlingFee: 40_000,
      }),
      makeCard({ id: 'c', name: 'C', currentDebt: 600_000, rateValuePct: 12 }),
    ]

    const projection = calculateCreditCardPortfolio({
      cards,
      mode: 'automatic',
      strategy: 'optimization',
      globalExtraPaymentAmount: 150_000,
    })

    expect(projection.strategyReport.snowballOrder.map((item) => item.cardId)).toEqual([
      'c',
      'a',
      'b',
    ])
    expect(projection.strategyReport.optimizationOrder[0].cardId).toBe('b')
    expect(projection.strategyReport.recommendedCardId).toBe('b')
  })

  it('manual global extras reduce total paid compared with baseline', () => {
    const cards: CreditCardInput[] = [
      makeCard({ id: 'a', name: 'A', currentDebt: 1_800_000, rateValuePct: 26 }),
      makeCard({ id: 'b', name: 'B', currentDebt: 1_200_000, rateValuePct: 20 }),
    ]

    const baseline = calculateCreditCardPortfolio({
      cards,
      mode: 'manual',
      strategy: 'snowball',
      globalExtraPaymentAmount: 0,
      manualExtraByCardId: {},
    })

    const withManualExtra = calculateCreditCardPortfolio({
      cards,
      mode: 'manual',
      strategy: 'snowball',
      globalExtraPaymentAmount: 0,
      manualExtraByCardId: { a: 120_000, b: 80_000 },
    })

    expect(withManualExtra.totals.totalPaid).toBeLessThan(baseline.totals.totalPaid)
    expect(withManualExtra.totals.totalExtraPaid).toBeGreaterThan(0)
    expect(withManualExtra.strategyReport.estimatedTotalPaidSavings).toBeGreaterThan(0)
  })

  it('automatic mode allocates extra payment and builds consolidated rows', () => {
    const cards: CreditCardInput[] = [
      makeCard({ id: 'a', name: 'A', currentDebt: 700_000, rateValuePct: 21 }),
      makeCard({ id: 'b', name: 'B', currentDebt: 1_100_000, rateValuePct: 23 }),
    ]

    const projection = calculateCreditCardPortfolio({
      cards,
      mode: 'automatic',
      strategy: 'snowball',
      globalExtraPaymentAmount: 100_000,
    })

    expect(projection.consolidatedSchedule.length).toBeGreaterThan(0)
    expect(projection.totals.totalExtraPaid).toBeGreaterThan(0)
    expect(projection.cards).toHaveLength(2)
  })
})
