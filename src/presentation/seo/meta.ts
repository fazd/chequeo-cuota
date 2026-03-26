import { getCalculatorById, type CalculatorId } from '../../domain/calculators/manifest'
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

export function getCalculatorSeoMeta(calculatorId: CalculatorId): SeoMeta {
  const calculator = getCalculatorById(calculatorId)

  return {
    title: calculator.seo.title,
    description: calculator.seo.description,
    canonical: buildCanonical(calculator.path),
    ogType: calculator.seo.ogType ?? 'website',
  }
}
