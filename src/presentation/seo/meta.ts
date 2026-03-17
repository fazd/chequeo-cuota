import { buildCanonical } from './site'
import type { SeoMeta } from './seo.types'

export const seoMetaByPath: Record<string, SeoMeta> = {
  home: {
    title: 'Finanzas claras - Educacion financiera para credito de vivienda',
    description:
      'Aprende sobre amortizacion, tasas y estrategias de pago para tomar mejores decisiones financieras.',
    canonical: buildCanonical('/'),
    ogType: 'website',
  },
  mortgageAmortization: {
    title: 'Amortizacion credito vivienda - Finanzas claras',
    description:
      'Calcula tu tabla de amortizacion de credito de vivienda y valida cuota teorica en sistema frances.',
    canonical: buildCanonical('/amortizacion-credito-vivienda'),
    ogType: 'website',
  },
  vehicleLoan: {
    title: 'Amortizacion credito vehicular - Finanzas claras',
    description:
      'Calcula cuota, tabla de amortizacion y compara escenarios para tu credito vehicular.',
    canonical: buildCanonical('/amortizacion-credito-vehicular'),
    ogType: 'website',
  },
  payrollLoan: {
    title: 'Amortizacion credito de libranza - Finanzas claras',
    description:
      'Simula tu credito de libranza y evalua cuota, plazo e intereses con abonos periodicos.',
    canonical: buildCanonical('/amortizacion-credito-libranza'),
    ogType: 'website',
  },
  blogIndex: {
    title: 'Blog de educacion financiera - Finanzas claras',
    description:
      'Articulos practicos para entender credito de vivienda, tasas, amortizacion y decisiones financieras.',
    canonical: buildCanonical('/blog'),
    ogType: 'website',
  },
  about: {
    title: 'Sobre el proyecto - Finanzas claras',
    description:
      'Conoce por que existe Finanzas claras y nuestro enfoque independiente para educacion financiera.',
    canonical: buildCanonical('/sobre'),
  },
  privacy: {
    title: 'Politica de privacidad - Finanzas claras',
    description:
      'Transparencia sobre analytics, cookies tecnicas y tratamiento de datos en Finanzas claras.',
    canonical: buildCanonical('/privacidad'),
  },
  terms: {
    title: 'Terminos y descargo - Finanzas claras',
    description:
      'Condiciones de uso y descargo de responsabilidad de la plataforma Finanzas claras.',
    canonical: buildCanonical('/terminos'),
  },
  notFound: {
    title: 'Pagina no encontrada - Finanzas claras',
    description: 'La ruta solicitada no existe en Finanzas claras.',
    canonical: buildCanonical('/404'),
  },
}
