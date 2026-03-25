import { formatMoneyInput } from './moneyInput.utils'

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
