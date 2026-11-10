import type { CourseProgress, CourseProgressStatus } from '@/types'
import { getDatabase } from '../database'

export async function getCourseProgress(lessonId: string) {
  return getDatabase().courseProgress.get(lessonId)
}

export async function getAllCourseProgress() {
  return getDatabase().courseProgress.toArray()
}

export async function visitLesson(
  lessonId: string,
  readSeconds: number
): Promise<void> {
  const db = getDatabase()
  const existing = await db.courseProgress.get(lessonId)
  const now = new Date().toISOString()
  await db.courseProgress.put({
    lessonId,
    status: existing?.status === 'completed' ? 'completed' : 'in_progress',
    lastVisitedAt: now,
    completedAt: existing?.completedAt,
    readSeconds: (existing?.readSeconds ?? 0) + readSeconds
  })
}

export async function setLessonStatus(
  lessonId: string,
  status: CourseProgressStatus
): Promise<void> {
  const db = getDatabase()
  const existing = await db.courseProgress.get(lessonId)
  const now = new Date().toISOString()
  await db.courseProgress.put({
    lessonId,
    status,
    lastVisitedAt: now,
    completedAt: status === 'completed' ? now : existing?.completedAt,
    readSeconds: existing?.readSeconds ?? 0
  })
}

export async function resetLesson(lessonId: string): Promise<void> {
  const db = getDatabase()
  const existing = await db.courseProgress.get(lessonId)
  await db.courseProgress.put({
    lessonId,
    status: 'not_started',
    lastVisitedAt: new Date().toISOString(),
    completedAt: undefined,
    readSeconds: existing?.readSeconds ?? 0
  })
}
