'use client'

import styles from '@/styles/ambient.module.scss'

interface Props {
  id: string
  label: string
  color: string
  volume: number
  disabled?: boolean
  onChange: (volume: number) => void
}

export default function SoundTrack({ label, color, volume, disabled, onChange }: Props) {
  const active = volume > 0.01

  return (
    <div className={`flex items-center gap-3 ${disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(active ? 0 : 0.35)}
        className="w-[5.5rem] text-left text-sm transition"
        style={{ color: active ? color : undefined }}
      >
        <span className={active ? 'font-medium' : 'text-chronos-muted'}>{label}</span>
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`${styles.slider} flex-1`}
        style={{ ['--thumb' as string]: color }}
        aria-label={`${label} volume`}
      />
      <span className="w-8 text-right text-[10px] tabular-nums text-chronos-muted">
        {Math.round(volume * 100)}
      </span>
    </div>
  )
}
