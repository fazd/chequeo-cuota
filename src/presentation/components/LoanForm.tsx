import type { ComponentProps, ReactNode } from 'react'
import { useState } from 'react'
import type { LoanInput } from '../../domain/loan.types'
import { trackCalculoRealizado } from '../../application/analytics/events'
import {
  MoneyInput,
} from './MoneyInput'
import {
  parseMoneyInputValue,
  parseOptionalMoneyInputValue,
} from './moneyInput.utils'
import { InsuranceCard } from './InsuranceCard'
import {
  ExtraPaymentsCard,
  type ExtraPaymentRowDraft,
} from './ExtraPaymentsCard'
interface LoanFormProps {
  onCalculate: (input: LoanInput) => void
}

type RateType = 'effectiveAnnual' | 'nominalDue'

interface FormState {
  principal: string
  rateValuePct: string
  rateType: RateType
  termMonths: string
  bankMonthlyPayment: string
  bankPaymentIncludesInsurance: string
  hasFixedInsurance: boolean
  monthlyInsurance: string
  hasVariableInsurance: boolean
  monthlyLifeInsuranceRatePct: string
  wantsPeriodicExtraPayments: boolean
  periodicExtraAmount: string
  periodicExtraEveryMonths: string
  periodicExtraOccurrences: string
  wantsExtraordinaryExtraPayments: boolean
  extraordinaryRows: ExtraPaymentRowDraft[]
}

const initialState: FormState = {
  principal: '',
  rateValuePct: '',
  rateType: 'effectiveAnnual',
  termMonths: '',
  bankMonthlyPayment: '',
  bankPaymentIncludesInsurance: 'false',
  hasFixedInsurance: false,
  monthlyInsurance: '',
  hasVariableInsurance: false,
  monthlyLifeInsuranceRatePct: '',
  wantsPeriodicExtraPayments: false,
  periodicExtraAmount: '',
  periodicExtraEveryMonths: '',
  periodicExtraOccurrences: '',
  wantsExtraordinaryExtraPayments: false,
  extraordinaryRows: [],
}

