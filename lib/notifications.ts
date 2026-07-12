'use client'

import { assetPath } from './paths'

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function notifySessionComplete(modeLabel: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    const n = new Notification(`${modeLabel} complete — Chronos`, {
      body,
      icon: assetPath('/icons/icon-192.png'),
      badge: assetPath('/icons/icon-192.png'),
      silent: false,
    })
    setTimeout(() => n.close(), 6000)
  } catch {
    /* ignore */
  }
}

export function updateDocumentTitle(time: string, mode: string, running: boolean) {
  if (typeof document === 'undefined') return
  document.title = running ? `⏱ ${time} — Chronos` : `${mode} · Chronos`
}
