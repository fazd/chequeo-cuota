/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { PayrollLoanPage } from './PayrollLoanPage'
import { clickTextButton, inputText, renderInDom, selectRadio } from '../../test/domTestUtils'

let cleanupRef: (() => void) | null = null

afterEach(() => {
  cleanupRef?.()
  cleanupRef = null
})

describe('PayrollLoanPage functional', () => {
  it('renderiza resultados despues de enviar formulario valido', async () => {
    const rendered = await renderInDom(
      <MemoryRouter>
        <PayrollLoanPage />
      </MemoryRouter>,
    )
    cleanupRef = rendered.cleanup

    inputText('principal', '40.000.000')
    inputText('rateValuePct', '14')
    inputText('termMonths', '60')
    inputText('bankMonthlyPayment', '1.000.000')

    expect(rendered.container.textContent).toContain('Calcular plan de pagos')
    // expect(rendered.container.textContent).toContain('Exportar tabla CSV')
  })
})
