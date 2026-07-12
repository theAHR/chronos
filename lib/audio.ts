'use client'

import { Howl } from 'howler'
import { SOUND_TRACKS, type SoundTrackId } from './types'

class AmbientMixer {
  private tracks = new Map<SoundTrackId, Howl>()
  private volumes = new Map<SoundTrackId, number>()
  private unlocked = false
  private masterEnabled = true

  private ensure(id: SoundTrackId) {
    let howl = this.tracks.get(id)
    if (howl) return howl
    const meta = SOUND_TRACKS.find((t) => t.id === id)
    if (!meta) throw new Error(`Unknown track: ${id}`)
    howl = new Howl({
      src: [meta.file],
      loop: true,
      volume: 0,
      preload: true,
      html5: false,
    })
    this.tracks.set(id, howl)
    return howl
  }

  unlock() {
    if (this.unlocked) return
    this.unlocked = true
    SOUND_TRACKS.forEach((t) => this.ensure(t.id))
  }

  setMasterEnabled(enabled: boolean) {
    this.masterEnabled = enabled
    if (!enabled) {
      this.tracks.forEach((howl) => {
        if (howl.playing()) howl.pause()
      })
      return
    }
    this.volumes.forEach((vol, id) => {
      if (vol > 0.01) this.setVolume(id, vol)
    })
  }

  setVolume(id: SoundTrackId, volume: number) {
    const clamped = Math.max(0, Math.min(1, volume))
    this.volumes.set(id, clamped)
    const howl = this.ensure(id)
    howl.volume(clamped)

    if (!this.masterEnabled) {
      if (howl.playing()) howl.pause()
      return
    }

    if (clamped <= 0.01) {
      if (howl.playing()) howl.fade(howl.volume(), 0, 250)
      setTimeout(() => {
        if ((this.volumes.get(id) ?? 0) <= 0.01) howl.pause()
      }, 280)
    } else if (!howl.playing()) {
      howl.play()
      howl.fade(0, clamped, 400)
    }
  }

  applyMix(mix: Record<string, number>) {
    SOUND_TRACKS.forEach((t) => {
      this.setVolume(t.id, mix[t.id] ?? 0)
    })
  }

  stopAll() {
    this.tracks.forEach((howl) => {
      howl.stop()
    })
  }
}

export const ambientMixer = typeof window !== 'undefined' ? new AmbientMixer() : null

export function playChime() {
  if (typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime
    ;[523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + i * 0.12)
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.55)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.12)
      osc.stop(now + i * 0.12 + 0.6)
    })
    setTimeout(() => ctx.close(), 2000)
  } catch {
    /* ignore */
  }
}
