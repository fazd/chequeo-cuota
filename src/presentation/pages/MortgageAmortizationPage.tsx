import { useMemo, useState, lazy, Suspense, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllBlogPosts } from '../../application/blog/blogContent'
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
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const suggestedPosts = useMemo(() => getSuggestedPosts(), [])

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

  useEffect(() => {
    if (projection && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [projection])

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
          <div ref={resultsRef}>
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
          </div>
        ) : null}

        <section className="landing-block">
          <h2 className="landing-title">Para profundizar</h2>
          <p className="page-intro">
            Si quieres entender mejor los conceptos del calculo, revisa estos articulos.
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

function formatMonths(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${months} meses`
  }

  return `${years} anios y ${remainingMonths} meses`
}

function getSuggestedPosts() {
  const allPosts = getAllBlogPosts()
  const prioritySlugs = [
    'sistema-frances',
    'ea-vs-nominal-vencida',
    'reducir-plazo-vs-reducir-cuota',
  ]

  const priorityPosts = prioritySlugs
    .map((slug) => allPosts.find((post) => post.slug === slug))
    .filter((post): post is NonNullable<typeof post> => post != null)

  const remainingPosts = allPosts.filter(
    (post) => !priorityPosts.some((selected) => selected.slug === post.slug),
  )

  return [...priorityPosts, ...remainingPosts].slice(0, 3)
}
