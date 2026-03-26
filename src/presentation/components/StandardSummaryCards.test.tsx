/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import { renderInDom } from '../../test/domTestUtils'
import { StandardSummaryCards } from './StandardSummaryCards'

let cleanupRef: (() => void) | null = null

afterEach(() => {
  cleanupRef?.()
  cleanupRef = null
})

describe('StandardSummaryCards', () => {
  it('muestra Total seguros y % seguros cuando hay seguro', async () => {
    const rendered = await renderInDom(
      <StandardSummaryCards
        projection={buildProjection()}
        summary={buildSummary({ totalInsurance: 120_000, insurancePct: 6.5 })}
      />,
    )
    cleanupRef = rendered.cleanup

    const text = rendered.container.textContent ?? ''
    expect(text).toContain('Total seguros')
    expect(text).toContain('% seguros')
  })

  it('oculta Total seguros y % seguros cuando no hay seguro', async () => {
    const rendered = await renderInDom(
      <StandardSummaryCards
        projection={buildProjection()}
        summary={buildSummary({ totalInsurance: 0, insurancePct: 0 })}
      />,
    )
    cleanupRef = rendered.cleanup

    const text = rendered.container.textContent ?? ''
    expect(text).not.toContain('Total seguros')
    expect(text).not.toContain('% seguros')
  })
})

function buildProjection() {
  return {
    theoreticalInstallmentExInsurance: 800_000,
    theoreticalInstallmentInclInsurance: 830_000,
    bankComparisonAvailable: false,
    bankInstallmentNormalized: 0,
    installmentDifference: 0,
    installmentDifferencePct: 0,
  }
}

function buildSummary(
  overrides: Partial<{
    totalInterest: number
    totalPrincipal: number
    totalInsurance: number
    totalPaid: number
    monthsReduced: number
    interestSavingsFromPrepayments: number
    alertDifferenceAbove1Pct: boolean
    interestPct: number
    principalPct: number
    insurancePct: number
  }> = {},
) {
  return {
    totalInterest: 2_000_000,
    totalPrincipal: 10_000_000,
    totalInsurance: 0,
    totalPaid: 12_000_000,
    monthsReduced: 0,
    interestSavingsFromPrepayments: 0,
    alertDifferenceAbove1Pct: false,
    interestPct: 16.67,
    principalPct: 83.33,
    insurancePct: 0,
    ...overrides,
  }
}
