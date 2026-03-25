import type { CreditCardProjection } from '../../../domain/tc/loan.types'
import { formatCopWhole, formatPercent } from '../../../utils/currency'

interface CreditCardSummaryCardsProps {
  projection: CreditCardProjection
}

const EPSILON = 0.000001

export function CreditCardSummaryCards({ projection }: CreditCardSummaryCardsProps) {
  const firstRow = projection.schedule[0]
  const latestRow = projection.schedule[projection.schedule.length - 1]
  const rowWithLimitData = projection.schedule.find(
    (row) => row.usedLimitAmount != null && row.releasedLimitAmount != null,
  )
  const inferredCreditLimit = rowWithLimitData
    ? (rowWithLimitData.usedLimitAmount ?? 0) + (rowWithLimitData.releasedLimitAmount ?? 0)
    : null
  const hasLimitMetrics =
    firstRow != null &&
    latestRow != null &&
    inferredCreditLimit != null &&
    inferredCreditLimit > EPSILON

  const usedLimitAmount = hasLimitMetrics ? Math.max(0, firstRow.beginningDebt) : 0
  const releasedLimitAmount = hasLimitMetrics
    ? Math.max(0, firstRow.beginningDebt - latestRow.endingDebt)
    : 0
  const usedLimitPct =
    hasLimitMetrics && inferredCreditLimit
      ? (usedLimitAmount / inferredCreditLimit) * 100
      : 0

  const hasHandlingFeeTotals = Math.abs(projection.totalHandlingFee) > EPSILON
  const hasInsuranceTotals = Math.abs(projection.totalInsurance) > EPSILON
  const hasExtraPaid = Math.abs(projection.totalExtraPaid) > EPSILON
  const hasInterestSavings = Math.abs(projection.interestSavingsFromPrepayments) > EPSILON
  const hasMonthsReduced = projection.monthsReduced > 0
  const hasUsedLimitMetric = hasLimitMetrics && Math.abs(usedLimitAmount) > EPSILON
  const hasReleasedLimitMetric = hasLimitMetrics && Math.abs(releasedLimitAmount) > EPSILON
  const totalPaid = projection.totalPaid
  const principalPaid = projection.schedule.reduce((sum, row) => sum + row.principalDelta, 0)
  const interestPct = totalPaid > EPSILON ? (projection.totalInterest / totalPaid) * 100 : 0
  const principalPct = totalPaid > EPSILON ? (principalPaid / totalPaid) * 100 : 0
  const handlingFeePct =
    totalPaid > EPSILON ? (projection.totalHandlingFee / totalPaid) * 100 : 0
  const insurancePct = totalPaid > EPSILON ? (projection.totalInsurance / totalPaid) * 100 : 0

  return (
    <section className="panel section">
      <div className="cards-grid">
        <Metric
          label={
            projection.minimumPaymentComparison.comparisonAvailable
              ? 'Cuota minima teorica'
              : 'Cuota minima a pagar (teorica)'
          }
          value={formatCopWhole(projection.minimumPaymentComparison.theoreticalMinimumPayment)}
        />
        {projection.minimumPaymentComparison.comparisonAvailable ? (
          <Metric
            label="Cuota minima reportada"
            value={formatCopWhole(
              projection.minimumPaymentComparison.reportedMinimumPayment ?? 0,
            )}
          />
        ) : null}
        {projection.minimumPaymentComparison.comparisonAvailable ? (
          <Metric
            label="Diferencia cuota minima"
            value={`${formatCopWhole(projection.minimumPaymentComparison.difference)} (${formatPercent(
              projection.minimumPaymentComparison.differencePct,
            )})`}
          />
        ) : null}
        <Metric label="Intereses totales" value={formatCopWhole(projection.totalInterest)} />
        {hasHandlingFeeTotals ? (
          <Metric label="Cuota manejo total" value={formatCopWhole(projection.totalHandlingFee)} />
        ) : null}
        {hasInsuranceTotals ? (
          <Metric label="Seguros totales" value={formatCopWhole(projection.totalInsurance)} />
        ) : null}
        <Metric label="Pago minimo acumulado" value={formatCopWhole(projection.totalMinimumPaid)} />
        {hasExtraPaid ? (
          <Metric label="Aportes acumulados" value={formatCopWhole(projection.totalExtraPaid)} />
        ) : null}
        <Metric label="Total pagado" value={formatCopWhole(projection.totalPaid)} />
        <Metric
          label="Meses para cancelar"
          value={
            projection.monthsToPayoff == null
              ? 'No cancela en horizonte'
              : `${projection.monthsToPayoff} meses`
          }
        />
        {hasInterestSavings ? (
          <Metric
            label="Ahorro intereses (vs baseline)"
            value={formatCopWhole(projection.interestSavingsFromPrepayments)}
          />
        ) : null}
        {hasMonthsReduced ? (
          <Metric label="Reduccion de plazo" value={`${projection.monthsReduced} meses`} />
        ) : null}
        {hasUsedLimitMetric ? (
          <Metric
            label="Cupo usado"
            value={`${formatCopWhole(usedLimitAmount)} (${formatPercent(usedLimitPct)})`}
          />
        ) : null}
        {hasReleasedLimitMetric ? (
          <Metric label="Cupo liberado" value={formatCopWhole(releasedLimitAmount)} />
        ) : null}
        <Metric label="% intereses" value={formatPercent(interestPct)} />
        <Metric label="% deuda total" value={formatPercent(principalPct)} />
        {hasHandlingFeeTotals ? (
          <Metric label="% cuota manejo" value={formatPercent(handlingFeePct)} />
        ) : null}
        {hasInsuranceTotals ? <Metric label="% seguros" value={formatPercent(insurancePct)} /> : null}
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
