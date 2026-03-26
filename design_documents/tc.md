# Tarjetas de Credito (TC) - Plan V1

## 1) Problema a resolver

Hoy la plataforma tiene calculadoras para credito hipotecario, vehicular y libranza, pero no tiene una categoria funcional para tarjetas de credito.

El problema principal es que un usuario puede tener varias tarjetas con condiciones distintas (tasa, cuota de manejo, seguros, cupo y pago minimo), y no tiene una vista clara para:

- Simular cada tarjeta de forma independiente.
- Consolidar su deuda total.
- Probar aportes por tarjeta o desde una vista global.
- Entender que tarjeta conviene pagar primero segun estrategia.

Este modulo debe ser independiente de las calculadoras actuales y mantener los principios vigentes del proyecto: frontend-only, stateless, sin autenticacion, sin persistencia financiera.

## 2) Objetivo funcional del modulo TC

Construir una nueva calculadora en la ruta de tarjeta de credito con:

- 1 a 5 tarjetas maximo, gestionadas por pestañas.
- Pestaña inicial por defecto: `TC 1`, editable por el usuario.
- Simulacion individual por tarjeta.
- Graficas por cada tarjeta (en su respectiva pestaña).
- Reporte consolidado de todas las tarjetas.
- Simulacion de aportes en tarjeta individual y desde consolidado.
- Reporte de recomendacion de pago con dos estrategias:
  - Bola de nieve.
  - Optimizacion de dinero.

## 3) Alcance V1 (decisiones cerradas)

- Maximo 5 tarjetas.
- Sin compras nuevas en la simulacion (solo deuda actual).
- Pago minimo modelado como monto fijo mensual (COP).
- Tipos de tasa soportados por tarjeta:
  - EA.
  - Nominal vencida anual.
- Si el pago minimo no cubre interes + cargos, la simulacion se permite pero con alerta de deuda creciente.
- Aporte global en consolidado con 2 modos:
  - Manual.
  - Automatico por estrategia.
- Si no se ingresa cupo total, se ocultan metricas de uso/liberacion de cupo.

## 4) Inputs por tarjeta (tab)

Cada tarjeta debe capturar:

- Nombre de la tarjeta (default `TC 1`, `TC 2`, etc., editable).
- Deuda actual.
- Tipo de tasa (`EA` o `Nominal vencida`) y valor (%).
- Pago minimo mensual.
- Cuota de manejo:
  - Si/No.
  - Valor mensual si aplica.
- Seguros:
  - Si/No.
  - Valor mensual si aplica.
- Cupo total (opcional).
- Aportes de la tarjeta (simulacion individual):
  - Periodicos.
  - Extraordinarios por mes.

## 5) Modelo de calculo (como se hara)

### 5.1 Motor mensual por tarjeta

Para cada mes:

1. Convertir tasa a tasa mensual segun tipo.
2. Calcular interes del mes sobre deuda inicial.
3. Sumar cargos fijos del mes:
   - Cuota de manejo (si aplica).
   - Seguros (si aplica).
4. Aplicar pago minimo + aporte extra (si existe).
5. Calcular deuda final del mes.
6. Si el pago supera deuda + cargos del mes, ajustar ultimo pago para cerrar saldo en cero.

Resultado por fila mensual:

- Mes.
- Deuda inicial.
- Interes.
- Cuota de manejo.
- Seguro.
- Pago minimo.
- Aporte extra.
- Pago total.
- Variacion de principal (puede ser negativa si hay deuda creciente).
- Deuda final.
- Uso/liberacion de cupo (si hay cupo definido).

### 5.2 Baseline vs simulado

Se deben construir dos escenarios por tarjeta:

- `baselineSchedule`: solo pago minimo.
- `schedule`: pago minimo + aportes.

Esto permite calcular:

- Ahorro de intereses.
- Reduccion de tiempo (si aplica).
- Alertas de no convergencia.

### 5.3 Regla de estabilidad

Para evitar simulaciones infinitas cuando la deuda no baja, definir un tope de horizonte de simulacion (ejemplo recomendado: 600 meses) y marcar alerta: "No se cancela en el horizonte de simulacion".

## 6) Consolidado de multiples tarjetas

Si existen 2 o mas tarjetas, habilitar vista consolidada con:

- Deuda total.
- Total pagado proyectado.
- Intereses totales.
- Total cuota de manejo.
- Total seguros.
- Ahorro total por aportes vs baseline.

Regla de navegacion V1 del consolidado:

- El consolidado sera un tab fijo dentro del mismo modulo TC (no pagina aparte).

### 6.1 Graficas consolidado

Mostrar evolucion de deuda por tarjeta (hasta 5 lineas, porque el maximo es 5 tarjetas) y tendencia de deuda total.

### 6.2 Aportes desde consolidado

Soportar:

- Modo manual: usuario define aporte por tarjeta.
- Modo automatico: usuario define un aporte global y el sistema lo asigna segun estrategia activa.

## 7) Reporte "Que tarjeta pagar primero"

El modulo debe exponer dos ordenes de prioridad:

### 7.1 Estrategia Bola de nieve

- Prioriza la tarjeta con menor deuda actual.
- Al cerrarla, mueve el esfuerzo de pago a la siguiente menor.

### 7.2 Estrategia Optimizacion de dinero

- Prioriza por mayor costo efectivo mensual.
- Definicion de score:

`score = tasaMensual + ((cuotaManejoMensual + seguroMensual) / max(deudaActual, 1))`

- A mayor score, mayor prioridad.
- En empate, priorizar mayor deuda actual.

