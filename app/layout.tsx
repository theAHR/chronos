import type { Metadata, Viewport } from 'next'
import './globals.css'
import AppShell from '@/components/layout/AppShell'
import { assetPath } from '@/lib/paths'

export const metadata: Metadata = {
  title: 'Chronos — Focus & Productivity Hub',
  description:
    'Pomodoro timer, ambient sound mixer, tasks, and focus heatmap — offline-first, no login, installable PWA.',
  applicationName: 'Chronos',
  manifest: assetPath('/manifest.webmanifest'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Chronos',
  },
  icons: {
    icon: [
      { url: assetPath('/icons/icon-192.png'), sizes: '192x192', type: 'image/png' },
      { url: assetPath('/icons/icon-512.png'), sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: assetPath('/icons/icon-192.png'), sizes: '192x192' }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3efe8' },
    { media: '(prefers-color-scheme: dark)', color: '#161210' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
