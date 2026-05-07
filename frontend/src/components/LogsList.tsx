import type { LogEntry, LogLevel } from '@/types/log'

interface LogsListProps {
  logs: LogEntry[]
}

const levelStyles: Record<LogLevel, string> = {
  INFO: 'bg-sky-400/15 text-sky-200 ring-1 ring-sky-400/30',
  WARNING: 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30',
  ERROR: 'bg-rose-400/15 text-rose-200 ring-1 ring-rose-400/30',
  DEBUG: 'bg-violet-400/15 text-violet-200 ring-1 ring-violet-400/30',
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(timestamp))
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

            <div className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${levelStyles[log.level]}`}>
              {log.level}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}