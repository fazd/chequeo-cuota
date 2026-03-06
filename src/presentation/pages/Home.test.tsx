/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Home } from './Home'
import { renderInDom } from '../../test/domTestUtils'

let cleanupRef: (() => void) | null = null

afterEach(() => {
  cleanupRef?.()
  cleanupRef = null
})

describe('Home functional', () => {
  it('muestra tarjetas activas para hipotecario, vehicular y libranza', async () => {
    const rendered = await renderInDom(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    cleanupRef = rendered.cleanup

    const links = Array.from(rendered.container.querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    )

    expect(links).toContain('/amortizacion-credito-vivienda')
    expect(links).toContain('/amortizacion-credito-vehicular')
    expect(links).toContain('/amortizacion-credito-libranza')
  })
})
