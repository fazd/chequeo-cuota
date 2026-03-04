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

interface ChartsProps {
  schedule: AmortizationRow[]
}

export function Charts({ schedule }: ChartsProps) {
  return (
    <section className="panel section">
      <div className="chart-grid">
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={schedule}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="beginningBalance"
                stroke="#0b5ed7"
                name="Saldo"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={schedule}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
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
