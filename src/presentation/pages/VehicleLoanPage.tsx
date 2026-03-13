import { useMemo, useState, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { getAllBlogPosts } from '../../application/blog/blogContent'
import { buildVehicleLoanSummary } from '../../application/vehicular/vehicleLoanSummary'
import { calculateVehicleProjection } from '../../application/vehicular/calculateVehicleProjection'
import type { LoanInput } from '../../domain/loan.types'
import type { VehicleLoanProjection } from '../../domain/vehicular/loan.types'
import { formatCop } from '../../utils/currency'
import { CompactAmortizationTable } from '../components/CompactAmortizationTable'
import { ExportCSVButton } from '../components/ExportCSVButton'
import { LoanForm } from '../components/LoanForm'
import { StandardSummaryCards } from '../components/StandardSummaryCards'
import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCar } from '@fortawesome/free-solid-svg-icons'

const Charts = lazy(() => import('../components/Charts').then((m) => ({ default: m.Charts })))

export function VehicleLoanPage() {
  const [projection, setProjection] = useState<VehicleLoanProjection | null>(null)
  const suggestedPosts = useMemo(() => getSuggestedVehiclePosts(), [])

  function handleCalculate(input: LoanInput) {
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
        extraordinaryExtraPayments: input.extraordinaryExtraPayments,
      }),
    )
  }

  const summary = useMemo(
    () => (projection ? buildVehicleLoanSummary(projection) : null),
    [projection],
  )

  const showSavingsSummary =
    !!projection &&
    (projection.monthsReduced > 0 || projection.interestSavingsFromPrepayments > 0)

  return (
    <>
      <SeoHead meta={seoMetaByPath.vehicleLoan} />
      <section className="app-shell app-surface">
        <div className="hero hero-landing">
          <div className="hero-icon" aria-hidden>
            <FontAwesomeIcon icon={faCar} />
          </div>
          <h1 className="title">Amortizacion credito vehicular</h1>
        </div>

        <p className="subtitle">
          Simula tu credito vehicular en sistema frances y evalua como cambian
          cuota, plazo e intereses con aportes periodicos.
        </p>

        <section className="landing-block">
          <LoanForm onCalculate={handleCalculate} />
        </section>

        {projection && summary ? (
          <>
            <StandardSummaryCards projection={projection} summary={summary} />
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
            <CompactAmortizationTable rows={projection.schedule} />
            <ExportCSVButton schedule={projection.schedule} />
          </>
        ) : null}

        <section className="landing-block">
          <h2 className="landing-title">Para profundizar</h2>
          <p className="page-intro">
            Revisa estos articulos para entender mejor credito vehicular y tipos de tasa.
          </p>
          <div className="learn-suggest-grid">
            {suggestedPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="learn-suggest-item"
              >
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </Link>
            ))}
          </div>
          <Link to="/blog" className="text-link">
            Ver todos los articulos del blog
          </Link>
        </section>
      </section>
    </>
  )
}

function getSuggestedVehiclePosts() {
  const allPosts = getAllBlogPosts()
  const prioritySlugs = [
    'credito-vehicular-como-funciona',
    'credito-vehicular-abonos-estrategia',
    'ea-vs-nominal-vencida',
  ]

  const priorityPosts = prioritySlugs
    .map((slug) => allPosts.find((post) => post.slug === slug))
    .filter((post): post is NonNullable<typeof post> => post != null)

  const remainingPosts = allPosts.filter(
    (post) => !priorityPosts.some((selected) => selected.slug === post.slug),
  )

  return [...priorityPosts, ...remainingPosts].slice(0, 3)
}

function formatMonths(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${months} meses`
  }

  return `${years} años y ${remainingMonths} meses`
}
