import type { AmortizationRow } from '../../domain/loan.types'
import { formatCop } from '../../utils/currency'

interface AmortizationTableProps {
  rows: AmortizationRow[]
}

export function AmortizationTable({ rows }: AmortizationTableProps) {
  return (
    <section className="panel section">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Saldo inicial</th>
              <th>Interes</th>
              <th>Capital</th>
              <th>Seguro</th>
              <th>Pago total</th>
              <th>Saldo final</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month}>
                <td>{row.month}</td>
                <td>{formatCop(row.beginningBalance)}</td>
                <td>{formatCop(row.interest)}</td>
                <td>{formatCop(row.principalPayment)}</td>
                <td>{formatCop(row.insurance)}</td>
                <td>{formatCop(row.totalPayment)}</td>
                <td>{formatCop(row.endingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
