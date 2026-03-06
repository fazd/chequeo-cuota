export interface VehicleLoanInput {
  principal: number
  annualEffectiveRate: number
  termMonths: number
  bankMonthlyPayment?: number
  constantExtraPayment?: ConstantExtraPayment
  extraordinaryExtraPayments?: ExtraPayment[]
}

export interface VehicleAmortizationRow {
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

export interface VehicleLoanProjection {
  schedule: VehicleAmortizationRow[]
  baselineSchedule: VehicleAmortizationRow[]
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
