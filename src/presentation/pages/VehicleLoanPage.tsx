import { useMemo, useState, lazy, Suspense } from 'react'
import { buildVehicleLoanSummary } from '../../application/vehicular/vehicleLoanSummary'
import { calculateVehicleProjection } from '../../application/vehicular/calculateVehicleProjection'
import type { VehicleLoanProjection } from '../../domain/vehicular/loan.types'
import { CompactAmortizationTable } from '../components/CompactAmortizationTable'
import { ExportCSVButton } from '../components/ExportCSVButton'
import { StandardLoanForm, type StandardLoanFormInput } from '../components/StandardLoanForm'
import { StandardSummaryCards } from '../components/StandardSummaryCards'
import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'

const Charts = lazy(() => import('../components/Charts').then((m) => ({ default: m.Charts })))

export function VehicleLoanPage() {
  const [projection, setProjection] = useState<VehicleLoanProjection | null>(null)

  function handleCalculate(input: StandardLoanFormInput) {
    setProjection(
      calculateVehicleProjection({
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
    () => (projection ? buildVehicleLoanSummary(projection) : null),
    [projection],
  )

  return (
    <>
      <SeoHead meta={seoMetaByPath.vehicleLoan} />
      <section className="app-shell app-surface">
        <div className="hero hero-landing">
          <div className="hero-icon" aria-hidden>
            V
          </div>
          <h1 className="title">Amortizacion credito vehicular</h1>
        </div>

        <p className="subtitle">
          Simula tu credito vehicular en sistema frances y evalua como cambian
          cuota, plazo e intereses con aportes periodicos.
        </p>

        <section className="landing-block">
          <StandardLoanForm loanLabel="credito vehicular" onCalculate={handleCalculate} />
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
