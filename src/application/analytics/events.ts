import { track } from '@vercel/analytics'

export type AnalyticsEventName =
  | 'calculo_realizado'
  | 'csv_exportado'
  | 'visita_blog'

export function trackCalculoRealizado(): void {
  track('calculo_realizado')
}

export function trackCsvExportado(): void {
  track('csv_exportado')
}

export function trackVisitaBlog(path: string): void {
  track('visita_blog', { path })
}
