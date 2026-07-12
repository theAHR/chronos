'use client'

import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Brand } from './Sidebar'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function TopBar() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  return (
    <header className="flex items-center justify-between border-b border-chronos-border px-4 py-4 md:hidden">
      <Brand />
      {deferred && !installed && (
        <button
          type="button"
          onClick={async () => {
            await deferred.prompt()
            setDeferred(null)
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-chronos-border px-3 py-1.5 text-xs text-chronos-text"
        >
          <Download className="h-3.5 w-3.5" />
          Install
        </button>
      )}
    </header>
  )
}
