/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import { renderInDom } from '../../test/domTestUtils'
import { CompactAmortizationTable } from './CompactAmortizationTable'

type RowLike = Parameters<typeof CompactAmortizationTable>[0]['rows'][number]

let cleanupRef: (() => void) | null = null

afterEach(() => {
  cleanupRef?.()
  cleanupRef = null
})

describe('CompactAmortizationTable', () => {
  it('oculta columnas opcionales cuando sus valores son 0 o insignificantes', async () => {
    const rows: RowLike[] = [
      buildRow({ month: 1, extraPayment: 0, baseInsurance: 0, lifeInsurance: 0, insurance: 0 }),
      buildRow({
        month: 2,
        extraPayment: 0.0000001,
        baseInsurance: 0.0000001,
        lifeInsurance: -0.0000001,
        insurance: 0.0000001,
      }),
    ]

    const rendered = await renderInDom(<CompactAmortizationTable rows={rows} />)
    cleanupRef = rendered.cleanup

    const text = rendered.container.textContent ?? ''
    expect(text).not.toContain('Abono extra')
    expect(text).not.toContain('Seguro base')
    expect(text).not.toContain('Seguro vida')
    expect(text).not.toContain('Seguros total')
  })
})

function buildRow(
  patch: Partial<RowLike> & Pick<RowLike, 'month'>,
): RowLike {
  return {
    month: patch.month,
    beginningBalance: patch.beginningBalance ?? 800000,
    interest: patch.interest ?? 9000,
    principalPayment: patch.principalPayment ?? 21000,
    extraPayment: patch.extraPayment ?? 0,
    baseInsurance: patch.baseInsurance ?? 0,
    lifeInsurance: patch.lifeInsurance ?? 0,
    insurance: patch.insurance ?? 0,
    totalPayment: patch.totalPayment ?? 30000,
    endingBalance: patch.endingBalance ?? 779000,
  }
}
