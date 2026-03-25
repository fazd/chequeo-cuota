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
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { formatCop } from '../../../utils/currency'

export interface ChartLineSeries {
  key: string
  label: string
  color: string
  dashed?: boolean
}

export interface ChartBarSeries {
  key: string
  label: string
  color: string
}

export interface ChartDataRow {
  month: number
  [key: string]: number | undefined
}

interface FinancialChartsPanelProps {
  balanceTitle: string
  distributionTitle: string
  balanceData: ChartDataRow[]
  distributionData: ChartDataRow[]
  balanceSeries: ChartLineSeries[]
  distributionSeries: ChartBarSeries[]
}

const copTickFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function FinancialChartsPanel({
  balanceTitle,
  distributionTitle,
  balanceData,
  distributionData,
  balanceSeries,
  distributionSeries,
}: FinancialChartsPanelProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [hideBalanceTooltip, setHideBalanceTooltip] = useState(true)
  const [hideDistributionTooltip, setHideDistributionTooltip] = useState(true)
  const balanceChartRef = useRef<HTMLDivElement | null>(null)
  const distributionChartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mediaQuery.matches)

    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setHideBalanceTooltip(false)
      setHideDistributionTooltip(false)
      return
    }

    const handleScroll = () => {
      setHideBalanceTooltip(true)
      setHideDistributionTooltip(true)
    }

    const handleTouchStart = (event: TouchEvent) => {
      const target = event.target as Node | null
      setHideBalanceTooltip(!balanceChartRef.current?.contains(target ?? null))
      setHideDistributionTooltip(!distributionChartRef.current?.contains(target ?? null))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [isMobile])

  return (
    <section className="panel section">
      <div className="chart-grid">
        <div className="chart-card">
          <h3 className="chart-title">{balanceTitle}</h3>
          <div ref={balanceChartRef} className="chart-container" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart
                data={balanceData}
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
                  content={<ChartTooltip isMobile={isMobile} isHidden={isMobile && hideBalanceTooltip} />}
                  wrapperStyle={buildTooltipWrapperStyle(isMobile)}
                  allowEscapeViewBox={{ x: false, y: false }}
                />
                <Legend
                  align="center"
                  verticalAlign="bottom"
                  height={isMobile ? 24 : undefined}
                  wrapperStyle={isMobile ? { paddingTop: 4 } : undefined}
                />
                {balanceSeries.map((series) => (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    stroke={series.color}
                    strokeDasharray={series.dashed ? '4 4' : undefined}
                    name={series.label}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">{distributionTitle}</h3>
          <div ref={distributionChartRef} className="chart-container" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={distributionData} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickMargin={8} />
                <YAxis
                  tickFormatter={(value) => formatCurrencyTick(value)}
                  tickMargin={8}
                  width={isMobile ? 70 : 96}
                />
                <Tooltip
                  content={<ChartTooltip isMobile={isMobile} isHidden={isMobile && hideDistributionTooltip} />}
                  wrapperStyle={buildTooltipWrapperStyle(isMobile)}
                  allowEscapeViewBox={{ x: false, y: false }}
                />
                <Legend />
                {distributionSeries.map((series) => (
                  <Bar
                    key={series.key}
                    dataKey={series.key}
                    fill={series.color}
                    name={series.label}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

function formatCurrencyTick(value: number | string | readonly (number | string)[] | undefined): string {
  const numericValue = Number(Array.isArray(value) ? value[0] : value)
  if (!Number.isFinite(numericValue)) {
    return '$0'
  }

  if (Math.abs(numericValue) >= 1_000_000) {
    return `$${formatMillions(numericValue)}`
  }

  return `$${copTickFormatter.format(Math.round(numericValue))}`
}

function formatTooltipCurrency(value: number | string | readonly (number | string)[] | undefined): string {
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
      display: 'flex',
      justifyContent: 'center',
      maxWidth: '100%',
    }
  }

  return {
    pointerEvents: 'none',
  }
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
  isHidden?: boolean
}

function ChartTooltip({ active, payload, label, isMobile, isHidden }: ChartTooltipProps) {
  if (isHidden || !active || !payload || payload.length === 0) {
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
    const firstLine = pairTexts.slice(0, 2).join(' | ')
    const secondLine = pairTexts.slice(2).join(' | ')

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

