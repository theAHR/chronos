'use client'

import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import Heatmap from '@/components/stats/Heatmap'
import StatsSummary from '@/components/stats/StatsSummary'
import ExportCard from '@/components/stats/ExportCard'
import DailyGoal from '@/components/timer/DailyGoal'
import { useChronosStore } from '@/lib/store'
import { formatDuration, formatTime } from '@/lib/types'

export default function StatsPage() {
  const sessions = useChronosStore((s) => s.sessions)
  const tasks = useChronosStore((s) => s.tasks)
  const deleteSession = useChronosStore((s) => s.deleteSession)

  const recent = [...sessions]
    .filter((s) => s.completed && s.mode === 'work')
    .reverse()
    .slice(0, 12)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl space-y-6"
    >
      <div>
        <h1 className="font-display text-3xl text-chronos-text">Stats</h1>
        <p className="mt-1 text-sm text-chronos-muted">
          A contributions-style view of your focus — stored only on this device.
        </p>
      </div>

      <DailyGoal />
      <StatsSummary sessions={sessions} />
      <ExportCard sessions={sessions} tasks={tasks} />

      <section className="rounded-3xl border border-chronos-border bg-chronos-surface p-5 shadow-soft">
        <h2 className="mb-4 font-display text-lg">Focus heatmap</h2>
        <Heatmap sessions={sessions} />
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-3xl border border-chronos-border bg-chronos-surface p-5 shadow-soft">
          <h2 className="mb-3 font-display text-lg">Recent sessions</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-chronos-muted">Complete a focus session to see history here.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((s) => {
                const task = tasks.find((t) => t.id === s.taskId)
                return (
                  <li
                    key={s.id}
                    className="group flex items-center justify-between rounded-2xl bg-chronos-elevated/70 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-chronos-text">{task?.title ?? 'Untitled focus'}</p>
                      <p className="text-[10px] text-chronos-muted">
                        {new Date(s.startedAt).toLocaleString()}
                        {s.profileId ? ` · ${s.profileId}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-chronos-muted">{formatTime(s.duration)}</span>
                      <button
                        type="button"
                        aria-label="Delete session"
                        onClick={() => void deleteSession(s.id)}
                        className="rounded-lg p-1 text-chronos-muted opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-chronos-border bg-chronos-surface p-5 shadow-soft">
          <h2 className="mb-3 font-display text-lg">Top tasks</h2>
          {tasks.filter((t) => t.sessionCount > 0).length === 0 ? (
            <p className="text-sm text-chronos-muted">Attach tasks to sessions to track time spent.</p>
          ) : (
            <ul className="space-y-2">
              {[...tasks]
                .filter((t) => t.sessionCount > 0)
                .sort((a, b) => b.focusSeconds - a.focusSeconds)
                .slice(0, 8)
                .map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-2xl bg-chronos-elevated/70 px-3 py-2 text-sm"
                  >
                    <span className={t.completed ? 'text-chronos-muted line-through' : ''}>{t.title}</span>
                    <span className="text-xs text-chronos-muted">
                      {t.sessionCount}× · {formatDuration(t.focusSeconds)}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </motion.div>
  )
}
