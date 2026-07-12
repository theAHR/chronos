'use client'

import { Check, Trash2 } from 'lucide-react'
import { formatDuration, type Task } from '@/lib/types'

interface Props {
  task: Task
  active: boolean
  onToggle: () => void
  onDelete: () => void
  onSelect: () => void
}

export default function TaskItem({ task, active, onToggle, onDelete, onSelect }: Props) {
  return (
    <div
      className={`group flex items-start gap-3 rounded-2xl border px-3 py-2.5 transition ${
        active
          ? 'border-chronos-accent/40 bg-chronos-accent/10'
          : 'border-transparent bg-chronos-elevated/60 hover:border-chronos-border'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          task.completed
            ? 'border-chronos-accent bg-chronos-accent text-[#1a1512]'
            : 'border-chronos-border text-transparent hover:border-chronos-accent/60'
        }`}
      >
        <Check className="h-3 w-3" />
      </button>

      <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
        <p
          className={`truncate text-sm ${
            task.completed ? 'text-chronos-muted line-through' : 'text-chronos-text'
          }`}
        >
          {task.title}
        </p>
        <p className="mt-0.5 text-[10px] text-chronos-muted">
          {task.sessionCount} session{task.sessionCount === 1 ? '' : 's'}
          {task.focusSeconds > 0 ? ` · ${formatDuration(task.focusSeconds)}` : ''}
          {active ? ' · focusing' : ''}
        </p>
      </button>

      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete task"
        className="rounded-lg p-1.5 text-chronos-muted opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
