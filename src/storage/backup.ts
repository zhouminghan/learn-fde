import type { ExportBundle } from '@/types'
import { getDatabase } from './database'

export const BACKUP_SCHEMA = 'learn-fde-backup'
export const BACKUP_VERSION = 1
export const APP_VERSION = '0.1.0'

export async function createExportBundle(): Promise<ExportBundle> {
  const db = getDatabase()
  const [courseProgress, practiceAttempts, examAttempts, wrongQuestions, bookmarks, userNotes, appSettings] =
    await Promise.all([
      db.courseProgress.toArray(),
      db.practiceAttempts.toArray(),
      db.examAttempts.toArray(),
      db.wrongQuestions.toArray(),
      db.bookmarks.toArray(),
      db.userNotes.toArray(),
      db.appSettings.toArray()
    ])

  return {
    schema: BACKUP_SCHEMA,
    version: BACKUP_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      courseProgress,
      practiceAttempts,
      examAttempts,
      wrongQuestions,
      bookmarks,
      userNotes,
      appSettings
    }
  }
}

export function exportToJson(bundle: ExportBundle): string {
  return JSON.stringify(bundle, null, 2)
}

export function parseBackup(json: string): { ok: true; bundle: ExportBundle } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json) as ExportBundle
    if (parsed.schema !== BACKUP_SCHEMA) return { ok: false, error: '文件不是 Learning FDE 学习数据备份' }
    if (parsed.version !== BACKUP_VERSION) return { ok: false, error: `备份版本 ${parsed.version} 与当前版本 ${BACKUP_VERSION} 不兼容` }
    if (!parsed.data || typeof parsed.data !== 'object') return { ok: false, error: '备份缺少数据内容' }
    return { ok: true, bundle: parsed }
  } catch {
    return { ok: false, error: 'JSON 解析失败，文件可能已损坏' }
  }
}

export async function importBundle(bundle: ExportBundle): Promise<void> {
  const db = getDatabase()
  await db.transaction(
    'rw',
    [
      db.courseProgress,
      db.practiceAttempts,
      db.examAttempts,
      db.wrongQuestions,
      db.bookmarks,
      db.userNotes,
      db.appSettings
    ],
    async () => {
      await db.courseProgress.bulkPut(bundle.data.courseProgress ?? [])
      await db.practiceAttempts.bulkPut(bundle.data.practiceAttempts ?? [])
      await db.examAttempts.bulkPut(bundle.data.examAttempts ?? [])
      await db.wrongQuestions.bulkPut(bundle.data.wrongQuestions ?? [])
      await db.bookmarks.bulkPut(bundle.data.bookmarks ?? [])
      await db.userNotes.bulkPut(bundle.data.userNotes ?? [])
      await db.appSettings.bulkPut(bundle.data.appSettings ?? [])
    }
  )
}

export async function clearAllData(): Promise<void> {
  const db = getDatabase()
  await db.transaction(
    'rw',
    [
      db.courseProgress,
      db.practiceAttempts,
      db.examAttempts,
      db.wrongQuestions,
      db.bookmarks,
      db.userNotes,
      db.appSettings
    ],
    async () => {
      await db.courseProgress.clear()
      await db.practiceAttempts.clear()
      await db.examAttempts.clear()
      await db.wrongQuestions.clear()
      await db.bookmarks.clear()
      await db.userNotes.clear()
      await db.appSettings.clear()
    }
  )
}
