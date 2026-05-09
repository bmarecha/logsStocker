export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG'

export const levelStyles: Record<LogLevel, { bg: string; text: string; ring: string; color: string }> = {
  INFO: { bg: 'bg-sky-400/15', text: 'text-sky-200', ring: 'ring-sky-400/30', color: '#0ea5e9' },
  WARNING: { bg: 'bg-amber-400/15', text: 'text-amber-200', ring: 'ring-amber-400/30', color: '#fbbf24' },
  ERROR: { bg: 'bg-rose-400/15', text: 'text-rose-200', ring: 'ring-rose-400/30', color: '#f43f5e' },
  DEBUG: { bg: 'bg-violet-400/15', text: 'text-violet-200', ring: 'ring-violet-400/30', color: '#a78bfa' },
}

export const levelBadgeStyles: Record<LogLevel, string> = {
  INFO: `${levelStyles.INFO.bg} ${levelStyles.INFO.text} ring-1 ${levelStyles.INFO.ring}`,
  WARNING: `${levelStyles.WARNING.bg} ${levelStyles.WARNING.text} ring-1 ${levelStyles.WARNING.ring}`,
  ERROR: `${levelStyles.ERROR.bg} ${levelStyles.ERROR.text} ring-1 ${levelStyles.ERROR.ring}`,
  DEBUG: `${levelStyles.DEBUG.bg} ${levelStyles.DEBUG.text} ring-1 ${levelStyles.DEBUG.ring}`,
}

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  service: string
}

export interface LogFilters {
  query: string
  level: LogLevel | ''
  service: string
  dateFrom: string
  dateTo: string
}

export interface LogInput {
  timestamp: string
  level: LogLevel
  message: string
  service: string
}

export interface SearchResponse {
  total: number
  loaded: number
  page_num: number
  page_size: number
  results: LogEntry[]
  level_counts: Record<LogLevel, number>
}