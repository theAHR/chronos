'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { useChronosStore } from '@/lib/store'
import TimerRing from './TimerRing'
import TimerControls from './TimerControls'
import TimerModeTabs from './TimerModeTabs'

export default function FocusModeOverlay() {
  const focusMode = useChronosStore((s) => s.focusMode)
  const setFocusMode = useChronosStore((s) => s.setFocusMode)
  const mode = useChronosStore((s) => s.mode)
  const breakIdea = useChronosStore((s) => s.breakIdea)
  const tasks = useChronosStore((s) => s.tasks)
  const activeTaskId = useChronosStore((s) => s.activeTaskId)
  const activeTask = tasks.find((t) => t.id === activeTaskId)

  return (
    <AnimatePresence>
      {focusMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#12100e]/95 px-4 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setFocusMode(false)}
            className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-white/60 hover:text-white"
            aria-label="Exit focus mode"
          >
            <X className="h-5 w-5" />
          </button>

          <p className="mb-2 font-display text-sm tracking-wide text-white/40">Chronos · Focus mode</p>
          {activeTask && mode === 'work' && (
            <p className="mb-6 max-w-md text-center text-sm text-white/70">{activeTask.title}</p>
          )}
          {mode !== 'work' && (
            <p className="mb-6 max-w-sm text-center text-sm text-chronos-accent">{breakIdea}</p>
          )}

          <TimerModeTabs />
          <div className="my-8">
            <TimerRing />
          </div>
          <TimerControls />

          <p className="mt-8 text-[11px] text-white/35">
            Esc or F to exit · Space start/pause
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function FocusModeButton() {
  const focusMode = useChronosStore((s) => s.focusMode)
  const setFocusMode = useChronosStore((s) => s.setFocusMode)

  return (
    <button
      type="button"
      onClick={() => setFocusMode(!focusMode)}
      className="inline-flex items-center gap-1.5 rounded-full border border-chronos-border bg-chronos-elevated px-3 py-1.5 text-xs text-chronos-muted transition hover:text-chronos-text"
    >
      {focusMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      Focus mode
    </button>
  )
}
