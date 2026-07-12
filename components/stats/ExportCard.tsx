'use client'

import { useRef, useState } from 'react'
import { Download, Share2 } from 'lucide-react'
import { computeStreak, startOfDay, startOfWeek, sumFocusSeconds } from '@/lib/stats'
import { formatDuration, type FocusSession, type Task } from '@/lib/types'

interface Props {
  sessions: FocusSession[]
  tasks: Task[]
}

export default function ExportCard({ sessions, tasks }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const build = async () => {
    setBusy(true)
    try {
      const canvas = canvasRef.current
      if (!canvas) return
      const w = 1080
      const h = 1350
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Warm dark background
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, '#1a1612')
      grad.addColorStop(0.55, '#211c17')
      grad.addColorStop(1, '#16231f')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Soft accent glow
      const glow = ctx.createRadialGradient(w * 0.5, h * 0.22, 20, w * 0.5, h * 0.22, 420)
      glow.addColorStop(0, 'rgba(126,184,168,0.28)')
      glow.addColorStop(1, 'rgba(126,184,168,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      const today = sumFocusSeconds(sessions, startOfDay())
      const week = sumFocusSeconds(sessions, startOfWeek())
      const streak = computeStreak(sessions)
      const total = sessions.filter((s) => s.completed && s.mode === 'work').length
      const top = [...tasks]
        .filter((t) => t.focusSeconds > 0)
        .sort((a, b) => b.focusSeconds - a.focusSeconds)[0]

      ctx.fillStyle = '#7eb8a8'
      ctx.font = '600 42px Georgia, serif'
      ctx.fillText('Chronos', 80, 120)

      ctx.fillStyle = '#f3ebe1'
      ctx.font = '600 72px Georgia, serif'
      ctx.fillText('Focus wrapped', 80, 220)

      ctx.fillStyle = '#a3988c'
      ctx.font = '400 28px system-ui, sans-serif'
      const dateLabel = new Date().toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
      ctx.fillText(dateLabel, 80, 270)

      const cards = [
        { label: 'TODAY', value: formatDuration(today) },
        { label: 'THIS WEEK', value: formatDuration(week) },
        { label: 'STREAK', value: `${streak} day${streak === 1 ? '' : 's'}` },
        { label: 'SESSIONS', value: String(total) },
      ]

      cards.forEach((c, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = 80 + col * 460
        const y = 340 + row * 220
        roundRect(ctx, x, y, 420, 180, 28)
        ctx.fillStyle = 'rgba(42,35,29,0.9)'
        ctx.fill()
        ctx.fillStyle = '#a3988c'
        ctx.font = '600 22px system-ui, sans-serif'
        ctx.fillText(c.label, x + 36, y + 58)
        ctx.fillStyle = '#f3ebe1'
        ctx.font = '600 56px Georgia, serif'
        ctx.fillText(c.value, x + 36, y + 130)
      })

      ctx.fillStyle = '#a3988c'
      ctx.font = '400 26px system-ui, sans-serif'
      ctx.fillText(
        top ? `Top task · ${truncate(top.title, 36)}` : 'No tasks tracked yet',
        80,
        860
      )

      // Mini heatmap strip (last 28 days)
      const dayMs = 86400000
      const todayStart = startOfDay()
      for (let i = 0; i < 28; i++) {
        const day = todayStart - (27 - i) * dayMs
        const count = sessions.filter(
          (s) =>
            s.completed &&
            s.mode === 'work' &&
            s.startedAt >= day &&
            s.startedAt < day + dayMs
        ).length
        const colors = ['#2a231d', '#35564c', '#4a7a6a', '#6fa894', '#9fd0bc']
        const level = count <= 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4
        ctx.fillStyle = colors[level]
        const x = 80 + i * 34
        roundRect(ctx, x, 920, 28, 28, 6)
        ctx.fill()
      }

      ctx.fillStyle = '#7a7166'
      ctx.font = '400 22px system-ui, sans-serif'
      ctx.fillText('Offline · no login · chronos focus hub', 80, 1060)

      const url = canvas.toDataURL('image/png')
      setPreview(url)
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!preview) return
    const a = document.createElement('a')
    a.href = preview
    a.download = `chronos-focus-${new Date().toISOString().slice(0, 10)}.png`
    a.click()
  }

  const share = async () => {
    if (!preview || !navigator.share) {
      download()
      return
    }
    const res = await fetch(preview)
    const blob = await res.blob()
    const file = new File([blob], 'chronos-focus.png', { type: 'image/png' })
    try {
      await navigator.share({ files: [file], title: 'Chronos Focus Wrapped' })
    } catch {
      download()
    }
  }

  return (
    <section className="rounded-3xl border border-chronos-border bg-chronos-surface p-5 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg">Share your focus</h2>
          <p className="text-xs text-chronos-muted">Export a wrapped-style card as PNG.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void build()}
            disabled={busy}
            className="rounded-full bg-chronos-accent px-4 py-1.5 text-xs font-semibold text-[#1a1512]"
          >
            {busy ? 'Building…' : preview ? 'Refresh card' : 'Generate card'}
          </button>
          {preview && (
            <>
              <button
                type="button"
                onClick={download}
                className="inline-flex items-center gap-1 rounded-full border border-chronos-border px-3 py-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
              <button
                type="button"
                onClick={() => void share()}
                className="inline-flex items-center gap-1 rounded-full border border-chronos-border px-3 py-1.5 text-xs"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
            </>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Chronos focus wrapped card preview"
          className="mt-2 max-h-80 w-full rounded-2xl border border-chronos-border object-contain"
        />
      )}
    </section>
  )
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
