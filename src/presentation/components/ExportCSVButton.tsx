import type { AmortizationRow } from '../../domain/loan.types'
import { trackCsvExportado } from '../../application/analytics/events'
import { scheduleToCsv } from '../../utils/csv'

interface ExportCSVButtonProps {
  schedule: AmortizationRow[]
}

export function ExportCSVButton({ schedule }: ExportCSVButtonProps) {
  function downloadCsv() {
    const csv = scheduleToCsv(schedule)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'amortizacion.csv'
    anchor.click()

    URL.revokeObjectURL(url)
    trackCsvExportado()
  }

  return (
    <button type="button" className="btn-primary section" onClick={downloadCsv}>
      Exportar tabla CSV
    </button>
  )
}

