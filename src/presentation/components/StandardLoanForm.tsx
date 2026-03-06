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
  monthlyInsurance?: number
  monthlyLifeInsuranceRate?: number
  bankPaymentIncludesInsurance: boolean
  constantExtraPayment?: {
    amount: number
    everyNMonths: number
  }
}

type RateType = 'effectiveAnnual' | 'nominalDue'

interface FormState {
  principal: string
  annualEffectiveRatePct: string
  rateType: RateType
  termMonths: string
  bankMonthlyPayment: string
  bankPaymentIncludesInsurance: string
  hasFixedInsurance: boolean
  monthlyInsurance: string
  hasVariableInsurance: boolean
  monthlyLifeInsuranceRatePct: string
  wantsExtraPayments: boolean
  periodicExtraAmount: string
  periodicExtraEveryMonths: string
}

const initialState: FormState = {
  principal: '',
  annualEffectiveRatePct: '',
  rateType: 'effectiveAnnual',
  termMonths: '',
  bankMonthlyPayment: '',
  bankPaymentIncludesInsurance: 'false',
  hasFixedInsurance: false,
  monthlyInsurance: '',
  hasVariableInsurance: false,
  monthlyLifeInsuranceRatePct: '',
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
    const rateInputPct = Number(form.annualEffectiveRatePct)
    const annualEffectiveRate = toEffectiveAnnualRate(form.rateType, rateInputPct)
    const termMonths = Number(form.termMonths)
    const bankMonthlyPayment = parseOptionalMoneyInputValue(form.bankMonthlyPayment)
    const insuranceEnabled = form.bankPaymentIncludesInsurance === 'true'
    const monthlyInsurance =
      insuranceEnabled && form.hasFixedInsurance
        ? parseMoneyInputValue(form.monthlyInsurance)
        : 0
    const monthlyLifeInsuranceRatePct =
      insuranceEnabled && form.hasVariableInsurance
        ? Number(form.monthlyLifeInsuranceRatePct)
        : 0

    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(rateInputPct) ||
      !Number.isFinite(annualEffectiveRate) ||
      !Number.isFinite(termMonths) ||
      !Number.isFinite(monthlyInsurance) ||
      !Number.isFinite(monthlyLifeInsuranceRatePct)
    ) {
      setError('Completa saldo, tasa y plazo con valores validos.')
      return
    }

    if (principal <= 0 || annualEffectiveRate <= 0 || termMonths <= 0) {
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
    if (monthlyInsurance < 0) {
      setError('El seguro fijo debe ser >= 0.')
      return
    }
    if (monthlyLifeInsuranceRatePct < 0) {
      setError('El interes mensual del seguro variable debe ser >= 0.')
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
      annualEffectiveRate,
      termMonths,
      bankMonthlyPayment,
      monthlyInsurance,
      monthlyLifeInsuranceRate: monthlyLifeInsuranceRatePct / 100,
      bankPaymentIncludesInsurance: insuranceEnabled,
      constantExtraPayment,
    })
  }

  const showInsuranceCard = form.bankPaymentIncludesInsurance === 'true'
  const insuranceBadge = '2'
  const extraPaymentsBadge = showInsuranceCard ? '3' : '2'

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
              <label>Tipo de tasa</label>
              <div className="choice-group choice-group-inline">
                <label className="choice-item">
                  <input
                    type="radio"
                    name="rateType"
                    value="nominalDue"
                    checked={form.rateType === 'nominalDue'}
                    onChange={(event) =>
                      updateField('rateType', event.target.value as RateType)
                    }
                  />
                  Tasa nominal vencida
                </label>
                <label className="choice-item">
                  <input
                    type="radio"
                    name="rateType"
                    value="effectiveAnnual"
                    checked={form.rateType === 'effectiveAnnual'}
                    onChange={(event) =>
                      updateField('rateType', event.target.value as RateType)
                    }
                  />
                  Tasa efectiva anual
                </label>
              </div>
            </div>

            <div className="field">
              <label htmlFor="annualEffectiveRatePct">Valor de la tasa (%)</label>
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

            <div className="field">
              <label htmlFor="bankPaymentIncludesInsurance">
                La cuota banco incluye seguros
              </label>
              <select
                id="bankPaymentIncludesInsurance"
                value={form.bankPaymentIncludesInsurance}
                onChange={(event) =>
                  updateField('bankPaymentIncludesInsurance', event.target.value)
                }
              >
                <option value="false">No incluye seguros</option>
                <option value="true">Si incluye seguros</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {showInsuranceCard ? (
        <section className="form-card">
          <header className="form-card-header">
            <span className="form-card-badge" aria-hidden>
              {insuranceBadge}
            </span>
            <div>
              <h3 className="section-title">Seguros</h3>
              <p className="section-description">
                Configura los seguros asociados a tu credito.
              </p>
            </div>
          </header>

          <div className="form-card-content">
            <div className="choice-group choice-group-inline">
              <label className="choice-item" htmlFor="hasFixedInsurance">
                <input
                  id="hasFixedInsurance"
                  type="checkbox"
                  checked={form.hasFixedInsurance}
                  onChange={(event) =>
                    updateField('hasFixedInsurance', event.target.checked)
                  }
                />
                Seguro fijo
              </label>
              <label className="choice-item" htmlFor="hasVariableInsurance">
                <input
                  id="hasVariableInsurance"
                  type="checkbox"
                  checked={form.hasVariableInsurance}
                  onChange={(event) =>
                    updateField('hasVariableInsurance', event.target.checked)
                  }
                />
                Seguro variable
              </label>
            </div>

            <div className="form-grid">
              {form.hasFixedInsurance ? (
                <div className="field">
                  <label htmlFor="monthlyInsurance">Valor del seguro fijo</label>
                  <MoneyInput
                    id="monthlyInsurance"
                    value={form.monthlyInsurance}
                    onChange={(value) => updateField('monthlyInsurance', value)}
                  />
                </div>
              ) : null}
              {form.hasVariableInsurance ? (
                <div className="field">
                  <label htmlFor="monthlyLifeInsuranceRatePct">
                    Interes del seguro variable (%)
                  </label>
                  <input
                    id="monthlyLifeInsuranceRatePct"
                    type="number"
                    min={0}
                    step="any"
                    value={form.monthlyLifeInsuranceRatePct}
                    onChange={(event) =>
                      updateField('monthlyLifeInsuranceRatePct', event.target.value)
                    }
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="form-card">
        <header className="form-card-header">
          <span className="form-card-badge" aria-hidden>
            {extraPaymentsBadge}
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

function toEffectiveAnnualRate(rateType: RateType, ratePct: number): number {
  const rateDecimal = ratePct / 100

  if (rateType === 'effectiveAnnual') {
    return rateDecimal
  }

  const monthlyNominalDue = rateDecimal / 12
  return Math.pow(1 + monthlyNominalDue, 12) - 1
}
