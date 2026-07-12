'use client'

import { useMemo, useState } from 'react'
import { sessionsByDay, heatLevel, dayKey } from '@/lib/stats'
import type { FocusSession } from '@/lib/types'

const CELL = 12
const GAP = 3
const WEEKS = 12
const DAYS = 7

interface Props {
  sessions: FocusSession[]
}

export default function Heatmap({ sessions }: Props) {
  const [hover, setHover] = useState<{ label: string; x: number; y: number } | null>(null)

  const { cells, width, height } = useMemo(() => {
    const map = sessionsByDay(sessions, WEEKS * DAYS)
    const entries = Array.from(map.entries())
    // Align to weeks starting Monday
    const first = new Date(entries[0][0] + 'T12:00:00')
    const pad = (first.getDay() + 6) % 7
    const padded: Array<[string, number] | null> = [
      ...Array.from({ length: pad }, () => null),
      ...entries,
    ]
    while (padded.length % 7 !== 0) padded.push(null)

    const weeks = Math.ceil(padded.length / 7)
    const grid: Array<{ key: string; count: number; col: number; row: number } | null> = []

    padded.forEach((entry, i) => {
      const col = Math.floor(i / 7)
      const row = i % 7
      if (!entry) {
        grid.push(null)
        return
      }
      grid.push({ key: entry[0], count: entry[1], col, row })
    })

    return {
      cells: grid.filter(Boolean) as Array<{ key: string; count: number; col: number; row: number }>,
      width: weeks * (CELL + GAP),
      height: DAYS * (CELL + GAP),
    }
  }, [sessions])

  const colors = [
    'var(--heat-0)',
    'var(--heat-1)',
    'var(--heat-2)',
    'var(--heat-3)',
    'var(--heat-4)',
  ]

  return (
    <div className="relative overflow-x-auto">
      <svg width={width} height={height + 8} className="min-w-full">
        {cells.map((cell) => {
          const level = heatLevel(cell.count)
          const x = cell.col * (CELL + GAP)
          const y = cell.row * (CELL + GAP)
          return (
            <rect
              key={cell.key}
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              rx={2.5}
              fill={colors[level]}
              className="cursor-default transition-opacity hover:opacity-80"
              onMouseEnter={(e) => {
                const date = new Date(cell.key + 'T12:00:00')
                setHover({
                  label: `${date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })} · ${cell.count} session${cell.count === 1 ? '' : 's'}`,
                  x: e.clientX,
                  y: e.clientY,
                })
              }}
              onMouseLeave={() => setHover(null)}
            />
          )
        })}
      </svg>

      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-chronos-muted">
        <span>Less</span>
        {colors.map((c, i) => (
          <span key={i} className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
        ))}
        <span>More</span>
        <span className="ml-auto">Last {WEEKS} weeks</span>
      </div>

      {hover && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-chronos-border bg-chronos-elevated px-2.5 py-1.5 text-xs text-chronos-text shadow-soft"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          {hover.label}
        </div>
      )}
    </div>
  )
}

export function todayKey() {
  return dayKey(Date.now())
}
