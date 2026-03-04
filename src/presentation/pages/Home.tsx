import { Link } from 'react-router-dom'
import { calculatorsRegistry } from '../../domain/calculators/registry'
import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'

export function Home() {
  const upcomingCalculators = calculatorsRegistry.filter(
    (calculator) => !calculator.enabled,
  )
  const activeCalculators = calculatorsRegistry.filter(
    (calculator) => calculator.enabled,
  )

  return (
    <>
      <SeoHead meta={seoMetaByPath.home} />
      <section className="app-shell app-surface">
        <div className="hero hero-landing">
          <div className="hero-icon" aria-hidden>
            C
          </div>
          <h1 className="title">Chequeo de Credito Hipotecario</h1>
        </div>

        <p className="subtitle">
          Plataforma educativa para entender mejor tu credito de vivienda,
          tasas, amortizacion y estrategias de pago.
        </p>

        <section className="landing-block">
          <h2 className="landing-title">Como te ayudamos</h2>
          <p>
            Mis Finanzas Claras te permite entender conceptos clave y tomar
            decisiones con mayor claridad antes de hablar con tu banco.
          </p>
        </section>

        <section className="landing-block">
          <h2 className="landing-title">Prueba</h2>
          <div className="upcoming-grid upcoming-grid-compact">
            {activeCalculators
              .filter((calculator) => calculator.id === 'hipotecario')
              .map((calculator) => (
                <Link
                  key={calculator.id}
                  to="/amortizaci�n-credito-vivienda"
                  className="upcoming-card-link"
                >
                  <article className="upcoming-card upcoming-card-active">
                    <h3>Amortizacion de credito de vivienda</h3>
                    <p>{calculator.description}</p>
                    <span>Ir a calculadora</span>
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
                <h3>{calculator.name}</h3>
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
