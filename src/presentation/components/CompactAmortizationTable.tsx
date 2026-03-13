import { formatCop } from '../../utils/currency'

interface RowLike {
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

interface CompactAmortizationTableProps {
  rows: RowLike[]
}

export function CompactAmortizationTable({ rows }: CompactAmortizationTableProps) {
  return (
    <section className="panel section">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Saldo inicial</th>
              <th className="col-interest">Interes</th>
              <th className="col-principal">Capital</th>
              <th>Abono extra</th>
              <th>Seguro base</th>
              <th>Seguro vida</th>
              <th>Seguros total</th>
              <th>Pago total</th>
              <th>Saldo final</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month}>
                <td>{row.month}</td>
                <td>{formatCop(row.beginningBalance)}</td>
                <td className="col-interest">{formatCop(row.interest)}</td>
                <td className="col-principal">{formatCop(row.principalPayment)}</td>
                <td>{formatCop(row.extraPayment)}</td>
                <td>{formatCop(row.baseInsurance)}</td>
                <td>{formatCop(row.lifeInsurance)}</td>
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
