import { effectiveAnnualToMonthly } from '../rate'
import { calculateFrenchInstallment } from '../frenchAmortization'
import type {
  CreditCardConstantExtraPayment,
  CreditCardExtraPayment,
  CreditCardInput,
  CreditCardMonthRow,
  CreditCardProjection,
  SimulateCreditCardOptions,
} from './loan.types'

const EPSILON = 0.000001
const DEFAULT_MAX_MONTHS = 600

interface ScenarioResult {
  schedule: CreditCardMonthRow[]
  totalInterest: number
  totalHandlingFee: number
  totalInsurance: number
  totalPaid: number
  totalMinimumPaid: number
  totalExtraPaid: number
  monthsToPayoff: number | null
  hasNegativeAmortization: boolean
  noPayoffWithinHorizon: boolean
}

export function toMonthlyRate(rateType: CreditCardInput['rateType'], rateValuePct: number): number {
  const decimalRate = rateValuePct / 100
  if (!Number.isFinite(decimalRate) || decimalRate < 0) {
    throw new Error('rateValuePct must be >= 0')
  }

  if (rateType === 'nominalDue') {
    return decimalRate / 12
  }

  return effectiveAnnualToMonthly(decimalRate)
}

export function calculateAutoMinimumPayment(card: CreditCardInput): number {
  const monthlyRate = toMonthlyRate(card.rateType, card.rateValuePct)
  const installment = calculateFrenchInstallment(
    card.currentDebt,
    monthlyRate,
    card.termMonths,
  )
  const monthlyCharges =
    (card.hasHandlingFee ? card.monthlyHandlingFee ?? 0 : 0) +
    (card.hasInsurance ? card.monthlyInsurance ?? 0 : 0)

  return installment + monthlyCharges
}

export function simulateCreditCard(
  card: CreditCardInput,
  options: SimulateCreditCardOptions = {},
): CreditCardProjection {
  validateCardInput(card)

  const theoreticalMinimumPayment = calculateAutoMinimumPayment(card)
  const reportedMinimumPayment = card.minimumPaymentAmount ?? null
  const comparisonAvailable = reportedMinimumPayment != null
  const difference = comparisonAvailable
    ? reportedMinimumPayment - theoreticalMinimumPayment
    : 0
  const differencePct =
    comparisonAvailable && theoreticalMinimumPayment !== 0
      ? (difference / theoreticalMinimumPayment) * 100
      : 0

  const resolvedCard = {
    ...card,
    minimumPaymentAmount: resolveMinimumPaymentAmount(card),
  }

  const maxMonths = options.maxMonths ?? card.termMonths ?? DEFAULT_MAX_MONTHS
  if (!Number.isInteger(maxMonths) || maxMonths <= 0) {
    throw new Error('maxMonths must be an integer > 0')
  }

  const baseline = simulateScenario(resolvedCard, {
    maxMonths,
    includeExtras: false,
    additionalMonthlyExtra: 0,
  })
  const scenario = simulateScenario(resolvedCard, {
    maxMonths,
    includeExtras: true,
    additionalMonthlyExtra: options.additionalMonthlyExtra ?? 0,
  })

  const monthsReduced =
    baseline.monthsToPayoff != null && scenario.monthsToPayoff != null
      ? Math.max(0, baseline.monthsToPayoff - scenario.monthsToPayoff)
      : 0

  return {
    cardId: card.id,
    cardName: card.name,
    schedule: scenario.schedule,
    baselineSchedule: baseline.schedule,
    totalInterest: scenario.totalInterest,
    totalHandlingFee: scenario.totalHandlingFee,
    totalInsurance: scenario.totalInsurance,
    totalPaid: scenario.totalPaid,
    totalMinimumPaid: scenario.totalMinimumPaid,
    totalExtraPaid: scenario.totalExtraPaid,
    monthsToPayoff: scenario.monthsToPayoff,
    baselineMonthsToPayoff: baseline.monthsToPayoff,
    monthsReduced,
    interestSavingsFromPrepayments: Math.max(
      0,
      baseline.totalInterest - scenario.totalInterest,
    ),
    minimumPaymentComparison: {
      theoreticalMinimumPayment,
      reportedMinimumPayment,
      comparisonAvailable,
      difference,
      differencePct,
    },
    alerts: {
      hasNegativeAmortization: scenario.hasNegativeAmortization,
      noPayoffWithinHorizon: scenario.noPayoffWithinHorizon,
      baselineNoPayoffWithinHorizon: baseline.noPayoffWithinHorizon,
      minimumPaymentDifferenceAbove1Pct:
        comparisonAvailable && Math.abs(differencePct) > 1,
    },
  }
}

