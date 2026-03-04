import type { LoanSummary } from '../../application/loanSummary'
import type { LoanProjection } from '../../domain/loan.types'
import { formatCop, formatPercent } from '../../utils/currency'

interface SummaryCardsProps {
  projection: LoanProjection
  summary: LoanSummary
}

export function SummaryCards({ projection, summary }: SummaryCardsProps) {
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
        <Metric
          label="Cuota banco normalizada"
          value={formatCop(projection.bankInstallmentNormalized)}
        />
        <Metric
          label="Diferencia"
          value={`${formatCop(projection.installmentDifference)} (${formatPercent(
            projection.installmentDifferencePct,
          )})`}
        />
        <Metric label="Total intereses" value={formatCop(summary.totalInterest)} />
        <Metric label="Total capital" value={formatCop(summary.totalPrincipal)} />
        <Metric label="Total seguros" value={formatCop(summary.totalInsurance)} />
        <Metric label="Total pagado" value={formatCop(summary.totalPaid)} />
        <Metric
          label="Ahorro de intereses (abonos)"
          value={formatCop(summary.interestSavingsFromPrepayments)}
        />
        <Metric
          label="Reduccion de plazo"
          value={formatMonths(summary.monthsReduced)}
        />
        <Metric label="% interes" value={formatPercent(summary.interestPct)} />
        <Metric label="% capital" value={formatPercent(summary.principalPct)} />
        <Metric label="% seguros" value={formatPercent(summary.insurancePct)} />
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
  return `${years} anos ${remainingMonths} meses`
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
