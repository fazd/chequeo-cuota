import { MoneyInput } from './MoneyInput'

export interface InsuranceCardState {
  hasFixedInsurance: boolean
  monthlyInsurance: string
  hasVariableInsurance: boolean
  monthlyLifeInsuranceRatePct: string
}

interface InsuranceCardProps {
  badge: string
  description: string
  idPrefix: string
  allowVariable: boolean
  state: InsuranceCardState
  onChange: (next: InsuranceCardState) => void
}

export function InsuranceCard({
  badge,
  description,
  idPrefix,
  allowVariable,
  state,
  onChange,
}: InsuranceCardProps) {
  function patch(partial: Partial<InsuranceCardState>) {
    onChange({ ...state, ...partial })
  }

  return (
    <section className="form-card">
      <header className="form-card-header">
        <span className="form-card-badge" aria-hidden>
          {badge}
        </span>
        <div>
          <h3 className="section-title">Seguros</h3>
          <p className="section-description">{description}</p>
        </div>
      </header>

      <div className="form-card-content">
        <div className="choice-group choice-group-inline">
          <label className="choice-item" htmlFor={`${idPrefix}-hasFixedInsurance`}>
            <input
              id={`${idPrefix}-hasFixedInsurance`}
              type="checkbox"
              checked={state.hasFixedInsurance}
              onChange={(event) =>
                patch({ hasFixedInsurance: event.target.checked })
              }
            />
            Seguro fijo
          </label>

          {allowVariable ? (
            <label className="choice-item" htmlFor={`${idPrefix}-hasVariableInsurance`}>
              <input
                id={`${idPrefix}-hasVariableInsurance`}
                type="checkbox"
                checked={state.hasVariableInsurance}
                onChange={(event) =>
                  patch({ hasVariableInsurance: event.target.checked })
                }
              />
              Seguro variable
            </label>
          ) : null}
        </div>

        <div className="form-grid">
          {state.hasFixedInsurance ? (
            <div className="field">
              <label htmlFor={`${idPrefix}-monthlyInsurance`}>Valor del seguro fijo</label>
              <MoneyInput
                id={`${idPrefix}-monthlyInsurance`}
                value={state.monthlyInsurance}
                onChange={(value) => patch({ monthlyInsurance: value })}
              />
            </div>
          ) : null}

          {allowVariable && state.hasVariableInsurance ? (
            <div className="field">
              <label htmlFor={`${idPrefix}-monthlyLifeInsuranceRatePct`}>
                Interes del seguro variable (%)
              </label>
              <input
                id={`${idPrefix}-monthlyLifeInsuranceRatePct`}
                type="number"
                min={0}
                step="any"
                value={state.monthlyLifeInsuranceRatePct}
                onChange={(event) =>
                  patch({ monthlyLifeInsuranceRatePct: event.target.value })
                }
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
