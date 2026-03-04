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
