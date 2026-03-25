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
  faArrowRight,
  faBolt,
  faCalculator,
  faCar,
  faChartLine,
  faCreditCard,
  faHouse,
  faMagnifyingGlass,
  faPercent,
  faShieldHalved,
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
const primaryCalculatorPath = activeCalculators[0]?.path ?? '/'

export function Home() {
  return (
    <>
      <SeoHead meta={seoMetaByPath.home} />
      <section className="app-shell app-surface landing-v2">
        <section className="landing-hero panel" aria-label="Hero principal">
          <div className="hero hero-landing">
            <div className="hero-icon" aria-hidden>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </div>
            <p className="landing-kicker">Simuladores financieros claros</p>
          </div>
          <h1 className="landing-main-title">
            Entiende tu cuota antes de hablar con tu banco
          </h1>
          <p className="landing-lead">
            Calcula, compara escenarios y toma decisiones con confianza en menos de 3
            minutos.
          </p>
          <div className="landing-hero-actions">
            <Link to={primaryCalculatorPath} className="landing-cta-primary">
              Ir a la calculadora
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
            <Link to="/como-funciona" className="landing-cta-secondary">
              Como funciona
            </Link>
          </div>
        </section>

        <section id="calculadoras" className="landing-block">
          <h2 className="landing-title">Elige tu calculadora</h2>
          <p className="landing-section-lead">
            Herramientas listas para comparar tu cuota y proyectar tu credito.
          </p>
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

        <section id="como-funciona" className="landing-block">
          <h2 className="landing-title">Como funciona</h2>
          <div className="landing-steps">
            <article className="landing-step-card">
              <span className="landing-step-pill">Paso 1</span>
              <h3>Ingresa tus datos</h3>
              <p>Saldo, tasa y plazo restante.</p>
            </article>
            <article className="landing-step-card">
              <span className="landing-step-pill">Paso 2</span>
              <h3>Compara escenarios</h3>
              <p>Revisa cuota, interes y tiempo.</p>
            </article>
            <article className="landing-step-card">
              <span className="landing-step-pill">Paso 3</span>
              <h3>Decide con claridad</h3>
              <p>Lleva una base objetiva al banco.</p>
            </article>
          </div>
        </section>

        <section className="landing-block landing-trust">
          <h2 className="landing-title">Confianza y privacidad</h2>
          <div className="landing-trust-grid">
            <article className="landing-trust-card">
              <div className="landing-trust-icon" aria-hidden>
                <FontAwesomeIcon icon={faShieldHalved} />
              </div>
              <h3>Sin login</h3>
              <p>No te pedimos crear cuenta.</p>
            </article>
            <article className="landing-trust-card">
              <div className="landing-trust-icon" aria-hidden>
                <FontAwesomeIcon icon={faBolt} />
              </div>
              <h3>Todo en tu navegador</h3>
              <p>Tus datos financieros no se almacenan.</p>
            </article>
            <article className="landing-trust-card">
              <div className="landing-trust-icon" aria-hidden>
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <h3>Enfoque educativo</h3>
              <p>Entiende antes de tomar decisiones.</p>
            </article>
          </div>
        </section>

        <section className="landing-block landing-block-compact">
          <h2 className="landing-title">Proximamente</h2>
          <div className="upcoming-chip-list">
            {upcomingCalculators.map((calculator) => (
              <article key={calculator.id} className="upcoming-chip" aria-disabled>
                <span className="card-icon" aria-hidden>
                  <FontAwesomeIcon
                    icon={iconByCalculatorKey[calculator.iconKey] ?? faCalculator}
                  />
                </span>
                <h3>{calculator.name}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-block">
          <h2 className="landing-title">Preguntas frecuentes</h2>
          <div className="landing-faq-accordion">
            <details>
              <summary>La herramienta guarda mis datos?</summary>
              <p>
                No. Todo se calcula en tu navegador y no se almacena informacion
                financiera personal.
              </p>
            </details>
            <details>
              <summary>Por que puede diferir del banco?</summary>
              <p>
                Puede haber diferencias por redondeos, politicas internas o seguros no
                incluidos en la cuota comparada.
              </p>
            </details>
            <details>
              <summary>Reemplaza asesoria financiera?</summary>
              <p>
                No. Es una herramienta educativa para comparar escenarios con mejor
                contexto.
              </p>
            </details>
          </div>
        </section>

        <section className="landing-final-cta panel">
          <h2>Empieza tu simulacion hoy</h2>
          <p>Un punto de partida claro para negociar mejor tu credito.</p>
          <Link to={primaryCalculatorPath} className="landing-cta-primary">
            Simular ahora
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </section>
      </section>
    </>
  )
}
