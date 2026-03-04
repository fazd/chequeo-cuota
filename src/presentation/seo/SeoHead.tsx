import { useEffect } from 'react'
import type { SeoMeta } from './seo.types'

interface SeoHeadProps {
  meta: SeoMeta
}

export function SeoHead({ meta }: SeoHeadProps) {
  useEffect(() => {
    document.title = meta.title

    updateMetaTag('name', 'description', meta.description)
    updateMetaTag('property', 'og:title', meta.ogTitle ?? meta.title)
    updateMetaTag('property', 'og:description', meta.ogDescription ?? meta.description)
    updateMetaTag('property', 'og:type', meta.ogType ?? 'website')
    updateMetaTag('property', 'og:url', meta.canonical)

    updateCanonical(meta.canonical)
  }, [meta])

  return null
}

function updateMetaTag(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  const existing = document.head.querySelector<HTMLMetaElement>(selector)

  if (existing) {
    existing.content = content
    return
  }

  const tag = document.createElement('meta')
  tag.setAttribute(attr, key)
  tag.content = content
  document.head.appendChild(tag)
}

function updateCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }

  link.href = url
}
