import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCreditCard, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons'
import { trackCalculoRealizado } from '../../application/analytics/events'
import {
  calculateCreditCardPortfolio,
  type ConsolidatedExtraMode,
  type PortfolioProjection,
  type PortfolioStrategy,
} from '../../application/tc/portfolioProjection'
import type {
  CreditCardInput,
  CreditCardProjection,
  CreditCardRateType,
} from '../../domain/tc/loan.types'
import { simulateCreditCard } from '../../domain/tc/simulator'
import { formatCop, formatCopWhole, formatPercent } from '../../utils/currency'
import {
  MoneyInput,
} from '../components/MoneyInput'
import {
  parseMoneyInputValue,
  parseOptionalMoneyInputValue,
} from '../components/moneyInput.utils'
import { SeoHead } from '../seo/SeoHead'
import { getCalculatorSeoMeta } from '../seo/meta'
import { CreditCardCharts } from '../components/tc/CreditCardCharts'
import { CreditCardSummaryCards } from '../components/tc/CreditCardSummaryCards'
import { CreditCardTable } from '../components/tc/CreditCardTable'
import { ExtraPaymentsCard } from '../components/ExtraPaymentsCard'
import { InsuranceCard } from '../components/InsuranceCard'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface CardDraft {
  id: string
  name: string
  currentDebt: string
  termMonths: string
  rateType: CreditCardRateType
  rateValuePct: string
  minimumPaymentAmount: string
  hasHandlingFee: boolean
  monthlyHandlingFee: string
  hasInsurance: boolean
  monthlyInsurance: string
  creditLimit: string
  wantsPeriodicExtraPayments: boolean
  periodicExtraAmount: string
  periodicExtraEveryMonths: string
  periodicExtraOccurrences: string
  wantsExtraordinaryExtraPayments: boolean
  extraordinaryRows: Array<{ month: string; amount: string }>
}

const MAX_CARDS = 5
const CONSOLIDATED_TAB = 'consolidated'
const EPSILON = 0.000001

