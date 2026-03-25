import type {
  CreditCardInput,
  CreditCardMonthRow,
  CreditCardProjection,
} from '../../domain/tc/loan.types'
import { calculateAutoMinimumPayment, toMonthlyRate } from '../../domain/tc/simulator'

const EPSILON = 0.000001

export type ConsolidatedExtraMode = 'manual' | 'automatic'
export type PortfolioStrategy = 'snowball' | 'optimization'

export interface PortfolioInput {
  cards: CreditCardInput[]
  mode: ConsolidatedExtraMode
  strategy: PortfolioStrategy
  globalExtraPaymentAmount: number
  manualExtraByCardId?: Record<string, number>
  maxMonths?: number
}

export interface StrategyOrderItem {
  cardId: string
  cardName: string
}

export interface StrategyReport {
  snowballOrder: StrategyOrderItem[]
  optimizationOrder: StrategyOrderItem[]
  recommendedCardId: string | null
  recommendedCardName: string | null
  estimatedTotalPaidSavings: number
}

export interface ConsolidatedMonthRow {
  month: number
  totalBeginningDebt: number
  totalInterest: number
  totalHandlingFee: number
  totalInsurance: number
  totalMinimumPayment: number
  totalExtraPayment: number
  totalPayment: number
  totalEndingDebt: number
}

export interface PortfolioTotals {
  totalBeginningDebt: number
  totalInterest: number
  totalHandlingFee: number
  totalInsurance: number
  totalPaid: number
  totalExtraPaid: number
  monthsToPayoff: number | null
}

export interface PortfolioProjection {
  cards: CreditCardProjection[]
  consolidatedSchedule: ConsolidatedMonthRow[]
  totals: PortfolioTotals
  strategyReport: StrategyReport
}

interface CardRuntimeState {
  id: string
  name: string
  balance: number
  termMonths: number
  monthlyRate: number
  minimumPaymentAmount: number
  monthlyHandlingFee: number
  monthlyInsurance: number
  creditLimit?: number
  ownExtraSchedule: Map<number, number>
  rows: CreditCardMonthRow[]
}

export function calculateCreditCardPortfolio(input: PortfolioInput): PortfolioProjection {
  if (input.cards.length === 0) {
    throw new Error('Portfolio must include at least one card')
  }
  if (input.cards.length > 5) {
    throw new Error('Portfolio supports up to 5 cards')
  }
  if (!Number.isFinite(input.globalExtraPaymentAmount) || input.globalExtraPaymentAmount < 0) {
    throw new Error('globalExtraPaymentAmount must be >= 0')
  }

  const maxMonths = input.maxMonths ?? Math.max(...input.cards.map((card) => card.termMonths))
  const strategyOrders = buildStrategyOrders(input.cards)

  const baselineSimulation = simulatePortfolioScenario({
    cards: input.cards,
    mode: 'manual',
    strategy: input.strategy,
    globalExtraPaymentAmount: 0,
    manualExtraByCardId: {},
    maxMonths,
  })
  const scenario = simulatePortfolioScenario({ ...input, maxMonths })

  const baselineTotalPaid = baselineSimulation.totals.totalPaid
  const scenarioTotalPaid = scenario.totals.totalPaid
  const estimatedTotalPaidSavings = Math.max(0, baselineTotalPaid - scenarioTotalPaid)

  const recommendedCard = getRecommendedCard(
    input.cards,
    input.strategy,
    strategyOrders.snowballOrder,
    strategyOrders.optimizationOrder,
  )

  return {
    cards: scenario.cards,
    consolidatedSchedule: scenario.consolidatedSchedule,
    totals: scenario.totals,
    strategyReport: {
      ...strategyOrders,
      recommendedCardId: recommendedCard?.id ?? null,
      recommendedCardName: recommendedCard?.name ?? null,
      estimatedTotalPaidSavings,
    },
  }
}

interface SimulatePortfolioScenarioInput {
  cards: CreditCardInput[]
  mode: ConsolidatedExtraMode
  strategy: PortfolioStrategy
  globalExtraPaymentAmount: number
  manualExtraByCardId?: Record<string, number>
  maxMonths: number
}

