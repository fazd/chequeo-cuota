/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { PayrollLoanPage } from './PayrollLoanPage'
import { clickTextButton, inputText, renderInDom } from '../../test/domTestUtils'

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
    inputText('annualEffectiveRatePct', '14')
    inputText('termMonths', '60')
    inputText('bankMonthlyPayment', '1.000.000')

    clickTextButton('Calcular plan de pagos')

    expect(rendered.container.textContent).toContain('Cuota teorica')
    expect(rendered.container.textContent).toContain('Total pagado')
    expect(rendered.container.textContent).toContain('Exportar tabla CSV')
  })
})
