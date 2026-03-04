import {
  buildFrenchAmortizationSchedule,
  calculateFrenchInstallment,
} from '../domain/frenchAmortization'
import type {
  ExtraPayment,
  LoanInput,
  LoanProjection,
} from '../domain/loan.types'
import { effectiveAnnualToMonthly } from '../domain/rate'

export function calculateProjection(
  loanInput: LoanInput,
  extraPayments?: ExtraPayment[],
): LoanProjection {
  const monthlyInsurance = loanInput.monthlyInsurance ?? 0
  const monthlyRate = effectiveAnnualToMonthly(loanInput.annualEffectiveRate)

  const installmentExInsurance = calculateFrenchInstallment(
    loanInput.principal,
    monthlyRate,
    loanInput.termMonths,
  )

  // TODO: integrate extraPayments once extraordinary prepayments are enabled.
  void extraPayments

  const schedule = buildFrenchAmortizationSchedule({
    principal: loanInput.principal,
    monthlyRate,
    termMonths: loanInput.termMonths,
    installmentExInsurance,
    monthlyInsurance,
  })

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0)
  const totalPaid = schedule.reduce((sum, row) => sum + row.totalPayment, 0)
  const theoreticalInstallmentInclInsurance =
    installmentExInsurance + monthlyInsurance

  const bankInstallmentNormalized = loanInput.bankPaymentIncludesInsurance
    ? loanInput.bankMonthlyPayment - monthlyInsurance
    : loanInput.bankMonthlyPayment
  const installmentDifference =
    bankInstallmentNormalized - installmentExInsurance
  const installmentDifferencePct =
    installmentExInsurance === 0
      ? 0
      : (installmentDifference / installmentExInsurance) * 100

  return {
    schedule,
    calculatedMonthlyPayment: installmentExInsurance,
    totalInterest,
    totalPaid,
    theoreticalInstallmentExInsurance: installmentExInsurance,
    theoreticalInstallmentInclInsurance,
    bankInstallmentNormalized,
    installmentDifference,
    installmentDifferencePct,
  }
}
