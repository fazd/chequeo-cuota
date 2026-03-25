/** @vitest-environment jsdom */
import { act } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { CreditCardCalculatorPage } from './CreditCardCalculatorPage'
import { clickTextButton, renderInDom } from '../../test/domTestUtils'

let cleanupRef: (() => void) | null = null

afterEach(() => {
  cleanupRef?.()
  cleanupRef = null
})

describe('CreditCardCalculatorPage functional', () => {
  it('oculta consolidado con una sola tarjeta y lo muestra con dos o mas', async () => {
    const rendered = await renderInDom(<CreditCardCalculatorPage />)
    cleanupRef = rendered.cleanup

    const initialTabLabels = Array.from(
      rendered.container.querySelectorAll('.tc-tabs .tc-tab'),
    ).map((node) => node.textContent?.trim())

    expect(initialTabLabels).not.toContain('Consolidado')

    clickTextButton('Agregar')

    const updatedTabLabels = Array.from(
      rendered.container.querySelectorAll('.tc-tabs .tc-tab'),
    ).map((node) => node.textContent?.trim())

    expect(updatedTabLabels).toContain('Consolidado')
  })

  it('permite editar el nombre directamente en el tab y no muestra campo extra de nombre', async () => {
    const rendered = await renderInDom(<CreditCardCalculatorPage />)
    cleanupRef = rendered.cleanup

    const tabInput = rendered.container.querySelector('.tc-tab-input') as
      | HTMLInputElement
      | null

    expect(tabInput).not.toBeNull()
    expect(rendered.container.textContent).not.toContain('Nombre')

    if (!tabInput) return

    act(() => {
      tabInput.value = 'Visa principal'
      tabInput.dispatchEvent(new Event('input', { bubbles: true }))
    })

    expect(tabInput.value).toBe('Visa principal')
  })

  it('usa radios para tipo de tasa y controles para seguros/aporte por tarjeta', async () => {
    const rendered = await renderInDom(<CreditCardCalculatorPage />)
    cleanupRef = rendered.cleanup

    const rateNominal = rendered.container.querySelector(
      'input[type="radio"][value="nominalDue"]',
    ) as HTMLInputElement | null
    const rateEffective = rendered.container.querySelector(
      'input[type="radio"][value="effectiveAnnual"]',
    ) as HTMLInputElement | null

    expect(rateNominal).not.toBeNull()
    expect(rateEffective).not.toBeNull()
    expect(rateEffective?.checked).toBe(true)
    expect(
      rendered.container.querySelector('input[id^="currentDebt-"]')?.getAttribute('type'),
    ).toBe('text')
    expect(
      rendered.container.querySelector('input[id^="minimumPaymentAmount-"]')?.getAttribute('type'),
    ).toBe('text')

    expect(rendered.container.textContent).toContain('Tiene seguros')
    expect(rendered.container.textContent).toContain('Quiero agregar aporte mensual')
  })

  it('permite eliminar tarjetas desde el tab y oculta consolidado al volver a una tarjeta', async () => {
    const rendered = await renderInDom(<CreditCardCalculatorPage />)
    cleanupRef = rendered.cleanup

    clickTextButton('Agregar')
    expect(rendered.container.textContent).toContain('Consolidado')

    const removeButton = rendered.container.querySelector('.tc-tab-remove') as
      | HTMLButtonElement
      | null
    expect(removeButton).not.toBeNull()

    if (!removeButton) return

    act(() => {
      removeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(rendered.container.textContent).not.toContain('Consolidado')
  })

  it('muestra warning y bloquea cambio cuando intentan repetir nombre de tarjeta', async () => {
    const rendered = await renderInDom(<CreditCardCalculatorPage />)
    cleanupRef = rendered.cleanup

    clickTextButton('Agregar')

    const tabInputs = Array.from(
      rendered.container.querySelectorAll('.tc-tab-input'),
    ) as HTMLInputElement[]

    expect(tabInputs).toHaveLength(2)

    const firstName = tabInputs[0]?.value ?? ''
    const secondBefore = tabInputs[1]?.value ?? ''

    const secondInput = tabInputs[1]
    if (!secondInput) return

    act(() => {
      secondInput.value = firstName
      secondInput.dispatchEvent(new Event('input', { bubbles: true }))
    })

    const updatedInputs = Array.from(
      rendered.container.querySelectorAll('.tc-tab-input'),
    ) as HTMLInputElement[]

    expect(updatedInputs[1]?.value).toBe(secondBefore)
    expect(rendered.container.textContent).toContain(
      'Cada tarjeta debe tener un nombre unico',
    )
  })
})
