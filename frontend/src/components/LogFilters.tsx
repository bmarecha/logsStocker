import type { LogFilters, LogLevel } from '@/types/log'

interface LogFiltersPanelProps {
  filters: LogFilters
  levelOptions: LogLevel[]
  onChange: (filters: LogFilters) => void
}

export function LogFiltersPanel({ filters, levelOptions, onChange }: LogFiltersPanelProps) {
  const updateFilter = <Key extends keyof LogFilters>(key: Key, value: LogFilters[Key]) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-5">
      <label className="block">
        <input
          type="text"
          value={filters.query}
          onChange={(event) => updateFilter('query', event.target.value)}
          placeholder="Search full text in the message field"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
        />
      </label>

      <div className="flex items-center gap-3">
        <span className="flex w-20 shrink-0 items-center justify-center text-center text-sm font-medium text-slate-300 sm:w-24">
          Level
        </span>
        <select
          value={filters.level}
          onChange={(event) => updateFilter('level', event.target.value as LogFilters['level'])}
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
        >
          <option value="">All levels</option>
          {levelOptions.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-3">
        <span className="flex w-20 shrink-0 items-center justify-center text-center text-sm font-medium text-slate-300 sm:w-24">
          Service
        </span>
        <input
          type="text"
          value={filters.service}
          onChange={(event) => updateFilter('service', event.target.value)}
          placeholder="Filter by lowercase service name"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
        />
      </label>
    </div>
  )
}