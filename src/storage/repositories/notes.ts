import type { UserNote } from '@/types'
import { getDatabase } from '../database'
import { newId, nowIso } from '@/utils/id'

export async function listNotes(lessonId?: string): Promise<UserNote[]> {
  if (lessonId) {
    return getDatabase().userNotes.where('lessonId').equals(lessonId).reverse().sortBy('updatedAt')
  }
  return getDatabase().userNotes.orderBy('updatedAt').reverse().toArray()
}

export async function saveNote(lessonId: string, text: string, id?: string): Promise<void> {
  const db = getDatabase()
  if (id) {
    const existing = await db.userNotes.get(id)
    if (existing) {
      await db.userNotes.put({ ...existing, text, updatedAt: nowIso() })
      return
    }
  }
  await db.userNotes.put({
    id: id ?? newId('note'),
    lessonId,
    text,
    createdAt: nowIso(),
    updatedAt: nowIso()
  })
}

export async function deleteNote(id: string): Promise<void> {
  await getDatabase().userNotes.delete(id)
}
