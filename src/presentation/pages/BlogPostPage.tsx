import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NotFoundPage } from './NotFoundPage'
import { getBlogPostBySlug } from '../../application/blog/blogContent'
import { trackVisitaBlog } from '../../application/analytics/events'
import { SeoHead } from '../seo/SeoHead'
import { buildCanonical } from '../seo/site'

export function BlogPostPage() {
  const { slug = '' } = useParams()
  const post = getBlogPostBySlug(slug)

  useEffect(() => {
    if (post) {
      trackVisitaBlog(`/blog/${post.slug}`)
    }
  }, [post])

  if (!post) {
    return <NotFoundPage />
  }

  const meta = {
    title: `${post.title} - Mis Finanzas Claras`,
    description: post.excerpt,
    canonical: buildCanonical(`/blog/${post.slug}`),
    ogType: 'article' as const,
  }

  const PostComponent = post.Component

  return (
    <article className="app-shell blog-post-wrap">
      <SeoHead meta={meta} />
      <Link to="/blog" className="text-link">&lt; Volver al blog</Link>
      <h1 className="page-title">{post.title}</h1>
      <p className="blog-meta">{post.date} - {post.readingTime} min lectura</p>
      {post.tags?.length ? (
        <div className="blog-tags" aria-label="Tags del articulo">
          {post.tags.map((tag) => (
            <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`} className="tag-chip static link">
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="blog-post-content">
        <PostComponent />
      </div>
    </article>
  )
}