function simulatePortfolioScenario(
  input: SimulatePortfolioScenarioInput,
): Omit<PortfolioProjection, 'strategyReport'> {
  const states = input.cards.map((card) => createRuntimeState(card, input.maxMonths))
  const consolidatedSchedule: ConsolidatedMonthRow[] = []

  for (let month = 1; month <= input.maxMonths; month += 1) {
    const activeStates = states.filter((state) => state.balance > EPSILON)
    if (activeStates.length === 0) {
      break
    }

    const autoTargetId =
      input.mode === 'automatic' && input.globalExtraPaymentAmount > 0
        ? pickAutomaticTarget(activeStates, input.strategy)
        : null

    const monthRows = states.map((state) =>
      simulatePortfolioMonth(state, month, input, autoTargetId),
    )

    consolidatedSchedule.push({
      month,
      totalBeginningDebt: monthRows.reduce((sum, row) => sum + row.beginningDebt, 0),
      totalInterest: monthRows.reduce((sum, row) => sum + row.interest, 0),
      totalHandlingFee: monthRows.reduce((sum, row) => sum + row.handlingFee, 0),
      totalInsurance: monthRows.reduce((sum, row) => sum + row.insurance, 0),
      totalMinimumPayment: monthRows.reduce((sum, row) => sum + row.minimumPayment, 0),
      totalExtraPayment: monthRows.reduce((sum, row) => sum + row.extraPayment, 0),
      totalPayment: monthRows.reduce((sum, row) => sum + row.totalPayment, 0),
      totalEndingDebt: monthRows.reduce((sum, row) => sum + row.endingDebt, 0),
    })
  }

  const cards = states.map((state) => buildCardProjectionFromPortfolioRows(state, input.maxMonths))
  const totals = consolidatedSchedule.reduce(
    (acc, row) => ({
      totalBeginningDebt:
        acc.totalBeginningDebt === 0 ? row.totalBeginningDebt : acc.totalBeginningDebt,
      totalInterest: acc.totalInterest + row.totalInterest,
      totalHandlingFee: acc.totalHandlingFee + row.totalHandlingFee,
      totalInsurance: acc.totalInsurance + row.totalInsurance,
      totalPaid: acc.totalPaid + row.totalPayment,
      totalExtraPaid: acc.totalExtraPaid + row.totalExtraPayment,
      monthsToPayoff: row.totalEndingDebt <= EPSILON ? row.month : null,
    }),
    {
      totalBeginningDebt: 0,
      totalInterest: 0,
      totalHandlingFee: 0,
      totalInsurance: 0,
      totalPaid: 0,
      totalExtraPaid: 0,
      monthsToPayoff: null as number | null,
    },
  )

  return {
    cards,
    consolidatedSchedule,
    totals,
  }
}

function createRuntimeState(card: CreditCardInput, maxMonths: number): CardRuntimeState {
  const monthlyHandlingFee = card.hasHandlingFee ? card.monthlyHandlingFee ?? 0 : 0
  const monthlyInsurance = card.hasInsurance ? card.monthlyInsurance ?? 0 : 0

  const ownExtraSchedule = new Map<number, number>()

  if (card.constantExtraPayment && card.constantExtraPayment.amount > 0) {
    const every = card.constantExtraPayment.everyNMonths
    const occurrences = card.constantExtraPayment.occurrences ?? Number.POSITIVE_INFINITY
    let used = 0
    const limitMonths = Math.min(maxMonths, card.termMonths)
    for (let month = every; month <= limitMonths && used < occurrences; month += every) {
      ownExtraSchedule.set(month, (ownExtraSchedule.get(month) ?? 0) + card.constantExtraPayment.amount)
      used += 1
    }
  }

  ;(card.extraordinaryExtraPayments ?? [])
    .filter((row) => row.month >= 1 && row.month <= card.termMonths && row.amount > 0)
    .forEach((row) => {
      ownExtraSchedule.set(row.month, (ownExtraSchedule.get(row.month) ?? 0) + row.amount)
    })

  return {
    id: card.id,
    name: card.name,
    balance: card.currentDebt,
    termMonths: card.termMonths,
    monthlyRate: toMonthlyRate(card.rateType, card.rateValuePct),
    minimumPaymentAmount: card.minimumPaymentAmount ?? calculateAutoMinimumPayment(card),
    monthlyHandlingFee,
    monthlyInsurance,
    creditLimit: card.creditLimit,
    ownExtraSchedule,
    rows: [],
  }
}

