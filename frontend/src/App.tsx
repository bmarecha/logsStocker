import { useEffect, useState } from 'react'
import { LogFiltersPanel } from '@/components/LogFilters'
import { LogForm } from '@/components/LogForm'
import { LogsList } from '@/components/LogsList'
import { createLog, searchLogs } from '@/services/logsApi'
import type { LogEntry, LogFilters, LogInput, LogLevel } from '@/types/log'

const logLevels: LogLevel[] = ['INFO', 'WARNING', 'ERROR', 'DEBUG']

const defaultFilters: LogFilters = {
  query: '',
  level: '',
  service: '',
}

function App() {
  const [filters, setFilters] = useState<LogFilters>(defaultFilters)
  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>([])
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState<number>(0)
  const loadLogs = async (
    currentFilters: LogFilters,
    page = 1,
    pageSize = itemsPerPage,
  ) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await searchLogs(currentFilters, page, pageSize)
      setVisibleLogs(response.results)
      setTotalCount(response.total)
    } catch {
      setVisibleLogs([])
      setTotalCount(0)
      setErrorMessage('Failed to fetch logs from the backend.')
    } finally {
      setIsLoading(false)
    }
  }

  // Immediately refetch when filters change
  useEffect(() => {
    void loadLogs(filters, 1, itemsPerPage)
    setCurrentPage(1)
  }, [filters])

  useEffect(() => {
    setCurrentPage(1)
    void loadLogs(filters, 1, itemsPerPage)
  }, [itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
    void loadLogs(filters, currentPage, itemsPerPage)
  }, [currentPage])

  const paginatedLogs = visibleLogs

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1))
  }

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1))
  }

  const handleCreateLog = async (payload: LogInput) => {
    try {
      await createLog(payload)
      await loadLogs(filters, 1, itemsPerPage)
      setIsCreateFormOpen(false)
    } catch {
      setErrorMessage('Failed to create log.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {errorMessage && (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </div>
        )}

        <header className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">Logs workspace</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-300">
                Search logs, refine them with filters, and add new entries from the same page.
              </p>
            </div>
            <div className="text-sm text-slate-400">
              {isLoading ? 'Refreshing logs...' : `${totalCount} log(s) loaded`}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Filters and search</h2>
                <p className="text-sm text-slate-400">One exclusive level filter, plus text search.</p>
              </div>
              <button
                type="button"
                onClick={() => setFilters(defaultFilters)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/60 hover:text-cyan-200"
              >
                Reset
              </button>
            </div>

            <LogFiltersPanel
              filters={filters}
              onChange={setFilters}
              levelOptions={logLevels}
            />
          </div>

          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 p-6 shadow-xl shadow-black/10">
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Create log</h2>
              <p className="text-sm text-slate-400">Add a manual entry without leaving the page.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateFormOpen((currentValue) => !currentValue)}
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              {isCreateFormOpen ? 'Hide form' : 'Create log'}
            </button>
          </div>

          {isCreateFormOpen && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <LogForm onSubmit={handleCreateLog} onCancel={() => setIsCreateFormOpen(false)} />
            </div>
          )}

        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <span className="w-20 shrink-0 text-center sm:w-24">Per page</span>
              <input
                type="number"
                min={4}
                max={50}
                step={1}
                value={itemsPerPage}
                onChange={(event) => {
                  const nextValue = Number(event.target.value)

                  if (!Number.isNaN(nextValue)) {
                    setItemsPerPage(Math.min(50, Math.max(4, nextValue)))
                  }
                }}
                className="w-24 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <span className="w-16 shrink-0 text-center sm:w-20">Page</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                step={1}
                value={currentPage}
                onChange={(event) => {
                  const nextValue = Number(event.target.value)

                  if (!Number.isNaN(nextValue)) {
                    setCurrentPage(Math.min(totalPages, Math.max(1, nextValue)))
                  }
                }}
                className="w-24 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <div className="text-sm text-slate-400">
              {totalCount === 0
                ? 'No results'
                : `Page ${currentPage} of ${totalPages} · ${totalCount} result(s)`}
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/60 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/60 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>

          <LogsList logs={paginatedLogs} />

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/60 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/60 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
