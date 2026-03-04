import { describe, expect, it } from 'vitest'
import { effectiveAnnualToMonthly } from './rate'

describe('effectiveAnnualToMonthly', () => {
  it('converts 12% EA into monthly equivalent', () => {
    const result = effectiveAnnualToMonthly(0.12)
    expect(result).toBeCloseTo(0.00948879, 8)
  })

  it('returns 0 when EA is 0', () => {
    expect(effectiveAnnualToMonthly(0)).toBe(0)
  })
})
