import { useMemo, useState, lazy, Suspense } from 'react'
import { buildPayrollLoanSummary } from '../../application/libranza/payrollLoanSummary'
import { calculatePayrollProjection } from '../../application/libranza/calculatePayrollProjection'
import type { PayrollLoanProjection } from '../../domain/libranza/loan.types'
import { CompactAmortizationTable } from '../components/CompactAmortizationTable'
import { ExportCSVButton } from '../components/ExportCSVButton'
import { StandardLoanForm, type StandardLoanFormInput } from '../components/StandardLoanForm'
import { StandardSummaryCards } from '../components/StandardSummaryCards'
import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'

const Charts = lazy(() => import('../components/Charts').then((m) => ({ default: m.Charts })))

export function PayrollLoanPage() {
  const [projection, setProjection] = useState<PayrollLoanProjection | null>(null)

  function handleCalculate(input: StandardLoanFormInput) {
    setProjection(
      calculatePayrollProjection({
        principal: input.principal,
        annualEffectiveRate: input.annualEffectiveRate,
        termMonths: input.termMonths,
        bankMonthlyPayment: input.bankMonthlyPayment,
        monthlyInsurance: input.monthlyInsurance,
        monthlyLifeInsuranceRate: input.monthlyLifeInsuranceRate,
        bankPaymentIncludesInsurance: input.bankPaymentIncludesInsurance,
        constantExtraPayment: input.constantExtraPayment,
      }),
    )
  }

  const summary = useMemo(
    () => (projection ? buildPayrollLoanSummary(projection) : null),
    [projection],
  )

  return (
    <>
      <SeoHead meta={seoMetaByPath.payrollLoan} />
      <section className="app-shell app-surface">
        <div className="hero hero-landing">
          <div className="hero-icon" aria-hidden>
            L
          </div>
          <h1 className="title">Amortizacion credito de libranza</h1>
        </div>

        <p className="subtitle">
          Proyecta tu credito de libranza y compara escenarios con o sin aportes
          para reducir intereses y plazo.
        </p>

        <section className="landing-block">
          <StandardLoanForm loanLabel="credito de libranza" onCalculate={handleCalculate} />
        </section>

        {projection && summary ? (
          <>
            <StandardSummaryCards projection={projection} summary={summary} />
            <Suspense fallback={<div className="panel section">Cargando graficas...</div>}>
              <Charts
                schedule={projection.schedule}
                baselineSchedule={projection.baselineSchedule}
              />
            </Suspense>
            <CompactAmortizationTable rows={projection.schedule} />
            <ExportCSVButton schedule={projection.schedule} />
          </>
        ) : null}
      </section>
    </>
  )
}
