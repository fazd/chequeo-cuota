import type { AmortizationRow, ConstantExtraPayment, ExtraPayment } from './loan.types'

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
  monthlyBaseInsurance: number
  monthlyLifeInsuranceRate: number
  constantExtraPayment?: ConstantExtraPayment
  extraordinaryExtraPayments?: ExtraPayment[]
}

export function buildFrenchAmortizationSchedule(
  params: BuildScheduleParams,
): AmortizationRow[] {
  const {
    principal,
    monthlyRate,
    termMonths,
    installmentExInsurance,
    monthlyBaseInsurance,
    monthlyLifeInsuranceRate,
    constantExtraPayment,
    extraordinaryExtraPayments = [],
  } = params

  if (monthlyBaseInsurance < 0) {
    throw new Error('monthlyBaseInsurance must be >= 0')
  }
  if (monthlyLifeInsuranceRate < 0) {
    throw new Error('monthlyLifeInsuranceRate must be >= 0')
  }

  const rows: AmortizationRow[] = []
  const extraPaymentMap = buildExtraPaymentMap(
    termMonths,
    constantExtraPayment,
    extraordinaryExtraPayments,
  )
  let balance = principal

  for (let month = 1; month <= termMonths && balance > 0.000001; month += 1) {
    const beginningBalance = balance
    const lifeInsurance = beginningBalance * monthlyLifeInsuranceRate
    const insurance = monthlyBaseInsurance + lifeInsurance
    const interest = beginningBalance * monthlyRate
    const plannedExtraPayment = extraPaymentMap.get(month) ?? 0

    let principalWithoutExtra = installmentExInsurance - interest
    if (principalWithoutExtra <= 0) {
      throw new Error(
        'installmentExInsurance must be greater than monthly interest to amortize principal',
      )
    }
    if (principalWithoutExtra > beginningBalance) {
      principalWithoutExtra = beginningBalance
    }

    let endingBalance = beginningBalance - principalWithoutExtra
    let extraPayment = Math.min(plannedExtraPayment, Math.max(0, endingBalance))
    endingBalance -= extraPayment
    if (endingBalance < 0.01) {
      extraPayment += endingBalance
      endingBalance = 0
    }

    const principalPayment = principalWithoutExtra + extraPayment
    const paymentExInsurance = interest + principalPayment
    const totalPayment = paymentExInsurance + insurance

    rows.push({
      month,
      beginningBalance,
      interest,
      principalPayment,
      extraPayment,
      baseInsurance: monthlyBaseInsurance,
      lifeInsurance,
      insurance,
      totalPayment,
      endingBalance,
    })

    balance = endingBalance
  }

  return rows
}

function buildExtraPaymentMap(
  termMonths: number,
  constantExtraPayment?: ConstantExtraPayment,
  extraordinaryExtraPayments: ExtraPayment[] = [],
): Map<number, number> {
  const map = new Map<number, number>()

  if (
    constantExtraPayment &&
    constantExtraPayment.amount > 0 &&
    constantExtraPayment.everyNMonths > 0
  ) {
    const maxOccurrences = constantExtraPayment.occurrences ?? Infinity
    let count = 0
    for (
      let month = constantExtraPayment.everyNMonths;
      month <= termMonths && count < maxOccurrences;
      month += constantExtraPayment.everyNMonths
    ) {
      map.set(month, (map.get(month) ?? 0) + constantExtraPayment.amount)
      count++
    }
  }

  extraordinaryExtraPayments
    .filter((item) => item.month >= 1 && item.month <= termMonths && item.amount > 0)
    .forEach((item) => {
      map.set(item.month, (map.get(item.month) ?? 0) + item.amount)
    })

  return map
}