export function CreditCardCalculatorPage() {
  const [cards, setCards] = useState<CardDraft[]>([buildCardDraft(1)])
  const [activeTab, setActiveTab] = useState<string>('tc-1')
  const [cardProjections, setCardProjections] = useState<Record<string, CreditCardProjection>>({})
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({})
  const [nameWarning, setNameWarning] = useState<string | null>(null)
  const [pendingDeleteCardId, setPendingDeleteCardId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [editingCardOriginalName, setEditingCardOriginalName] = useState<string>('')

  const [mode, setMode] = useState<ConsolidatedExtraMode>('manual')
  const [strategy, setStrategy] = useState<PortfolioStrategy>('snowball')
  const [globalExtra, setGlobalExtra] = useState<string>('0')
  const [manualExtraByCardId, setManualExtraByCardId] = useState<Record<string, string>>({})
  const [portfolio, setPortfolio] = useState<PortfolioProjection | null>(null)
  const [portfolioError, setPortfolioError] = useState<string | null>(null)

  const hasMultipleCards = cards.length > 1
  const activeCard = cards.find((card) => card.id === activeTab) ?? cards[0]
  const isConsolidated = hasMultipleCards && activeTab === CONSOLIDATED_TAB
  const activeProjection = activeCard ? cardProjections[activeCard.id] : null
  const activeSavingsSummary = activeProjection
    ? buildCardSavingsSummary(activeProjection)
    : null

  useEffect(() => {
    if (!hasMultipleCards && activeTab === CONSOLIDATED_TAB) {
      setActiveTab(cards[0]?.id ?? 'tc-1')
    }
  }, [activeTab, cards, hasMultipleCards])

  function updateCard(id: string, patch: Partial<CardDraft>) {
    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, ...patch } : card)))
  }

  function addCard() {
    if (cards.length >= MAX_CARDS) return
    const next = buildCardDraft(cards.length + 1)
    setCards((prev) => [...prev, next])
    setActiveTab(next.id)
    setNameWarning(null)
  }

  function removeCard(cardId: string) {
    if (cards.length <= 1) return

    const remainingCards = cards.filter((card) => card.id !== cardId)
    if (remainingCards.length === 0) return

    setCards(remainingCards)
    setCardProjections((prev) => omitByKey(prev, cardId))
    setCardErrors((prev) => omitByKey(prev, cardId))
    setManualExtraByCardId((prev) => omitByKey(prev, cardId))
    setNameWarning(null)

    if (activeTab === cardId) {
      const removedIndex = cards.findIndex((card) => card.id === cardId)
      const fallbackIndex = Math.min(removedIndex, remainingCards.length - 1)
      const fallbackCard = remainingCards[fallbackIndex] ?? remainingCards[0]
      setActiveTab(fallbackCard.id)
    }
  }

  function startEditingCardName(cardId: string) {
    const card = cards.find((c) => c.id === cardId)
    setEditingCardId(cardId)
    setEditingCardOriginalName(card?.name ?? '')
  }

  function stopEditingCardName() {
    setEditingCardId(null)
    setEditingCardOriginalName('')
  }

  function handleCardNameEdit(cardId: string, newName: string) {
    const originalName = editingCardOriginalName || cards.find((c) => c.id === cardId)?.name || ''

    const normalized = normalizeCardName(newName)
    const isDuplicate = cards.some(
      (c) => c.id !== cardId && normalizeCardName(c.name) === normalized,
    )

    if (isDuplicate) {
      setNameWarning('Cada tarjeta debe tener un nombre unico')
      updateCard(cardId, { name: originalName })
    } else {
      setNameWarning(null)
      updateCard(cardId, { name: newName.trim() === '' ? originalName : newName })
    }

    setEditingCardId(null)
    setEditingCardOriginalName('')
  }

  function calculateCard(card: CardDraft) {
    try {
      const projection = simulateCreditCard(parseCardDraft(card))
      setCardProjections((prev) => ({ ...prev, [card.id]: projection }))
      setCardErrors((prev) => ({ ...prev, [card.id]: '' }))
      trackCalculoRealizado()
    } catch (error) {
      setCardErrors((prev) => ({
        ...prev,
        [card.id]: error instanceof Error ? error.message : 'Error de validacion',
      }))
    }
  }

  function calculateConsolidated() {
    try {
      const parsedCards = cards.map(parseCardDraft)
      const projection = calculateCreditCardPortfolio({
        cards: parsedCards,
        mode,
        strategy,
        globalExtraPaymentAmount: toMoneyNumber(globalExtra),
        manualExtraByCardId: Object.fromEntries(
          Object.entries(manualExtraByCardId).map(([cardId, value]) => [
            cardId,
            toMoneyNumber(value),
          ]),
        ),
      })
      setPortfolio(projection)
      setPortfolioError(null)
      trackCalculoRealizado()
    } catch (error) {
      setPortfolio(null)
      setPortfolioError(error instanceof Error ? error.message : 'Error de validacion')
    }
  }

  const consolidatedTotals = useMemo(() => portfolio?.totals, [portfolio])
  const consolidatedChartData = useMemo(
    () => (portfolio ? buildPortfolioChartData(portfolio) : []),
    [portfolio],
  )

  return (
    <>
      <SeoHead meta={getCalculatorSeoMeta('tarjeta-credito')} />
      <section className="app-shell app-surface">
        <div className="hero hero-landing">
          <div className="hero-icon" aria-hidden>
            <FontAwesomeIcon icon={faCreditCard} />
          </div>
          <h1 className="title">Calculadora tarjetas de credito</h1>
        </div>
        <p className="subtitle">
          Gestiona hasta 5 tarjetas en pestañas. El consolidado se habilita cuando agregas 2 o mas tarjetas.
        </p>

        <div className="tc-tabs-wrapper">
          <div className="tc-tabs">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`tc-tab ${activeTab === card.id ? 'active' : ''}`}
                onClick={() => setActiveTab(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (editingCardId === card.id) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setActiveTab(card.id)
                  }
                }}
              >
                {editingCardId === card.id ? (
                  <input
                    type="text"
                    className="tc-tab-input"
                    value={card.name}
                    onChange={(event) => updateCard(card.id, { name: event.target.value.slice(0, 25) })}
                    onBlur={(event) => handleCardNameEdit(card.id, event.currentTarget.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleCardNameEdit(card.id, event.currentTarget.value)
                      } else if (event.key === 'Escape') {
                        stopEditingCardName()
                      }
                    }}
                    autoFocus
                    maxLength={25}
                  />
                ) : (
                  <span className="tc-tab-name">{card.name}</span>
                )}
                {activeTab === card.id && editingCardId !== card.id && (
                  <button
                    type="button"
                    className="tc-tab-edit"
                    onClick={(event) => {
                      event.stopPropagation()
                      startEditingCardName(card.id)
                    }}
                    aria-label={`Editar nombre de ${card.name}`}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </button>
                )}
                {cards.length > 1 && (
                  <button
                    type="button"
                    className="tc-tab-remove"
                    onClick={(event) => {
                      event.stopPropagation()
                      setPendingDeleteCardId(card.id)
                    }}
                    aria-label={`Eliminar ${card.name}`}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>
            ))}
            {hasMultipleCards ? (
              <button
                type="button"
                className={`tc-tab ${isConsolidated ? 'active' : ''}`}
                onClick={() => setActiveTab(CONSOLIDATED_TAB)}
              >
                Consolidado
              </button>
            ) : null}
            <button type="button" className="tc-tab-add" onClick={addCard} disabled={cards.length >= MAX_CARDS}>
              +
            </button>
          </div>

          <section className="landing-block tc-content-block">
            {nameWarning ? <div className="field-warning">{nameWarning}</div> : null}

          {!isConsolidated && activeCard ? (
            <div className="tc-tab-panel">
              <div className="form-grid">
                <Field label="Deuda actual">
                  <MoneyInput
                    id={`currentDebt-${activeCard.id}`}
                    value={activeCard.currentDebt}
                    onChange={(value) =>
                      updateCard(activeCard.id, { currentDebt: value })
                    }
                  />
                </Field>
                <Field label="Plazo para pagar (meses)">
                  <input
                    id={`termMonths-${activeCard.id}`}
                    type="number"
                    min={1}
                    step={1}
                    value={activeCard.termMonths}
                    onChange={(event) =>
                      updateCard(activeCard.id, { termMonths: event.target.value })
                    }
                  />
                </Field>
                <Field label="Tipo tasa">
                  <div className="choice-group choice-group-inline">
                    <label className="choice-item">
                      <input
                        type="radio"
                        name={`rateType-${activeCard.id}`}
                        value="nominalDue"
                        checked={activeCard.rateType === 'nominalDue'}
                        onChange={(event) =>
                          updateCard(activeCard.id, { rateType: event.target.value as CreditCardRateType })
                        }
                      />
                      Tasa nominal vencida
                    </label>
                    <label className="choice-item">
                      <input
                        type="radio"
                        name={`rateType-${activeCard.id}`}
                        value="effectiveAnnual"
                        checked={activeCard.rateType === 'effectiveAnnual'}
                        onChange={(event) =>
                          updateCard(activeCard.id, { rateType: event.target.value as CreditCardRateType })
                        }
                      />
                      Tasa efectiva anual
                    </label>
                  </div>
                </Field>
                <Field label="Tasa (%)">
                  <input type="number" min={0} step="any" value={activeCard.rateValuePct} onChange={(event) => updateCard(activeCard.id, { rateValuePct: event.target.value })} />
                </Field>
                <Field label="Pago minimo">
                  <MoneyInput
                    id={`minimumPaymentAmount-${activeCard.id}`}
                    value={activeCard.minimumPaymentAmount}
                    onChange={(value) =>
                      updateCard(activeCard.id, { minimumPaymentAmount: value })
                    }
                  />
                  <small className="helper-text">
                    Opcional. Si lo dejas vacio, se calcula con deuda, tasa y plazo.
                  </small>
                </Field>
                <Field label="Cupo total (opcional)">
                  <MoneyInput
                    id={`creditLimit-${activeCard.id}`}
                    value={activeCard.creditLimit}
                    onChange={(value) => updateCard(activeCard.id, { creditLimit: value })}
                  />
                </Field>
              </div>

              <div className="choice-group choice-group-inline">
                <label className="choice-item"><input type="checkbox" checked={activeCard.hasHandlingFee} onChange={(event) => updateCard(activeCard.id, { hasHandlingFee: event.target.checked })} /> Tiene cuota de manejo</label>
              </div>

              <div className="tc-compact-grid">
                {activeCard.hasHandlingFee ? (
                  <Field label="Cuota de manejo mensual">
                    <MoneyInput
                      id={`monthlyHandlingFee-${activeCard.id}`}
                      value={activeCard.monthlyHandlingFee}
                      onChange={(value) =>
                        updateCard(activeCard.id, { monthlyHandlingFee: value })
                      }
                    />
                  </Field>
                ) : null}
              </div>

              <InsuranceCard
                badge="2"
                idPrefix={`tc-${activeCard.id}`}
                description="Configura el seguro asociado a esta tarjeta."
                allowVariable={false}
                state={{
                  hasFixedInsurance: activeCard.hasInsurance,
                  monthlyInsurance: activeCard.monthlyInsurance,
                  hasVariableInsurance: false,
                  monthlyLifeInsuranceRatePct: '',
                }}
                onChange={(next) =>
                  updateCard(activeCard.id, {
                    hasInsurance: next.hasFixedInsurance,
                    monthlyInsurance: next.monthlyInsurance,
                  })
                }
              />

              <ExtraPaymentsCard
                badge="3"
                description="Define aportes periodicos y/o extraordinarios para esta tarjeta."
                termMonths={Number(activeCard.termMonths)}
                state={{
                  wantsPeriodicExtraPayments: activeCard.wantsPeriodicExtraPayments,
                  periodicExtraAmount: activeCard.periodicExtraAmount,
                  periodicExtraEveryMonths: activeCard.periodicExtraEveryMonths,
                  periodicExtraOccurrences: activeCard.periodicExtraOccurrences,
                  wantsExtraordinaryExtraPayments:
                    activeCard.wantsExtraordinaryExtraPayments,
                  extraordinaryRows: activeCard.extraordinaryRows,
                }}
                onChange={(next) =>
                  updateCard(activeCard.id, {
                    wantsPeriodicExtraPayments: next.wantsPeriodicExtraPayments,
                    periodicExtraAmount: next.periodicExtraAmount,
                    periodicExtraEveryMonths: next.periodicExtraEveryMonths,
                    periodicExtraOccurrences: next.periodicExtraOccurrences,
                    wantsExtraordinaryExtraPayments:
                      next.wantsExtraordinaryExtraPayments,
                    extraordinaryRows: next.extraordinaryRows,
                  })
                }
              />

              {cardErrors[activeCard.id] ? <div className="field-error">{cardErrors[activeCard.id]}</div> : null}
              <div className="submit-wrap">
                <button type="button" className="btn-primary btn-wide" onClick={() => calculateCard(activeCard)}>
                  Calcular tarjeta
                </button>
              </div>

              {activeProjection ? (
                <>
                  <CreditCardSummaryCards projection={activeProjection} />
                  {activeSavingsSummary ? (
                    <p className="savings-summary">{activeSavingsSummary}</p>
                  ) : null}
                  <CreditCardCharts schedule={activeProjection.schedule} baselineSchedule={activeProjection.baselineSchedule} />
                  <CreditCardTable rows={activeProjection.schedule} />
                </>
              ) : null}
            </div>
          ) : null}

          {isConsolidated ? (
            <div className="tc-tab-panel">
              <div className="form-grid">
                <Field label="Modo de aporte">
                  <select value={mode} onChange={(event) => setMode(event.target.value as ConsolidatedExtraMode)}>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatico</option>
                  </select>
                </Field>
                <Field label="Estrategia">
                  <select value={strategy} onChange={(event) => setStrategy(event.target.value as PortfolioStrategy)}>
                    <option value="snowball">Bola de nieve</option>
                    <option value="optimization">Optimizacion</option>
                  </select>
                </Field>
                <Field label="Aporte global mensual">
                  <MoneyInput
                    id="globalExtra"
                    value={globalExtra}
                    onChange={setGlobalExtra}
                  />
                </Field>
              </div>

              {mode === 'manual' ? (
                <div className="form-grid">
                  {cards.map((card) => (
                    <Field key={`manual-${card.id}`} label={`Aporte ${card.name}`}>
                      <MoneyInput
                        id={`manualExtra-${card.id}`}
                        value={manualExtraByCardId[card.id] ?? ''}
                        onChange={(value) =>
                          setManualExtraByCardId((prev) => ({ ...prev, [card.id]: value }))
                        }
                      />
                    </Field>
                  ))}
                </div>
              ) : null}

              {portfolioError ? <div className="field-error">{portfolioError}</div> : null}
              <div className="submit-wrap">
                <button type="button" className="btn-primary btn-wide" onClick={calculateConsolidated}>
                  Calcular consolidado
                </button>
              </div>

              {portfolio && consolidatedTotals ? (
                <>
                  <section className="panel section">
                    <div className="cards-grid">
                      <Metric label="Deuda inicial total" value={formatCopWhole(consolidatedTotals.totalBeginningDebt)} />
                      <Metric label="Interes total" value={formatCopWhole(consolidatedTotals.totalInterest)} />
                      {Math.abs(consolidatedTotals.totalHandlingFee) > EPSILON ? (
                        <Metric label="Cuota manejo total" value={formatCopWhole(consolidatedTotals.totalHandlingFee)} />
                      ) : null}
                      {Math.abs(consolidatedTotals.totalInsurance) > EPSILON ? (
                        <Metric label="Seguro total" value={formatCopWhole(consolidatedTotals.totalInsurance)} />
                      ) : null}
                      {Math.abs(consolidatedTotals.totalExtraPaid) > EPSILON ? (
                        <Metric label="Aportes totales" value={formatCopWhole(consolidatedTotals.totalExtraPaid)} />
                      ) : null}
                      <Metric label="Total pagado" value={formatCopWhole(consolidatedTotals.totalPaid)} />
                      <Metric
                        label="% intereses"
                        value={formatPercent(safePct(consolidatedTotals.totalInterest, consolidatedTotals.totalPaid))}
                      />
                      <Metric
                        label="% deuda total"
                        value={formatPercent(
                          safePct(
                            consolidatedTotals.totalPaid -
                              consolidatedTotals.totalInterest -
                              consolidatedTotals.totalHandlingFee -
                              consolidatedTotals.totalInsurance,
                            consolidatedTotals.totalPaid,
                          ),
                        )}
                      />
                      {Math.abs(consolidatedTotals.totalHandlingFee) > EPSILON ? (
                        <Metric
                          label="% cuota manejo"
                          value={formatPercent(safePct(consolidatedTotals.totalHandlingFee, consolidatedTotals.totalPaid))}
                        />
                      ) : null}
                      {Math.abs(consolidatedTotals.totalInsurance) > EPSILON ? (
                        <Metric
                          label="% seguros"
                          value={formatPercent(safePct(consolidatedTotals.totalInsurance, consolidatedTotals.totalPaid))}
                        />
                      ) : null}
                    </div>
                  </section>
                  <section className="panel section">
                    <p className="helper-text">
                      Recomendacion: <strong>{portfolio.strategyReport.recommendedCardName ?? 'Sin recomendacion'}</strong>
                    </p>
                    <p className="helper-text">Snowball: {portfolio.strategyReport.snowballOrder.map((item) => item.cardName).join(' -> ')}</p>
                    <p className="helper-text">Optimizacion: {portfolio.strategyReport.optimizationOrder.map((item) => item.cardName).join(' -> ')}</p>
                  </section>
                  <section className="panel section">
                    <h3 className="chart-title">Evolucion consolidada de deuda</h3>
                    <div className="chart-container" style={{ width: '100%', height: 320 }}>
                      <ResponsiveContainer>
                        <LineChart data={consolidatedChartData} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
                          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => formatCompactCop(Number(value))} width={96} />
                          <Tooltip formatter={(value) => formatCop(Number(value))} labelFormatter={(label) => `Mes ${label}`} />
                          <Legend />
                          <Line type="monotone" dataKey="totalDebt" name="Deuda total" stroke="#0f2a44" dot={false} />
                          {portfolio.cards.slice(0, 5).map((card, index) => (
                            <Line
                              key={`line-${card.cardId}`}
                              type="monotone"
                              dataKey={`card-${card.cardId}`}
                              name={card.cardName}
                              stroke={portfolioLineColor(index)}
                              dot={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          ) : null}
          </section>
        </div>
      </section>
      {pendingDeleteCardId ? (
        <DeleteCardModal
          cardName={cards.find((card) => card.id === pendingDeleteCardId)?.name ?? 'esta tarjeta'}
          onCancel={() => setPendingDeleteCardId(null)}
          onConfirm={() => {
            removeCard(pendingDeleteCardId)
            setPendingDeleteCardId(null)
          }}
        />
      ) : null}
    </>
  )
}

function buildCardDraft(index: number): CardDraft {
  return {
    id: `tc-${index}`,
    name: `TC ${index}`,
    currentDebt: '',
    termMonths: '',
    rateType: 'effectiveAnnual',
    rateValuePct: '',
    minimumPaymentAmount: '',
    hasHandlingFee: false,
    monthlyHandlingFee: '',
    hasInsurance: false,
    monthlyInsurance: '',
    creditLimit: '',
    wantsPeriodicExtraPayments: false,
    periodicExtraAmount: '',
    periodicExtraEveryMonths: '',
    periodicExtraOccurrences: '',
    wantsExtraordinaryExtraPayments: false,
    extraordinaryRows: [],
  }
}

function parseCardDraft(card: CardDraft): CreditCardInput {
  const currentDebt = toPositiveMoney(card.currentDebt, 'La deuda actual debe ser mayor que 0')
  const termMonths = toPositiveInteger(card.termMonths, 'El plazo debe ser un entero mayor que 0')
  const minimumPaymentAmount =
    card.minimumPaymentAmount.trim() === ''
      ? undefined
      : toPositiveMoney(card.minimumPaymentAmount, 'El pago minimo debe ser mayor que 0')
  const rateValuePct = toNonNegativeNumber(card.rateValuePct, 'La tasa debe ser mayor o igual a 0')
  const monthlyHandlingFee = card.hasHandlingFee
    ? toNonNegativeMoney(card.monthlyHandlingFee, 'Cuota de manejo invalida')
    : 0
  const monthlyInsurance = card.hasInsurance
    ? toNonNegativeMoney(card.monthlyInsurance, 'Seguro invalido')
    : 0
  const creditLimit =
    card.creditLimit.trim() === ''
      ? undefined
      : toPositiveMoney(card.creditLimit, 'Cupo invalido')

  return {
    id: card.id,
    name: card.name.trim() === '' ? card.id.toUpperCase() : card.name.trim(),
    currentDebt,
    termMonths,
    rateType: card.rateType,
    rateValuePct,
    minimumPaymentAmount,
    hasHandlingFee: card.hasHandlingFee,
    monthlyHandlingFee,
    hasInsurance: card.hasInsurance,
    monthlyInsurance,
    creditLimit,
    constantExtraPayment:
      !card.wantsPeriodicExtraPayments || card.periodicExtraAmount.trim() === ''
        ? undefined
        : {
            amount: toPositiveMoney(card.periodicExtraAmount, 'Aporte periodico invalido'),
            everyNMonths: toPositiveInteger(
              card.periodicExtraEveryMonths,
              'Frecuencia invalida para aporte periodico',
            ),
            occurrences:
              card.periodicExtraOccurrences.trim() === ''
                ? undefined
                : toPositiveInteger(
                    card.periodicExtraOccurrences,
                    'Ocurrencias invalidas para aporte periodico',
                  ),
          },
    extraordinaryExtraPayments: !card.wantsExtraordinaryExtraPayments
      ? []
      : card.extraordinaryRows
          .map((row) => ({
            month: Number(row.month),
            amount: parseMoneyInputValue(row.amount),
          }))
          .filter(
            (row) =>
              Number.isFinite(row.month) &&
              Number.isFinite(row.amount) &&
              row.month >= 1 &&
              row.month <= termMonths &&
              row.amount > 0,
          ),
  }
}

function omitByKey<T extends Record<string, unknown>>(record: T, key: string): T {
  const next = { ...record }
  delete next[key]
  return next
}

function toNonNegativeNumber(rawValue: string, message: string): number {
  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(message)
  return parsed
}

function toPositiveInteger(rawValue: string, message: string): number {
  const parsed = Number(rawValue)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(message)
  }
  return parsed
}

function toPositiveMoney(rawValue: string, message: string): number {
  const parsed = parseMoneyInputValue(rawValue)
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(message)
  return parsed
}

function toNonNegativeMoney(rawValue: string, message: string): number {
  const parsed = parseMoneyInputValue(rawValue)
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(message)
  return parsed
}

function safePct(part: number, total: number): number {
  if (!Number.isFinite(part) || !Number.isFinite(total) || Math.abs(total) < EPSILON) {
    return 0
  }
  return (part / total) * 100
}

function buildCardSavingsSummary(projection: CreditCardProjection): string | null {
  const messages: string[] = []

  if (projection.interestSavingsFromPrepayments > EPSILON) {
    messages.push(
      `ahorras ${formatCop(projection.interestSavingsFromPrepayments)} en intereses`,
    )
  }

  if (projection.monthsReduced > 0) {
    messages.push(`reduces el plazo en ${formatMonths(projection.monthsReduced)}`)
  }

  if (messages.length === 0) {
    if (projection.totalExtraPaid > EPSILON) {
      return 'Gracias a los aportes adicionales en esta tarjeta, tu deuda se reducira y pagaras menos intereses.'
    }
    return null
  }

  if (messages.length === 1) {
    return `Gracias a los aportes adicionales en esta tarjeta, ${messages[0]}.`
  }

  return `Gracias a los aportes adicionales en esta tarjeta, ${messages[0]} y ${messages[1]}.`
}

function formatMonths(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${months} meses`
  }

  return `${years} anios y ${remainingMonths} meses`
}

function toMoneyNumber(rawValue: string): number {
  const parsed = parseOptionalMoneyInputValue(rawValue)
  return parsed ?? 0
}

function normalizeCardName(name: string): string {
  return name.toLowerCase().trim()
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="card">
      <h4>{label}</h4>
      <p>{value}</p>
    </article>
  )
}

function DeleteCardModal({
  cardName,
  onCancel,
  onConfirm,
}: {
  cardName: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="tc-modal-backdrop" role="presentation">
      <div className="tc-modal" role="dialog" aria-modal="true" aria-labelledby="delete-card-title">
        <h3 id="delete-card-title">Eliminar tarjeta</h3>
        <p>
          Vas a eliminar <strong>{cardName}</strong>. Esta accion no se puede deshacer.
        </p>
        <div className="tc-modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

function buildPortfolioChartData(portfolio: PortfolioProjection): Array<Record<string, number>> {
  return portfolio.consolidatedSchedule.map((row, index) => {
    const point: Record<string, number> = {
      month: row.month,
      totalDebt: row.totalEndingDebt,
    }

    portfolio.cards.slice(0, 5).forEach((card) => {
      point[`card-${card.cardId}`] = card.schedule[index]?.endingDebt ?? 0
    })

    return point
  })
}

function portfolioLineColor(index: number): string {
  const palette = ['#1e4a72', '#2e9b6f', '#f5a623', '#475569', '#0f172a']
  return palette[index % palette.length]
}

function formatCompactCop(value: number): string {
  if (!Number.isFinite(value)) return '$0'
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  return formatCop(value)
}


