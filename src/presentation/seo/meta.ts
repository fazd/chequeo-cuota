import { buildCanonical } from './site'
import type { SeoMeta } from './seo.types'

export const seoMetaByPath: Record<string, SeoMeta> = {
  home: {
    title: 'Mis Finanzas Claras - Educacion financiera para credito de vivienda',
    description:
      'Aprende sobre amortizacion, tasas y estrategias de pago para tomar mejores decisiones financieras.',
    canonical: buildCanonical('/'),
    ogType: 'website',
  },
  mortgageAmortization: {
    title: 'Amortizacion credito vivienda - Mis Finanzas Claras',
    description:
      'Calcula tu tabla de amortizacion de credito de vivienda y valida cuota teorica en sistema frances.',
    canonical: buildCanonical('/amortización-credito-vivienda'),
    ogType: 'website',
  },
  howItWorks: {
    title: 'Como funciona el sistema frances - Mis Finanzas Claras',
    description:
      'Aprende la formula del sistema frances, conversion de tasa EA a mensual y como interpretar la tabla de amortizacion.',
    canonical: buildCanonical('/como-funciona'),
    ogType: 'article',
  },
  blogIndex: {
    title: 'Blog de educacion financiera - Mis Finanzas Claras',
    description:
      'Articulos practicos para entender credito de vivienda, tasas, amortizacion y decisiones financieras.',
    canonical: buildCanonical('/blog'),
    ogType: 'website',
  },
  about: {
    title: 'Sobre el proyecto - Mis Finanzas Claras',
    description:
      'Conoce por que existe Mis Finanzas Claras y nuestro enfoque independiente para educacion financiera.',
    canonical: buildCanonical('/sobre'),
  },
  privacy: {
    title: 'Politica de privacidad - Mis Finanzas Claras',
    description:
      'Transparencia sobre analytics, cookies tecnicas y tratamiento de datos en Mis Finanzas Claras.',
    canonical: buildCanonical('/privacidad'),
  },
  terms: {
    title: 'Terminos y descargo - Mis Finanzas Claras',
    description:
      'Condiciones de uso y descargo de responsabilidad de la plataforma Mis Finanzas Claras.',
    canonical: buildCanonical('/terminos'),
  },
  notFound: {
    title: 'Pagina no encontrada - Mis Finanzas Claras',
    description: 'La ruta solicitada no existe en Mis Finanzas Claras.',
    canonical: buildCanonical('/404'),
  },
}
