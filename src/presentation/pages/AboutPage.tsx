import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'

export function AboutPage() {
  return (
    <section className="app-shell static-page">
      <SeoHead meta={seoMetaByPath.about} />
      <h1 className="page-title">Sobre el proyecto</h1>
      <p>
        Finanzas Claras existe para ayudarte a entender y validar decisiones
        financieras con herramientas simples y transparentes.
      </p>
      <p>
        Somos independientes de bancos y no almacenamos los datos financieros que
        ingresas.
      </p>
      <p>Contacto: fabiozapata980729@gmail.com</p>
    </section>
  )
}
