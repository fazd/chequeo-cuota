import type { CreditCardMonthRow } from '../../../domain/tc/loan.types'
import { formatCop, formatPercent } from '../../../utils/currency'

interface CreditCardTableProps {
  rows: CreditCardMonthRow[]
}

export function CreditCardTable({ rows }: CreditCardTableProps) {
  const showExtraPayment = rows.some((row) => Math.abs(row.extraPayment) > 0.000001)
  const showLimitColumns = rows.some((row) => row.usedLimitPct != null)
  const showHandlingFee = rows.some((row) => Math.abs(row.handlingFee) > 0.000001)
  const showInsurance = rows.some((row) => Math.abs(row.insurance) > 0.000001)

  return (
    <section className="panel section">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Deuda inicial</th>
              <th>Interes</th>
              {showHandlingFee ? <th>Cuota manejo</th> : null}
              {showInsurance ? <th>Seguro</th> : null}
              <th>Pago minimo</th>
              {showExtraPayment ? <th>Aporte</th> : null}
              <th>Pago total</th>
              <th>Aporte a capital</th>
              <th>Deuda final</th>
              {showLimitColumns ? <th>% cupo usado</th> : null}
              {showLimitColumns ? <th>Cupo liberado</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.month}-${row.endingDebt}`}>
                <td>{row.month}</td>
                <td>{formatCop(row.beginningDebt)}</td>
                <td>{formatCop(row.interest)}</td>
                {showHandlingFee ? <td>{formatCop(row.handlingFee)}</td> : null}
                {showInsurance ? <td>{formatCop(row.insurance)}</td> : null}
                <td>{formatCop(row.minimumPayment)}</td>
                {showExtraPayment ? <td>{formatCop(row.extraPayment)}</td> : null}
                <td>{formatCop(row.totalPayment)}</td>
                <td>{formatCop(row.principalDelta)}</td>
                <td>{formatCop(row.endingDebt)}</td>
                {showLimitColumns ? (
                  <td>{row.usedLimitPct == null ? '-' : formatPercent(row.usedLimitPct)}</td>
                ) : null}
                {showLimitColumns ? (
                  <td>{row.releasedLimitAmount == null ? '-' : formatCop(row.releasedLimitAmount)}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
