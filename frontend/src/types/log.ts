export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG'

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
}

export interface LogInput {
  timestamp: string
  level: LogLevel
  message: string
  service: string
}

export interface SearchResponse {
  total: number
  page_num: number
  page_size: number
  results: LogEntry[]
}