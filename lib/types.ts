import { assetPath } from './paths'

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'
export type ThemeMode = 'light' | 'dark' | 'auto'
export type ProfileId = 'classic' | 'deep' | 'quick' | 'custom'

export interface FocusSession {
  id: string
  taskId?: string
  startedAt: number
  duration: number
  completed: boolean
  mode: TimerMode
  note?: string
  profileId?: ProfileId
}

export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: number
  sessionCount: number
  focusSeconds: number
}

export interface FocusProfile {
  id: ProfileId
  label: string
  description: string
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  soundMix: Record<string, number>
}

export interface Settings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  theme: ThemeMode
  soundEnabled: boolean
  notificationsEnabled: boolean
  soundMix: Record<string, number>
  autoStartBreaks: boolean
  autoStartWork: boolean
  activeProfileId: ProfileId
  dailyGoalMinutes: number
  customProfile: FocusProfile
}

export const SOUND_TRACKS = [
  { id: 'rain', label: 'Rain', file: assetPath('/sounds/rain.wav'), color: '#6b9ac4' },
  { id: 'cafe', label: 'Café', file: assetPath('/sounds/cafe.wav'), color: '#c4a574' },
  { id: 'noise', label: 'White noise', file: assetPath('/sounds/noise.wav'), color: '#9ca3af' },
  { id: 'forest', label: 'Forest', file: assetPath('/sounds/forest.wav'), color: '#7eb8a8' },
  { id: 'lofi', label: 'Lo-fi', file: assetPath('/sounds/lofi.wav'), color: '#a78baf' },
  { id: 'fireplace', label: 'Fireplace', file: assetPath('/sounds/fireplace.wav'), color: '#d97757' },
] as const

export type SoundTrackId = (typeof SOUND_TRACKS)[number]['id']

const emptyMix = (): Record<string, number> => ({
  rain: 0,
  cafe: 0,
  noise: 0,
  forest: 0,
  lofi: 0,
  fireplace: 0,
})

export const SOUND_PRESETS: { id: string; label: string; mix: Record<string, number> }[] = [
  { id: 'silence', label: 'Silence', mix: emptyMix() },
  {
    id: 'rainy',
    label: 'Rainy day',
    mix: { ...emptyMix(), rain: 0.55, noise: 0.15 },
  },
  {
    id: 'cafe',
    label: 'Café desk',
    mix: { ...emptyMix(), cafe: 0.4, lofi: 0.25 },
  },
  {
    id: 'forest',
    label: 'Forest walk',
    mix: { ...emptyMix(), forest: 0.5, rain: 0.2 },
  },
  {
    id: 'cozy',
    label: 'Cozy fire',
    mix: { ...emptyMix(), fireplace: 0.45, lofi: 0.2 },
  },
  {
    id: 'deep',
    label: 'Deep focus',
    mix: { ...emptyMix(), noise: 0.35, rain: 0.2 },
  },
]

export const BUILT_IN_PROFILES: FocusProfile[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: '25 / 5 / 15 — the original Pomodoro',
    workDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    longBreakInterval: 4,
    soundMix: { ...emptyMix(), rain: 0.3 },
  },
  {
    id: 'deep',
    label: 'Deep work',
    description: '50 / 10 / 20 — longer blocks',
    workDuration: 50 * 60,
    shortBreakDuration: 10 * 60,
    longBreakDuration: 20 * 60,
    longBreakInterval: 3,
    soundMix: { ...emptyMix(), noise: 0.35, rain: 0.15 },
  },
  {
    id: 'quick',
    label: 'Quick tasks',
    description: '15 / 3 / 10 — ship small wins',
    workDuration: 15 * 60,
    shortBreakDuration: 3 * 60,
    longBreakDuration: 10 * 60,
    longBreakInterval: 4,
    soundMix: { ...emptyMix(), lofi: 0.35, cafe: 0.15 },
  },
]

export const DEFAULT_CUSTOM_PROFILE: FocusProfile = {
  id: 'custom',
  label: 'Custom',
  description: 'Your saved durations & mix',
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  longBreakInterval: 4,
  soundMix: emptyMix(),
}

export const DEFAULT_SETTINGS: Settings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  longBreakInterval: 4,
  theme: 'dark',
  soundEnabled: true,
  notificationsEnabled: true,
  soundMix: emptyMix(),
  autoStartBreaks: false,
  autoStartWork: false,
  activeProfileId: 'classic',
  dailyGoalMinutes: 120,
  customProfile: { ...DEFAULT_CUSTOM_PROFILE, soundMix: emptyMix() },
}

export function getProfile(settings: Settings, id: ProfileId = settings.activeProfileId): FocusProfile {
  if (id === 'custom') return settings.customProfile
  return BUILT_IN_PROFILES.find((p) => p.id === id) ?? BUILT_IN_PROFILES[0]
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60)
  const s = Math.floor(Math.max(0, totalSeconds) % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}
