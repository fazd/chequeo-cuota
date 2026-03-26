/** @vitest-environment jsdom */
import { act } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { CreditCardCalculatorPage } from './CreditCardCalculatorPage'
import { clickTextButton, renderInDom } from '../../test/domTestUtils'
import { simulateCreditCard } from '../../domain/tc/simulator'

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

    // Initially, no input should be visible
    const tabInputBefore = rendered.container.querySelector('.tc-tab-input')
    expect(tabInputBefore).toBeNull()
    expect(rendered.container.textContent).not.toContain('Nombre')

    // Click the edit button to start editing
    const editButton = rendered.container.querySelector('.tc-tab-edit') as
      | HTMLButtonElement
      | null
    expect(editButton).not.toBeNull()

    if (!editButton) return

    act(() => {
      editButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Now the input should be visible
    const tabInput = rendered.container.querySelector('.tc-tab-input') as
      | HTMLInputElement
      | null
    expect(tabInput).not.toBeNull()

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

    expect(rendered.container.textContent).toContain('Tiene cuota de manejo')
    expect(rendered.container.textContent).toContain('Seguros')
    expect(rendered.container.textContent).toContain('Quiero hacer abonos periodicos')
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

    // Confirm deletion in modal
    const confirmButton = rendered.container.querySelector('.btn-danger') as
      | HTMLButtonElement
      | null
    expect(confirmButton).not.toBeNull()
    expect(confirmButton?.textContent?.trim()).toBe('Eliminar')

    if (!confirmButton) return

    act(() => {
      confirmButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(rendered.container.textContent).not.toContain('Consolidado')
  })

  it('muestra warning y bloquea cambio cuando intentan repetir nombre de tarjeta', async () => {
    const rendered = await renderInDom(<CreditCardCalculatorPage />)
    cleanupRef = rendered.cleanup

    const addCardButton = rendered.container.querySelector('button.tc-tab-add') as
      | HTMLButtonElement
      | null
    expect(addCardButton).not.toBeNull()

    if (!addCardButton) return

    act(() => {
      addCardButton.click()
    })

    const tabNodesAfterAdd = Array.from(
      rendered.container.querySelectorAll('.tc-tab-name, .tc-tab-input'),
    ).map((node) => node.textContent?.trim() ?? (node as HTMLInputElement).value)
    // eslint-disable-next-line no-console
    console.log('TAB NODES AFTER ADD', tabNodesAfterAdd)
    expect(tabNodesAfterAdd.length).toBeGreaterThanOrEqual(2)

    // After adding, second card is active and only this tab shows edit/delete
    const editButton = rendered.container.querySelector('.tc-tab-edit') as
      | HTMLButtonElement
      | null
    expect(editButton).not.toBeNull()

    if (!editButton) return

    act(() => {
      editButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const tabInput = rendered.container.querySelector('.tc-tab-input') as
      | HTMLInputElement
      | null
    expect(tabInput).not.toBeNull()

    if (!tabInput) return

    const firstCardName = 'TC 1'

    act(() => {
      tabInput.value = firstCardName
      tabInput.dispatchEvent(new InputEvent('input', { bubbles: true }))
    })

    act(() => {
      tabInput.blur()
    })

    const tabNames = Array.from(rendered.container.querySelectorAll('.tc-tab-name')).map((node) => node.textContent?.trim())

    expect(tabNames).toContain('TC 2')
    expect(rendered.container.textContent).toContain('TC 1')
    expect(rendered.container.textContent).toContain(
      'Cada tarjeta debe tener un nombre unico',
    )
  })

  it('muestra mensaje de ahorro por tarjeta cuando hay aportes', () => {
    const baselineInput = {
      id: 'tc-1',
      name: 'TC 1',
      currentDebt: 5_000_000,
      termMonths: 24,
      rateType: 'effectiveAnnual' as const,
      rateValuePct: 24,
      minimumPaymentAmount: undefined,
      hasHandlingFee: false,
      hasInsurance: false,
    }

    const baseline = simulateCreditCard(baselineInput)

    const withExtras = simulateCreditCard({
      ...baselineInput,
      constantExtraPayment: { amount: 100_000, everyNMonths: 1 },
      extraordinaryExtraPayments: [],
    })

    expect(withExtras.interestSavingsFromPrepayments).toBeGreaterThan(0)
    expect(withExtras.monthsReduced).toBeGreaterThan(0)
    expect(withExtras.monthsToPayoff).toBeLessThan(baseline.monthsToPayoff!) // expectation for improvement
  })
})

