import { useMemo, useState } from 'react'
import type { AmortizationRow } from '../../domain/loan.types'
import { formatCop } from '../../utils/currency'

interface ExcelCheckPanelProps {
  schedule: AmortizationRow[]
}

interface DiffRow {
  month: number
  field: string
  expected: number
  actual: number
  delta: number
  withinTolerance: boolean
}

const TOLERANCE_COP = 1

const FIELDS: Array<{
  key: keyof Pick<
    AmortizationRow,
    | 'beginningBalance'
    | 'interest'
    | 'principalPayment'
    | 'insurance'
    | 'totalPayment'
    | 'endingBalance'
  >
  label: string
}> = [
  { key: 'beginningBalance', label: 'Saldo inicial' },
  { key: 'interest', label: 'Interes' },
  { key: 'principalPayment', label: 'Capital' },
  { key: 'insurance', label: 'Seguro total' },
  { key: 'totalPayment', label: 'Pago total' },
  { key: 'endingBalance', label: 'Saldo final' },
]

export function ExcelCheckPanel({ schedule }: ExcelCheckPanelProps) {
  const [csvText, setCsvText] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const result = useMemo(() => {
    if (!enabled || !csvText.trim()) {
      return null
    }

    try {
      const parsed = parseCsvRows(csvText)
      const diffs: DiffRow[] = []

      const comparedRows = Math.min(parsed.length, schedule.length)
      for (let index = 0; index < comparedRows; index += 1) {
        const month = index + 1
        const expectedRow = schedule[index]
        const actualRow = parsed[index]

        FIELDS.forEach(({ key, label }) => {
          const expected = expectedRow[key]
          const actual = actualRow[key]
          const delta = actual - expected
          diffs.push({
            month,
            field: label,
            expected,
            actual,
            delta,
            withinTolerance: Math.abs(delta) <= TOLERANCE_COP,
          })
        })
      }

      const totalChecks = diffs.length
      const failedChecks = diffs.filter((item) => !item.withinTolerance).length
      const passedChecks = totalChecks - failedChecks
      const maxDelta = diffs.reduce(
        (max, item) => Math.max(max, Math.abs(item.delta)),
        0,
      )

      return {
        comparedRows,
        totalChecks,
        passedChecks,
        failedChecks,
        maxDelta,
        diffs,
        parsedLength: parsed.length,
      }
    } catch (parseError) {
      return {
        parseError:
          parseError instanceof Error ? parseError.message : 'Error parsing CSV',
      }
    }
  }, [csvText, enabled, schedule])

  function runValidation() {
    setEnabled(true)
    if (!csvText.trim()) {
      setError('Pega primero el CSV de Excel para comparar.')
      return
    }
    setError(null)
  }

  return (
    <section className="panel section">
      <h3 style={{ marginTop: 0 }}>Chequeo contra Excel (tolerancia +/-1 COP)</h3>
      <p style={{ color: '#486581' }}>
        Pega el CSV de Excel con columnas: Mes, Saldo inicial, Interes, Capital,
        Seguro, Pago total, Saldo final. Si hay columnas extra, se ignoran.
      </p>

      <textarea
        value={csvText}
        onChange={(event) => setCsvText(event.target.value)}
        style={{
          width: '100%',
          minHeight: '150px',
          border: '1px solid #bcccdc',
          borderRadius: '8px',
          padding: '0.6rem',
          fontFamily: 'Consolas, monospace',
        }}
        placeholder="Mes,Saldo inicial,Interes,Capital,Seguro,Pago total,Saldo final"
      />

      <button className="btn-primary" type="button" onClick={runValidation}>
        Comparar con proyeccion actual
      </button>

      {error ? <div className="field-error">{error}</div> : null}

      {result && 'parseError' in result ? (
        <div className="field-error">{result.parseError}</div>
      ) : null}

      {result && !('parseError' in result) ? (
        <div className="section">
          <div className="cards-grid">
            <Metric label="Filas Excel" value={String(result.parsedLength)} />
            <Metric label="Filas comparadas" value={String(result.comparedRows)} />
            <Metric label="Validaciones OK" value={String(result.passedChecks)} />
            <Metric
              label="Fuera de tolerancia"
              value={String(result.failedChecks)}
            />
            <Metric label="Delta maximo" value={formatCop(result.maxDelta)} />
          </div>

          {result.failedChecks > 0 ? (
            <div className="table-wrap section">
              <table>
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Campo</th>
                    <th>Esperado</th>
                    <th>Excel</th>
                    <th>Delta</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {result.diffs
                    .filter((item) => !item.withinTolerance)
                    .slice(0, 120)
                    .map((item, idx) => (
                      <tr key={`${item.month}-${item.field}-${idx}`}>
                        <td>{item.month}</td>
                        <td>{item.field}</td>
                        <td>{formatCop(item.expected)}</td>
                        <td>{formatCop(item.actual)}</td>
                        <td>{formatCop(item.delta)}</td>
                        <td>Fuera</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className="alert"
              style={{
                color: '#065f46',
                borderColor: '#a7f3d0',
                background: '#ecfdf5',
              }}
            >
              Todo dentro de tolerancia +/-1 COP.
            </div>
          )}
        </div>
      ) : null}
    </section>
  )
}

interface MetricProps {
  label: string
  value: string
}

function Metric({ label, value }: MetricProps) {
  return (
    <article className="card">
      <h4>{label}</h4>
      <p>{value}</p>
    </article>
  )
}

function parseCsvRows(text: string): AmortizationRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    throw new Error('No hay contenido para comparar.')
  }

  const delimiter =
    (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length
      ? ';'
      : ','

  const rows: AmortizationRow[] = []

  lines.forEach((line) => {
    const cells = line.split(delimiter).map((cell) => cell.trim())
    if (cells.length < 7) {
      return
    }

    const monthValue = toNumber(cells[0])
    if (!Number.isFinite(monthValue)) {
      return
    }

    const beginningBalance = toNumber(cells[1])
    const interest = toNumber(cells[2])
    const principalPayment = toNumber(cells[3])
    const insurance = toNumber(cells[4])
    const totalPayment = toNumber(cells[5])
    const endingBalance = toNumber(cells[6])

    if (
      !Number.isFinite(beginningBalance) ||
      !Number.isFinite(interest) ||
      !Number.isFinite(principalPayment) ||
      !Number.isFinite(insurance) ||
      !Number.isFinite(totalPayment) ||
      !Number.isFinite(endingBalance)
    ) {
      throw new Error(
        'El CSV contiene filas con formato numerico invalido en columnas monetarias.',
      )
    }

    rows.push({
      month: monthValue,
      beginningBalance,
      interest,
      principalPayment,
      extraPayment: 0,
      baseInsurance: insurance,
      lifeInsurance: 0,
      insurance,
      totalPayment,
      endingBalance,
    })
  })

  if (rows.length === 0) {
    throw new Error('No se detectaron filas de datos validas.')
  }

  return rows
}

function toNumber(raw: string): number {
  const cleaned = raw.replace(/["$\s]/g, '')
  const hasComma = cleaned.includes(',')
  const hasDot = cleaned.includes('.')

  let normalized = cleaned
  if (hasComma && hasDot) {
    normalized = cleaned.replace(/,/g, '')
  } else if (hasComma) {
    normalized = cleaned.replace(',', '.')
  }

  return Number(normalized)
}
