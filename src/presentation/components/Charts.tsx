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
import type { CSSProperties } from 'react'
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
  console.log('schedule', schedule)
  const hasExtraPayments = schedule.some((row) => row.extraPayment > 0.01)
  const balanceChartData = buildBalanceChartData(schedule, baselineSchedule)
  const hasInsurance = schedule.some((row) => row.insurance > 0)

  const monthlyDistribution = hasInsurance ? "Distribución mensual: interes vs capital vs seguros" : "Distribución mensual: interes vs capital"

  return (
    <section className="panel section">
      <div className="chart-grid">
        <div className="chart-card">
          <h3 className="chart-title">Evolucion del saldo pendiente</h3>
          <div className="chart-container" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart
                data={balanceChartData}
                margin={{ top: 8, right: 12, left: 12, bottom: isMobile ? 36 : 8 }}
              >
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickMargin={isMobile ? 12 : 8} height={isMobile ? 28 : undefined} />
                <YAxis
                  tickFormatter={(value) => formatCurrencyTick(value)}
                  tickMargin={8}
                  width={isMobile ? 70 : 96}
                />
                <Tooltip
                  content={<ChartTooltip isMobile={isMobile} />}
                  wrapperStyle={buildTooltipWrapperStyle(isMobile)}
                  allowEscapeViewBox={{ x: false, y: false }}
                />
                <Legend
                  align="center"
                  verticalAlign="bottom"
                  height={isMobile ? 24 : undefined}
                  wrapperStyle={isMobile ? { paddingTop: 4 } : undefined}
                />
                {hasExtraPayments ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="balanceWithExtras"
                      stroke="#1e4a72"
                      name="Saldo (con aportes)"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="balanceWithoutExtras"
                      stroke="#475569"
                      strokeDasharray="4 4"
                      name="Saldo (sin aportes)"
                      dot={false}
                    />
                  </>
                ) : (
                  <Line type="monotone" dataKey="balanceWithExtras" stroke="#1e4a72" name="Saldo" dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">{monthlyDistribution}</h3>
          <div className="chart-container" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={schedule} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickMargin={8} />
                <YAxis
                  tickFormatter={(value) => formatCurrencyTick(value)}
                  tickMargin={8}
                  width={isMobile ? 70 : 96}
                />
                <Tooltip
                  content={<ChartTooltip isMobile={isMobile} />}
                  wrapperStyle={buildTooltipWrapperStyle(isMobile)}
                  allowEscapeViewBox={{ x: false, y: false }}
                />
                <Legend />
                <Bar dataKey="interest" fill="#f5a623" name="Interes" />
                <Bar dataKey="principalPayment" fill="#2e9b6f" name="Capital" />
                {hasInsurance ? <Bar dataKey="insurance" fill="#475569" name="Seguros" /> : null}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

function formatCurrencyTick(
  value: number | string | readonly (number | string)[] | undefined
): string {
  const numericValue = Number(Array.isArray(value) ? value[0] : value)
  if (!Number.isFinite(numericValue)) {
    return '$0'
  }

  if (Math.abs(numericValue) >= 1_000_000) {
    return `$${formatMillions(numericValue)}`
  }

  return `$${copTickFormatter.format(Math.round(numericValue))}`
}

function formatTooltipCurrency(
  value: number | string | readonly (number | string)[] | undefined): string {
  const numericValue = Number(Array.isArray(value) ? value[0] : value)
  if (!Number.isFinite(numericValue)) {
    return '$0'
  }

  if (Math.abs(numericValue) >= 1_000_000) {
    return `$${formatMillions(numericValue)}`
  }

  return formatCop(numericValue)
}

function formatMillions(value: number): string {
  const millions = value / 1_000_000
  const formatted = millions.toFixed(2).replace(/\.?0+$/, '')
  return `${formatted}M`
}

function buildTooltipWrapperStyle(isMobile: boolean): CSSProperties {
  if (isMobile) {
    return {
      position: 'absolute',
      left: 8,
      right: 8,
      top: 8,
      pointerEvents: 'none',
    }
  }

  return {
    pointerEvents: 'none',
  }
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

type ChartTooltipProps = {
  active?: boolean
  payload?: Array<{
    name?: string
    dataKey?: string
    value?: number
  }>
  label?: number | string
  isMobile: boolean
}

function ChartTooltip({ active, payload, label, isMobile }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const lines = payload
    .filter((entry) => entry && Number.isFinite(entry.value))
    .map((entry) => ({
      label: entry.name ?? String(entry.dataKey ?? ''),
      value: formatTooltipCurrency(entry.value ?? 0),
    }))

  if (lines.length === 0) {
    return null
  }

  if (isMobile) {
    const pairTexts = lines.map((line) => `${line.label}: ${line.value}`)
    const firstLine = pairTexts.slice(0, 2).join(' · ')
    const secondLine = pairTexts.slice(2).join(' · ')

    return (
      <div className="chart-tooltip-band is-mobile">
        <span className="chart-tooltip-title">Mes {label}</span>
        <span className="chart-tooltip-line">{firstLine}</span>
        {secondLine ? <span className="chart-tooltip-line">{secondLine}</span> : null}
      </div>
    )
  }

  return (
    <div className="chart-tooltip-band">
      <span className="chart-tooltip-title">Mes {label}</span>
      {lines.map((line) => (
        <span key={line.label} className="chart-tooltip-line">
          {line.label}: {line.value}
        </span>
      ))}
    </div>
  )
}
