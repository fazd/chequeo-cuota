import HowItWorksContent from '../../content/pages/como-funciona.mdx'
import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'

export function HowItWorksPage() {
  return (
    <section className="app-shell blog-post-wrap">
      <SeoHead meta={seoMetaByPath.howItWorks} />
      <h1 className="page-title">Como funciona el sistema frances</h1>
      <div className="blog-post-content">
        <HowItWorksContent />
      </div>
    </section>
  )
}
