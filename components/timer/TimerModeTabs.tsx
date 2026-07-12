'use client'

import { useChronosStore } from '@/lib/store'
import type { TimerMode } from '@/lib/types'

const MODES: { id: TimerMode; label: string }[] = [
  { id: 'work', label: 'Focus' },
  { id: 'shortBreak', label: 'Short' },
  { id: 'longBreak', label: 'Long' },
]

export default function TimerModeTabs() {
  const mode = useChronosStore((s) => s.mode)
  const setMode = useChronosStore((s) => s.setMode)

  return (
    <div className="inline-flex rounded-full border border-chronos-border bg-chronos-surface p-1">
      {MODES.map((m) => {
        const active = mode === m.id
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              active
                ? 'bg-chronos-elevated text-chronos-text shadow-soft'
                : 'text-chronos-muted hover:text-chronos-text'
            }`}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
