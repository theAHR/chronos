'use client'

import { useEffect } from 'react'
import { useChronosStore, syncTitleFromStore } from '@/lib/store'
import Sidebar, { MobileNav } from './Sidebar'
import TopBar from './TopBar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const hydrate = useChronosStore((s) => s.hydrate)
  const hydrated = useChronosStore((s) => s.hydrated)
  const tick = useChronosStore((s) => s.tick)
  const status = useChronosStore((s) => s.status)
  const remaining = useChronosStore((s) => s.remaining)
  const mode = useChronosStore((s) => s.mode)
  const theme = useChronosStore((s) => s.settings.theme)
  const start = useChronosStore((s) => s.start)
  const pause = useChronosStore((s) => s.pause)
  const reset = useChronosStore((s) => s.reset)
  const skip = useChronosStore((s) => s.skip)
  const setMode = useChronosStore((s) => s.setMode)
  const addTask = useChronosStore((s) => s.addTask)
  const focusMode = useChronosStore((s) => s.focusMode)
  const setFocusMode = useChronosStore((s) => s.setFocusMode)
  const clearCelebrate = useChronosStore((s) => s.clearCelebrate)
  const celebrate = useChronosStore((s) => s.celebrate)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    if (status !== 'running') return
    const id = window.setInterval(() => tick(Date.now()), 250)
    return () => clearInterval(id)
  }, [status, tick])

  useEffect(() => {
    syncTitleFromStore()
  }, [remaining, mode, status])

  useEffect(() => {
    const root = document.documentElement
    const apply = (dark: boolean) => {
      root.classList.toggle('dark', dark)
      root.dataset.theme = dark ? 'dark' : 'light'
    }

    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches)
      const onChange = () => apply(mq.matches)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }
    apply(theme === 'dark')
  }, [theme])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'Escape') {
        setFocusMode(false)
        return
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setFocusMode(!useChronosStore.getState().focusMode)
        return
      }
      if (e.code === 'Space') {
        e.preventDefault()
        const s = useChronosStore.getState().status
        if (s === 'running') pause()
        else start()
        return
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        const title = window.prompt('New task')
        if (title) void addTask(title)
        return
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        reset()
        return
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        skip()
        return
      }
      if (e.key === '1') setMode('work')
      if (e.key === '2') setMode('shortBreak')
      if (e.key === '3') setMode('longBreak')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [start, pause, reset, skip, setMode, addTask, setFocusMode])

  useEffect(() => {
    if (!celebrate) return
    const t = window.setTimeout(() => clearCelebrate(), 1200)
    return () => clearTimeout(t)
  }, [celebrate, clearCelebrate])

  return (
    <div className={`chronos-shell flex min-h-screen ${focusMode ? 'overflow-hidden' : ''}`}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-8">
          {!hydrated ? (
            <div className="flex h-[60vh] items-center justify-center text-sm text-chronos-muted">
              Loading Chronos…
            </div>
          ) : (
            children
          )}
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
