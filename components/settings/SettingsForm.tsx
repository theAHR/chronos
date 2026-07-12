'use client'

import { FormEvent, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Minus, Monitor, Moon, Plus, Sun } from 'lucide-react'
import { useChronosStore } from '@/lib/store'
import type { ThemeMode } from '@/lib/types'

const THEMES: {
  id: ThemeMode
  label: string
  hint: string
  icon: typeof Moon
}[] = [
  { id: 'dark', label: 'Dark', hint: 'Cozy warm tones', icon: Moon },
  { id: 'light', label: 'Light', hint: 'Soft paper feel', icon: Sun },
  { id: 'auto', label: 'Auto', hint: 'Match system', icon: Monitor },
]

export default function SettingsForm() {
  const settings = useChronosStore((s) => s.settings)
  const updateSettings = useChronosStore((s) => s.updateSettings)
  const saveAsCustomProfile = useChronosStore((s) => s.saveAsCustomProfile)
  const [work, setWork] = useState(Math.round(settings.workDuration / 60))
  const [shortBreak, setShortBreak] = useState(Math.round(settings.shortBreakDuration / 60))
  const [longBreak, setLongBreak] = useState(Math.round(settings.longBreakDuration / 60))
  const [interval, setIntervalCount] = useState(settings.longBreakInterval)
  const [goal, setGoal] = useState(settings.dailyGoalMinutes)
  const [saved, setSaved] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    setWork(Math.round(settings.workDuration / 60))
    setShortBreak(Math.round(settings.shortBreakDuration / 60))
    setLongBreak(Math.round(settings.longBreakDuration / 60))
    setIntervalCount(settings.longBreakInterval)
    setGoal(settings.dailyGoalMinutes)
  }, [
    settings.workDuration,
    settings.shortBreakDuration,
    settings.longBreakDuration,
    settings.longBreakInterval,
    settings.dailyGoalMinutes,
  ])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await updateSettings({
      workDuration: Math.max(1, work) * 60,
      shortBreakDuration: Math.max(1, shortBreak) * 60,
      longBreakDuration: Math.max(1, longBreak) * 60,
      longBreakInterval: Math.max(1, interval),
      dailyGoalMinutes: Math.max(5, goal),
      activeProfileId: 'custom',
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-3xl text-chronos-text">Settings</h1>
        <p className="mt-1 text-sm text-chronos-muted">Durations, goals, theme, and notifications.</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-3xl border border-chronos-border bg-chronos-surface p-5 shadow-soft"
      >
        <h2 className="text-xs font-medium uppercase tracking-wider text-chronos-muted">Timer & goal</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <StepperField label="Focus" unit="min" value={work} min={1} max={120} step={1} onChange={setWork} />
          <StepperField
            label="Short break"
            unit="min"
            value={shortBreak}
            min={1}
            max={60}
            step={1}
            onChange={setShortBreak}
          />
          <StepperField
            label="Long break"
            unit="min"
            value={longBreak}
            min={1}
            max={60}
            step={1}
            onChange={setLongBreak}
          />
          <StepperField
            label="Long break every"
            unit="sessions"
            value={interval}
            min={1}
            max={12}
            step={1}
            onChange={setIntervalCount}
          />
          <div className="sm:col-span-2">
            <StepperField
              label="Daily focus goal"
              unit="min"
              value={goal}
              min={5}
              max={720}
              step={5}
              onChange={setGoal}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-full bg-chronos-accent px-5 py-2 text-sm font-semibold text-[#1a1512] transition hover:brightness-110"
          >
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            onClick={async () => {
              await saveAsCustomProfile()
              setProfileSaved(true)
              setTimeout(() => setProfileSaved(false), 1600)
            }}
            className="rounded-full border border-chronos-border px-5 py-2 text-sm text-chronos-text transition hover:border-chronos-accent/40"
          >
            {profileSaved ? 'Custom profile saved' : 'Save as Custom profile'}
          </button>
        </div>
      </form>

      <section className="space-y-5 rounded-3xl border border-chronos-border bg-chronos-surface p-5 shadow-soft">
        <h2 className="text-xs font-medium uppercase tracking-wider text-chronos-muted">Preferences</h2>

        <ThemePicker
          value={settings.theme}
          onChange={(theme) => void updateSettings({ theme })}
        />

        <div className="space-y-1 border-t border-chronos-border pt-4">
          <Toggle
            label="Ambient sound master"
            checked={settings.soundEnabled}
            onChange={(v) => void updateSettings({ soundEnabled: v })}
          />
          <Toggle
            label="Desktop notifications"
            checked={settings.notificationsEnabled}
            onChange={(v) => void updateSettings({ notificationsEnabled: v })}
          />
          <Toggle
            label="Auto-start breaks"
            checked={settings.autoStartBreaks}
            onChange={(v) => void updateSettings({ autoStartBreaks: v })}
          />
          <Toggle
            label="Auto-start focus after break"
            checked={settings.autoStartWork}
            onChange={(v) => void updateSettings({ autoStartWork: v })}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-chronos-border bg-chronos-surface p-5 text-xs text-chronos-muted shadow-soft">
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wider">Keyboard shortcuts</h2>
        <ul className="space-y-1.5">
          <li>
            <kbd className="rounded bg-chronos-elevated px-1.5 py-0.5">Space</kbd> start / pause
          </li>
          <li>
            <kbd className="rounded bg-chronos-elevated px-1.5 py-0.5">F</kbd> focus mode
          </li>
          <li>
            <kbd className="rounded bg-chronos-elevated px-1.5 py-0.5">1</kbd> /{' '}
            <kbd className="rounded bg-chronos-elevated px-1.5 py-0.5">2</kbd> /{' '}
            <kbd className="rounded bg-chronos-elevated px-1.5 py-0.5">3</kbd> focus / short / long
          </li>
          <li>
            <kbd className="rounded bg-chronos-elevated px-1.5 py-0.5">R</kbd> reset ·{' '}
            <kbd className="rounded bg-chronos-elevated px-1.5 py-0.5">S</kbd> skip ·{' '}
            <kbd className="rounded bg-chronos-elevated px-1.5 py-0.5">N</kbd> new task
          </li>
          <li>
            <kbd className="rounded bg-chronos-elevated px-1.5 py-0.5">Esc</kbd> exit focus mode
          </li>
        </ul>
      </section>
    </div>
  )
}

function StepperField({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step: number
  onChange: (n: number) => void
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const dec = () => onChange(clamp(value - step))
  const inc = () => onChange(clamp(value + step))

  return (
    <div className="rounded-2xl border border-chronos-border bg-chronos-elevated/40 px-3 py-3">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <span className="text-sm text-chronos-text">{label}</span>
        <span className="text-[10px] uppercase tracking-wider text-chronos-muted">{unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <StepperButton label={`Decrease ${label}`} onClick={dec} disabled={value <= min}>
          <Minus className="h-4 w-4" />
        </StepperButton>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, '')
            if (raw === '') return
            onChange(clamp(Number(raw)))
          }}
          onBlur={() => onChange(clamp(value || min))}
          className="w-full rounded-xl border border-chronos-border bg-chronos-surface py-2 text-center font-display text-xl tabular-nums text-chronos-text outline-none transition focus:border-chronos-accent/50"
          aria-label={label}
        />
        <StepperButton label={`Increase ${label}`} onClick={inc} disabled={value >= max}>
          <Plus className="h-4 w-4" />
        </StepperButton>
      </div>
    </div>
  )
}

function StepperButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-chronos-border bg-chronos-surface text-chronos-text transition hover:border-chronos-accent/45 hover:bg-chronos-accent/10 hover:text-chronos-accent active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-chronos-border disabled:hover:bg-chronos-surface disabled:hover:text-chronos-text"
    >
      {children}
    </button>
  )
}

function ThemePicker({
  value,
  onChange,
}: {
  value: ThemeMode
  onChange: (theme: ThemeMode) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const current = THEMES.find((t) => t.id === value) ?? THEMES[0]
  const Icon = current.icon

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <p className="mb-2 text-sm text-chronos-text">Theme</p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-2xl border border-chronos-border bg-chronos-elevated/50 px-3.5 py-3 text-left transition hover:border-chronos-accent/40"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-chronos-accent/15 text-chronos-accent">
          <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-chronos-text">{current.label}</span>
          <span className="block text-xs text-chronos-muted">{current.hint}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-chronos-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label="Theme"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-chronos-border bg-chronos-surface shadow-soft"
          >
            {THEMES.map((theme) => {
              const selected = theme.id === value
              const ThemeIcon = theme.icon
              return (
                <li key={theme.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(theme.id)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition ${
                      selected ? 'bg-chronos-accent/10' : 'hover:bg-chronos-elevated/70'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        selected
                          ? 'bg-chronos-accent/20 text-chronos-accent'
                          : 'bg-chronos-elevated text-chronos-muted'
                      }`}
                    >
                      <ThemeIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-chronos-text">{theme.label}</span>
                      <span className="block text-xs text-chronos-muted">{theme.hint}</span>
                    </span>
                    {selected && <Check className="h-4 w-4 text-chronos-accent" />}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl px-1 py-2.5 text-sm">
      <span className="text-chronos-text">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? 'bg-chronos-accent' : 'bg-chronos-elevated'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition ${
            checked ? 'left-[1.35rem]' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  )
}
