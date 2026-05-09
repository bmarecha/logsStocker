import { useState } from 'react'
import type { FormEvent } from 'react'
import type { LogInput, LogLevel } from '@/types/log'

const levelOptions: LogLevel[] = ['INFO', 'WARNING', 'ERROR', 'DEBUG']

interface LogFormProps {
  onSubmit: (payload: LogInput) => Promise<void> | void
  onCancel: () => void
}

function toDatetimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function toIsoTimestamp(value: string) {
  return new Date(value).toISOString()
}

export function LogForm({ onSubmit, onCancel }: LogFormProps) {
  const [formState, setFormState] = useState<LogInput>({
    timestamp: toDatetimeLocalValue(new Date()),
    level: 'INFO',
    message: '',
    service: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = <Key extends keyof LogInput>(key: Key, value: LogInput[Key]) => {
    setFormState((currentValue) => ({ ...currentValue, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        ...formState,
        timestamp: toIsoTimestamp(formState.timestamp),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Timestamp</span>
          <input
            type="datetime-local"
            value={formState.timestamp}
            onChange={(event) => updateField('timestamp', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Level</span>
          <select
            value={formState.level}
            onChange={(event) => updateField('level', event.target.value as LogLevel)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
          >
            {levelOptions.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">Service</span>
        <input
          type="text"
          value={formState.service}
          onChange={(event) => updateField('service', event.target.value)}
          placeholder="Service name"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">Message</span>
        <textarea
          value={formState.message}
          onChange={(event) => updateField('message', event.target.value)}
          placeholder="Describe the log message here"
          rows={5}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Save log'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}