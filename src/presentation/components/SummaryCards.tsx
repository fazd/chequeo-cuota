import { useState } from 'react'
import type { LoanSummary } from '../../application/loanSummary'
import type { LoanProjection } from '../../domain/loan.types'
import { formatCop, formatPercent } from '../../utils/currency'

interface SummaryCardsProps {
  projection: LoanProjection
  summary: LoanSummary
}

interface MetricItem {
  label: string
  rawValue: number
  value: string
  description: string
  requiresBankComparison?: boolean
}

export function SummaryCards({ projection, summary }: SummaryCardsProps) {
  const metrics: MetricItem[] = [
    {
      label: 'Cuota teorica sin seguro',
      rawValue: projection.theoreticalInstallmentExInsurance,
      value: formatCop(projection.theoreticalInstallmentExInsurance),
      description:
        'Pago mensual estimado del credito incluyendo solo interes y capital, sin seguros.',
    },
    {
      label: 'Cuota teorica con seguro',
      rawValue: projection.theoreticalInstallmentInclInsurance,
      value: formatCop(projection.theoreticalInstallmentInclInsurance),
      description:
        'Pago mensual estimado sumando interes, capital y seguros configurados en la simulacion.',
    },
    {
      label: 'Cuota banco normalizada',
      rawValue: projection.bankInstallmentNormalized,
      value: formatCop(projection.bankInstallmentNormalized),
      description:
        'Cuota reportada del banco ajustada al mismo criterio de calculo para compararla con la teorica.',
      requiresBankComparison: true,
    },
    {
      label: 'Diferencia',
      rawValue: projection.installmentDifference,
      value: `${formatCop(projection.installmentDifference)} (${formatPercent(
        projection.installmentDifferencePct,
      )})`,
      description:
        'Brecha entre la cuota teorica y la cuota del banco, expresada en valor absoluto y porcentaje.',
      requiresBankComparison: true,
    },
    {
      label: 'Total intereses',
      rawValue: summary.totalInterest,
      value: formatCop(summary.totalInterest),
      description: 'Suma total pagada por intereses durante todo el plazo proyectado.',
    },
    {
      label: 'Total capital',
      rawValue: summary.totalPrincipal,
      value: formatCop(summary.totalPrincipal),
      description: 'Suma total abonada al capital de la deuda durante la proyeccion.',
    },
    {
      label: 'Total seguros',
      rawValue: summary.totalInsurance,
      value: formatCop(summary.totalInsurance),
      description: 'Valor acumulado de seguros pagados en toda la vida proyectada del credito.',
    },
    {
      label: 'Total pagado',
      rawValue: summary.totalPaid,
      value: formatCop(summary.totalPaid),
      description:
        'Suma global pagada en la proyeccion: capital + intereses + seguros.',
    },
    {
      label: 'Ahorro de intereses (abonos)',
      rawValue: summary.interestSavingsFromPrepayments,
      value: formatCop(summary.interestSavingsFromPrepayments),
      description:
        'Intereses que dejas de pagar gracias a los aportes adicionales frente al escenario base.',
    },
    {
      label: 'Reduccion de plazo',
      rawValue: summary.monthsReduced,
      value: formatMonths(summary.monthsReduced),
      description:
        'Cantidad de meses que se recorta el credito por los abonos adicionales.',
    },
    {
      label: '% interes',
      rawValue: summary.interestPct,
      value: formatPercent(summary.interestPct),
      description: 'Porcentaje del total pagado que corresponde a intereses.',
    },
    {
      label: '% capital',
      rawValue: summary.principalPct,
      value: formatPercent(summary.principalPct),
      description: 'Porcentaje del total pagado que corresponde a abono de capital.',
    },
    {
      label: '% seguros',
      rawValue: summary.insurancePct,
      value: formatPercent(summary.insurancePct),
      description: 'Porcentaje del total pagado que corresponde a seguros.',
    },
  ].filter((metric) => {
    if (metric.requiresBankComparison && !projection.bankComparisonAvailable) {
      return false
    }

    return !isZero(metric.rawValue)
  })

  return (
    <section className="panel section">
      <div className="cards-grid">
        {metrics.map((metric) => (
          <Metric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            description={metric.description}
          />
        ))}
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
  return `${years} años ${remainingMonths} meses`
}

function isZero(value: number): boolean {
  return Math.abs(value) < 0.000001
}

interface MetricProps {
  label: string
  value: string
  description: string
}

function Metric({ label, value, description }: MetricProps) {
  const [open, setOpen] = useState(false)

  return (
    <article className="card">
      <div className="card-head">
        <h4>{label}</h4>
        <span className={`tooltip-wrap${open ? ' is-open' : ''}`}>
          <button
            type="button"
            className="tooltip-trigger"
            aria-label={description}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            onBlur={() => setOpen(false)}
          >
            i
          </button>
          <span className="tooltip-content" role="tooltip">
            {description}
          </span>
        </span>
      </div>
      <p>{value}</p>
    </article>
  )
}
