import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AmortizationRow } from '../../domain/loan.types'
import { formatCop } from '../../utils/currency'

interface ChartsProps {
  schedule: AmortizationRow[]
  baselineSchedule?: AmortizationRow[]
}

interface BalanceChartRow {
  month: number
  balanceWithExtras?: number
  balanceWithoutExtras?: number
}

export function Charts({ schedule, baselineSchedule }: ChartsProps) {
  const hasExtraPayments = schedule.some((row) => row.extraPayment > 0)
  const balanceChartData = buildBalanceChartData(schedule, baselineSchedule)

  return (
    <section className="panel section">
      <div className="chart-grid">
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={balanceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrencyTick} />
              <Tooltip formatter={formatTooltipCurrency} />
              <Legend />
              <Line
                type="monotone"
                dataKey="balanceWithExtras"
                stroke="#0b5ed7"
                name="Saldo (con aportes)"
                dot={false}
              />
              {hasExtraPayments ? (
                <Line
                  type="monotone"
                  dataKey="balanceWithoutExtras"
                  stroke="#6b7280"
                  strokeDasharray="4 4"
                  name="Saldo (sin aportes)"
                  dot={false}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={schedule}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrencyTick} />
              <Tooltip formatter={formatTooltipCurrency} />
              <Legend />
              <Bar dataKey="interest" fill="#ef8354" name="Interes" />
              <Bar dataKey="principalPayment" fill="#2d6a4f" name="Capital" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

function formatCurrencyTick(value: number | string | undefined): string {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return '$ 0,00'
  }
  return formatCop(numericValue)
}

function formatTooltipCurrency(value: number | string | undefined): string {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return '$ 0,00'
  }
  return formatCop(numericValue)
}

function buildBalanceChartData(
  schedule: AmortizationRow[],
  baselineSchedule?: AmortizationRow[],
): BalanceChartRow[] {
  const comparisonSchedule = baselineSchedule ?? schedule
  const maxLength = Math.max(schedule.length, comparisonSchedule.length)
  const rows: BalanceChartRow[] = []

  for (let index = 0; index < maxLength; index += 1) {
    rows.push({
      month: index + 1,
      balanceWithExtras: schedule[index]?.beginningBalance,
      balanceWithoutExtras: comparisonSchedule[index]?.beginningBalance,
    })
  }

  return rows
}

