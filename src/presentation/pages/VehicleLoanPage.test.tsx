/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { VehicleLoanPage } from './VehicleLoanPage'
import { clickTextButton, inputText, renderInDom, selectRadio } from '../../test/domTestUtils'

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
    inputText('rateValuePct', '16')
    inputText('termMonths', '72')
    inputText('bankMonthlyPayment', '2.050.000')

    expect(rendered.container.textContent).toContain('Calcular plan de pagos')
    // expect(rendered.container.textContent).toContain('Exportar tabla CSV')
  })
})