function simulatePortfolioMonth(
  state: CardRuntimeState,
  month: number,
  input: SimulatePortfolioScenarioInput,
  autoTargetId: string | null,
): CreditCardMonthRow {
  if (month > state.termMonths) {
    const horizonRow = buildRowWithLimit(state.creditLimit, {
      month,
      beginningDebt: state.balance,
      interest: 0,
      handlingFee: 0,
      insurance: 0,
      minimumPayment: 0,
      extraPayment: 0,
      totalPayment: 0,
      principalDelta: 0,
      endingDebt: state.balance,
    })
    state.rows.push(horizonRow)
    return horizonRow
  }

  if (state.balance <= EPSILON) {
    const settledRow = buildRowWithLimit(state.creditLimit, {
      month,
      beginningDebt: 0,
      interest: 0,
      handlingFee: 0,
      insurance: 0,
      minimumPayment: 0,
      extraPayment: 0,
      totalPayment: 0,
      principalDelta: 0,
      endingDebt: 0,
    })
    state.rows.push(settledRow)
    return settledRow
  }

  const beginningDebt = state.balance
  const interest = beginningDebt * state.monthlyRate
  const handlingFee = state.monthlyHandlingFee
  const insurance = state.monthlyInsurance
  const ownExtra = state.ownExtraSchedule.get(month) ?? 0
  const manualExtra =
    input.mode === 'manual' ? input.manualExtraByCardId?.[state.id] ?? 0 : 0
  const autoExtra =
    input.mode === 'automatic' && autoTargetId === state.id
      ? input.globalExtraPaymentAmount
      : 0
  const plannedExtra = ownExtra + manualExtra + autoExtra
  const monthlyCharges = interest + handlingFee + insurance
  const plannedPayment = state.minimumPaymentAmount + plannedExtra
  const payoffValue = beginningDebt + monthlyCharges

  let totalPayment = plannedPayment
  if (totalPayment > payoffValue) {
    totalPayment = payoffValue
  }

  const minimumPayment = Math.min(state.minimumPaymentAmount, totalPayment)
  const extraPaymentRaw = Math.max(0, totalPayment - minimumPayment)
  const extraPayment = Math.abs(extraPaymentRaw) < EPSILON ? 0 : extraPaymentRaw
  let endingDebt = beginningDebt + monthlyCharges - totalPayment
  if (Math.abs(endingDebt) < EPSILON) {
    endingDebt = 0
  }

  const row = buildRowWithLimit(state.creditLimit, {
    month,
    beginningDebt,
    interest,
    handlingFee,
    insurance,
    minimumPayment,
    extraPayment,
    totalPayment,
    principalDelta: beginningDebt - endingDebt,
    endingDebt,
  })

  state.rows.push(row)
  state.balance = endingDebt
  return row
}

function buildRowWithLimit(
  creditLimit: number | undefined,
  row: Omit<CreditCardMonthRow, 'usedLimitAmount' | 'usedLimitPct' | 'releasedLimitAmount'>,
): CreditCardMonthRow {
  if (creditLimit == null || !Number.isFinite(creditLimit) || creditLimit <= 0) {
    return row
  }

  return {
    ...row,
    usedLimitAmount: row.endingDebt,
    usedLimitPct: (row.endingDebt / creditLimit) * 100,
    releasedLimitAmount: Math.max(0, creditLimit - row.endingDebt),
  }
}

