export type CalculatorId = 'hipotecario' | 'vehicular' | 'libranza' | 'tarjeta-credito' | 'cdt' | 'alto-rendimiento'

export interface CalculatorModule {
  id: CalculatorId
  name: string
  description: string
  enabled: boolean
}

export const calculatorsRegistry: CalculatorModule[] = [
  {
    id: 'hipotecario',
    name: 'Credito hipotecario',
    description: 'Calculadora activa para cuota y proyeccion en sistema frances.',
    enabled: true,
  },
  {
    id: 'vehicular',
    name: 'Credito vehicular',
    description: 'Calculadora activa para cuota y proyeccion en sistema frances.',
    enabled: false,
  },
  {
    id: 'libranza',
    name: 'Credito de libranza',
    description: 'Calculadora activa para cuota y proyeccion en sistema frances.',
    enabled: false,
  },
  {
    id: 'tarjeta-credito',
    name: 'Tarjeta de credito',
    description: 'Calculadora activa para cuota y proyeccion en sistema frances.',
    enabled: false,
  },
  {
    id: 'cdt',
    name: 'CDT',
    description: 'Calculadora activa para cuota y proyeccion en sistema frances.',
    enabled: false,
  },
  {
    id: 'alto-rendimiento',
    name: 'Cuentas de alto rendimiento',
    description: 'Calculadora activa para cuota y proyeccion en sistema frances.',
    enabled: false,
  },
]
