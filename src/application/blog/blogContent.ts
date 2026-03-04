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

      return {
        slug,
        title: module.frontmatter.title,
        date: module.frontmatter.date,
        excerpt: module.frontmatter.excerpt,
        coverImage: module.frontmatter.coverImage,
        tags: module.frontmatter.tags,
        readingTime: estimateReadingTimeFromExcerpt(module.frontmatter.excerpt),
        Component: module.default,
      }
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

function estimateReadingTimeFromExcerpt(excerpt: string): number {
  const words = excerpt
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  return Math.max(1, Math.round(words / 120))
}