interface SimulateScenarioOptions {
  maxMonths: number
  includeExtras: boolean
  additionalMonthlyExtra: number
}

function simulateScenario(
  card: CreditCardInput,
  options: SimulateScenarioOptions,
): ScenarioResult {
  const monthlyRate = toMonthlyRate(card.rateType, card.rateValuePct)
  const monthlyHandlingFee = card.hasHandlingFee ? card.monthlyHandlingFee ?? 0 : 0
  const monthlyInsurance = card.hasInsurance ? card.monthlyInsurance ?? 0 : 0
  const extraPaymentMap = options.includeExtras
    ? buildExtraPaymentMap(
        options.maxMonths,
        card.constantExtraPayment,
        card.extraordinaryExtraPayments ?? [],
      )
    : new Map<number, number>()

  if (options.additionalMonthlyExtra < 0) {
    throw new Error('additionalMonthlyExtra must be >= 0')
  }

  let balance = card.currentDebt
  const rows: CreditCardMonthRow[] = []
  let hasNegativeAmortization = false

  for (let month = 1; month <= options.maxMonths && balance > EPSILON; month += 1) {
    const beginningDebt = balance
    const interest = beginningDebt * monthlyRate
    const handlingFee = monthlyHandlingFee
    const insurance = monthlyInsurance
    const extraPaymentPlan =
      (extraPaymentMap.get(month) ?? 0) + options.additionalMonthlyExtra
    const minimumPlan = card.minimumPaymentAmount ?? 0

    const monthlyCharges = interest + handlingFee + insurance
    const plannedTotalPayment = minimumPlan + extraPaymentPlan
    const payoffTarget = beginningDebt + monthlyCharges

    let totalPayment = plannedTotalPayment
    if (totalPayment > payoffTarget) {
      totalPayment = payoffTarget
    }

    const minimumPayment = Math.min(minimumPlan, totalPayment)
    const extraPayment = Math.max(0, totalPayment - minimumPayment)
    let endingDebt = beginningDebt + monthlyCharges - totalPayment

    if (Math.abs(endingDebt) < EPSILON) {
      endingDebt = 0
    }

    const principalDelta = beginningDebt - endingDebt
    if (principalDelta < -EPSILON) {
      hasNegativeAmortization = true
    }

    const row = buildMonthRow(
      card.creditLimit,
      month,
      beginningDebt,
      interest,
      handlingFee,
      insurance,
      minimumPayment,
      extraPayment,
      totalPayment,
      principalDelta,
      endingDebt,
    )

    rows.push(row)
    balance = endingDebt
  }

  const noPayoffWithinHorizon = balance > EPSILON
  const totals = computeTotals(rows)

  return {
    schedule: rows,
    totalInterest: totals.totalInterest,
    totalHandlingFee: totals.totalHandlingFee,
    totalInsurance: totals.totalInsurance,
    totalPaid: totals.totalPaid,
    totalMinimumPaid: totals.totalMinimumPaid,
    totalExtraPaid: totals.totalExtraPaid,
    monthsToPayoff: noPayoffWithinHorizon ? null : rows.length,
    hasNegativeAmortization,
    noPayoffWithinHorizon,
  }
}

function computeTotals(rows: CreditCardMonthRow[]) {
  return rows.reduce(
    (acc, row) => ({
      totalInterest: acc.totalInterest + row.interest,
      totalHandlingFee: acc.totalHandlingFee + row.handlingFee,
      totalInsurance: acc.totalInsurance + row.insurance,
      totalPaid: acc.totalPaid + row.totalPayment,
      totalMinimumPaid: acc.totalMinimumPaid + row.minimumPayment,
      totalExtraPaid: acc.totalExtraPaid + row.extraPayment,
    }),
    {
      totalInterest: 0,
      totalHandlingFee: 0,
      totalInsurance: 0,
      totalPaid: 0,
      totalMinimumPaid: 0,
      totalExtraPaid: 0,
    },
  )
}

