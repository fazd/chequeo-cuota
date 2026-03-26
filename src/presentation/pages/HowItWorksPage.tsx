import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'

export function HowItWorksPage() {
  return (
    <section className="app-shell static-page">
      <SeoHead meta={seoMetaByPath.howItWorks} />
      <h1 className="page-title">Como funciona</h1>
      <p>
        Esta plataforma calcula creditos con el sistema frances (cuota fija) para
        que compares tu cuota teorica contra la reportada por el banco.
      </p>
      <p>
        Formula base de cuota:
        {' '}
        C = P * [i * (1 + i)^n] / [(1 + i)^n - 1]
      </p>
      <p>
        Donde P es el saldo inicial, i la tasa mensual y n el numero de meses del
        plazo restante.
      </p>
      <p>
        Regla de precision: los motores financieros no redondean internamente. El
        redondeo se aplica solo para mostrar y exportar datos.
      </p>
      <p>
        Si ingresas aportes adicionales, se compara escenario base vs escenario con
        aportes para medir reduccion de plazo y ahorro de intereses.
      </p>
    </section>
  )
}
