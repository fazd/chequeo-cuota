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
    description: 'Calculadora activa para cuota y proyeccion en sistema frances.',
    path: '/amortizacion-credito-vivienda',
    enabled: true,
  },
  {
    id: 'vehicular',
    name: 'Credito vehicular',
    description: 'Calculadora activa para cuota y proyeccion en sistema frances.',
    path: '/amortizacion-credito-vehicular',
    enabled: true,
  },
  {
    id: 'libranza',
    name: 'Credito de libranza',
    description: 'Calculadora activa para cuota y proyeccion en sistema frances.',
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
