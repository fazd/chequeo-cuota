export interface PayrollLoanInput {
  principal: number
  annualEffectiveRate: number
  termMonths: number
  bankMonthlyPayment?: number
  monthlyInsurance?: number
  monthlyLifeInsuranceRate?: number
  bankPaymentIncludesInsurance?: boolean
  constantExtraPayment?: ConstantExtraPayment
  extraordinaryExtraPayments?: ExtraPayment[]
}

export interface PayrollAmortizationRow {
  month: number
  beginningBalance: number
  interest: number
  principalPayment: number
  extraPayment: number
  baseInsurance: number
  lifeInsurance: number
  insurance: number
  totalPayment: number
  endingBalance: number
}

export interface PayrollLoanProjection {
  schedule: PayrollAmortizationRow[]
  baselineSchedule: PayrollAmortizationRow[]
  calculatedMonthlyPayment: number
  totalInterest: number
  totalPaid: number
  theoreticalInstallmentExInsurance: number
  theoreticalInstallmentInclInsurance: number
  bankComparisonAvailable: boolean
  bankInstallmentNormalized: number
  installmentDifference: number
  installmentDifferencePct: number
  originalTermMonths: number
  resultingTermMonths: number
  monthsReduced: number
  interestSavingsFromPrepayments: number
}

export interface ExtraPayment {
  month: number
  amount: number
}

export interface ConstantExtraPayment {
  amount: number
  everyNMonths: number
}
