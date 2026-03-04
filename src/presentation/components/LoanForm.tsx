import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import type { ExtraPayment, LoanInput } from '../../domain/loan.types'

interface LoanFormProps {
  onCalculate: (input: LoanInput) => void
}

interface ExtraordinaryRow {
  month: string
  amount: string
}

interface FormState {
  principal: string
  annualEffectiveRatePct: string
  termMonths: string
  bankMonthlyPayment: string
  monthlyInsurance: string
  monthlyLifeInsuranceRatePct: string
  bankPaymentIncludesInsurance: string
  constantExtraAmount: string
  constantExtraEveryMonths: string
  extraordinaryRows: ExtraordinaryRow[]
}

const initialState: FormState = {
  principal: '',
  annualEffectiveRatePct: '',
  termMonths: '',
  bankMonthlyPayment: '',
  monthlyInsurance: '',
  monthlyLifeInsuranceRatePct: '',
  bankPaymentIncludesInsurance: 'false',
  constantExtraAmount: '',
  constantExtraEveryMonths: '',
  extraordinaryRows: [],
}

export function LoanForm({ onCalculate }: LoanFormProps) {
  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)

  const termMonthsValue = Number(form.termMonths)
  const canAddExtraordinary =
    Number.isFinite(termMonthsValue) &&
    termMonthsValue > 0 &&
    form.extraordinaryRows.length < termMonthsValue

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateExtraordinaryRow(
    index: number,
    key: keyof ExtraordinaryRow,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      extraordinaryRows: prev.extraordinaryRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    }))
  }

  function addExtraordinaryRow() {
    setForm((prev) => ({
      ...prev,
      extraordinaryRows: [...prev.extraordinaryRows, { month: '', amount: '' }],
    }))
  }

  function removeExtraordinaryRow(index: number) {
    setForm((prev) => ({
      ...prev,
      extraordinaryRows: prev.extraordinaryRows.filter(
        (_, rowIndex) => rowIndex !== index,
      ),
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const principal = Number(form.principal)
    const annualRatePct = Number(form.annualEffectiveRatePct)
    const termMonths = Number(form.termMonths)
    const bankMonthlyPayment = Number(form.bankMonthlyPayment)
    const monthlyInsurance =
      form.monthlyInsurance.trim() === '' ? 0 : Number(form.monthlyInsurance)
    const monthlyLifeInsuranceRatePct =
      form.monthlyLifeInsuranceRatePct.trim() === ''
        ? 0
        : Number(form.monthlyLifeInsuranceRatePct)
    const constantExtraAmount =
      form.constantExtraAmount.trim() === '' ? 0 : Number(form.constantExtraAmount)
    const constantExtraEveryMonths =
      form.constantExtraEveryMonths.trim() === ''
        ? 0
        : Number(form.constantExtraEveryMonths)

    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(annualRatePct) ||
      !Number.isFinite(termMonths) ||
      !Number.isFinite(bankMonthlyPayment) ||
      !Number.isFinite(monthlyInsurance) ||
      !Number.isFinite(monthlyLifeInsuranceRatePct) ||
      !Number.isFinite(constantExtraAmount) ||
      !Number.isFinite(constantExtraEveryMonths)
    ) {
      setError('Todos los campos numericos deben ser validos.')
      return
    }

    if (principal <= 0 || annualRatePct <= 0 || termMonths <= 0) {
      setError('Saldo, tasa EA y plazo deben ser mayores que cero.')
      return
    }
    if (bankMonthlyPayment <= 0 || monthlyInsurance < 0) {
      setError('Cuota banco debe ser > 0 y seguro base debe ser >= 0.')
      return
    }
    if (monthlyLifeInsuranceRatePct < 0) {
      setError('El porcentaje mensual del seguro de vida debe ser >= 0.')
      return
    }

    const hasConstantAmount = constantExtraAmount > 0
    const hasConstantPeriod = constantExtraEveryMonths > 0
    if (hasConstantAmount !== hasConstantPeriod) {
      setError(
        'Para abono constante debes completar monto y periodicidad (cada cuantos meses).',
      )
      return
    }
    if (hasConstantAmount && !Number.isInteger(constantExtraEveryMonths)) {
      setError('La periodicidad de abono constante debe ser un entero.')
      return
    }

    const extraordinaryParsed = parseExtraordinaryRows(
      form.extraordinaryRows,
      termMonths,
    )
    if (extraordinaryParsed.error) {
      setError(extraordinaryParsed.error)
      return
    }

    setError(null)
    onCalculate({
      principal,
      annualEffectiveRate: annualRatePct / 100,
      termMonths,
      bankMonthlyPayment,
      monthlyInsurance,
      monthlyLifeInsuranceRate: monthlyLifeInsuranceRatePct / 100,
      bankPaymentIncludesInsurance: form.bankPaymentIncludesInsurance === 'true',
      constantExtraPayment:
        hasConstantAmount && hasConstantPeriod
          ? {
              amount: constantExtraAmount,
              everyNMonths: constantExtraEveryMonths,
            }
          : undefined,
      extraordinaryExtraPayments: extraordinaryParsed.payments,
    })
  }

  const activeExtraRows = useMemo(
    () =>
      form.extraordinaryRows.map((row, index) => (
        <div key={index} className="inline-grid-2">
          <div className="field">
            <label htmlFor={`extraMonth-${index}`}>Mes del abono</label>
            <input
              id={`extraMonth-${index}`}
              type="number"
              min={1}
              step={1}
              value={row.month}
              onChange={(event) =>
                updateExtraordinaryRow(index, 'month', event.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor={`extraAmount-${index}`}>Monto del abono</label>
            <MoneyInput
              id={`extraAmount-${index}`}
              min={0}
              value={row.amount}
              onChange={(value) => updateExtraordinaryRow(index, 'amount', value)}
            />
          </div>
          <div className="mini-actions">
            <button
              type="button"
              className="btn-danger"
              onClick={() => removeExtraordinaryRow(index)}
            >
              Eliminar
            </button>
          </div>
        </div>
      )),
    [form.extraordinaryRows],
  )

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="principal">Saldo actual</label>
          <MoneyInput
            id="principal"
            min={0}
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
          <MoneyInput
            id="bankMonthlyPayment"
            min={0}
            value={form.bankMonthlyPayment}
            onChange={(value) => updateField('bankMonthlyPayment', value)}
          />
        </div>

        <div className="field">
          <label htmlFor="monthlyInsurance">Seguro base mensual (opcional)</label>
          <MoneyInput
            id="monthlyInsurance"
            min={0}
            value={form.monthlyInsurance}
            onChange={(value) => updateField('monthlyInsurance', value)}
          />
        </div>

        <div className="field">
          <label htmlFor="monthlyLifeInsuranceRatePct">
            Seguro de vida mensual sobre saldo (%) opcional
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

      <div className="section">
        <h3 style={{ marginTop: 0 }}>Abono constante (opcional)</h3>
        <div className="inline-grid-2">
          <div className="field">
            <label htmlFor="constantExtraAmount">Monto de abono constante</label>
            <MoneyInput
              id="constantExtraAmount"
              min={0}
              value={form.constantExtraAmount}
              onChange={(value) => updateField('constantExtraAmount', value)}
            />
          </div>
          <div className="field">
            <label htmlFor="constantExtraEveryMonths">Cada cuantos meses</label>
            <input
              id="constantExtraEveryMonths"
              type="number"
              min={1}
              step={1}
              value={form.constantExtraEveryMonths}
              onChange={(event) =>
                updateField('constantExtraEveryMonths', event.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="section">
        <h3 style={{ marginTop: 0 }}>Abonos extraordinarios (opcional)</h3>
        <div className="mini-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={addExtraordinaryRow}
            disabled={!canAddExtraordinary}
          >
            Agregar abono extraordinario
          </button>
        </div>
        <div className="section">{activeExtraRows}</div>
      </div>

      {error ? <div className="field-error">{error}</div> : null}
      <button type="submit" className="btn-primary">
        Calcular proyeccion
      </button>
    </form>
  )
}

interface MoneyInputProps {
  id: string
  value: string
  min: number
  onChange: (value: string) => void
}

function MoneyInput({ id, value, min, onChange }: MoneyInputProps) {
  return (
    <div className="money-input-wrap">
      <span className="money-prefix">$</span>
      <input
        id={id}
        type="number"
        min={min}
        step="any"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function parseExtraordinaryRows(
  rows: ExtraordinaryRow[],
  termMonths: number,
): { payments: ExtraPayment[]; error: string | null } {
  const payments: ExtraPayment[] = []

  for (const row of rows) {
    const hasMonth = row.month.trim() !== ''
    const hasAmount = row.amount.trim() !== ''
    if (!hasMonth && !hasAmount) {
      continue
    }
    if (!hasMonth || !hasAmount) {
      return {
        payments: [],
        error: 'Cada abono extraordinario debe tener mes y monto.',
      }
    }

    const month = Number(row.month)
    const amount = Number(row.amount)

    if (!Number.isInteger(month) || month < 1 || month > termMonths) {
      return {
        payments: [],
        error: `El mes de abono extraordinario debe estar entre 1 y ${termMonths}.`,
      }
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return {
        payments: [],
        error: 'El monto del abono extraordinario debe ser mayor que cero.',
      }
    }

    payments.push({ month, amount })
  }

  return { payments, error: null }
}
