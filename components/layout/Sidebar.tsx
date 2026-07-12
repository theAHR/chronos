'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Clock3, Settings } from 'lucide-react'

const NAV = [
  { href: '/', label: 'Timer', icon: Clock3 },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-chronos-border bg-chronos-surface/60 px-4 py-6 md:flex">
      <Brand />
      <nav className="mt-10 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                active
                  ? 'bg-chronos-accent/15 text-chronos-accent'
                  : 'text-chronos-muted hover:bg-chronos-elevated hover:text-chronos-text'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
      <p className="mt-auto text-[10px] leading-relaxed text-chronos-muted/70">
        Offline-first · local data · installable PWA
      </p>
    </aside>
  )
}

export function Brand() {
  return (
    <div>
      <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-chronos-text">
        Chronos
      </Link>
      <p className="mt-1 text-xs text-chronos-muted">Focus & productivity hub</p>
    </div>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-chronos-border bg-chronos-bg/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-[10px] ${
                active ? 'text-chronos-accent' : 'text-chronos-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
