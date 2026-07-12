'use client'

import { Flame, Timer, CalendarDays } from 'lucide-react'
import { computeStreak, startOfDay, startOfWeek, sumFocusSeconds } from '@/lib/stats'
import { formatDuration, type FocusSession } from '@/lib/types'

interface Props {
  sessions: FocusSession[]
}

export default function StatsSummary({ sessions }: Props) {
  const today = sumFocusSeconds(sessions, startOfDay())
  const week = sumFocusSeconds(sessions, startOfWeek())
  const streak = computeStreak(sessions)
  const totalSessions = sessions.filter((s) => s.completed && s.mode === 'work').length

  const cards = [
    { label: 'Today', value: formatDuration(today), icon: Timer },
    { label: 'This week', value: formatDuration(week), icon: CalendarDays },
    { label: 'Streak', value: `${streak} day${streak === 1 ? '' : 's'}`, icon: Flame },
    { label: 'Sessions', value: String(totalSessions), icon: Timer },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-2xl border border-chronos-border bg-chronos-surface px-4 py-3 shadow-soft"
        >
          <div className="mb-2 flex items-center gap-1.5 text-chronos-muted">
            <Icon className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase tracking-wider">{label}</span>
          </div>
          <p className="font-display text-xl text-chronos-text">{value}</p>
        </div>
      ))}
    </div>
  )
}
