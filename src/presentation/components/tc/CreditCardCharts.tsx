import type { CreditCardMonthRow } from '../../../domain/tc/loan.types'
import {
  FinancialChartsPanel,
  type ChartBarSeries,
  type ChartDataRow,
  type ChartLineSeries,
} from '../charts/FinancialChartsPanel'

interface CreditCardChartsProps {
  schedule: CreditCardMonthRow[]
  baselineSchedule?: CreditCardMonthRow[]
}

export function CreditCardCharts({ schedule, baselineSchedule }: CreditCardChartsProps) {
  const hasExtraPayments = schedule.some((row) => Math.abs(row.extraPayment) > 0.000001)
  const hasBaseline = Boolean(
    hasExtraPayments && baselineSchedule && baselineSchedule.length > 0,
  )
  const hasHandlingFee = schedule.some((row) => row.handlingFee > 0)
  const hasInsurance = schedule.some((row) => row.insurance > 0)

  const balanceSeries: ChartLineSeries[] = hasBaseline
    ? [
        { key: 'debtWithExtras', label: 'Deuda (simulada)', color: '#1e4a72' },
        {
          key: 'debtWithoutExtras',
          label: 'Deuda (sin aportes)',
          color: '#475569',
          dashed: true,
        },
      ]
    : [{ key: 'debtWithExtras', label: 'Deuda', color: '#1e4a72' }]

  const distributionSeries: ChartBarSeries[] = [
    { key: 'interest', label: 'Interes', color: '#f5a623' },
    { key: 'principalDelta', label: 'Aporte a capital', color: '#2e9b6f' },
    ...(hasHandlingFee
      ? [{ key: 'handlingFee', label: 'Cuota manejo', color: '#1e4a72' }]
      : []),
    ...(hasInsurance ? [{ key: 'insurance', label: 'Seguro', color: '#64748b' }] : []),
  ]
  const distributionData = buildDistributionData(schedule, hasHandlingFee, hasInsurance)

  return (
    <FinancialChartsPanel
      balanceTitle="Evolucion deuda de tarjeta"
      distributionTitle="Componentes del pago mensual"
      balanceData={buildBalanceRows(schedule, baselineSchedule)}
      distributionData={distributionData}
      balanceSeries={balanceSeries}
      distributionSeries={distributionSeries}
    />
  )
}

function buildBalanceRows(
  schedule: CreditCardMonthRow[],
  baselineSchedule?: CreditCardMonthRow[],
): ChartDataRow[] {
  const comparison = baselineSchedule ?? schedule
  const maxLength = Math.max(schedule.length, comparison.length)

  return Array.from({ length: maxLength }, (_, index) => ({
    month: index + 1,
    debtWithExtras: schedule[index]?.endingDebt,
    debtWithoutExtras: comparison[index]?.endingDebt,
  }))
}

function buildDistributionData(
  schedule: CreditCardMonthRow[],
  includeHandlingFee: boolean,
  includeInsurance: boolean,
): ChartDataRow[] {
  return schedule.map((row) => ({
    month: row.month,
    interest: row.interest,
    principalDelta: row.principalDelta,
    handlingFee: includeHandlingFee ? row.handlingFee : undefined,
    insurance: includeInsurance ? row.insurance : undefined,
  }))
}
