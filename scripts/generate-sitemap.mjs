import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const rootDir = process.cwd()
const publicDir = resolve(rootDir, 'public')
const blogDir = resolve(rootDir, 'src', 'content', 'blog')
const manifestPath = resolve(rootDir, 'src', 'domain', 'calculators', 'manifest.json')
const outputPath = join(publicDir, 'sitemap.xml')

const siteUrl = process.env.VITE_SITE_URL ?? 'https://finanzasclaras.app'

const staticPaths = [
  '/',
  '/blog',
  '/sobre',
  '/privacidad',
  '/terminos',
]

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function toAbsoluteUrl(pathname) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return new URL(normalizedPath, siteUrl).toString()
}

function readEnabledCalculatorPaths() {
  const raw = readFileSync(manifestPath, 'utf8')
  const manifest = JSON.parse(raw)

  return manifest
    .filter((calculator) => calculator.enabled)
    .map((calculator) => calculator.path)
}

function readBlogSlugs() {
  const files = readdirSync(blogDir).filter((file) => file.endsWith('.mdx'))
  const slugs = []

  for (const fileName of files) {
    const filePath = join(blogDir, fileName)
    const content = readFileSync(filePath, 'utf8')
    const explicitSlug = content.match(/slug:\s*['"`]([^'"`]+)['"`]/)
    const fromFileName = fileName.replace(/\.mdx$/, '')
    const slug = slugify(explicitSlug?.[1] ?? fromFileName)
    if (slug) {
      slugs.push(slug)
    }
  }

  return Array.from(new Set(slugs)).sort((a, b) => a.localeCompare(b))
}

function buildSitemapXml() {
  const calculatorPaths = readEnabledCalculatorPaths()
  const blogPaths = readBlogSlugs().map((slug) => `/blog/${slug}`)

  const allPaths = [...staticPaths, ...calculatorPaths, ...blogPaths]
  const uniquePaths = Array.from(new Set(allPaths))

  const urlEntries = uniquePaths
    .map((pathname) => `  <url><loc>${toAbsoluteUrl(pathname)}</loc></url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`
}

writeFileSync(outputPath, buildSitemapXml(), 'utf8')
console.log(`Sitemap generated at ${outputPath}`)
