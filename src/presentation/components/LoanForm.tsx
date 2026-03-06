import type { ComponentProps, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import type { ExtraPayment, LoanInput } from '../../domain/loan.types'
import { trackCalculoRealizado } from '../../application/analytics/events'
interface LoanFormProps {
  onCalculate: (input: LoanInput) => void
}

interface ExtraordinaryRow {
  month: string
  amount: string
}

type RateType = 'effectiveAnnual' | 'nominalDue'
type ExtraPaymentGoal = 'reduceTerm' | 'reduceInstallment'
type ExtraPaymentMode = 'periodic' | 'extraordinary'

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
  wantsExtraPayments: boolean
  extraPaymentGoal: ExtraPaymentGoal
  extraPaymentMode: ExtraPaymentMode
  periodicExtraAmount: string
  periodicExtraEveryMonths: string
  periodicExtraOccurrences: string
  extraordinaryRows: ExtraordinaryRow[]
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
  wantsExtraPayments: false,
  extraPaymentGoal: 'reduceTerm',
  extraPaymentMode: 'periodic',
  periodicExtraAmount: '',
  periodicExtraEveryMonths: '',
  periodicExtraOccurrences: '',
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
  const showInsuranceCard = form.bankPaymentIncludesInsurance === 'true'
  const insuranceBadge = '2'
  const extraPaymentsBadge = showInsuranceCard ? '3' : '2'

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

    const extraPaymentsParsed = parseExtraPayments(form, termMonths)
    if (extraPaymentsParsed.error) {
      setError(extraPaymentsParsed.error)
      return
    }

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
      extraordinaryExtraPayments: extraPaymentsParsed.payments,
    })
  }

  const activeExtraRows = useMemo(
    () =>
      form.extraordinaryRows.map((row, index) => (
        <div key={index} className="extra-row">
          <div className="field">
            <LabelWithTooltip
              htmlFor={`extraMonth-${index}`}
              label="Mes del abono"
              tooltip="Numero de mes futuro en el que haras el aporte."
            />
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
            <LabelWithTooltip
              htmlFor={`extraAmount-${index}`}
              label="Valor del abono"
              tooltip="Monto adicional que pagas en ese mes."
            />
            <MoneyInput
              id={`extraAmount-${index}`}
              value={row.amount}
              onChange={(value) => updateExtraordinaryRow(index, 'amount', value)}
            />
          </div>
          <button
            type="button"
            className="btn-danger"
            onClick={() => removeExtraordinaryRow(index)}
            aria-label={`Eliminar abono ${index + 1}`}
          >
            Eliminar
          </button>
        </div>
      )),
    [form.extraordinaryRows],
  )

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
        <SectionCard
          badge={insuranceBadge}
          title="Seguros"
          description="Configura los seguros asociados a tu credito."
        >
          <div className="choice-group choice-group-inline">
            <div className="choice-with-tip">
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
              <TooltipInfo text="Seguro con valor mensual constante." />
            </div>
            <div className="choice-with-tip">
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
              <TooltipInfo text="Seguro calculado como porcentaje sobre saldo." />
            </div>
          </div>

          <div className="inline-grid-2">
            {form.hasFixedInsurance ? (
              <div className="field">
                <LabelWithTooltip
                  htmlFor="monthlyInsurance"
                  label="Valor del seguro fijo"
                  tooltip="Monto mensual fijo del seguro asociado al credito."
                />
                <MoneyInput
                  id="monthlyInsurance"
                  value={form.monthlyInsurance}
                  onChange={(value) => updateField('monthlyInsurance', value)}
                />
              </div>
            ) : null}

            {form.hasVariableInsurance ? (
              <div className="field">
                <LabelWithTooltip
                  htmlFor="monthlyLifeInsuranceRatePct"
                  label="Interes del seguro variable (%)"
                  tooltip="Porcentaje mensual aplicado sobre el saldo pendiente."
                />
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
        </SectionCard>
      ) : null}

      <SectionCard
        badge={extraPaymentsBadge}
        title="Aportes adicionales"
        description="Define tu estrategia de abonos periodicos o extraordinarios."
      >
        <div className="choice-with-tip">
          <label className="choice-item" htmlFor="wantsExtraPayments">
            <input
              id="wantsExtraPayments"
              type="checkbox"
              checked={form.wantsExtraPayments}
              onChange={(event) =>
                updateField('wantsExtraPayments', event.target.checked)
              }
            />
            Quiero hacer abonos extraordinarios
          </label>
          <TooltipInfo text="Activa para proyectar pagos adicionales al credito." />
        </div>

        {form.wantsExtraPayments ? (
          <>
            <p className="helper-text">
              Tipos: abono para reducir cuota o abono para reducir tiempo.
            </p>

            <div className="choice-group choice-group-inline">
              <label className="choice-item">
                <input
                  type="radio"
                  name="extraPaymentGoal"
                  value="reduceInstallment"
                  checked={form.extraPaymentGoal === 'reduceInstallment'}
                  onChange={(event) =>
                    updateField(
                      'extraPaymentGoal',
                      event.target.value as ExtraPaymentGoal,
                    )
                  }
                />
                Reducir cuota
                <TooltipInfo text="Objetivo de bajar el valor mensual a pagar." />
              </label>
              <label className="choice-item">
                <input
                  type="radio"
                  name="extraPaymentGoal"
                  value="reduceTerm"
                  checked={form.extraPaymentGoal === 'reduceTerm'}
                  onChange={(event) =>
                    updateField('extraPaymentGoal', event.target.value as ExtraPaymentGoal)
                  }
                />
                Reducir tiempo
                <TooltipInfo text="Objetivo de terminar el credito en menos meses." />
              </label>
            </div>

            {form.extraPaymentGoal === 'reduceInstallment' ? (
              <p className="helper-text helper-note">
                Nota: el calculo actual aplica los abonos reduciendo tiempo.
              </p>
            ) : null}

            <div className="field">
              <FieldLegend
                label="Tipo de registro"
                tooltip="Elige si los aportes se repiten con una frecuencia o si los defines por mes."
              />
              <div className="choice-group choice-group-inline">
                <label className="choice-item">
                  <input
                    type="radio"
                    name="extraPaymentMode"
                    value="periodic"
                    checked={form.extraPaymentMode === 'periodic'}
                    onChange={(event) =>
                      updateField('extraPaymentMode', event.target.value as ExtraPaymentMode)
                    }
                  />
                  Abono periodico
                </label>
                <label className="choice-item">
                  <input
                    type="radio"
                    name="extraPaymentMode"
                    value="extraordinary"
                    checked={form.extraPaymentMode === 'extraordinary'}
                    onChange={(event) =>
                      updateField('extraPaymentMode', event.target.value as ExtraPaymentMode)
                    }
                  />
                  Abono extraordinario
                </label>
              </div>
            </div>

            {form.extraPaymentMode === 'periodic' ? (
              <div className="form-grid form-grid-three">
                <div className="field">
                  <LabelWithTooltip
                    htmlFor="periodicExtraAmount"
                    label="Monto de abono"
                    tooltip="Valor adicional que se pagara en cada aporte periodico."
                  />
                  <MoneyInput
                    id="periodicExtraAmount"
                    value={form.periodicExtraAmount}
                    onChange={(value) => updateField('periodicExtraAmount', value)}
                  />
                </div>
                <div className="field">
                  <LabelWithTooltip
                    htmlFor="periodicExtraEveryMonths"
                    label="Cada cuantos meses"
                    tooltip="Frecuencia de los aportes: 1 mensual, 3 trimestral, etc."
                  />
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
                <div className="field">
                  <LabelWithTooltip
                    htmlFor="periodicExtraOccurrences"
                    label="Cuantas veces"
                    tooltip="Numero total de aportes periodicos que haras."
                  />
                  <input
                    id="periodicExtraOccurrences"
                    type="number"
                    min={1}
                    step={1}
                    value={form.periodicExtraOccurrences}
                    onChange={(event) =>
                      updateField('periodicExtraOccurrences', event.target.value)
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="section section-tight">
                <div className="mini-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={addExtraordinaryRow}
                    disabled={!canAddExtraordinary}
                  >
                    Agregar aporte
                  </button>
                </div>
                <div className="section section-tight">{activeExtraRows}</div>
              </div>
            )}
          </>
        ) : null}
      </SectionCard>

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
    const amount = parseMoneyInputValue(row.amount)

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

function parseExtraPayments(
  form: FormState,
  termMonths: number,
): { payments: ExtraPayment[]; error: string | null } {
  if (!form.wantsExtraPayments) {
    return { payments: [], error: null }
  }

  if (form.extraPaymentMode === 'periodic') {
    const amount = parseMoneyInputValue(form.periodicExtraAmount)
    const everyMonths = Number(form.periodicExtraEveryMonths)
    const occurrences = Number(form.periodicExtraOccurrences)

    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(everyMonths) ||
      !Number.isFinite(occurrences)
    ) {
      return {
        payments: [],
        error: 'Completa monto, periodicidad y cuantas veces del abono periodico.',
      }
    }

    if (amount <= 0) {
      return {
        payments: [],
        error: 'El monto del abono periodico debe ser mayor que cero.',
      }
    }
    if (!Number.isInteger(everyMonths) || everyMonths <= 0) {
      return {
        payments: [],
        error: 'La periodicidad del abono periodico debe ser un entero mayor que cero.',
      }
    }
    if (!Number.isInteger(occurrences) || occurrences <= 0) {
      return {
        payments: [],
        error: 'La cantidad de veces del abono periodico debe ser un entero mayor que cero.',
      }
    }

    const payments: ExtraPayment[] = []
    for (let index = 1; index <= occurrences; index += 1) {
      const month = index * everyMonths
      if (month > termMonths) {
        return {
          payments: [],
          error:
            'La configuracion del abono periodico excede el plazo restante. Ajusta periodicidad o cuantas veces.',
        }
      }

      payments.push({ month, amount })
    }

    return { payments, error: null }
  }

  return parseExtraordinaryRows(form.extraordinaryRows, termMonths)
}

function toEffectiveAnnualRate(rateType: RateType, ratePct: number): number {
  const rateDecimal = ratePct / 100

  if (rateType === 'effectiveAnnual') {
    return rateDecimal
  }

  const monthlyNominalDue = rateDecimal / 12
  return Math.pow(1 + monthlyNominalDue, 12) - 1
}






