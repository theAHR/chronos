import type { FocusSession } from './types'

export function startOfDay(ts = Date.now()): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function startOfWeek(ts = Date.now()): number {
  const d = new Date(startOfDay(ts))
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d.getTime()
}

export function sumFocusSeconds(sessions: FocusSession[], since: number): number {
  return sessions
    .filter((s) => s.completed && s.mode === 'work' && s.startedAt >= since)
    .reduce((acc, s) => acc + s.duration, 0)
}

export function sessionsByDay(sessions: FocusSession[], days = 84): Map<string, number> {
  const map = new Map<string, number>()
  const today = startOfDay()
  for (let i = days - 1; i >= 0; i--) {
    const key = dayKey(today - i * 86400000)
    map.set(key, 0)
  }
  sessions.forEach((s) => {
    if (!s.completed || s.mode !== 'work') return
    const key = dayKey(s.startedAt)
    if (map.has(key)) map.set(key, (map.get(key) || 0) + 1)
  })
  return map
}

export function dayKey(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function computeStreak(sessions: FocusSession[]): number {
  const daysWithFocus = new Set(
    sessions.filter((s) => s.completed && s.mode === 'work').map((s) => dayKey(s.startedAt))
  )
  let streak = 0
  let cursor = startOfDay()
  // If today has no sessions yet, start from yesterday
  if (!daysWithFocus.has(dayKey(cursor))) {
    cursor -= 86400000
  }
  while (daysWithFocus.has(dayKey(cursor))) {
    streak++
    cursor -= 86400000
  }
  return streak
}

export function heatLevel(count: number): number {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 3
  return 4
}
