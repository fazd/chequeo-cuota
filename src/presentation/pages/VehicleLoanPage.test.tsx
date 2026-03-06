/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { VehicleLoanPage } from './VehicleLoanPage'
import { clickTextButton, inputText, renderInDom } from '../../test/domTestUtils'

let cleanupRef: (() => void) | null = null

afterEach(() => {
  cleanupRef?.()
  cleanupRef = null
})

describe('VehicleLoanPage functional', () => {
  it('renderiza resultados despues de enviar formulario valido', async () => {
    const rendered = await renderInDom(
      <MemoryRouter>
        <VehicleLoanPage />
      </MemoryRouter>,
    )
    cleanupRef = rendered.cleanup

    inputText('principal', '90.000.000')
    inputText('annualEffectiveRatePct', '16')
    inputText('termMonths', '72')
    inputText('bankMonthlyPayment', '2.050.000')

    clickTextButton('Calcular plan de pagos')

    expect(rendered.container.textContent).toContain('Cuota teorica')
    expect(rendered.container.textContent).toContain('Total intereses')
    expect(rendered.container.textContent).toContain('Exportar tabla CSV')
  })
})
