import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { FocusSession, Settings, Task } from './types'
import { DEFAULT_SETTINGS } from './types'

interface ChronosDB extends DBSchema {
  sessions: {
    key: string
    value: FocusSession
    indexes: { 'by-date': number }
  }
  tasks: {
    key: string
    value: Task
    indexes: { 'by-created': number }
  }
  meta: {
    key: string
    value: Settings | string
  }
}

const DB_NAME = 'chronos-db'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<ChronosDB>> | null = null

function getDb() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is browser-only'))
  }
  if (!dbPromise) {
    dbPromise = openDB<ChronosDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'id' })
        sessions.createIndex('by-date', 'startedAt')
        const tasks = db.createObjectStore('tasks', { keyPath: 'id' })
        tasks.createIndex('by-created', 'createdAt')
        db.createObjectStore('meta')
      },
    })
  }
  return dbPromise
}

export async function loadSettings(): Promise<Settings> {
  try {
    const db = await getDb()
    const stored = await db.get('meta', 'settings')
    if (stored && typeof stored === 'object') {
      const s = stored as Settings
      return {
        ...DEFAULT_SETTINGS,
        ...s,
        soundMix: { ...DEFAULT_SETTINGS.soundMix, ...s.soundMix },
        customProfile: {
          ...DEFAULT_SETTINGS.customProfile,
          ...s.customProfile,
          soundMix: {
            ...DEFAULT_SETTINGS.customProfile.soundMix,
            ...(s.customProfile?.soundMix ?? {}),
          },
        },
      }
    }
  } catch {
    /* ignore */
  }
  return {
    ...DEFAULT_SETTINGS,
    soundMix: { ...DEFAULT_SETTINGS.soundMix },
    customProfile: {
      ...DEFAULT_SETTINGS.customProfile,
      soundMix: { ...DEFAULT_SETTINGS.customProfile.soundMix },
    },
  }
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('sessions', id)
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDb()
  await db.put('meta', settings, 'settings')
}

export async function loadSessions(): Promise<FocusSession[]> {
  try {
    const db = await getDb()
    return await db.getAllFromIndex('sessions', 'by-date')
  } catch {
    return []
  }
}

export async function addSession(session: FocusSession): Promise<void> {
  const db = await getDb()
  await db.put('sessions', session)
}

export async function loadTasks(): Promise<Task[]> {
  try {
    const db = await getDb()
    const tasks = await db.getAllFromIndex('tasks', 'by-created')
    return tasks.reverse()
  } catch {
    return []
  }
}

export async function saveTask(task: Task): Promise<void> {
  const db = await getDb()
  await db.put('tasks', task)
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('tasks', id)
}

export async function clearAllData(): Promise<void> {
  const db = await getDb()
  await db.clear('sessions')
  await db.clear('tasks')
  await db.delete('meta', 'settings')
}
