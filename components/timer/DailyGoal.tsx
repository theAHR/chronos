'use client'

import { Target } from 'lucide-react'
import { startOfDay, sumFocusSeconds } from '@/lib/stats'
import { formatDuration } from '@/lib/types'
import { useChronosStore } from '@/lib/store'

export default function DailyGoal() {
  const sessions = useChronosStore((s) => s.sessions)
  const goalMinutes = useChronosStore((s) => s.settings.dailyGoalMinutes)
  const today = sumFocusSeconds(sessions, startOfDay())
  const goalSeconds = Math.max(1, goalMinutes) * 60
  const pct = Math.min(100, Math.round((today / goalSeconds) * 100))
  const done = today >= goalSeconds

  return (
    <section className="rounded-3xl border border-chronos-border bg-chronos-surface p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-chronos-accent" />
          <h2 className="font-display text-lg">Daily goal</h2>
        </div>
        <span className={`text-xs font-medium ${done ? 'text-chronos-accent' : 'text-chronos-muted'}`}>
          {done ? 'Goal reached' : `${pct}%`}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-chronos-elevated">
        <div
          className="h-full rounded-full bg-chronos-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-chronos-muted">
        <span className="tabular-nums text-chronos-text">{formatDuration(today)}</span>
        {' / '}
        {goalMinutes}m focus today
      </p>
    </section>
  )
}
