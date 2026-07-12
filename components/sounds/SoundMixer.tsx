'use client'

import { SOUND_PRESETS, SOUND_TRACKS } from '@/lib/types'
import { useChronosStore } from '@/lib/store'
import SoundTrack from './SoundTrack'
import styles from '@/styles/ambient.module.scss'

export default function SoundMixer() {
  const mix = useChronosStore((s) => s.settings.soundMix)
  const soundEnabled = useChronosStore((s) => s.settings.soundEnabled)
  const setSoundVolume = useChronosStore((s) => s.setSoundVolume)
  const updateSettings = useChronosStore((s) => s.updateSettings)
  const applySoundPreset = useChronosStore((s) => s.applySoundPreset)

  return (
    <section className={`${styles.mixer} rounded-3xl border border-chronos-border p-5 shadow-soft`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-chronos-text">Ambient mix</h2>
          <p className="text-xs text-chronos-muted">Layer sounds. Mix freely.</p>
        </div>
        <button
          type="button"
          onClick={() => updateSettings({ soundEnabled: !soundEnabled })}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            soundEnabled
              ? 'bg-chronos-accent/20 text-chronos-accent'
              : 'bg-chronos-elevated text-chronos-muted'
          }`}
        >
          {soundEnabled ? 'On' : 'Muted'}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {SOUND_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={!soundEnabled && preset.id !== 'silence'}
            onClick={() => void applySoundPreset(preset.mix)}
            className="rounded-full border border-chronos-border px-2.5 py-1 text-[11px] text-chronos-muted transition hover:border-chronos-accent/40 hover:text-chronos-text disabled:opacity-40"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {SOUND_TRACKS.map((track) => (
          <SoundTrack
            key={track.id}
            id={track.id}
            label={track.label}
            color={track.color}
            volume={mix[track.id] ?? 0}
            disabled={!soundEnabled}
            onChange={(v) => void setSoundVolume(track.id, v)}
          />
        ))}
      </div>
    </section>
  )
}
