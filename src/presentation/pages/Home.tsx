import { Link } from 'react-router-dom'
import {
  getHomeEnabledCalculators,
  getHomeUpcomingCalculators,
  type CalculatorIconKey,
} from '../../domain/calculators/manifest'
import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalculator,
  faCar,
  faCreditCard,
  faHouse,
  faMagnifyingGlass,
  faPercent,
} from '@fortawesome/free-solid-svg-icons'

const iconByCalculatorKey: Record<CalculatorIconKey, typeof faHouse> = {
  house: faHouse,
  car: faCar,
  percent: faPercent,
  'credit-card': faCreditCard,
  calculator: faCalculator,
}

const activeCalculators = getHomeEnabledCalculators()
const upcomingCalculators = getHomeUpcomingCalculators()

export function Home() {
  return (
    <>
      <SeoHead meta={seoMetaByPath.home} />
      <section className="app-shell app-surface">
        <div className="hero hero-landing">
          <div className="hero-icon" aria-hidden>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </div>
          <h1 className="title">Finanzas claras</h1>
        </div>

        <p className="subtitle">
          Plataforma educativa para entender mejor tu credito de vivienda, tasas,
          amortizacion y estrategias de pago.
        </p>

        <section className="landing-block">
          <h2 className="landing-title">Como te ayudamos</h2>
          <p>
            Finanzas Claras te permite entender conceptos clave y tomar decisiones
            con mayor claridad antes de hablar con tu banco.
          </p>
        </section>

        <section className="landing-block">
          <h2 className="landing-title">Prueba</h2>
          <div className="upcoming-grid">
            {activeCalculators.map((calculator) => (
              <Link
                key={calculator.id}
                to={calculator.path}
                className="upcoming-card-link"
              >
                <article className="upcoming-card upcoming-card-active">
                  <div className="card-title-row">
                    <span className="card-icon" aria-hidden>
                      <FontAwesomeIcon
                        icon={iconByCalculatorKey[calculator.iconKey] ?? faCalculator}
                      />
                    </span>
                    <h3>{calculator.name}</h3>
                  </div>
                  <p>{calculator.description}</p>
                  <span>{calculator.homeCard.ctaLabel}</span>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-block">
          <h2 className="landing-title">Proximamente</h2>
          <div className="upcoming-grid">
            {upcomingCalculators.map((calculator) => (
              <article key={calculator.id} className="upcoming-card" aria-disabled>
                <div className="card-title-row">
                  <span className="card-icon" aria-hidden>
                    <FontAwesomeIcon
                      icon={iconByCalculatorKey[calculator.iconKey] ?? faCalculator}
                    />
                  </span>
                  <h3>{calculator.name}</h3>
                </div>
                <p>{calculator.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-block">
          <h2 className="landing-title">FAQ</h2>
          <div className="faq-list">
            <article>
              <h3>La herramienta guarda mis datos?</h3>
              <p>
                No. Todo se calcula en tu navegador y no se almacena informacion
                financiera personal.
              </p>
            </article>
            <article>
              <h3>Por que puede diferir del banco?</h3>
              <p>
                Puede haber diferencias por redondeos, politicas internas del banco
                o seguros no incluidos.
              </p>
            </article>
            <article>
              <h3>Esto reemplaza asesoria financiera?</h3>
              <p>
                No. Es una herramienta educativa para mejorar comprension y
                comparacion de escenarios.
              </p>
            </article>
          </div>
        </section>
      </section>
    </>
  )
}
