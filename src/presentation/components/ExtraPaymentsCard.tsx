import { MoneyInput } from './MoneyInput'

export interface ExtraPaymentRowDraft {
  month: string
  amount: string
}

export interface ExtraPaymentsDraft {
  wantsPeriodicExtraPayments: boolean
  periodicExtraAmount: string
  periodicExtraEveryMonths: string
  periodicExtraOccurrences: string
  wantsExtraordinaryExtraPayments: boolean
  extraordinaryRows: ExtraPaymentRowDraft[]
}

interface ExtraPaymentsCardProps {
  badge: string
  description: string
  termMonths?: number
  state: ExtraPaymentsDraft
  onChange: (next: ExtraPaymentsDraft) => void
}

export function ExtraPaymentsCard({
  badge,
  description,
  termMonths,
  state,
  onChange,
}: ExtraPaymentsCardProps) {
  const canAddExtraordinary =
    termMonths == null ||
    !Number.isFinite(termMonths) ||
    termMonths <= 0 ||
    state.extraordinaryRows.length < termMonths

  function patch(partial: Partial<ExtraPaymentsDraft>) {
    onChange({ ...state, ...partial })
  }

  function updateExtraordinaryRow(
    index: number,
    key: keyof ExtraPaymentRowDraft,
    value: string,
  ) {
    patch({
      extraordinaryRows: state.extraordinaryRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    })
  }

  function addExtraordinaryRow() {
    patch({
      extraordinaryRows: [...state.extraordinaryRows, { month: '', amount: '' }],
    })
  }

  function removeExtraordinaryRow(index: number) {
    patch({
      extraordinaryRows: state.extraordinaryRows.filter((_, rowIndex) => rowIndex !== index),
    })
  }

  return (
    <section className="form-card">
      <header className="form-card-header">
        <span className="form-card-badge" aria-hidden>
          {badge}
        </span>
        <div>
          <h3 className="section-title">Aportes adicionales</h3>
          <p className="section-description">{description}</p>
        </div>
      </header>

      <div className="form-card-content">
        <label className="choice-item" htmlFor="wantsPeriodicExtraPayments">
          <input
            id="wantsPeriodicExtraPayments"
            type="checkbox"
            checked={state.wantsPeriodicExtraPayments}
            onChange={(event) =>
              patch({ wantsPeriodicExtraPayments: event.target.checked })
            }
          />
          Quiero hacer abonos periodicos
        </label>

        {state.wantsPeriodicExtraPayments ? (
          <div className="form-grid form-grid-three">
            <div className="field">
              <label htmlFor="periodicExtraAmount">Monto del abono</label>
              <MoneyInput
                id="periodicExtraAmount"
                value={state.periodicExtraAmount}
                onChange={(value) => patch({ periodicExtraAmount: value })}
              />
            </div>
            <div className="field">
              <label htmlFor="periodicExtraEveryMonths">Cada cuantos meses</label>
              <input
                id="periodicExtraEveryMonths"
                type="number"
                min={1}
                step={1}
                value={state.periodicExtraEveryMonths}
                onChange={(event) =>
                  patch({ periodicExtraEveryMonths: event.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="periodicExtraOccurrences">Cuantas veces (opcional)</label>
              <input
                id="periodicExtraOccurrences"
                type="number"
                min={1}
                step={1}
                value={state.periodicExtraOccurrences}
                onChange={(event) =>
                  patch({ periodicExtraOccurrences: event.target.value })
                }
              />
            </div>
          </div>
        ) : null}

        <label className="choice-item" htmlFor="wantsExtraordinaryExtraPayments">
          <input
            id="wantsExtraordinaryExtraPayments"
            type="checkbox"
            checked={state.wantsExtraordinaryExtraPayments}
            onChange={(event) =>
              patch({ wantsExtraordinaryExtraPayments: event.target.checked })
            }
          />
          Quiero hacer abonos extraordinarios
        </label>

        {state.wantsExtraordinaryExtraPayments ? (
          <>
            {state.extraordinaryRows.map((row, index) => (
              <div key={`extra-row-${index}`} className="extra-row">
                <div className="field">
                  <label htmlFor={`extraMonth-${index}`}>Mes del abono</label>
                  <input
                    id={`extraMonth-${index}`}
                    type="number"
                    min={1}
                    step={1}
                    value={row.month}
                    onChange={(event) =>
                      updateExtraordinaryRow(index, 'month', event.target.value)
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor={`extraAmount-${index}`}>Valor del abono</label>
                  <MoneyInput
                    id={`extraAmount-${index}`}
                    value={row.amount}
                    onChange={(value) => updateExtraordinaryRow(index, 'amount', value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => removeExtraordinaryRow(index)}
                  aria-label={`Eliminar abono ${index + 1}`}
                >
                  Eliminar
                </button>
              </div>
            ))}
            {canAddExtraordinary ? (
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={addExtraordinaryRow}
              >
                + Agregar abono extraordinario
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  )
}
