import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAllBlogPosts } from '../../application/blog/blogContent'
import { trackVisitaBlog } from '../../application/analytics/events'
import { SeoHead } from '../seo/SeoHead'
import { seoMetaByPath } from '../seo/meta'

const allTagsKey = '__all__'

export function BlogIndexPage() {
  const posts = getAllBlogPosts()
  const [searchParams, setSearchParams] = useSearchParams()

  const availableTags = useMemo(
    () =>
      Array.from(
        new Set(
          posts.flatMap((post) => (post.tags ?? []).map((tag) => normalizeTag(tag))),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [posts],
  )

  const tagFromQuery = normalizeTag(searchParams.get('tag') ?? '')
  const activeTag = tagFromQuery || allTagsKey

  const filteredPosts = useMemo(() => {
    if (activeTag === allTagsKey) {
      return posts
    }

    return posts.filter((post) =>
      (post.tags ?? []).some((tag) => normalizeTag(tag) === activeTag),
    )
  }, [posts, activeTag])

  useEffect(() => {
    trackVisitaBlog('/blog')
  }, [])

  function handleTagFilter(tag: string) {
    if (tag === allTagsKey) {
      setSearchParams({})
      return
    }

    setSearchParams({ tag })
  }

  return (
    <section className="app-shell">
      <SeoHead meta={seoMetaByPath.blogIndex} />
      <h1 className="page-title">Blog</h1>
      <p className="page-intro">Guias practicas para entender tu credito y mejorar decisiones financieras.</p>

      <div className="blog-tags-filter" role="group" aria-label="Filtrar por tag">
        <button
          type="button"
          className={`tag-chip${activeTag === allTagsKey ? ' active' : ''}`}
          onClick={() => handleTagFilter(allTagsKey)}
        >
          Todos
        </button>
        {availableTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`tag-chip${activeTag === tag ? ' active' : ''}`}
            onClick={() => handleTagFilter(tag)}
          >
            #{tag}
          </button>
        ))}
      </div>

      <div className="blog-list">
        {filteredPosts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-card-link">
            <article className="blog-card">
              <p className="blog-meta">{post.date} - {post.readingTime} min lectura</p>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              {post.tags?.length ? (
                <div className="blog-tags" aria-label="Tags del articulo">
                  {post.tags.map((tag) => (
                    <span key={tag} className="tag-chip static">#{normalizeTag(tag)}</span>
                  ))}
                </div>
              ) : null}
            </article>
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <p className="page-intro">No hay articulos para el tag seleccionado.</p>
      ) : null}
    </section>
  )
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase()
}
