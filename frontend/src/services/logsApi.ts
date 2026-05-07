import axios from 'axios'
import type { LogEntry, LogFilters, LogInput, SearchResponse } from '@/types/log'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  timeout: 5000,
})

function normalizeFilters(filters: LogFilters) {
  return {
    q: filters.query.trim() || undefined,
    level: filters.level || undefined,
    service: filters.service.trim() || undefined,
  }
}


export async function searchLogs(
  filters: LogFilters,
  page_num = 1,
  page_size = 20,
): Promise<SearchResponse> {
  const params = {
    ...normalizeFilters(filters),
    page_num,
    page_size,
  }

  const response = await api.get<SearchResponse>('/logs/search', {
    params,
  })

  return response.data
}

export async function createLog(payload: LogInput): Promise<LogEntry> {
  const response = await api.post<LogEntry>('/logs', payload)

  return response.data
}