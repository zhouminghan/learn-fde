import type { CourseProgress, LessonMeta } from '@/types'

export function nextLesson(
  lessons: LessonMeta[],
  progress: CourseProgress[]
): LessonMeta | null {
  const progressMap = new Map(progress.map((p) => [p.lessonId, p]))
  const ordered = [...lessons].sort((a, b) => a.order - b.order)
  const firstNotCompleted = ordered.find((l) => progressMap.get(l.id)?.status !== 'completed')
  return firstNotCompleted ?? null
}

export function continueLesson(
  lessons: LessonMeta[],
  progress: CourseProgress[]
): LessonMeta | null {
  const progressMap = new Map(progress.map((p) => [p.lessonId, p]))
  const ordered = [...lessons].sort((a, b) => a.order - b.order)
  const inProgress = ordered
    .filter((l) => progressMap.get(l.id)?.status === 'in_progress')
    .sort((a, b) =>
      (progressMap.get(b.id)?.lastVisitedAt ?? '').localeCompare(
        progressMap.get(a.id)?.lastVisitedAt ?? ''
      )
    )
  return inProgress[0] ?? nextLesson(lessons, progress)
}
