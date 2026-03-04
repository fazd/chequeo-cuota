# AGENTS.md - Decisiones de Arquitectura

## Objetivo del documento
Este archivo resume las decisiones arquitectónicas vigentes del proyecto `chequeo-cuota` para guiar trabajo futuro de agentes y desarrolladores.

## 1) Arquitectura en capas (desacoplada)
Se adopta una arquitectura por capas con separación estricta de responsabilidades:

- `domain/`: reglas financieras puras y tipos del dominio.
- `application/`: orquestación de casos de uso y agregados de negocio.
- `presentation/`: UI React (formularios, vistas, componentes).
- `utils/`: utilidades transversales (formato, redondeo, CSV).

Reglas:
- `domain` NO importa React.
- `application` NO importa React.
- `presentation` puede importar `application`.

## 2) Motor financiero como núcleo de negocio
El cálculo hipotecario se modela como núcleo estable y reutilizable:

- Conversión de tasa: EA -> mensual equivalente.
- Sistema francés (cuota fija) como único sistema del MVP.
- Generación de tabla de amortización mes a mes.
- Ajuste de última cuota para cierre de saldo.

Decisión de precisión:
- No redondear internamente en cálculos.
- Redondear solo al presentar/exportar.

## 3) Contratos del dominio (tipos)
`LoanInput` concentra entradas funcionales:
- capital, tasa EA, plazo, cuota banco.
- seguro fijo mensual opcional.
- seguro de vida mensual (% sobre saldo) opcional.
- indicador de si cuota banco incluye seguros.
- abonos constantes opcionales.
- abonos extraordinarios opcionales.

`AmortizationRow` desglosa por mes:
- saldo inicial/final, interés, capital, abono extra,
- seguro base, seguro vida, seguro total, pago total.

`LoanProjection` agrega salida operativa:
- cronograma, totales, comparación con cuota banco,
- reducción de plazo por abonos,
- ahorro de intereses por abonos.

## 4) Estrategia de abonos (MVP)
Se implementa una única estrategia activa:
- **Reducir capital y mantener cuota** (reduce plazo).

Tipos de abono soportados:
- Constante: monto cada N meses.
- Extraordinario: lista de (mes, monto).

Comportamiento:
- Ambos tipos pueden coexistir.
- Se aplica contra capital del mes.
- Si excede saldo restante, se recorta al saldo pendiente.

## 5) Seguros
Seguros modelados como componentes independientes:

- Seguro fijo mensual (`monthlyInsurance`).
- Seguro variable de vida (`monthlyLifeInsuranceRate`), calculado cada mes sobre saldo inicial del período.

En comparación con cuota banco:
- si la cuota banco “incluye seguros”, se normaliza restando seguros estimados para comparar contra cuota financiera teórica.

## 6) Cálculo de impacto por aportes
Se comparan dos escenarios para métricas de impacto:

- Escenario base: sin abonos.
- Escenario con abonos.

Métricas resultantes:
- `monthsReduced`.
- `interestSavingsFromPrepayments`.

## 7) UI y experiencia
Decisiones de presentación:

- Secciones por tarjetas: información básica, seguros, estrategia, aportes.
- Inputs monetarios con prefijo `$`.
- Diseño responsive mobile-first.
- Tabla completa + gráficos + exportación CSV.

## 8) Exportación y validación
- Exportación CSV desde cronograma calculado.
- Panel de chequeo contra Excel con tolerancia +/- 1 COP.

## 9) Pruebas y calidad
Se mantienen pruebas unitarias de dominio/aplicación para:

- conversión de tasas,
- cuota y amortización,
- comparación de cuota,
- resumen y métricas,
- impacto de abonos.

Regla de aceptación técnica:
- cualquier cambio de negocio debe venir acompañado de actualización de pruebas.

## 10) Extensibilidad prevista
La arquitectura queda preparada para:

- nuevas estrategias de pago (p. ej. reducir cuota manteniendo plazo),
- más productos de crédito,
- persistencia/backend,
- comparación de escenarios avanzada.

Principio guía:
- extender por nuevos casos de uso y adaptadores, evitando reescribir el motor financiero central.
