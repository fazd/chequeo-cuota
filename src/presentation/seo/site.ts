const siteUrl = import.meta.env.VITE_SITE_URL ?? 'https://misfinanzasclaras.vercel.app'

export function buildCanonical(pathname: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return new URL(normalizedPath, siteUrl).toString()
}

export function getSiteUrl(): string {
  return siteUrl
}
