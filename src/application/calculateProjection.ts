import {
  buildFrenchAmortizationSchedule,
  calculateFrenchInstallment,
} from '../domain/frenchAmortization'
import type { ExtraPayment, LoanInput, LoanProjection } from '../domain/loan.types'
import { effectiveAnnualToMonthly } from '../domain/rate'

export function calculateProjection(
  loanInput: LoanInput,
  extraPayments?: ExtraPayment[],
): LoanProjection {
  const monthlyBaseInsurance = loanInput.monthlyInsurance ?? 0
  const monthlyLifeInsuranceRate = loanInput.monthlyLifeInsuranceRate ?? 0
  const monthlyRate = effectiveAnnualToMonthly(loanInput.annualEffectiveRate)

  const installmentExInsurance = calculateFrenchInstallment(
    loanInput.principal,
    monthlyRate,
    loanInput.termMonths,
  )

  const mergedExtraordinaryPayments = [
    ...(loanInput.extraordinaryExtraPayments ?? []),
    ...(extraPayments ?? []),
  ]

  const baselineSchedule = buildFrenchAmortizationSchedule({
    principal: loanInput.principal,
    monthlyRate,
    termMonths: loanInput.termMonths,
    installmentExInsurance,
    monthlyBaseInsurance,
    monthlyLifeInsuranceRate,
  })

  const schedule = buildFrenchAmortizationSchedule({
    principal: loanInput.principal,
    monthlyRate,
    termMonths: loanInput.termMonths,
    installmentExInsurance,
    monthlyBaseInsurance,
    monthlyLifeInsuranceRate,
    constantExtraPayment: loanInput.constantExtraPayment,
    extraordinaryExtraPayments: mergedExtraordinaryPayments,
  })

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0)
  const totalPaid = schedule.reduce((sum, row) => sum + row.totalPayment, 0)
  const baselineTotalInterest = baselineSchedule.reduce(
    (sum, row) => sum + row.interest,
    0,
  )
  const firstMonthLifeInsurance = loanInput.principal * monthlyLifeInsuranceRate
  const theoreticalInstallmentInclInsurance =
    installmentExInsurance + monthlyBaseInsurance + firstMonthLifeInsurance

  const bankComparisonAvailable =
    typeof loanInput.bankMonthlyPayment === 'number' &&
    Number.isFinite(loanInput.bankMonthlyPayment) &&
    loanInput.bankMonthlyPayment > 0

  const bankInstallmentNormalized = bankComparisonAvailable
    ? loanInput.bankPaymentIncludesInsurance
      ? loanInput.bankMonthlyPayment! - (monthlyBaseInsurance + firstMonthLifeInsurance)
      : loanInput.bankMonthlyPayment!
    : 0
  const installmentDifference = bankComparisonAvailable
    ? bankInstallmentNormalized - installmentExInsurance
    : 0
  const installmentDifferencePct =
    bankComparisonAvailable && installmentExInsurance !== 0
      ? (installmentDifference / installmentExInsurance) * 100
      : 0
  const originalTermMonths = baselineSchedule.length
  const resultingTermMonths = schedule.length

  return {
    schedule,
    baselineSchedule,
    calculatedMonthlyPayment: installmentExInsurance,
    totalInterest,
    totalPaid,
    theoreticalInstallmentExInsurance: installmentExInsurance,
    theoreticalInstallmentInclInsurance,
    bankComparisonAvailable,
    bankInstallmentNormalized,
    installmentDifference,
    installmentDifferencePct,
    originalTermMonths,
    resultingTermMonths,
    monthsReduced: Math.max(0, originalTermMonths - resultingTermMonths),
    interestSavingsFromPrepayments: Math.max(0, baselineTotalInterest - totalInterest),
  }
}


