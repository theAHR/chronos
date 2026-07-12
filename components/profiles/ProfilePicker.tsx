'use client'

import { BUILT_IN_PROFILES, type ProfileId } from '@/lib/types'
import { useChronosStore } from '@/lib/store'

export default function ProfilePicker() {
  const activeId = useChronosStore((s) => s.settings.activeProfileId)
  const applyProfile = useChronosStore((s) => s.applyProfile)
  const custom = useChronosStore((s) => s.settings.customProfile)

  const profiles = [
    ...BUILT_IN_PROFILES,
    { ...custom, description: 'Your saved durations & mix' },
  ]

  return (
    <section className="w-full rounded-3xl border border-chronos-border bg-chronos-surface p-4 shadow-soft">
      <div className="mb-3">
        <h2 className="font-display text-lg text-chronos-text">Focus profile</h2>
        <p className="text-xs text-chronos-muted">Durations + ambient preset in one tap.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {profiles.map((p) => {
          const active = activeId === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => void applyProfile(p.id as ProfileId)}
              className={`rounded-2xl border px-3 py-2.5 text-left transition ${
                active
                  ? 'border-chronos-accent/50 bg-chronos-accent/10'
                  : 'border-chronos-border bg-chronos-elevated/50 hover:border-chronos-accent/30'
              }`}
            >
              <p className={`text-sm font-medium ${active ? 'text-chronos-accent' : 'text-chronos-text'}`}>
                {p.label}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-chronos-muted">{p.description}</p>
              <p className="mt-1.5 text-[10px] tabular-nums text-chronos-muted">
                {Math.round(p.workDuration / 60)}/{Math.round(p.shortBreakDuration / 60)}/
                {Math.round(p.longBreakDuration / 60)} min
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
