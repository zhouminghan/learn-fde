import type { Bookmark } from '@/types'
import { getDatabase } from '../database'
import { newId, nowIso } from '@/utils/id'

export async function addBookmark(kind: Bookmark['kind'], targetId: string): Promise<void> {
  await getDatabase().bookmarks.put({
    id: newId('bm'),
    kind,
    targetId,
    createdAt: nowIso()
  })
}

export async function removeBookmark(kind: Bookmark['kind'], targetId: string): Promise<void> {
  const db = getDatabase()
  const existing = await db.bookmarks
    .where('kind')
    .equals(kind)
    .filter((b) => b.targetId === targetId)
    .first()
  if (existing) await db.bookmarks.delete(existing.id)
}

export async function isBookmarked(kind: Bookmark['kind'], targetId: string): Promise<boolean> {
  const existing = await getDatabase().bookmarks
    .where('kind')
    .equals(kind)
    .filter((b) => b.targetId === targetId)
    .first()
  return Boolean(existing)
}

export async function listBookmarks(): Promise<Bookmark[]> {
  return getDatabase().bookmarks.toArray()
}

export async function bookmarkTargetIds(kind: Bookmark['kind']): Promise<string[]> {
  const all = await getDatabase().bookmarks.where('kind').equals(kind).toArray()
  return all.map((b) => b.targetId)
}
