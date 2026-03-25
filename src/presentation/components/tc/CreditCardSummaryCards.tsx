import type { CreditCardProjection } from '../../../domain/tc/loan.types'
import { formatCop, formatPercent } from '../../../utils/currency'

interface CreditCardSummaryCardsProps {
  projection: CreditCardProjection
}

export function CreditCardSummaryCards({ projection }: CreditCardSummaryCardsProps) {
  const latestRow = projection.schedule[projection.schedule.length - 1]
  const usedLimitPct = latestRow?.usedLimitPct ?? 0
  const usedLimitAmount = latestRow?.usedLimitAmount ?? 0
  const releasedLimitAmount = latestRow?.releasedLimitAmount ?? 0
  const hasLimitMetrics = latestRow?.usedLimitPct != null
  const hasInsuranceTotals = Math.abs(projection.totalInsurance) > 0.000001

  return (
    <section className="panel section">
      <div className="cards-grid">
        <Metric
          label={
            projection.minimumPaymentComparison.comparisonAvailable
              ? 'Cuota minima teorica'
              : 'Cuota minima a pagar (teorica)'
          }
          value={formatCop(projection.minimumPaymentComparison.theoreticalMinimumPayment)}
        />
        {projection.minimumPaymentComparison.comparisonAvailable ? (
          <Metric
            label="Cuota minima reportada"
            value={formatCop(projection.minimumPaymentComparison.reportedMinimumPayment ?? 0)}
          />
        ) : null}
        {projection.minimumPaymentComparison.comparisonAvailable ? (
          <Metric
            label="Diferencia cuota minima"
            value={`${formatCop(projection.minimumPaymentComparison.difference)} (${formatPercent(
              projection.minimumPaymentComparison.differencePct,
            )})`}
          />
        ) : null}
        <Metric label="Intereses totales" value={formatCop(projection.totalInterest)} />
        <Metric label="Cuota manejo total" value={formatCop(projection.totalHandlingFee)} />
        {hasInsuranceTotals ? (
          <Metric label="Seguros totales" value={formatCop(projection.totalInsurance)} />
        ) : null}
        <Metric label="Pago minimo acumulado" value={formatCop(projection.totalMinimumPaid)} />
        <Metric label="Aportes acumulados" value={formatCop(projection.totalExtraPaid)} />
        <Metric label="Total pagado" value={formatCop(projection.totalPaid)} />
        <Metric
          label="Meses para cancelar"
          value={
            projection.monthsToPayoff == null
              ? 'No cancela en horizonte'
              : `${projection.monthsToPayoff} meses`
          }
        />
        <Metric
          label="Ahorro intereses (vs baseline)"
          value={formatCop(projection.interestSavingsFromPrepayments)}
        />
        <Metric
          label="Reduccion de plazo"
          value={`${projection.monthsReduced} meses`}
        />
        {hasLimitMetrics ? (
          <Metric label="Cupo usado" value={`${formatCop(usedLimitAmount)} (${formatPercent(usedLimitPct)})`} />
        ) : null}
        {hasLimitMetrics ? (
          <Metric label="Cupo liberado" value={formatCop(releasedLimitAmount)} />
        ) : null}
      </div>

      {projection.alerts.hasNegativeAmortization ? (
        <div className="alert">
          Alerta: el pago minimo no cubre cargos en uno o mas meses. La deuda puede crecer.
        </div>
      ) : null}

      {projection.alerts.noPayoffWithinHorizon ? (
        <div className="alert">
          Alerta: la tarjeta no se cancela en el horizonte de simulacion configurado.
        </div>
      ) : null}

      {projection.alerts.minimumPaymentDifferenceAbove1Pct ? (
        <div className="alert">
          Alerta: la diferencia entre cuota minima teorica y reportada supera el 1%.
        </div>
      ) : null}
    </section>
  )
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
