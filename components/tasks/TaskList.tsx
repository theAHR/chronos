'use client'

import { FormEvent, useState } from 'react'
import { Plus } from 'lucide-react'
import { useChronosStore } from '@/lib/store'
import TaskItem from './TaskItem'

export default function TaskList() {
  const tasks = useChronosStore((s) => s.tasks)
  const activeTaskId = useChronosStore((s) => s.activeTaskId)
  const addTask = useChronosStore((s) => s.addTask)
  const toggleTask = useChronosStore((s) => s.toggleTask)
  const deleteTask = useChronosStore((s) => s.deleteTask)
  const setActiveTask = useChronosStore((s) => s.setActiveTask)
  const [title, setTitle] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void addTask(title)
    setTitle('')
  }

  return (
    <section className="rounded-3xl border border-chronos-border bg-chronos-surface p-5 shadow-soft">
      <div className="mb-4">
        <h2 className="font-display text-lg text-chronos-text">Tasks</h2>
        <p className="text-xs text-chronos-muted">Attach one to your focus session.</p>
      </div>

      <form onSubmit={onSubmit} className="mb-4 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What are you focusing on?"
          className="flex-1 rounded-2xl border border-chronos-border bg-chronos-elevated px-3 py-2.5 text-sm text-chronos-text outline-none placeholder:text-chronos-muted/70 focus:border-chronos-accent/50"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-2xl bg-chronos-accent/15 px-3 py-2 text-sm font-medium text-chronos-accent transition hover:bg-chronos-accent/25"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </form>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {tasks.length === 0 && (
          <p className="py-6 text-center text-sm text-chronos-muted">No tasks yet — add one above.</p>
        )}
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            active={activeTaskId === task.id}
            onToggle={() => void toggleTask(task.id)}
            onDelete={() => void deleteTask(task.id)}
            onSelect={() => setActiveTask(activeTaskId === task.id ? null : task.id)}
          />
        ))}
      </div>
    </section>
  )
}
