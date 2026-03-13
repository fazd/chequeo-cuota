import { formatCop, formatPercent } from '../../utils/currency'

interface StandardProjection {
  theoreticalInstallmentExInsurance: number
  theoreticalInstallmentInclInsurance: number
  bankComparisonAvailable: boolean
  bankInstallmentNormalized: number
  installmentDifference: number
  installmentDifferencePct: number
}

interface StandardSummaryCardsProps {
  projection: StandardProjection
  summary: StandardSummary
}

interface StandardSummary {
  totalInterest: number
  totalPrincipal: number
  totalPaid: number
  monthsReduced: number
  interestSavingsFromPrepayments: number
  alertDifferenceAbove1Pct: boolean
  interestPct: number
  principalPct: number
  insurancePct: number
}

export function StandardSummaryCards({ projection, summary }: StandardSummaryCardsProps) {
  return (
    <section className="panel section">
      <div className="cards-grid">
        <Metric
          label="Cuota teorica sin seguro"
          value={formatCop(projection.theoreticalInstallmentExInsurance)}
        />
        <Metric
          label="Cuota teorica con seguro"
          value={formatCop(projection.theoreticalInstallmentInclInsurance)}
        />
        {projection.bankComparisonAvailable ? (
          <Metric
            label="Cuota banco sin seguro"
            value={formatCop(projection.bankInstallmentNormalized)}
          />
        ) : null}
        {projection.bankComparisonAvailable ? (
          <Metric
            label="Diferencia"
            value={`${formatCop(projection.installmentDifference)} (${formatPercent(
              projection.installmentDifferencePct,
            )})`}
          />
        ) : null}
        <Metric label="Total intereses" value={formatCop(summary.totalInterest)} />
        <Metric label="Total capital" value={formatCop(summary.totalPrincipal)} />
        <Metric label="Total pagado" value={formatCop(summary.totalPaid)} />
        <Metric label="% intereses" value={formatPercent(summary.interestPct)} />
        <Metric label="% capital" value={formatPercent(summary.principalPct)} />
        {summary.insurancePct > 0 ? (
          <Metric label="% seguros" value={formatPercent(summary.insurancePct)} />
        ) : null}
        {summary.interestSavingsFromPrepayments > 0 ? (
          <Metric
            label="Ahorro de intereses"
            value={formatCop(summary.interestSavingsFromPrepayments)}
          />
        ) : null}
        {summary.monthsReduced > 0 ? (
          <Metric label="Reduccion de plazo" value={formatMonths(summary.monthsReduced)} />
        ) : null}
      </div>

      {summary.alertDifferenceAbove1Pct ? (
        <div className="alert">
          Alerta: la diferencia entre la cuota teorica y la cuota del banco supera
          el 1%.
        </div>
      ) : null}
    </section>
  )
}

function formatMonths(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${months} meses`
  }

  return `${years} años y ${remainingMonths} meses`
}

interface MetricProps {
  label: string
  value: string
}

function Metric({ label, value }: MetricProps) {
  return (
    <article className="card">
      <h4>{label}</h4>
      <p>{value}</p>
    </article>
  )
}
