export interface BlogFrontmatter {
  title: string
  date: string
  excerpt: string
  slug?: string
  coverImage?: string
  tags?: string[]
}

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  excerpt: string
  readingTime: number
  coverImage?: string
  tags?: string[]
}
