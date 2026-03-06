import { formatCop, formatPercent } from '../../utils/currency'

interface StandardProjection {
  theoreticalInstallmentExInsurance: number
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
}

export function StandardSummaryCards({ projection, summary }: StandardSummaryCardsProps) {
  return (
    <section className="panel section">
      <div className="cards-grid">
        <Metric
          label="Cuota teorica"
          value={formatCop(projection.theoreticalInstallmentExInsurance)}
        />
        {projection.bankComparisonAvailable ? (
          <Metric
            label="Cuota banco"
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
        <Metric
          label="Ahorro de intereses"
          value={formatCop(summary.interestSavingsFromPrepayments)}
        />
        <Metric label="Reduccion de plazo" value={formatMonths(summary.monthsReduced)} />
      </div>
    </section>
  )
}

function formatMonths(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${months} meses`
  }

  return `${years} anios y ${remainingMonths} meses`
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
