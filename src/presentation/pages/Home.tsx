import { useMemo, useState } from 'react'
import { buildLoanSummary } from '../../application/loanSummary'
import { calculateProjection } from '../../application/calculateProjection'
import type { LoanInput, LoanProjection } from '../../domain/loan.types'
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

  return (
    <main className="app-shell">
      <h1 className="title">Chequeo de Cuota Hipotecaria</h1>
      <p className="subtitle">
        Verifica si tu cuota bajo sistema frances coincide con la proyeccion
        teorica.
      </p>

      <LoanForm onCalculate={handleCalculate} />

      {projection && summary ? (
        <>
          <SummaryCards projection={projection} summary={summary} />
          <Charts schedule={projection.schedule} />
          <AmortizationTable rows={projection.schedule} />
          <ExcelCheckPanel schedule={projection.schedule} />
          <ExportCSVButton schedule={projection.schedule} />
        </>
      ) : null}
    </main>
  )
}
