import { useMemo, useState } from 'react'
import { buildLoanSummary } from '../../application/loanSummary'
import { calculateProjection } from '../../application/calculateProjection'
import type { LoanInput, LoanProjection } from '../../domain/loan.types'
import { formatCop } from '../../utils/currency'
import { AmortizationTable } from '../components/AmortizationTable'
import { Charts } from '../components/Charts'
import { ExcelCheckPanel } from '../components/ExcelCheckPanel'
import { ExportCSVButton } from '../components/ExportCSVButton'
import { LoanForm } from '../components/LoanForm'
import { SummaryCards } from '../components/SummaryCards'
import '../styles.css'

export function Home() {
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
    <main className="app-shell app-surface">
      <div className="hero">
        <div className="hero-icon" aria-hidden>
          C
        </div>
        <h1 className="title">Chequeo de Credito Hipotecario</h1>
      </div>
      <p className="subtitle">
        Analiza y optimiza tu prestamo. Verifica si tu cuota bajo sistema
        frances coincide con la proyeccion teorica.
      </p>

      <LoanForm onCalculate={handleCalculate} />

      {projection && summary ? (
        <>
          <SummaryCards projection={projection} summary={summary} />
          {showSavingsSummary ? (
            <p className="savings-summary">
              Gracias a los aportes adicionales, ahorras {formatCop(summary.interestSavingsFromPrepayments)}
              {' '}en intereses y reduces el plazo en {formatMonths(summary.monthsReduced)}.
            </p>
          ) : null}
          <Charts schedule={projection.schedule} baselineSchedule={projection.baselineSchedule} />
          <AmortizationTable rows={projection.schedule} />
          <ExcelCheckPanel schedule={projection.schedule} />
          <ExportCSVButton schedule={projection.schedule} />
        </>
      ) : null}
    </main>
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

