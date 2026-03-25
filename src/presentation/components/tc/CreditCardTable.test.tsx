/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import type { CreditCardMonthRow } from '../../../domain/tc/loan.types'
import { renderInDom } from '../../../test/domTestUtils'
import { CreditCardTable } from './CreditCardTable'

let cleanupRef: (() => void) | null = null

afterEach(() => {
  cleanupRef?.()
  cleanupRef = null
})

describe('CreditCardTable', () => {
  it('oculta columna aporte cuando todos los aportes son 0', async () => {
    const rendered = await renderInDom(
      <CreditCardTable
        rows={[
          buildRow({ month: 1, extraPayment: 0 }),
          buildRow({ month: 2, extraPayment: 0 }),
        ]}
      />,
    )
    cleanupRef = rendered.cleanup

    expect(getHeaderLabels(rendered.container)).not.toContain('Aporte')
  })

  it('muestra columna aporte cuando al menos un mes tiene aporte', async () => {
    const rendered = await renderInDom(
      <CreditCardTable
        rows={[
          buildRow({ month: 1, extraPayment: 0 }),
          buildRow({ month: 2, extraPayment: 80_000 }),
        ]}
      />,
    )
    cleanupRef = rendered.cleanup

    expect(getHeaderLabels(rendered.container)).toContain('Aporte')
  })
})

function buildRow(overrides: Partial<CreditCardMonthRow>): CreditCardMonthRow {
  return {
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
    ...overrides,
  }
}

function getHeaderLabels(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('thead th')).map(
    (node) => node.textContent?.trim() ?? '',
  )
}
