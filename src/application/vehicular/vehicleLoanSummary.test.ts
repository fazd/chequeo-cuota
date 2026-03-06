import { describe, expect, it } from 'vitest'
import { calculateVehicleProjection } from './calculateVehicleProjection'
import { buildVehicleLoanSummary } from './vehicleLoanSummary'

describe('buildVehicleLoanSummary', () => {
  it('construye metricas y alerta cuando aplica diferencia > 1%', () => {
    const projection = calculateVehicleProjection({
      principal: 90_000_000,
      annualEffectiveRate: 0.16,
      termMonths: 72,
      bankMonthlyPayment: 3_000_000,
    })

    const summary = buildVehicleLoanSummary(projection)

    expect(summary.totalPaid).toBeGreaterThan(0)
    expect(summary.totalInterest).toBeGreaterThan(0)
    expect(summary.alertDifferenceAbove1Pct).toBe(true)
  })
})
