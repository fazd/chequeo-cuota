export type CalculatorId = 'hipotecario' | 'vehicular' | 'libranza' | 'tarjeta-credito' | 'cdt' | 'alto-rendimiento'

export interface CalculatorModule {
  id: CalculatorId
  name: string
  description: string
  path: string
  enabled: boolean
}

export const calculatorsRegistry: CalculatorModule[] = [
  {
    id: 'hipotecario',
    name: 'Credito hipotecario',
    description: 'Calcula tu cuota mensual y genera la tabla de amortización de tu crédito.',
    path: '/amortizacion-credito-vivienda',
    enabled: true,
  },
  {
    id: 'vehicular',
    name: 'Credito vehicular',
    description: 'Calcula tu cuota y la proyección de tu crédito vehicular.',
    path: '/amortizacion-credito-vehicular',
    enabled: true,
  },
  {
    id: 'libranza',
    name: 'Credito de libranza',
    description: 'Calcula la cuota de tu libranza y genera su tabla de amortización.',
    path: '/amortizacion-credito-libranza',
    enabled: true,
  },
  {
    id: 'tarjeta-credito',
    name: 'Tarjeta de credito',
    description: 'Calculadora activa para cuota y proyeccion en sistema frances.',
    path: '/calculadora-tarjeta-credito',
    enabled: false,
  },
  {
    id: 'cdt',
    name: 'CDT',
    description: 'Calculadora activa para cuota y proyeccion en sistema frances.',
    path: '/calculadora-cdt',
    enabled: false,
  },
  {
    id: 'alto-rendimiento',
    name: 'Cuentas de alto rendimiento',
    description: 'Calculadora activa para cuota y proyeccion en sistema frances.',
    path: '/calculadora-alto-rendimiento',
    enabled: false,
  },
]
