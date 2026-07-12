'use client'

import { create } from 'zustand'
import { ambientMixer, playChime } from './audio'
import {
  addSession,
  deleteSession as dbDeleteSession,
  deleteTask as dbDeleteTask,
  loadSessions,
  loadSettings,
  loadTasks,
  saveSettings,
  saveTask,
} from './db'
import { notifySessionComplete, requestNotificationPermission, updateDocumentTitle } from './notifications'
import {
  DEFAULT_SETTINGS,
  formatTime,
  getProfile,
  uid,
  type FocusSession,
  type ProfileId,
  type Settings,
  type Task,
  type TimerMode,
} from './types'

type TimerStatus = 'idle' | 'running' | 'paused'

interface ChronosState {
  hydrated: boolean
  mode: TimerMode
  status: TimerStatus
  remaining: number
  sessionStartedAt: number | null
  completedWorkCount: number
  celebrate: boolean
  focusMode: boolean
  breakIdea: string
  activeTaskId: string | null
  tasks: Task[]
  sessions: FocusSession[]
  settings: Settings
  hydrate: () => Promise<void>
  setMode: (mode: TimerMode) => void
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  tick: (now: number) => void
  addTask: (title: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setActiveTask: (id: string | null) => void
  updateSettings: (patch: Partial<Settings>) => Promise<void>
  setSoundVolume: (trackId: string, volume: number) => Promise<void>
  applySoundPreset: (mix: Record<string, number>) => Promise<void>
  applyProfile: (id: ProfileId) => Promise<void>
  saveAsCustomProfile: () => Promise<void>
  setFocusMode: (on: boolean) => void
  deleteSession: (id: string) => Promise<void>
  clearCelebrate: () => void
}

function durationFor(mode: TimerMode, settings: Settings): number {
  if (mode === 'work') return settings.workDuration
  if (mode === 'shortBreak') return settings.shortBreakDuration
  return settings.longBreakDuration
}

function modeLabel(mode: TimerMode): string {
  if (mode === 'work') return 'Focus'
  if (mode === 'shortBreak') return 'Short break'
  return 'Long break'
}

const BREAK_IDEAS = [
  'Stretch your shoulders and neck',
  'Look out a window for 20 seconds',
  'Refill your water',
  'Take three slow breaths',
  'Stand up and walk a lap',
  'Rest your eyes — soft gaze',
]

function randomBreakIdea() {
  return BREAK_IDEAS[Math.floor(Math.random() * BREAK_IDEAS.length)]
}

let hydrating = false

export const useChronosStore = create<ChronosState>((set, get) => ({
  hydrated: false,
  mode: 'work',
  status: 'idle',
  remaining: DEFAULT_SETTINGS.workDuration,
  sessionStartedAt: null,
  completedWorkCount: 0,
  celebrate: false,
  focusMode: false,
  breakIdea: BREAK_IDEAS[0],
  activeTaskId: null,
  tasks: [],
  sessions: [],
  settings: {
    ...DEFAULT_SETTINGS,
    soundMix: { ...DEFAULT_SETTINGS.soundMix },
    customProfile: {
      ...DEFAULT_SETTINGS.customProfile,
      soundMix: { ...DEFAULT_SETTINGS.customProfile.soundMix },
    },
  },

  hydrate: async () => {
    if (get().hydrated || hydrating) return
    hydrating = true
    try {
      const [settings, tasks, sessions] = await Promise.all([
        loadSettings(),
        loadTasks(),
        loadSessions(),
      ])

      const mergedSessions = mergeSessions(sessions, get().sessions)
      const memoryTasks = get().tasks
      const taskMap = new Map<string, Task>()
      tasks.forEach((t) => taskMap.set(t.id, t))
      memoryTasks.forEach((t) => taskMap.set(t.id, t))
      const mergedTasks = Array.from(taskMap.values()).sort((a, b) => b.createdAt - a.createdAt)

      const workSessionsToday = mergedSessions.filter((s) => {
        const day = new Date(s.startedAt)
        const now = new Date()
        return (
          s.completed &&
          s.mode === 'work' &&
          day.toDateString() === now.toDateString()
        )
      }).length

      const { status, mode, remaining } = get()
      set({
        settings,
        tasks: mergedTasks,
        sessions: mergedSessions,
        remaining: status === 'idle' ? durationFor(mode, settings) : remaining,
        completedWorkCount: workSessionsToday,
        hydrated: true,
      })

      ambientMixer?.setMasterEnabled(settings.soundEnabled)
      ambientMixer?.applyMix(settings.soundMix)
    } finally {
      hydrating = false
    }
  },

  setMode: (mode) => {
    const { settings, status } = get()
    if (status === 'running') get().pause()
    set({
      mode,
      remaining: durationFor(mode, settings),
      status: 'idle',
      sessionStartedAt: null,
      breakIdea: mode === 'work' ? get().breakIdea : randomBreakIdea(),
    })
  },

  start: () => {
    const { status, settings } = get()
    if (status === 'running') return
    ambientMixer?.unlock()
    if (settings.notificationsEnabled) {
      void requestNotificationPermission()
    }
    set({
      status: 'running',
      sessionStartedAt: Date.now(),
    })
  },

  pause: () => {
    if (get().status !== 'running') return
    set({ status: 'paused', sessionStartedAt: null })
  },

  reset: () => {
    const { mode, settings } = get()
    set({
      status: 'idle',
      remaining: durationFor(mode, settings),
      sessionStartedAt: null,
    })
  },

  skip: () => {
    void completeCurrentSession(get, set, true)
  },

  tick: (now) => {
    const { status, sessionStartedAt, remaining } = get()
    if (status !== 'running' || !sessionStartedAt) return
    const elapsed = Math.floor((now - sessionStartedAt) / 1000)
    if (elapsed <= 0) return
    const next = remaining - elapsed
    if (next <= 0) {
      set({ remaining: 0, sessionStartedAt: null, status: 'paused' })
      void completeCurrentSession(get, set, false)
      return
    }
    set({ remaining: next, sessionStartedAt: now })
  },

  addTask: async (title) => {
    const trimmed = title.trim()
    if (!trimmed) return
    const task: Task = {
      id: uid(),
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
      sessionCount: 0,
      focusSeconds: 0,
    }
    await saveTask(task)
    set((s) => ({
      tasks: [task, ...s.tasks],
      activeTaskId: s.activeTaskId ?? task.id,
    }))
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return
    const next = { ...task, completed: !task.completed }
    await saveTask(next)
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? next : t)),
    }))
  },

  deleteTask: async (id) => {
    await dbDeleteTask(id)
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id),
      activeTaskId: s.activeTaskId === id ? null : s.activeTaskId,
    }))
  },

  setActiveTask: (id) => set({ activeTaskId: id }),

  updateSettings: async (patch) => {
    const prev = get().settings
    const settings: Settings = {
      ...prev,
      ...patch,
      soundMix: patch.soundMix ? { ...prev.soundMix, ...patch.soundMix } : prev.soundMix,
      customProfile: patch.customProfile
        ? {
            ...prev.customProfile,
            ...patch.customProfile,
            soundMix: {
              ...prev.customProfile.soundMix,
              ...(patch.customProfile.soundMix ?? {}),
            },
          }
        : prev.customProfile,
    }
    await saveSettings(settings)
    set({ settings })

    if (patch.soundEnabled !== undefined) {
      ambientMixer?.setMasterEnabled(patch.soundEnabled)
    }
    if (patch.soundMix) {
      ambientMixer?.applyMix(settings.soundMix)
    }

    const { status, mode } = get()
    if (status === 'idle') {
      set({ remaining: durationFor(mode, settings) })
    }
  },

  setSoundVolume: async (trackId, volume) => {
    const soundMix = { ...get().settings.soundMix, [trackId]: volume }
    ambientMixer?.unlock()
    ambientMixer?.setVolume(trackId as never, volume)
    await get().updateSettings({ soundMix, activeProfileId: 'custom' })
  },

  applySoundPreset: async (mix) => {
    ambientMixer?.unlock()
    ambientMixer?.applyMix(mix)
    await get().updateSettings({ soundMix: mix, soundEnabled: true, activeProfileId: 'custom' })
  },

  applyProfile: async (id) => {
    const settings = get().settings
    const profile = getProfile(settings, id)
    const next: Partial<Settings> = {
      activeProfileId: id,
      workDuration: profile.workDuration,
      shortBreakDuration: profile.shortBreakDuration,
      longBreakDuration: profile.longBreakDuration,
      longBreakInterval: profile.longBreakInterval,
      soundMix: { ...profile.soundMix },
      soundEnabled: true,
    }
    ambientMixer?.unlock()
    ambientMixer?.applyMix(profile.soundMix)
    if (get().status === 'running') get().pause()
    await get().updateSettings(next)
    set({
      mode: 'work',
      remaining: profile.workDuration,
      status: 'idle',
      sessionStartedAt: null,
    })
  },

  saveAsCustomProfile: async () => {
    const { settings } = get()
    const customProfile = {
      ...settings.customProfile,
      workDuration: settings.workDuration,
      shortBreakDuration: settings.shortBreakDuration,
      longBreakDuration: settings.longBreakDuration,
      longBreakInterval: settings.longBreakInterval,
      soundMix: { ...settings.soundMix },
    }
    await get().updateSettings({ customProfile, activeProfileId: 'custom' })
  },

  setFocusMode: (on) => set({ focusMode: on }),

  deleteSession: async (id) => {
    await dbDeleteSession(id)
    const sessions = get().sessions.filter((s) => s.id !== id)
    const workSessionsToday = sessions.filter((s) => {
      const day = new Date(s.startedAt)
      const now = new Date()
      return (
        s.completed &&
        s.mode === 'work' &&
        day.toDateString() === now.toDateString()
      )
    }).length
    set({ sessions, completedWorkCount: workSessionsToday })
  },

  clearCelebrate: () => set({ celebrate: false }),
}))