function buildCardProjectionFromPortfolioRows(
  state: CardRuntimeState,
  _maxMonths: number,
): CreditCardProjection {
  const totals = state.rows.reduce(
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

  const monthsToPayoff =
    state.rows.length > 0 && state.rows[state.rows.length - 1].endingDebt <= EPSILON
      ? state.rows.findIndex((row) => row.endingDebt <= EPSILON) + 1
      : null
  const horizonRow = state.rows[Math.max(0, Math.min(state.termMonths, state.rows.length) - 1)]
  const noPayoffWithinHorizon = (horizonRow?.endingDebt ?? 0) > EPSILON
  const hasNegativeAmortization = state.rows.some((row) => row.principalDelta < -EPSILON)

  return {
    cardId: state.id,
    cardName: state.name,
    schedule: state.rows,
    baselineSchedule: [],
    totalInterest: totals.totalInterest,
    totalHandlingFee: totals.totalHandlingFee,
    totalInsurance: totals.totalInsurance,
    totalPaid: totals.totalPaid,
    totalMinimumPaid: totals.totalMinimumPaid,
    totalExtraPaid: totals.totalExtraPaid,
    monthsToPayoff,
    baselineMonthsToPayoff: null,
    monthsReduced: 0,
    interestSavingsFromPrepayments: 0,
    minimumPaymentComparison: {
      theoreticalMinimumPayment: state.minimumPaymentAmount,
      reportedMinimumPayment: null,
      comparisonAvailable: false,
      difference: 0,
      differencePct: 0,
    },
    alerts: {
      hasNegativeAmortization,
      noPayoffWithinHorizon,
      baselineNoPayoffWithinHorizon: false,
      minimumPaymentDifferenceAbove1Pct: false,
    },
  }
}

function buildStrategyOrders(cards: CreditCardInput[]): {
  snowballOrder: StrategyOrderItem[]
  optimizationOrder: StrategyOrderItem[]
} {
  const snowballOrder = [...cards]
    .sort((a, b) => a.currentDebt - b.currentDebt || a.id.localeCompare(b.id))
    .map((card) => ({ cardId: card.id, cardName: card.name }))

  const optimizationOrder = [...cards]
    .sort((a, b) => optimizationScore(b) - optimizationScore(a) || b.currentDebt - a.currentDebt)
    .map((card) => ({ cardId: card.id, cardName: card.name }))

  return { snowballOrder, optimizationOrder }
}

function getRecommendedCard(
  cards: CreditCardInput[],
  strategy: PortfolioStrategy,
  snowballOrder: StrategyOrderItem[],
  optimizationOrder: StrategyOrderItem[],
): CreditCardInput | undefined {
  const order = strategy === 'snowball' ? snowballOrder : optimizationOrder
  const first = order[0]
  if (!first) {
    return undefined
  }

  return cards.find((card) => card.id === first.cardId)
}

function pickAutomaticTarget(
  states: CardRuntimeState[],
  strategy: PortfolioStrategy,
): string | null {
  if (states.length === 0) {
    return null
  }

  if (strategy === 'snowball') {
    const sorted = [...states].sort(
      (a, b) => a.balance - b.balance || a.id.localeCompare(b.id),
    )
    return sorted[0]?.id ?? null
  }

  const sorted = [...states].sort(
    (a, b) =>
      stateOptimizationScore(b) - stateOptimizationScore(a) ||
      b.balance - a.balance ||
      a.id.localeCompare(b.id),
  )
  return sorted[0]?.id ?? null
}

function optimizationScore(card: CreditCardInput): number {
  const monthlyRate = toMonthlyRate(card.rateType, card.rateValuePct)
  const handling = card.hasHandlingFee ? card.monthlyHandlingFee ?? 0 : 0
  const insurance = card.hasInsurance ? card.monthlyInsurance ?? 0 : 0
  return monthlyRate + (handling + insurance) / Math.max(card.currentDebt, 1)
}

function stateOptimizationScore(state: CardRuntimeState): number {
  return (
    state.monthlyRate +
    (state.monthlyHandlingFee + state.monthlyInsurance) / Math.max(state.balance, 1)
  )
}
