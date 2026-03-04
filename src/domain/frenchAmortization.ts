import type { AmortizationRow } from './loan.types'

export function calculateFrenchInstallment(
  principal: number,
  monthlyRate: number,
  termMonths: number,
): number {
  if (principal <= 0) {
    throw new Error('principal must be > 0')
  }
  if (termMonths <= 0) {
    throw new Error('termMonths must be > 0')
  }
  if (monthlyRate < 0) {
    throw new Error('monthlyRate must be >= 0')
  }

  if (monthlyRate === 0) {
    return principal / termMonths
  }

  const factor = Math.pow(1 + monthlyRate, termMonths)
  return (principal * monthlyRate * factor) / (factor - 1)
}

export interface BuildScheduleParams {
  principal: number
  monthlyRate: number
  termMonths: number
  installmentExInsurance: number
  monthlyInsurance: number
}

export function buildFrenchAmortizationSchedule(
  params: BuildScheduleParams,
): AmortizationRow[] {
  const {
    principal,
    monthlyRate,
    termMonths,
    installmentExInsurance,
    monthlyInsurance,
  } = params

  if (monthlyInsurance < 0) {
    throw new Error('monthlyInsurance must be >= 0')
  }

  const rows: AmortizationRow[] = []
  let balance = principal

  for (let month = 1; month <= termMonths; month += 1) {
    const beginningBalance = balance
    const interest = beginningBalance * monthlyRate

    let principalPayment = installmentExInsurance - interest
    let endingBalance = beginningBalance - principalPayment

    const isLastMonth = month === termMonths
    if (isLastMonth || endingBalance < 0.01) {
      principalPayment = beginningBalance
      endingBalance = 0
    }

    const paymentExInsurance = principalPayment + interest
    const totalPayment = paymentExInsurance + monthlyInsurance

    rows.push({
      month,
      beginningBalance,
      interest,
      principalPayment,
      insurance: monthlyInsurance,
      totalPayment,
      endingBalance,
    })

    balance = endingBalance
  }

  return rows
}
