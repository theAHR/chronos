'use client'

import { motion } from 'framer-motion'
import TimerRing from '@/components/timer/TimerRing'
import TimerControls from '@/components/timer/TimerControls'
import TimerModeTabs from '@/components/timer/TimerModeTabs'
import DailyGoal from '@/components/timer/DailyGoal'
import FocusModeOverlay, { FocusModeButton } from '@/components/timer/FocusMode'
import SoundMixer from '@/components/sounds/SoundMixer'
import TaskList from '@/components/tasks/TaskList'
import StatsSummary from '@/components/stats/StatsSummary'
import Heatmap from '@/components/stats/Heatmap'
import ProfilePicker from '@/components/profiles/ProfilePicker'
import { useChronosStore } from '@/lib/store'

export default function HomePage() {
  const sessions = useChronosStore((s) => s.sessions)
  const mode = useChronosStore((s) => s.mode)
  const breakIdea = useChronosStore((s) => s.breakIdea)
  const completedWorkCount = useChronosStore((s) => s.completedWorkCount)

  return (
    <>
      <FocusModeOverlay />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col items-center"
        >
          <div className="mb-8 text-center md:hidden">
            <h1 className="font-display text-3xl font-semibold tracking-tight">Chronos</h1>
            <p className="mt-1 text-sm text-chronos-muted">Focus · ambient · no login</p>
          </div>

          <div className="mb-6 hidden w-full md:block">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-semibold tracking-tight">Stay in the flow</h1>
                <p className="mt-2 max-w-md text-sm text-chronos-muted">
                  One calm hub for deep work — timer, soundscapes, tasks, and a visual history of your focus.
                </p>
              </div>
              <FocusModeButton />
            </div>
          </div>

          <div className="mb-4 flex items-center gap-3 md:hidden">
            <FocusModeButton />
          </div>

          <TimerModeTabs />
          <p className="mt-3 text-[11px] text-chronos-muted">
            {completedWorkCount} focus session{completedWorkCount === 1 ? '' : 's'} today
          </p>

          <div className="my-8">
            <TimerRing />
          </div>
          <TimerControls />

          {mode !== 'work' && (
            <motion.p
              key={breakIdea}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 max-w-xs text-center text-sm text-chronos-accent"
            >
              Break idea: {breakIdea}
            </motion.p>
          )}

          <p className="mt-6 text-center text-[11px] text-chronos-muted">
            Space start/pause · F focus mode · 1/2/3 modes · R reset · S skip · N task
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="space-y-5"
        >
          <DailyGoal />
          <ProfilePicker />
          <SoundMixer />
          <TaskList />
          <section className="rounded-3xl border border-chronos-border bg-chronos-surface p-5 shadow-soft">
            <h2 className="mb-1 font-display text-lg">Today at a glance</h2>
            <p className="mb-4 text-xs text-chronos-muted">Local-only stats from your sessions.</p>
            <StatsSummary sessions={sessions} />
            <div className="mt-5">
              <Heatmap sessions={sessions} />
            </div>
          </section>
        </motion.div>
      </div>
    </>
  )
}