function validateCardInput(card: CreditCardInput): void {
  if (card.id.trim() === '') {
    throw new Error('id is required')
  }
  if (card.name.trim() === '') {
    throw new Error('name is required')
  }
  if (!Number.isFinite(card.currentDebt) || card.currentDebt <= 0) {
    throw new Error('currentDebt must be > 0')
  }
  if (!Number.isInteger(card.termMonths) || card.termMonths <= 0) {
    throw new Error('termMonths must be an integer > 0')
  }
  if (
    card.minimumPaymentAmount != null &&
    (!Number.isFinite(card.minimumPaymentAmount) || card.minimumPaymentAmount <= 0)
  ) {
    throw new Error('minimumPaymentAmount must be > 0 when provided')
  }

  if (card.hasHandlingFee) {
    if (!Number.isFinite(card.monthlyHandlingFee) || (card.monthlyHandlingFee ?? 0) < 0) {
      throw new Error('monthlyHandlingFee must be >= 0 when hasHandlingFee is true')
    }
  }

  if (card.hasInsurance) {
    if (!Number.isFinite(card.monthlyInsurance) || (card.monthlyInsurance ?? 0) < 0) {
      throw new Error('monthlyInsurance must be >= 0 when hasInsurance is true')
    }
  }

  if (card.creditLimit != null) {
    if (!Number.isFinite(card.creditLimit) || card.creditLimit <= 0) {
      throw new Error('creditLimit must be > 0 when provided')
    }
  }
}

function resolveMinimumPaymentAmount(card: CreditCardInput): number {
  if (card.minimumPaymentAmount != null) {
    return card.minimumPaymentAmount
  }
  return calculateAutoMinimumPayment(card)
}

function buildMonthRow(
  creditLimit: number | undefined,
  month: number,
  beginningDebt: number,
  interest: number,
  handlingFee: number,
  insurance: number,
  minimumPayment: number,
  extraPayment: number,
  totalPayment: number,
  principalDelta: number,
  endingDebt: number,
): CreditCardMonthRow {
  if (creditLimit == null || !Number.isFinite(creditLimit) || creditLimit <= 0) {
    return {
      month,
      beginningDebt,
      interest,
      handlingFee,
      insurance,
      minimumPayment,
      extraPayment,
      totalPayment,
      principalDelta,
      endingDebt,
    }
  }

  const usedLimitAmount = endingDebt
  const releasedLimitAmount = Math.max(0, creditLimit - endingDebt)
  const usedLimitPct = (usedLimitAmount / creditLimit) * 100

  return {
    month,
    beginningDebt,
    interest,
    handlingFee,
    insurance,
    minimumPayment,
    extraPayment,
    totalPayment,
    principalDelta,
    endingDebt,
    usedLimitAmount,
    usedLimitPct,
    releasedLimitAmount,
  }
}

function buildExtraPaymentMap(
  maxMonths: number,
  constantExtraPayment?: CreditCardConstantExtraPayment,
  extraordinaryExtraPayments: CreditCardExtraPayment[] = [],
): Map<number, number> {
  const map = new Map<number, number>()

  if (
    constantExtraPayment &&
    constantExtraPayment.amount > 0 &&
    constantExtraPayment.everyNMonths > 0
  ) {
    const maxOccurrences = constantExtraPayment.occurrences ?? Number.POSITIVE_INFINITY
    let count = 0

    for (
      let month = constantExtraPayment.everyNMonths;
      month <= maxMonths && count < maxOccurrences;
      month += constantExtraPayment.everyNMonths
    ) {
      map.set(month, (map.get(month) ?? 0) + constantExtraPayment.amount)
      count += 1
    }
  }

  extraordinaryExtraPayments
    .filter((item) => item.amount > 0 && item.month >= 1 && item.month <= maxMonths)
    .forEach((item) => {
      map.set(item.month, (map.get(item.month) ?? 0) + item.amount)
    })

  return map
}
