declare module '*.mdx' {
  import type { ComponentType } from 'react'
  import type { BlogFrontmatter } from '../domain/content.types'

  export const frontmatter: BlogFrontmatter
  const MDXComponent: ComponentType
  export default MDXComponent
}
