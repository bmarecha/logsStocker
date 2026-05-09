import type { LogFilters, LogLevel } from '@/types/log'

interface LogFiltersPanelProps {
  filters: LogFilters
  levelOptions: LogLevel[]
  onChange: (filters: LogFilters) => void
}

function isoToLocalDatetimeString(isoString: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function localDatetimeToIso(localString: string): string {
  if (!localString) return ''
  return new Date(localString).toISOString()
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
          placeholder="Filter by service name"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
        />
      </label>

      <label className="flex items-center gap-3">
        <span className="flex w-20 shrink-0 items-center justify-center text-center text-sm font-medium text-slate-300 sm:w-24">
          From
        </span>
        <input
          type="datetime-local"
          value={isoToLocalDatetimeString(filters.dateFrom)}
          onChange={(event) => {
            let value = event.target.value
            if (value && value.length === 10) {
              value = value + 'T00:00'
            }
            updateFilter('dateFrom', value ? localDatetimeToIso(value) : '')
          }}
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
        />
      </label>

      <label className="flex items-center gap-3">
        <span className="flex w-20 shrink-0 items-center justify-center text-center text-sm font-medium text-slate-300 sm:w-24">
          To
        </span>
        <input
          type="datetime-local"
          value={isoToLocalDatetimeString(filters.dateTo)}
          onChange={(event) => {
            let value = event.target.value
            if (value && value.length === 10) {
              value = value + 'T23:59'
            }
            updateFilter('dateTo', value ? localDatetimeToIso(value) : '')
          }}
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
        />
      </label>
    </div>
  )
}