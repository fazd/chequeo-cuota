import {
  buildFrenchAmortizationSchedule,
  calculateFrenchInstallment,
} from '../../domain/frenchAmortization'
import { effectiveAnnualToMonthly } from '../../domain/rate'
import type {
  ExtraPayment,
  PayrollLoanInput,
  PayrollLoanProjection,
} from '../../domain/libranza/loan.types'

export function calculatePayrollProjection(
  loanInput: PayrollLoanInput,
  extraPayments?: ExtraPayment[],
): PayrollLoanProjection {
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
    monthlyBaseInsurance: 0,
    monthlyLifeInsuranceRate: 0,
  })

  const schedule = buildFrenchAmortizationSchedule({
    principal: loanInput.principal,
    monthlyRate,
    termMonths: loanInput.termMonths,
    installmentExInsurance,
    monthlyBaseInsurance: 0,
    monthlyLifeInsuranceRate: 0,
    constantExtraPayment: loanInput.constantExtraPayment,
    extraordinaryExtraPayments: mergedExtraordinaryPayments,
  })

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0)
  const totalPaid = schedule.reduce((sum, row) => sum + row.totalPayment, 0)
  const baselineTotalInterest = baselineSchedule.reduce(
    (sum, row) => sum + row.interest,
    0,
  )

  const bankComparisonAvailable =
    typeof loanInput.bankMonthlyPayment === 'number' &&
    Number.isFinite(loanInput.bankMonthlyPayment) &&
    loanInput.bankMonthlyPayment > 0

  const bankInstallmentNormalized = bankComparisonAvailable
    ? loanInput.bankMonthlyPayment!
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
    theoreticalInstallmentInclInsurance: installmentExInsurance,
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
