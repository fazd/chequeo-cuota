interface MoneyInputProps {
  id: string
  value: string
  onChange: (value: string) => void
}

export function MoneyInput({ id, value, onChange }: MoneyInputProps) {
  return (
    <div className="money-input-wrap">
      <span className="money-prefix">$</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(formatMoneyInput(event.target.value))}
      />
    </div>
  )
}

export function formatMoneyInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '')
  if (digits === '') return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function parseMoneyInputValue(rawValue: string): number {
  if (rawValue.trim() === '') return NaN
  const normalized = rawValue.replace(/\./g, '').replace(/\s/g, '').replace(',', '.')
  return Number(normalized)
}

export function parseOptionalMoneyInputValue(rawValue: string): number | undefined {
  if (rawValue.trim() === '') return undefined
  return parseMoneyInputValue(rawValue)
}
