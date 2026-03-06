import { Link } from 'react-router-dom'
import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'

export function NotFoundPage() {
  return (
    <section className="app-shell static-page">
      <SeoHead meta={seoMetaByPath.notFound} />
      <h1 className="page-title">404</h1>
      <p>La pagina que intentas visitar no existe.</p>
      <Link to="/" className="btn-primary not-found-cta">Volver al inicio</Link>
    </section>
  )
}
