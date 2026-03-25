/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import type { CreditCardProjection } from '../../../domain/tc/loan.types'
import { renderInDom } from '../../../test/domTestUtils'
import { CreditCardSummaryCards } from './CreditCardSummaryCards'

let cleanupRef: (() => void) | null = null

afterEach(() => {
  cleanupRef?.()
  cleanupRef = null
})

describe('CreditCardSummaryCards', () => {
  it('oculta metricas opcionales cuando su valor es 0', async () => {
    const projection = buildProjection({
      totalHandlingFee: 0,
      totalInsurance: 0,
      totalExtraPaid: 0,
      interestSavingsFromPrepayments: 0,
      monthsReduced: 0,
      schedule: [
        {
          month: 1,
          beginningDebt: 1_000_000,
          interest: 20_000,
          handlingFee: 0,
          insurance: 0,
          minimumPayment: 120_000,
          extraPayment: 0,
          totalPayment: 120_000,
          principalDelta: 100_000,
          endingDebt: 900_000,
        },
      ],
    })

    const rendered = await renderInDom(<CreditCardSummaryCards projection={projection} />)
    cleanupRef = rendered.cleanup

    const text = rendered.container.textContent ?? ''
    expect(text).not.toContain('Cuota manejo total')
    expect(text).not.toContain('Seguros totales')
    expect(text).not.toContain('% seguros')
    expect(text).not.toContain('Aportes acumulados')
    expect(text).not.toContain('Ahorro intereses (vs baseline)')
    expect(text).not.toContain('Reduccion de plazo')
  })

  it('calcula cupo usado y cupo liberado desde deuda inicial y deuda final', async () => {
    const projection = buildProjection({
      schedule: [
        {
          month: 1,
          beginningDebt: 1_000_000,
          interest: 20_000,
          handlingFee: 0,
          insurance: 0,
          minimumPayment: 120_000,
          extraPayment: 0,
          totalPayment: 120_000,
          principalDelta: 100_000,
          endingDebt: 900_000,
          usedLimitAmount: 900_000,
          usedLimitPct: 45,
          releasedLimitAmount: 1_100_000,
        },
        {
          month: 2,
          beginningDebt: 900_000,
          interest: 18_000,
          handlingFee: 0,
          insurance: 0,
          minimumPayment: 918_000,
          extraPayment: 0,
          totalPayment: 918_000,
          principalDelta: 900_000,
          endingDebt: 0,
          usedLimitAmount: 0,
          usedLimitPct: 0,
          releasedLimitAmount: 2_000_000,
        },
      ],
    })

    const rendered = await renderInDom(<CreditCardSummaryCards projection={projection} />)
    cleanupRef = rendered.cleanup

    const text = rendered.container.textContent ?? ''
    expect(text).toContain('Cupo usado')
    expect(text).toContain('$1.000.000 (50.00%)')
    expect(text).toContain('Cupo liberado')
    expect(text).toContain('$1.000.000')
    expect(text).toContain('% intereses')
    expect(text).toContain('% deuda total')
    expect(text).toContain('% seguros')
  })
})

function buildProjection(overrides: Partial<CreditCardProjection> = {}): CreditCardProjection {
  return {
    cardId: 'tc-1',
    cardName: 'TC 1',
    schedule: [
      {
        month: 1,
        beginningDebt: 1_000_000,
        interest: 20_000,
        handlingFee: 10_000,
        insurance: 5_000,
        minimumPayment: 120_000,
        extraPayment: 30_000,
        totalPayment: 150_000,
        principalDelta: 115_000,
        endingDebt: 885_000,
        usedLimitAmount: 885_000,
        usedLimitPct: 44.25,
        releasedLimitAmount: 1_115_000,
      },
    ],
    baselineSchedule: [],
    totalInterest: 20_000,
    totalHandlingFee: 10_000,
    totalInsurance: 5_000,
    totalPaid: 150_000,
    totalMinimumPaid: 120_000,
    totalExtraPaid: 30_000,
    monthsToPayoff: 12,
    baselineMonthsToPayoff: 14,
    monthsReduced: 2,
    interestSavingsFromPrepayments: 40_000,
    minimumPaymentComparison: {
      theoreticalMinimumPayment: 120_000,
      reportedMinimumPayment: null,
      comparisonAvailable: false,
      difference: 0,
      differencePct: 0,
    },
    alerts: {
      hasNegativeAmortization: false,
      noPayoffWithinHorizon: false,
      baselineNoPayoffWithinHorizon: false,
      minimumPaymentDifferenceAbove1Pct: false,
    },
    ...overrides,
  }
}
