import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'

export function TermsPage() {
  return (
    <section className="app-shell static-page">
      <SeoHead meta={seoMetaByPath.terms} />
      <h1 className="page-title">Terminos y descargo</h1>
      <p>
        Esta herramienta es solo informativa. No constituye asesoria financiera.
        Los calculos son estimaciones basadas en los datos ingresados por el usuario.
      </p>
      <p>
        El usuario es responsable de validar condiciones contractuales con su entidad financiera.
      </p>
    </section>
  )
}
