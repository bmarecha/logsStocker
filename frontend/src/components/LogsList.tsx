import type { LogEntry, LogLevel } from '@/types/log'
import { levelBadgeStyles } from '@/types/log'

interface LogsListProps {
  logs: LogEntry[]
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat(navigator.language || 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date)
}

export function LogsList({ logs }: LogsListProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-6 py-10 text-center text-sm text-slate-400">
        No logs match the current filters.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <article
          key={log.id}
          className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-lg shadow-black/20"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3 lg:max-w-4xl lg:flex-1">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>{formatTimestamp(log.timestamp)}</span>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-300">
                  {log.service}
                </span>
              </div>

              <p className="text-sm leading-6 text-slate-200">{log.message}</p>
            </div>

            <div className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${levelBadgeStyles[log.level]}`}>
              {log.level}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}