export function LoanForm({ onCalculate }: LoanFormProps) {
  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)

  const showInsuranceCard = form.bankPaymentIncludesInsurance === 'true'
  const insuranceBadge = '2'
  const extraPaymentsBadge = showInsuranceCard ? '3' : '2'

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = (event) => {
    event.preventDefault()

    const principal = parseMoneyInputValue(form.principal)
    const rateInputPct = Number(form.rateValuePct)
    const termMonths = Number(form.termMonths)
    const bankMonthlyPayment = parseOptionalMoneyInputValue(form.bankMonthlyPayment)
    const annualEffectiveRate = toEffectiveAnnualRate(form.rateType, rateInputPct)

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
      setError('Todos los campos numericos deben ser validos.')
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
      setError('Si ingresas la cuota banco, debe ser mayor que cero.')
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

    let constantExtraPayment: LoanInput['constantExtraPayment']
    if (form.wantsPeriodicExtraPayments) {
      const amount = parseMoneyInputValue(form.periodicExtraAmount)
      const everyNMonths = Number(form.periodicExtraEveryMonths)
      const occurrences = form.periodicExtraOccurrences.trim() === '' ? undefined : Number(form.periodicExtraOccurrences)

      if (!Number.isFinite(amount) || !Number.isFinite(everyNMonths)) {
        setError('Completa monto y frecuencia de abono periodico.')
        return
      }
      if (amount <= 0 || !Number.isInteger(everyNMonths) || everyNMonths <= 0) {
        setError('El abono periodico debe tener monto > 0 y frecuencia entera > 0.')
        return
      }
      if (occurrences !== undefined && (!Number.isInteger(occurrences) || occurrences <= 0)) {
        setError('Las ocurrencias deben ser un entero mayor que 0.')
        return
      }

      constantExtraPayment = { amount, everyNMonths, occurrences }
    }

    const extraordinaryExtraPayments = form.wantsExtraordinaryExtraPayments
      ? form.extraordinaryRows
          .map((row) => ({
            month: Number(row.month),
            amount: parseMoneyInputValue(row.amount),
          }))
          .filter(
            (item) =>
              Number.isFinite(item.month) &&
              Number.isFinite(item.amount) &&
              item.month >= 1 &&
              item.month <= termMonths &&
              item.amount > 0,
          )
      : []

    setError(null)
    trackCalculoRealizado()

    onCalculate({
      principal,
      annualEffectiveRate,
      termMonths,
      bankMonthlyPayment,
      monthlyInsurance,
      monthlyLifeInsuranceRate: monthlyLifeInsuranceRatePct / 100,
      bankPaymentIncludesInsurance: insuranceEnabled,
      constantExtraPayment,
      extraordinaryExtraPayments,
    })
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <SectionCard
        badge="1"
        title="Informacion esencial"
        description="Ingresa los datos actuales de tu credito hipotecario."
      >
        <div className="form-grid">
          <div className="field">
            <LabelWithTooltip
              htmlFor="principal"
              label="Saldo pendiente del credito"
              tooltip="Capital pendiente por pagar al banco en este momento."
            />
            <MoneyInput
              id="principal"
              value={form.principal}
              onChange={(value) => updateField('principal', value)}
            />
          </div>

          <div className="field">
            <FieldLegend
              label="Tipo de tasa"
              tooltip="Escoge si vas a digitar tasa nominal vencida anual o tasa efectiva anual."
            />
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
                Tasa interes efectivo anual
              </label>
            </div>
          </div>

          <div className="field">
            <LabelWithTooltip
              htmlFor="rateValuePct"
              label="Valor de la tasa (%)"
              tooltip="Porcentaje anual de interes segun el tipo de tasa seleccionado."
            />
            <input
              id="rateValuePct"
              type="number"
              min={0}
              step="any"
              value={form.rateValuePct}
              onChange={(event) => updateField('rateValuePct', event.target.value)}
            />
          </div>

          <div className="field">
            <LabelWithTooltip
              htmlFor="termMonths"
              label="Plazo restante (meses)"
              tooltip="Cantidad de cuotas que faltan para terminar el credito."
            />
            <input
              id="termMonths"
              type="number"
              min={1}
              step={1}
              value={form.termMonths}
              onChange={(event) => updateField('termMonths', event.target.value)}
            />
          </div>

          <div className="field align-control-row">
            <LabelWithTooltip
              htmlFor="bankMonthlyPayment"
              label="Cuota mensual actual del banco (opcional)"
              tooltip="Si la conoces, la usamos para comparar contra la cuota teorica."
            />
            <MoneyInput
              id="bankMonthlyPayment"
              value={form.bankMonthlyPayment}
              onChange={(value) => updateField('bankMonthlyPayment', value)}
            />
          </div>

          <div className="field align-control-row">
            <LabelWithTooltip
              htmlFor="bankPaymentIncludesInsurance"
              label="La cuota banco incluye seguros"
              tooltip="Si eliges Si, se habilita la tarjeta para registrar seguros."
            />
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
      </SectionCard>

      {showInsuranceCard ? (
        <InsuranceCard
          badge={insuranceBadge}
          idPrefix="loan"
          description="Configura los seguros asociados a tu credito."
          allowVariable
          state={{
            hasFixedInsurance: form.hasFixedInsurance,
            monthlyInsurance: form.monthlyInsurance,
            hasVariableInsurance: form.hasVariableInsurance,
            monthlyLifeInsuranceRatePct: form.monthlyLifeInsuranceRatePct,
          }}
          onChange={(next) =>
            setForm((prev) => ({
              ...prev,
              hasFixedInsurance: next.hasFixedInsurance,
              monthlyInsurance: next.monthlyInsurance,
              hasVariableInsurance: next.hasVariableInsurance,
              monthlyLifeInsuranceRatePct: next.monthlyLifeInsuranceRatePct,
            }))
          }
        />
      ) : null}

      <ExtraPaymentsCard
        badge={extraPaymentsBadge}
        description="Define tu estrategia de abonos periodicos y/o extraordinarios."
        termMonths={Number(form.termMonths)}
        state={{
          wantsPeriodicExtraPayments: form.wantsPeriodicExtraPayments,
          periodicExtraAmount: form.periodicExtraAmount,
          periodicExtraEveryMonths: form.periodicExtraEveryMonths,
          periodicExtraOccurrences: form.periodicExtraOccurrences,
          wantsExtraordinaryExtraPayments: form.wantsExtraordinaryExtraPayments,
          extraordinaryRows: form.extraordinaryRows,
        }}
        onChange={(next) =>
          setForm((prev) => ({
            ...prev,
            wantsPeriodicExtraPayments: next.wantsPeriodicExtraPayments,
            periodicExtraAmount: next.periodicExtraAmount,
            periodicExtraEveryMonths: next.periodicExtraEveryMonths,
            periodicExtraOccurrences: next.periodicExtraOccurrences,
            wantsExtraordinaryExtraPayments: next.wantsExtraordinaryExtraPayments,
            extraordinaryRows: next.extraordinaryRows,
          }))
        }
      />

      {error ? <div className="field-error">{error}</div> : null}

      <div className="submit-wrap">
        <button type="submit" className="btn-primary btn-wide">
          Calcular plan de pagos
        </button>
      </div>
    </form>
  )
}

interface SectionCardProps {
  badge: string
  title: string
  description: string
  children: ReactNode
}

function SectionCard({ badge, title, description, children }: SectionCardProps) {
  return (
    <section className="form-card">
      <header className="form-card-header">
        <span className="form-card-badge" aria-hidden>
          {badge}
        </span>
        <div>
          <h3 className="section-title">{title}</h3>
          <p className="section-description">{description}</p>
        </div>
      </header>
      <div className="form-card-content">{children}</div>
    </section>
  )
}

interface LabelWithTooltipProps {
  htmlFor: string
  label: string
  tooltip: string
}

function LabelWithTooltip({ htmlFor, label, tooltip }: LabelWithTooltipProps) {
  return (
    <label className="label-with-tooltip" htmlFor={htmlFor}>
      <span>{label}</span>
      <TooltipInfo text={tooltip} />
    </label>
  )
}

interface FieldLegendProps {
  label: string
  tooltip: string
}

function FieldLegend({ label, tooltip }: FieldLegendProps) {
  return (
    <div className="label-with-tooltip field-label">
      <span>{label}</span>
      <TooltipInfo text={tooltip} />
    </div>
  )
}

interface TooltipInfoProps {
  text: string
}

function TooltipInfo({ text }: TooltipInfoProps) {
  const [open, setOpen] = useState(false)

  return (
    <span className={`tooltip-wrap${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="tooltip-trigger"
        aria-label={text}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      <span className="tooltip-content" role="tooltip">
        {text}
      </span>
    </span>
  )
}

function toEffectiveAnnualRate(rateType: RateType, ratePct: number): number {
  const rateDecimal = ratePct / 100

  if (rateType === 'effectiveAnnual') {
    return rateDecimal
  }

  const monthlyNominalDue = rateDecimal / 12
  return Math.pow(1 + monthlyNominalDue, 12) - 1
}

