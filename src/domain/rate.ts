export function effectiveAnnualToMonthly(effectiveAnnualRate: number): number {
  if (effectiveAnnualRate < 0) {
    throw new Error('effectiveAnnualRate must be >= 0')
  }

  return Math.pow(1 + effectiveAnnualRate, 1 / 12) - 1
}
