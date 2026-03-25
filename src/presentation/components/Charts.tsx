import type { AmortizationRow } from '../../domain/loan.types'
import {
  FinancialChartsPanel,
  type ChartBarSeries,
  type ChartDataRow,
  type ChartLineSeries,
} from './charts/FinancialChartsPanel'

interface ChartsProps {
  schedule: AmortizationRow[]
  baselineSchedule?: AmortizationRow[]
}

export function Charts({ schedule, baselineSchedule }: ChartsProps) {
  const hasExtraPayments = schedule.some((row) => row.extraPayment > 0.01)
  const balanceData = buildBalanceChartData(schedule, baselineSchedule)
  const hasInsurance = schedule.some((row) => row.insurance > 0)

  const balanceSeries: ChartLineSeries[] = hasExtraPayments
    ? [
        { key: 'balanceWithExtras', label: 'Saldo (con aportes)', color: '#1e4a72' },
        {
          key: 'balanceWithoutExtras',
          label: 'Saldo (sin aportes)',
          color: '#475569',
          dashed: true,
        },
      ]
    : [{ key: 'balanceWithExtras', label: 'Saldo', color: '#1e4a72' }]

  const distributionSeries: ChartBarSeries[] = [
    { key: 'interest', label: 'Interes', color: '#f5a623' },
    { key: 'principalPayment', label: 'Capital', color: '#2e9b6f' },
    ...(hasInsurance ? [{ key: 'insurance', label: 'Seguros', color: '#475569' }] : []),
  ]
  const distributionData = buildDistributionData(schedule, hasInsurance)

  return (
    <FinancialChartsPanel
      balanceTitle="Evolucion del saldo pendiente"
      distributionTitle={
        hasInsurance
          ? 'Distribucion mensual: interes vs capital vs seguros'
          : 'Distribucion mensual: interes vs capital'
      }
      balanceData={balanceData}
      distributionData={distributionData}
      balanceSeries={balanceSeries}
      distributionSeries={distributionSeries}
    />
  )
}

function buildBalanceChartData(
  schedule: AmortizationRow[],
  baselineSchedule?: AmortizationRow[],
): ChartDataRow[] {
  const comparisonSchedule = baselineSchedule ?? schedule
  const maxLength = Math.max(schedule.length, comparisonSchedule.length)
  const rows: ChartDataRow[] = []

  for (let index = 0; index < maxLength; index += 1) {
    rows.push({
      month: index + 1,
      balanceWithExtras: schedule[index]?.beginningBalance,
      balanceWithoutExtras: comparisonSchedule[index]?.beginningBalance,
    })
  }

  return rows
}

function buildDistributionData(
  schedule: AmortizationRow[],
  includeInsurance: boolean,
): ChartDataRow[] {
  return schedule.map((row) => ({
    month: row.month,
    interest: row.interest,
    principalPayment: row.principalPayment,
    insurance: includeInsurance ? row.insurance : undefined,
  }))
}
