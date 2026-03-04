import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllBlogPosts } from '../../application/blog/blogContent'
import { trackVisitaBlog } from '../../application/analytics/events'
import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'

export function BlogIndexPage() {
  const posts = getAllBlogPosts()

  useEffect(() => {
    trackVisitaBlog('/blog')
  }, [])

  return (
    <section className="app-shell">
      <SeoHead meta={seoMetaByPath.blogIndex} />
      <h1 className="page-title">Blog</h1>
      <p className="page-intro">Guias practicas para entender tu credito y mejorar decisiones financieras.</p>

      <div className="blog-list">
        {posts.map((post) => (
          <article key={post.slug} className="blog-card">
            <p className="blog-meta">{post.date} · {post.readingTime} min lectura</p>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <Link to={`/blog/${post.slug}`} className="btn-secondary">Leer articulo</Link>
          </article>
        ))}
      </div>
    </section>
  )
}
