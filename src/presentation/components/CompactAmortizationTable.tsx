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

const EPSILON = 0.000001

export function CompactAmortizationTable({ rows }: CompactAmortizationTableProps) {
  const showExtraPayment = hasAnySignificantValue(rows, (row) => row.extraPayment)
  const showBaseInsurance = hasAnySignificantValue(rows, (row) => row.baseInsurance)
  const showLifeInsurance = hasAnySignificantValue(rows, (row) => row.lifeInsurance)
  const showTotalInsurance = hasAnySignificantValue(rows, (row) => row.insurance)

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
              {showExtraPayment ? <th>Abono extra</th> : null}
              {showBaseInsurance ? <th>Seguro base</th> : null}
              {showLifeInsurance ? <th>Seguro vida</th> : null}
              {showTotalInsurance ? <th>Seguros total</th> : null}
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
                {showExtraPayment ? <td>{formatCop(row.extraPayment)}</td> : null}
                {showBaseInsurance ? <td>{formatCop(row.baseInsurance)}</td> : null}
                {showLifeInsurance ? <td>{formatCop(row.lifeInsurance)}</td> : null}
                {showTotalInsurance ? <td>{formatCop(row.insurance)}</td> : null}
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

function hasAnySignificantValue(
  rows: RowLike[],
  selector: (row: RowLike) => number,
): boolean {
  return rows.some((row) => Math.abs(selector(row)) > EPSILON)
}
