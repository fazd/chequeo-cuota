import { useMemo, useState, lazy, Suspense } from 'react'
import { buildLoanSummary } from '../../application/loanSummary'
import { calculateProjection } from '../../application/calculateProjection'
import type { LoanInput, LoanProjection } from '../../domain/loan.types'
import { formatCop } from '../../utils/currency'
import { AmortizationTable } from '../components/AmortizationTable'
import { ExportCSVButton } from '../components/ExportCSVButton'
import { LoanForm } from '../components/LoanForm'
import { SummaryCards } from '../components/SummaryCards'
import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'

const Charts = lazy(() => import('../components/Charts').then((m) => ({ default: m.Charts })))

export function MortgageAmortizationPage() {
  const [projection, setProjection] = useState<LoanProjection | null>(null)

  function handleCalculate(input: LoanInput) {
    setProjection(calculateProjection(input))
  }

  const summary = useMemo(
    () => (projection ? buildLoanSummary(projection) : null),
    [projection],
  )

  const showSavingsSummary =
    !!projection &&
    (projection.monthsReduced > 0 || projection.interestSavingsFromPrepayments > 0)

  return (
    <>
      <SeoHead meta={seoMetaByPath.mortgageAmortization} />
      <section className="app-shell app-surface">
        <div className="hero hero-landing">
          <div className="hero-icon" aria-hidden>
            A
          </div>
          <h1 className="title">Amortizacion credito vivienda</h1>
        </div>

        <p className="subtitle">
          Calcula tu tabla de amortizacion, valida cuota teorica y analiza impacto de aportes extra.
        </p>

        <section className="landing-block">
          <LoanForm onCalculate={handleCalculate} />
        </section>

        {projection && summary ? (
          <>
            <SummaryCards projection={projection} summary={summary} />
            {showSavingsSummary ? (
              <p className="savings-summary">
                Gracias a los aportes adicionales, ahorras{' '}
                {formatCop(summary.interestSavingsFromPrepayments)} en intereses y
                reduces el plazo en {formatMonths(summary.monthsReduced)}.
              </p>
            ) : null}

            <Suspense fallback={<div className="panel section">Cargando graficas...</div>}>
              <Charts
                schedule={projection.schedule}
                baselineSchedule={projection.baselineSchedule}
              />
            </Suspense>
            <AmortizationTable rows={projection.schedule} />
            <ExportCSVButton schedule={projection.schedule} />
          </>
        ) : null}
      </section>
    </>
  )
}

function formatMonths(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${months} meses`
  }

  return `${years} anos y ${remainingMonths} meses`
}
