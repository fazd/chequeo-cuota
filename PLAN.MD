# Chequeo de Cuota de Vivienda - Plan Tecnico MVP

## Objetivo

Construir una SPA que permita:

- Ingresar datos de un credito hipotecario.
- Calcular tabla de amortizacion bajo sistema frances (cuota fija).
- Comparar cuota teorica vs cuota del banco.
- Mostrar resumen financiero.
- Mostrar tabla completa.
- Mostrar graficas.
- Exportar tabla en CSV.

## Stack Tecnologico

- React
- Vite
- TypeScript
- TailwindCSS v4 (si se adopta en UI final)
- Recharts

## Alcance del MVP

### Incluido

- Sistema frances.
- Tasa efectiva anual (EA).
- Capitalizacion mensual.
- Moneda fija: COP.
- Comparacion con cuota del banco (con selector para indicar si incluye seguro).
- Exportacion CSV.

### No incluido

- Login.
- Backend.
- Persistencia.
- Abonos extraordinarios (solo arquitectura preparada).

## Setup del Proyecto

Comandos base:

```bash
npm create vite@latest chequeo-cuota -- --template react-ts
cd chequeo-cuota
npm install
npm install recharts
```

Nota Tailwind v4:

- Tailwind v4 no requiere `npx tailwindcss init -p` como flujo tradicional.
- Si se integra en este MVP, usar la guia actual de configuracion de Tailwind v4.

## Estructura de Carpetas

```text
src/
|- domain/
|  |- loan.types.ts
|  |- rate.ts
|  |- frenchAmortization.ts
|
|- application/
|  |- calculateProjection.ts
|  |- loanSummary.ts
|
|- presentation/
|  |- components/
|  |  |- LoanForm.tsx
|  |  |- SummaryCards.tsx
|  |  |- AmortizationTable.tsx
|  |  |- Charts.tsx
|  |  |- ExportCSVButton.tsx
|  |
|  |- pages/
|     |- Home.tsx
|
|- utils/
|  |- currency.ts
|  |- rounding.ts
|  |- csv.ts
|
|- App.tsx
|- main.tsx
```

## Reglas de Arquitectura

- `domain` no puede importar React.
- `application` no puede importar React.
- `presentation` si puede importar `application`.

## Modelos del Dominio

```ts
export interface LoanInput {
  principal: number
  annualEffectiveRate: number
  termMonths: number
  bankMonthlyPayment: number
  monthlyInsurance?: number
  bankPaymentIncludesInsurance: boolean
}

export interface AmortizationRow {
  month: number
  beginningBalance: number
  interest: number
  principalPayment: number
  insurance: number
  totalPayment: number
  endingBalance: number
}

export interface LoanProjection {
  schedule: AmortizationRow[]
  calculatedMonthlyPayment: number
  totalInterest: number
  totalPaid: number
  theoreticalInstallmentExInsurance: number
  theoreticalInstallmentInclInsurance: number
  bankInstallmentNormalized: number
  installmentDifference: number
  installmentDifferencePct: number
}

export interface ExtraPayment {
  month: number
  amount: number
}
```

## Logica Matematica

Conversion de tasa:

```ts
export function effectiveAnnualToMonthly(ea: number): number {
  return Math.pow(1 + ea, 1 / 12) - 1
}
```

Formula cuota sistema frances:

```text
C = P * [i * (1+i)^n] / [(1+i)^n - 1]
```

Algoritmo:

1. Convertir EA a tasa mensual.
2. Calcular cuota teorica.
3. Iterar mes a mes:
   - interes = saldo * tasa
   - capital = cuota - interes
   - saldo nuevo = saldo - capital
4. No redondear internamente.
5. Redondear solo en UI.
6. Ajustar ultimo mes para cerrar saldo a cero.

## Application Layer

### `calculateProjection.ts`

Debe:

- Convertir tasa.
- Calcular cuota.
- Generar tabla.
- Retornar `LoanProjection`.
- Exponer firma preparada para futuro:

```ts
calculateProjection(
  loanInput: LoanInput,
  extraPayments?: ExtraPayment[]
)
```

Sin implementar aun la logica de abonos extraordinarios.

### `loanSummary.ts`

Debe calcular:

- Diferencia cuota banco vs cuota teorica.
- Totales acumulados (interes, capital, seguros, total pagado).
- Porcentajes (interes/capital/seguros sobre total pagado).
- Bandera de alerta si diferencia > 1%.

## UI - Diseno Funcional

Layout:

1. Header.
2. Formulario.
3. Boton Calcular.
4. Summary Cards.
5. Graficas.
6. Tabla.
7. Boton Exportar.

### `LoanForm.tsx`

Campos:

- Saldo actual.
- Tasa efectiva anual (% humano, ej. `12`).
- Plazo restante (meses).
- Cuota mensual del banco.
- Seguro mensual (opcional, default `0`).
- Selector: "La cuota banco incluye seguro" (si/no).

Validaciones:

- `principal > 0`
- `termMonths > 0`
- `annualEffectiveRate > 0`
- `bankMonthlyPayment > 0`
- `monthlyInsurance >= 0`

### `SummaryCards.tsx`

Mostrar:

- Cuota teorica sin seguro.
- Cuota teorica con seguro.
- Cuota banco normalizada.
- Diferencia absoluta y porcentual.
- Total intereses.
- Total capital.
- Total seguros.
- Total pagado.
- Porcentajes.

Mostrar alerta si diferencia > 1%.

### `Charts.tsx`

Graficas con Recharts:

- `LineChart`: saldo vs mes.
- `BarChart`: capital vs interes.

### `AmortizationTable.tsx`

Columnas:

- Mes.
- Saldo inicial.
- Interes.
- Capital.
- Seguro.
- Pago total.
- Saldo final.

Tabla scrollable.

### `ExportCSVButton.tsx`

- Convertir `schedule` a CSV.
- Descargar archivo.
- Nombre: `amortizacion.csv`.

## Reglas de Precision

- No redondear internamente.
- Usar precision completa en calculos.
- Redondear solo al mostrar.
- Ajustar ultimo mes si es necesario.

## Caso de Prueba Obligatorio

Validar con caso de referencia:

- Principal: `200,000,000`
- Tasa: `12% EA`
- Plazo: `240 meses`
- Criterio: tolerancia maxima de `+- 1 COP` por fila y en totales.

## Criterios de Aceptacion

El MVP esta listo cuando:

- Cuota se calcula correctamente.
- Tabla cumple tolerancia del caso de referencia.
- Graficas funcionan.
- CSV descarga correctamente.
- Diferencia con cuota banco se muestra.
- No hay errores acumulados de redondeo relevantes.
- Existen pruebas unitarias del dominio financiero.

## Filosofia del Proyecto

Este proyecto debe:

- Tener dominio desacoplado.
- Ser facilmente extensible.
- Permitir agregar sin reescribir el motor financiero:
  - Abonos extraordinarios.
  - Comparacion de escenarios.
  - Backend.
  - Persistencia.
