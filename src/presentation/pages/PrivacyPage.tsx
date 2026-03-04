import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'

export function PrivacyPage() {
  return (
    <section className="app-shell static-page">
      <SeoHead meta={seoMetaByPath.privacy} />
      <h1 className="page-title">Politica de privacidad</h1>
      <p>Usamos Vercel Analytics para medir uso general del sitio.</p>
      <p>No almacenamos datos financieros ingresados en la calculadora.</p>
      <p>No recolectamos datos personales identificables desde la calculadora.</p>
      <p>Se utilizan cookies tecnicas minimas para funcionamiento de la plataforma.</p>
    </section>
  )
}
