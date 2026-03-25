export type CreditCardRateType = 'effectiveAnnual' | 'nominalDue'

export interface CreditCardExtraPayment {
  month: number
  amount: number
}

export interface CreditCardConstantExtraPayment {
  amount: number
  everyNMonths: number
  occurrences?: number
}

export interface CreditCardInput {
  id: string
  name: string
  currentDebt: number
  termMonths: number
  rateType: CreditCardRateType
  rateValuePct: number
  minimumPaymentAmount?: number
  hasHandlingFee: boolean
  monthlyHandlingFee?: number
  hasInsurance: boolean
  monthlyInsurance?: number
  creditLimit?: number
  constantExtraPayment?: CreditCardConstantExtraPayment
  extraordinaryExtraPayments?: CreditCardExtraPayment[]
}

export interface CreditCardMonthRow {
  month: number
  beginningDebt: number
  interest: number
  handlingFee: number
  insurance: number
  minimumPayment: number
  extraPayment: number
  totalPayment: number
  principalDelta: number
  endingDebt: number
  usedLimitAmount?: number
  usedLimitPct?: number
  releasedLimitAmount?: number
}

export interface CreditCardProjectionAlerts {
  hasNegativeAmortization: boolean
  noPayoffWithinHorizon: boolean
  baselineNoPayoffWithinHorizon: boolean
  minimumPaymentDifferenceAbove1Pct: boolean
}

export interface CreditCardMinimumPaymentComparison {
  theoreticalMinimumPayment: number
  reportedMinimumPayment: number | null
  comparisonAvailable: boolean
  difference: number
  differencePct: number
}

export interface CreditCardProjection {
  cardId: string
  cardName: string
  schedule: CreditCardMonthRow[]
  baselineSchedule: CreditCardMonthRow[]
  totalInterest: number
  totalHandlingFee: number
  totalInsurance: number
  totalPaid: number
  totalMinimumPaid: number
  totalExtraPaid: number
  monthsToPayoff: number | null
  baselineMonthsToPayoff: number | null
  monthsReduced: number
  interestSavingsFromPrepayments: number
  minimumPaymentComparison: CreditCardMinimumPaymentComparison
  alerts: CreditCardProjectionAlerts
}

export interface SimulateCreditCardOptions {
  maxMonths?: number
  additionalMonthlyExtra?: number
}