type Get = () => ChronosState
type Set = (
  partial: Partial<ChronosState> | ((s: ChronosState) => Partial<ChronosState>)
) => void

let completing = false

function mergeSessions(fromDb: FocusSession[], fromMemory: FocusSession[]): FocusSession[] {
  const map = new Map<string, FocusSession>()
  fromDb.forEach((s) => map.set(s.id, s))
  fromMemory.forEach((s) => map.set(s.id, s))
  return Array.from(map.values()).sort((a, b) => a.startedAt - b.startedAt)
}

async function completeCurrentSession(get: Get, set: Set, skipped: boolean) {
  if (completing) return
  completing = true

  try {
    const state = get()
    const { mode, settings, activeTaskId, completedWorkCount } = state
    const planned = durationFor(mode, settings)
    const elapsed = Math.max(1, skipped ? planned - state.remaining : planned)

    const session: FocusSession = {
      id: uid(),
      taskId: activeTaskId ?? undefined,
      startedAt: Date.now() - elapsed * 1000,
      duration: elapsed,
      completed: true,
      mode,
      profileId: settings.activeProfileId,
    }

    const nextWorkCount =
      mode === 'work' && session.completed ? completedWorkCount + 1 : completedWorkCount
    let nextMode: TimerMode = 'work'
    if (mode === 'work') {
      nextMode =
        nextWorkCount > 0 && nextWorkCount % settings.longBreakInterval === 0
          ? 'longBreak'
          : 'shortBreak'
    }

    let tasks = state.tasks
    if (mode === 'work' && activeTaskId) {
      tasks = state.tasks.map((t) => {
        if (t.id !== activeTaskId) return t
        return {
          ...t,
          sessionCount: t.sessionCount + 1,
          focusSeconds: t.focusSeconds + session.duration,
        }
      })
    }

    set({
      sessions: [...state.sessions, session],
      tasks,
      completedWorkCount: nextWorkCount,
      mode: nextMode,
      remaining: durationFor(nextMode, settings),
      status: 'idle',
      sessionStartedAt: null,
      celebrate: mode === 'work',
      breakIdea: nextMode === 'work' ? state.breakIdea : randomBreakIdea(),
    })

    try {
      await addSession(session)
      if (mode === 'work' && activeTaskId) {
        const updated = tasks.find((t) => t.id === activeTaskId)
        if (updated) await saveTask(updated)
      }
    } catch (err) {
      console.error('Failed to persist session', err)
    }

    if (settings.soundEnabled) playChime()
    if (settings.notificationsEnabled) {
      notifySessionComplete(
        modeLabel(mode),
        nextMode === 'work' ? 'Time to focus again.' : 'Nice work — take a break.'
      )
    }

    const shouldAuto =
      (nextMode !== 'work' && settings.autoStartBreaks) ||
      (nextMode === 'work' && settings.autoStartWork)
    if (shouldAuto) {
      setTimeout(() => get().start(), 400)
    }
  } finally {
    completing = false
  }
}

export function syncTitleFromStore() {
  const { remaining, mode, status } = useChronosStore.getState()
  updateDocumentTitle(formatTime(remaining), modeLabel(mode), status === 'running')
}
