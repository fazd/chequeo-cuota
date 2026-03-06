import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ReactElement } from 'react'

export async function renderInDom(element: ReactElement) {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = createRoot(container)

  await act(async () => {
    root.render(element)
  })

  return {
    container,
    root,
    cleanup: () => cleanup(container, root),
  }
}

function cleanup(container: HTMLDivElement, root: Root) {
  act(() => {
    root.unmount()
  })
  container.remove()
}

export function inputText(id: string, value: string) {
  const input = document.getElementById(id) as HTMLInputElement | null
  if (!input) {
    throw new Error(`Input not found: ${id}`)
  }

  act(() => {
    input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

export function clickTextButton(text: string) {
  const buttons = Array.from(document.querySelectorAll('button'))
  const button = buttons.find((node) => node.textContent?.includes(text)) as
    | HTMLButtonElement
    | undefined

  if (!button) {
    throw new Error(`Button not found: ${text}`)
  }

  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}
