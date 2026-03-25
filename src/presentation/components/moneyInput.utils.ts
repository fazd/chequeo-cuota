export function formatMoneyInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '')
  if (digits === '') return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function parseMoneyInputValue(rawValue: string): number {
  if (rawValue.trim() === '') return Number.NaN
  const normalized = rawValue.replace(/\./g, '').replace(/\s/g, '').replace(',', '.')
  return Number(normalized)
}

export function parseOptionalMoneyInputValue(rawValue: string): number | undefined {
  if (rawValue.trim() === '') return undefined
  return parseMoneyInputValue(rawValue)
}
