import type { FormEvent } from 'react'
import { useState } from 'react'
import type { LoanInput } from '../../domain/loan.types'

interface LoanFormProps {
  onCalculate: (input: LoanInput) => void
}

interface FormState {
  principal: string
  annualEffectiveRatePct: string
  termMonths: string
  bankMonthlyPayment: string
  monthlyInsurance: string
  bankPaymentIncludesInsurance: string
}

const initialState: FormState = {
  principal: '',
  annualEffectiveRatePct: '',
  termMonths: '',
  bankMonthlyPayment: '',
  monthlyInsurance: '',
  bankPaymentIncludesInsurance: 'false',
}

export function LoanForm({ onCalculate }: LoanFormProps) {
  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const principal = Number(form.principal)
    const annualRatePct = Number(form.annualEffectiveRatePct)
    const termMonths = Number(form.termMonths)
    const bankMonthlyPayment = Number(form.bankMonthlyPayment)
    const monthlyInsurance =
      form.monthlyInsurance.trim() === '' ? 0 : Number(form.monthlyInsurance)

    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(annualRatePct) ||
      !Number.isFinite(termMonths) ||
      !Number.isFinite(bankMonthlyPayment) ||
      !Number.isFinite(monthlyInsurance)
    ) {
      setError('Todos los campos numericos deben ser validos.')
      return
    }

    if (principal <= 0 || annualRatePct <= 0 || termMonths <= 0) {
      setError('Saldo, tasa EA y plazo deben ser mayores que cero.')
      return
    }
    if (bankMonthlyPayment <= 0 || monthlyInsurance < 0) {
      setError('Cuota banco debe ser > 0 y seguro debe ser >= 0.')
      return
    }

    setError(null)
    onCalculate({
      principal,
      annualEffectiveRate: annualRatePct / 100,
      termMonths,
      bankMonthlyPayment,
      monthlyInsurance,
      bankPaymentIncludesInsurance: form.bankPaymentIncludesInsurance === 'true',
    })
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="principal">Saldo actual</label>
          <input
            id="principal"
            type="number"
            min={0}
            step="any"
            value={form.principal}
            onChange={(event) => updateField('principal', event.target.value)}
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
            onChange={(event) =>
              updateField('annualEffectiveRatePct', event.target.value)
            }
          />
        </div>

        <div className="field">
          <label htmlFor="termMonths">Plazo restante (meses)</label>
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
          <label htmlFor="bankMonthlyPayment">Cuota mensual del banco</label>
          <input
            id="bankMonthlyPayment"
            type="number"
            min={0}
            step="any"
            value={form.bankMonthlyPayment}
            onChange={(event) =>
              updateField('bankMonthlyPayment', event.target.value)
            }
          />
        </div>

        <div className="field">
          <label htmlFor="monthlyInsurance">Seguro mensual</label>
          <input
            id="monthlyInsurance"
            type="number"
            min={0}
            step="any"
            value={form.monthlyInsurance}
            onChange={(event) =>
              updateField('monthlyInsurance', event.target.value)
            }
          />
        </div>

        <div className="field">
          <label htmlFor="bankPaymentIncludesInsurance">
            La cuota banco incluye seguro
          </label>
          <select
            id="bankPaymentIncludesInsurance"
            value={form.bankPaymentIncludesInsurance}
            onChange={(event) =>
              updateField('bankPaymentIncludesInsurance', event.target.value)
            }
          >
            <option value="false">No incluye seguro</option>
            <option value="true">Si incluye seguro</option>
          </select>
        </div>
      </div>

      {error ? <div className="field-error">{error}</div> : null}
      <button type="submit" className="btn-primary">
        Calcular proyeccion
      </button>
    </form>
  )
}