Salida esperada del reporte:

- Ranking completo de tarjetas por estrategia.
- Tarjeta objetivo actual sugerida.
- Comparativo baseline vs estrategia.

## 8) UI/UX (como se vera la interfaz)

### 8.1 Pantalla principal TC

- Hero y estructura visual alineados con las calculadoras actuales.
- Barra de pestañas:
  - Crear tarjeta (hasta 5).
  - Cambiar de pestaña.
  - Renombrar pestaña.
  - Tab fijo adicional: `Consolidado`.
- Formulario de la tarjeta activa.
- Bloque de resultados de la tarjeta activa.
- Graficas de la tarjeta activa visibles dentro de su pestaña.

### 8.2 Cards de resultados (reusar patron actual)

Mantener look-and-feel de cards existentes y agregar tarjetas especificas de TC:

- Cuota de manejo pagada.
- Cupo usado (si hay cupo).
- Cupo liberado (si hay cupo).

### 8.3 Reporte consolidado

- Tab dedicado `Consolidado` para todas las tarjetas (en la misma pagina TC).
- Resumen global + graficas + controles de aporte global.
- Modulo de recomendacion de estrategia visible en la misma vista.

### 8.4 Mobile

Respetar reglas vigentes de mobile:

- Tooltips compactos dentro del contenedor.
- Cierre de tooltip al hacer scroll o tap fuera.
- Sin tooltips tipo modal/fullscreen.
- Cerrar teclado en scroll real (blur), no inmediatamente al focus.

## 9) Contratos propuestos (arquitectura)

Agregar modulo de dominio/aplicacion para TC con tipos dedicados, separados de hipotecario:

- `CreditCardInput`
- `CreditCardMonthRow`
- `CreditCardProjection`
- `PortfolioInput`
- `PortfolioProjection`
- `StrategyReport`

Regla de capas:

- `domain/tc` sin React.
- `application/tc` sin React.
- `presentation` consume `application/tc`.

## 10) Integraciones del sistema actual

- Activar calculadora `tarjeta-credito` en `src/domain/calculators/registry.ts`.
- Agregar ruta y pagina en router para `/calculadora-tarjeta-credito`.
- Agregar metadata SEO para la nueva ruta.
- Reutilizar analytics permitido sin PII:
  - `calculo_realizado`
  - `csv_exportado`

## 11) Pruebas y aceptacion tecnica

Regla global de calidad:

- Este modulo y sus evoluciones se desarrollan con TDD como politica por defecto.
- Todo cambio de negocio debe seguir ciclo `Red -> Green -> Refactor`.
- No se acepta PR de logica financiera sin pruebas nuevas o actualizadas.

### 11.1 Dominio

- Conversion de tasa para EA y nominal vencida.
- Caso con y sin cuota de manejo.
- Caso con y sin seguros.
- Caso de pago insuficiente con alerta de deuda creciente.
- Cierre correcto de saldo en ultimo mes.
- Metricas de cupo cuando hay cupo total.
- Pruebas de regresion con casos numericos fijos (fixtures) para validar totales:
  - Total interes.
  - Total cuota de manejo.
  - Total seguros.
  - Total pagado.
  - Mes de finalizacion (o alerta de no convergencia).
- Verificacion de precision:
  - Sin redondeo interno en motor de calculo.
  - Redondeo solo en presentacion y exportacion.

### 11.2 Aplicacion

- Consolidado suma correctamente todas las tarjetas.
- Aportes manuales y automaticos producen resultado esperado.
- Ranking de estrategias consistente con reglas.
- Pruebas de integracion de escenarios multi-tarjeta:
  - 1 tarjeta, 2 tarjetas y 5 tarjetas.
  - Comparativo baseline vs simulado por tarjeta y consolidado.
  - Asignacion de aporte global automatico segun estrategia activa.

### 11.3 Presentacion

- Flujo de tabs: crear, cambiar, renombrar, limite maximo 5.
- Cada tab de tarjeta renderiza sus graficas correspondientes.
- Tab `Consolidado` visible y navegable sin salir de la pagina TC.
- Render condicional de metricas de cupo.
- Vista consolidada visible cuando hay mas de 1 tarjeta.
- Pruebas de UI para estado vacio, estado con resultados y alertas de deuda creciente.

### 11.4 Criterio de aceptacion

La V1 se considera lista cuando:

- Se pueden simular 1..5 tarjetas.
- Funciona simulacion individual y consolidada.
- Funciona aporte por tarjeta y aporte global.
- Se muestran recomendaciones de pago por las dos estrategias.
- Se mantienen reglas de precision (sin redondeo interno, redondeo solo en presentacion/exportacion).
- Existe suite automatizada que cubre calculos clave del dominio y escenarios criticos de aplicacion.
- Todo cambio de logica financiera nuevo entra con TDD (test primero) y deja pruebas de regresion.

## 12) No alcance V1

- Compras nuevas recurrentes.
- Integracion bancaria o importacion automatica de extractos.
- Persistencia de escenarios entre sesiones.
- Backend/autenticacion.

## 13) Preguntas abiertas

- En la UI V1 actual, el aporte por tarjeta se implemento como aporte mensual fijo por tarjeta. Confirmar si deseas habilitar en esta iteracion el formulario completo de aportes extraordinarios por mes dentro de cada tab.
- Confirmar si el consolidado debe incluir tambien tabla mensual detallada completa (ademas de resumen + estrategia + grafica), o si ese nivel de detalle se dejara para la siguiente iteracion.
