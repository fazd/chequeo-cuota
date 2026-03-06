import type { ComponentType } from 'react'
import type { BlogFrontmatter, BlogPostMeta } from '../../domain/content.types'
import { slugify } from '../../utils/slugify'

interface BlogModule {
  default: ComponentType
  frontmatter?: BlogFrontmatter
}

export interface BlogPostEntry extends BlogPostMeta {
  Component: ComponentType
}

const blogModules = import.meta.glob('../../content/blog/*.mdx', {
  eager: true,
}) as Record<string, BlogModule>

const blogRawModules = import.meta.glob('../../content/blog/*.mdx', {
  eager: true,
  as: 'raw',
}) as Record<string, string | { default?: string }>

export function getAllBlogPosts(): BlogPostMeta[] {
  return buildBlogEntries()
    .map(({ Component: _, ...meta }) => meta)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

export function getBlogPostBySlug(slug: string): BlogPostEntry | null {
  const normalizedSlug = slugify(slug)
  return buildBlogEntries().find((post) => post.slug === normalizedSlug) ?? null
}

function buildBlogEntries(): BlogPostEntry[] {
  return Object.entries(blogModules)
    .map(([path, module]) => {
      if (!module.frontmatter) {
        throw new Error(`Missing frontmatter in ${path}`)
      }

      const fileName = path.split('/').pop()?.replace(/\.mdx$/, '') ?? ''
      const slug = slugify(module.frontmatter.slug ?? fileName)

      if (
        !slug ||
        !module.frontmatter.title ||
        !module.frontmatter.date ||
        !module.frontmatter.excerpt
      ) {
        throw new Error(`Invalid frontmatter required fields in ${path}`)
      }

      const rawContent = getRawContent(path)

      return {
        slug,
        title: module.frontmatter.title,
        date: module.frontmatter.date,
        excerpt: module.frontmatter.excerpt,
        coverImage: module.frontmatter.coverImage,
        tags: module.frontmatter.tags,
        readingTime: estimateReadingTimeFromContent(rawContent),
        Component: module.default,
      }
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

function estimateReadingTimeFromContent(rawContent: string): number {
  const contentWithoutFrontmatter = rawContent.replace(
    /export\s+const\s+frontmatter\s*=\s*\{[\s\S]*?\}\s*/m,
    '',
  )

  const normalizedContent = contentWithoutFrontmatter
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_[\]\(\)\-]/g, ' ')

  const words = normalizedContent.match(/[A-Za-zÀ-ÿ0-9]+/g)?.length ?? 0

  return Math.max(1, Math.round(words / 200))
}

function getRawContent(path: string): string {
  const rawModule = blogRawModules[path]

  if (typeof rawModule === 'string') {
    return rawModule
  }

  if (rawModule && typeof rawModule.default === 'string') {
    return rawModule.default
  }

  return ''
}
