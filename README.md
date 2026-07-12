# Chronos — Focus & Productivity Hub

A beautiful, fast, **no-login** focus app that unifies a Pomodoro timer, ambient sound mixer, task list, and visual session stats in one polished PWA. Everything runs locally — no backend required.

![Chronos](https://img.shields.io/badge/Next.js-15-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-installable-7eb8a8?style=flat-square)
![Offline](https://img.shields.io/badge/offline-first-3d8f7a?style=flat-square)

## Why Chronos

Most “Pomodoro apps” are either a bare timer or a bloated suite that wants an account. Chronos is the middle ground people actually want:

- **Ambient sound mixer** — rain, café, white noise, forest, lo-fi, fireplace — each with its own volume, mixable together
- **Visual session history** — GitHub-style heatmap of completed focus sessions
- **Zero friction** — open it, start focusing; data stays in IndexedDB on your device
- **Polished UI** — calm typography, cozy dark theme, satisfying timer ring

## Features

- ⏱️ Circular animated focus ring with work / short / long break modes
- ▶️ Start, pause, reset, skip + auto-advance between modes
- 🎛️ **Focus profiles** — Classic, Deep work, Quick tasks, Custom
- 🎯 **Daily focus goal** with live progress
- 🔊 Layered ambient mixer + one-tap sound presets
- ✅ Lightweight tasks with sessions-spent tracking
- 🔥 Contribution heatmap + today / week / streak stats
- 🖼️ **Export a shareable “Focus wrapped” PNG card**
- 🪟 Distraction-free **Focus mode** overlay
- 💡 Break ideas when you’re between sessions
- 🔔 Tab title countdown + optional desktop notifications + chime
- 📱 Installable PWA with offline support
- ⌨️ Shortcuts: `Space` `F` `1/2/3` `R` `S` `N` `Esc`

## Quick start

```bash
cd chronos
npm install
npm run dev
```

Open [http://localhost:3014](http://localhost:3014).

Ambient WAVs and PWA icons are generated automatically on `postinstall`.

```bash
npm run generate-sounds   # procedural looping WAVs → public/sounds
npm run generate-icons    # PNG icons → public/icons
```

## Tech stack

| Piece        | Choice                                      |
| ------------ | ------------------------------------------- |
| Framework    | Next.js 15 (App Router) + TypeScript        |
| Styling      | Tailwind CSS + SCSS modules                 |
| State        | Zustand                                     |
| Persistence  | IndexedDB via `idb`                         |
| Audio        | Howler.js                                   |
| Motion       | Framer Motion                               |
| PWA          | `@ducanh2912/next-pwa`                      |
| Icons        | Lucide React                                |

## Project structure

```
app/                  # routes: /, /stats, /settings
components/
  timer/              # ring + controls
  sounds/             # ambient mixer
  tasks/              # task list
  stats/              # heatmap + summary
  layout/             # shell / nav
lib/                  # store, db, audio, notifications, stats
public/sounds/        # ambient loops
public/icons/         # PWA icons
styles/               # SCSS modules
```

## Data model (local)

```ts
interface FocusSession {
  id: string
  taskId?: string
  startedAt: number
  duration: number // seconds
  completed: boolean
  mode: 'work' | 'shortBreak' | 'longBreak'
}

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: number
  sessionCount: number
  focusSeconds: number
}

interface Settings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  theme: 'light' | 'dark' | 'auto'
  soundMix: Record<string, number>
  // …
}
```

## Deploy

### GitHub Pages (static)

This project builds as a fully static site (`output: 'export'`) and deploys automatically via GitHub Actions on pushes to `main` / `master`.

1. In your repo on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` — the workflow publishes to `https://<user>.github.io/chronos/`.

Local static build (same as CI):

```bash
# Windows PowerShell
$env:NEXT_PUBLIC_BASE_PATH="/chronos"; npm run build:pages

# macOS / Linux
NEXT_PUBLIC_BASE_PATH=/chronos npm run build:pages
```

Output is written to `out/`. For root-domain hosting (e.g. `username.github.io`), omit `NEXT_PUBLIC_BASE_PATH`.

### Vercel / other hosts

```bash
npm run build
```

Point your host at the `chronos` folder. After deploy, use “Install app” / Add to Home Screen for the PWA.

## License

MIT — build on it, ship it, stay focused.
