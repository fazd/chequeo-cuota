/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import type { AmortizationRow } from '../../domain/loan.types'
import { renderInDom } from '../../test/domTestUtils'
import { AmortizationTable } from './AmortizationTable'

let cleanupRef: (() => void) | null = null

afterEach(() => {
  cleanupRef?.()
  cleanupRef = null
})

describe('AmortizationTable', () => {
  it('oculta columnas opcionales cuando todos los valores estan por debajo de la delta', async () => {
    const rows: AmortizationRow[] = [
      buildRow({ month: 1, extraPayment: 0, baseInsurance: 0, lifeInsurance: 0, insurance: 0 }),
      buildRow({
        month: 2,
        extraPayment: 0.0000001,
        baseInsurance: -0.0000001,
        lifeInsurance: 0.0000001,
        insurance: 0.0000001,
      }),
    ]

    const rendered = await renderInDom(<AmortizationTable rows={rows} />)
    cleanupRef = rendered.cleanup

    const text = rendered.container.textContent ?? ''
    expect(text).not.toContain('Abono extra')
    expect(text).not.toContain('Seguro base')
    expect(text).not.toContain('Seguro vida')
    expect(text).not.toContain('Seguro total')
  })

  it('muestra columnas opcionales cuando algun valor supera la delta', async () => {
    const rows: AmortizationRow[] = [
      buildRow({ month: 1, extraPayment: 0, baseInsurance: 0, lifeInsurance: 0, insurance: 0 }),
      buildRow({
        month: 2,
        extraPayment: 20000,
        baseInsurance: 5000,
        lifeInsurance: 3000,
        insurance: 8000,
      }),
    ]

    const rendered = await renderInDom(<AmortizationTable rows={rows} />)
    cleanupRef = rendered.cleanup

    const text = rendered.container.textContent ?? ''
    expect(text).toContain('Abono extra')
    expect(text).toContain('Seguro base')
    expect(text).toContain('Seguro vida')
    expect(text).toContain('Seguro total')
  })
})

function buildRow(
  patch: Partial<AmortizationRow> & Pick<AmortizationRow, 'month'>,
): AmortizationRow {
  return {
    month: patch.month,
    beginningBalance: patch.beginningBalance ?? 1000000,
    interest: patch.interest ?? 10000,
    principalPayment: patch.principalPayment ?? 25000,
    extraPayment: patch.extraPayment ?? 0,
    baseInsurance: patch.baseInsurance ?? 0,
    lifeInsurance: patch.lifeInsurance ?? 0,
    insurance: patch.insurance ?? 0,
    totalPayment: patch.totalPayment ?? 35000,
    endingBalance: patch.endingBalance ?? 975000,
  }
}
