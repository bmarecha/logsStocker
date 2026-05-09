import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { LogLevel } from '@/types/log'
import { levelStyles } from '@/types/log'

interface LogsStatisticsProps {
  levelCounts: Record<LogLevel, number>
}

export function LogsStatistics({ levelCounts }: LogsStatisticsProps) {
  const data = Object.entries(levelCounts)
    .map(([level, count]) => ({
      name: level as LogLevel,
      value: count,
      color: levelStyles[level as LogLevel].color,
    }))
    .filter((item) => item.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-6 py-10 text-center text-sm text-slate-400">
        No data available
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Distribution by level</h2>
        <p className="text-sm text-slate-400">Breakdown of loaded logs</p>
      </div>

      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value, _name, entry) => [value, entry.payload.name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.map((item) => (
          <div
            key={item.name}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${levelStyles[item.name].bg} ${levelStyles[item.name].text} ring-1 ${levelStyles[item.name].ring}`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
            <span className="ml-1 font-normal">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
