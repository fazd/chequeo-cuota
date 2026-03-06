import type { ComponentProps } from 'react'
import { useState } from 'react'

interface StandardLoanFormProps {
  loanLabel: string
  onCalculate: (input: StandardLoanFormInput) => void
}

export interface StandardLoanFormInput {
  principal: number
  annualEffectiveRate: number
  termMonths: number
  bankMonthlyPayment?: number
  constantExtraPayment?: {
    amount: number
    everyNMonths: number
  }
}

interface FormState {
  principal: string
  annualEffectiveRatePct: string
  termMonths: string
  bankMonthlyPayment: string
  wantsExtraPayments: boolean
  periodicExtraAmount: string
  periodicExtraEveryMonths: string
}

const initialState: FormState = {
  principal: '',
  annualEffectiveRatePct: '',
  termMonths: '',
  bankMonthlyPayment: '',
  wantsExtraPayments: false,
  periodicExtraAmount: '',
  periodicExtraEveryMonths: '',
}

export function StandardLoanForm({ loanLabel, onCalculate }: StandardLoanFormProps) {
  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (event) => {
    event.preventDefault()

    const principal = parseMoneyInputValue(form.principal)
    const annualEffectiveRatePct = Number(form.annualEffectiveRatePct)
    const termMonths = Number(form.termMonths)
    const bankMonthlyPayment = parseOptionalMoneyInputValue(form.bankMonthlyPayment)

    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(annualEffectiveRatePct) ||
      !Number.isFinite(termMonths)
    ) {
      setError('Completa saldo, tasa y plazo con valores validos.')
      return
    }

    if (principal <= 0 || annualEffectiveRatePct <= 0 || termMonths <= 0) {
      setError('Saldo, tasa y plazo deben ser mayores que cero.')
      return
    }

    if (
      bankMonthlyPayment !== undefined &&
      (!Number.isFinite(bankMonthlyPayment) || bankMonthlyPayment <= 0)
    ) {
      setError('Si ingresas cuota banco, debe ser mayor que cero.')
      return
    }

    let constantExtraPayment: StandardLoanFormInput['constantExtraPayment']
    if (form.wantsExtraPayments) {
      const amount = parseMoneyInputValue(form.periodicExtraAmount)
      const everyNMonths = Number(form.periodicExtraEveryMonths)

      if (!Number.isFinite(amount) || !Number.isFinite(everyNMonths)) {
        setError('Completa monto y frecuencia de abono periodico.')
        return
      }
      if (amount <= 0 || !Number.isInteger(everyNMonths) || everyNMonths <= 0) {
        setError('El abono periodico debe tener monto > 0 y frecuencia entera > 0.')
        return
      }

      constantExtraPayment = { amount, everyNMonths }
    }

    setError(null)
    onCalculate({
      principal,
      annualEffectiveRate: annualEffectiveRatePct / 100,
      termMonths,
      bankMonthlyPayment,
      constantExtraPayment,
    })
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <section className="form-card">
        <header className="form-card-header">
          <span className="form-card-badge" aria-hidden>
            1
          </span>
          <div>
            <h3 className="section-title">Datos del {loanLabel}</h3>
            <p className="section-description">
              Ingresa los valores base para calcular la amortizacion.
            </p>
          </div>
        </header>

        <div className="form-card-content">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="principal">Saldo pendiente</label>
              <MoneyInput
                id="principal"
                value={form.principal}
                onChange={(value) => updateField('principal', value)}
              />
            </div>

            <div className="field">
              <label htmlFor="annualEffectiveRatePct">Tasa efectiva anual (%)</label>
              <input
                id="annualEffectiveRatePct"
                type="number"
                min={0}
                step="any"
                value={form.annualEffectiveRatePct}
                onChange={(event) => updateField('annualEffectiveRatePct', event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="termMonths">Plazo (meses)</label>
              <input
                id="termMonths"
                type="number"
                min={1}
                step={1}
                value={form.termMonths}
                onChange={(event) => updateField('termMonths', event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="bankMonthlyPayment">Cuota mensual banco (opcional)</label>
              <MoneyInput
                id="bankMonthlyPayment"
                value={form.bankMonthlyPayment}
                onChange={(value) => updateField('bankMonthlyPayment', value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="form-card">
        <header className="form-card-header">
          <span className="form-card-badge" aria-hidden>
            2
          </span>
          <div>
            <h3 className="section-title">Aportes adicionales</h3>
            <p className="section-description">
              Opcional: simula un abono periodico para comparar contra escenario base.
            </p>
          </div>
        </header>

        <div className="form-card-content">
          <label className="choice-item" htmlFor="wantsExtraPayments">
            <input
              id="wantsExtraPayments"
              type="checkbox"
              checked={form.wantsExtraPayments}
              onChange={(event) => updateField('wantsExtraPayments', event.target.checked)}
            />
            Quiero simular abonos periodicos
          </label>

          {form.wantsExtraPayments ? (
            <div className="form-grid form-grid-three">
              <div className="field">
                <label htmlFor="periodicExtraAmount">Monto del abono</label>
                <MoneyInput
                  id="periodicExtraAmount"
                  value={form.periodicExtraAmount}
                  onChange={(value) => updateField('periodicExtraAmount', value)}
                />
              </div>
              <div className="field">
                <label htmlFor="periodicExtraEveryMonths">Cada cuantos meses</label>
                <input
                  id="periodicExtraEveryMonths"
                  type="number"
                  min={1}
                  step={1}
                  value={form.periodicExtraEveryMonths}
                  onChange={(event) =>
                    updateField('periodicExtraEveryMonths', event.target.value)
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {error ? <div className="field-error">{error}</div> : null}

      <div className="submit-wrap">
        <button type="submit" className="btn-primary btn-wide">
          Calcular plan de pagos
        </button>
      </div>
    </form>
  )
}

interface MoneyInputProps {
  id: string
  value: string
  onChange: (value: string) => void
}

function MoneyInput({ id, value, onChange }: MoneyInputProps) {
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

function formatMoneyInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '')
  if (digits === '') {
    return ''
  }

  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function parseMoneyInputValue(rawValue: string): number {
  if (rawValue.trim() === '') {
    return NaN
  }

  const normalized = rawValue.replace(/\./g, '').replace(/\s/g, '').replace(',', '.')
  return Number(normalized)
}

function parseOptionalMoneyInputValue(rawValue: string): number | undefined {
  if (rawValue.trim() === '') {
    return undefined
  }

  return parseMoneyInputValue(rawValue)
}
