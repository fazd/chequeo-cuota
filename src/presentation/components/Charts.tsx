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
import { useEffect, useState } from 'react'
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

const copTickFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function Charts({ schedule, baselineSchedule }: ChartsProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mediaQuery.matches)

    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  const hasExtraPayments = schedule.some((row) => row.extraPayment > 0)
  const balanceChartData = buildBalanceChartData(schedule, baselineSchedule)

  return (
    <section className="panel section">
      <div className="chart-grid">
        <div className="chart-card">
          <h3 className="chart-title">Evolucion del saldo pendiente</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={balanceChartData} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickMargin={8} />
                <YAxis
                  tickFormatter={(value) => formatCurrencyTick(value, isMobile)}
                  tickMargin={8}
                  width={isMobile ? 70 : 96}
                />
                <Tooltip
                  formatter={(value) => formatTooltipCurrency(value, isMobile)}
                  position={isMobile ? { x: 8, y: 8 } : undefined}
                />
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
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Distribucion mensual: interes vs capital</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={schedule} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickMargin={8} />
                <YAxis
                  tickFormatter={(value) => formatCurrencyTick(value, isMobile)}
                  tickMargin={8}
                  width={isMobile ? 70 : 96}
                />
                <Tooltip formatter={(value) => formatTooltipCurrency(value, isMobile)} />
                <Legend />
                <Bar dataKey="interest" fill="#ef8354" name="Interes" />
                <Bar dataKey="principalPayment" fill="#2d6a4f" name="Capital" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

function formatCurrencyTick(
  value: number | string | readonly (number | string)[] | undefined,
  isMobile: boolean,
): string {
  const numericValue = Number(Array.isArray(value) ? value[0] : value)
  if (!Number.isFinite(numericValue)) {
    return '$0'
  }

  if (isMobile && Math.abs(numericValue) >= 1_000_000) {
    return `$${formatMillions(numericValue)}`
  }

  return `$${copTickFormatter.format(Math.round(numericValue))}`
}

function formatTooltipCurrency(
  value: number | string | readonly (number | string)[] | undefined,
  isMobile: boolean,
): string {
  const numericValue = Number(Array.isArray(value) ? value[0] : value)
  if (!Number.isFinite(numericValue)) {
    return '$0'
  }

  if (isMobile && Math.abs(numericValue) >= 1_000_000) {
    return `$${formatMillions(numericValue)}`
  }

  return formatCop(numericValue)
}

function formatMillions(value: number): string {
  const millions = value / 1_000_000
  const formatted = millions.toFixed(2).replace(/\.?0+$/, '')
  return `${formatted}M`
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
