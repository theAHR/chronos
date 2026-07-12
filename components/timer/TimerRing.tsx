'use client'

import { motion } from 'framer-motion'
import { formatTime } from '@/lib/types'
import { useChronosStore } from '@/lib/store'
import styles from '@/styles/timer-ring.module.scss'

const SIZE = 300
const STROKE = 10
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

function modeLabel(mode: string) {
  if (mode === 'work') return 'Focus'
  if (mode === 'shortBreak') return 'Short break'
  return 'Long break'
}

export default function TimerRing() {
  const mode = useChronosStore((s) => s.mode)
  const remaining = useChronosStore((s) => s.remaining)
  const status = useChronosStore((s) => s.status)
  const settings = useChronosStore((s) => s.settings)
  const celebrate = useChronosStore((s) => s.celebrate)

  const total =
    mode === 'work'
      ? settings.workDuration
      : mode === 'shortBreak'
        ? settings.shortBreakDuration
        : settings.longBreakDuration

  const progress = total > 0 ? remaining / total : 0
  const offset = C * (1 - progress)

  return (
    <div className={`relative ${celebrate ? styles.celebrate : ''}`}>
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--chronos-accent-soft),transparent_65%)] opacity-70 blur-2xl"
        aria-hidden
      />
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={`${styles.ring} -rotate-90`}
        role="img"
        aria-label={`${modeLabel(mode)} timer ${formatTime(remaining)}`}
      >
        <circle
          className={status === 'running' ? styles.halo : undefined}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R + 8}
          fill="none"
          stroke="var(--chronos-accent-soft)"
          strokeWidth="1.5"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--chronos-border)"
          strokeWidth={STROKE}
        />
        <circle
          className={styles.progress}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--chronos-ring)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.p
          key={formatTime(remaining)}
          initial={{ opacity: 0.7, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="font-display text-6xl font-semibold tabular-nums tracking-tight text-chronos-text sm:text-7xl"
        >
          {formatTime(remaining)}
        </motion.p>
        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-chronos-muted">
          {modeLabel(mode)}
          {status === 'running' ? ' · running' : status === 'paused' ? ' · paused' : ''}
        </p>
      </div>
    </div>
  )
}
