'use client'

import { motion } from 'framer-motion'
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { useChronosStore } from '@/lib/store'

export default function TimerControls() {
  const status = useChronosStore((s) => s.status)
  const start = useChronosStore((s) => s.start)
  const pause = useChronosStore((s) => s.pause)
  const reset = useChronosStore((s) => s.reset)
  const skip = useChronosStore((s) => s.skip)

  const running = status === 'running'

  return (
    <div className="flex items-center justify-center gap-3">
      <ControlButton label="Reset" onClick={reset}>
        <RotateCcw className="h-4 w-4" />
      </ControlButton>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => (running ? pause() : start())}
        className="flex h-14 min-w-[9.5rem] items-center justify-center gap-2 rounded-full bg-chronos-accent px-8 text-sm font-semibold text-[#1a1512] shadow-glow transition hover:brightness-110"
      >
        {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        {running ? 'Pause' : 'Start'}
      </motion.button>

      <ControlButton label="Skip" onClick={skip}>
        <SkipForward className="h-4 w-4" />
      </ControlButton>
    </div>
  )
}

function ControlButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-chronos-border bg-chronos-elevated text-chronos-muted transition hover:border-chronos-accent/40 hover:text-chronos-text"
    >
      {children}
    </motion.button>
  )
}
