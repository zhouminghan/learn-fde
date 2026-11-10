import type { CourseProgress, ExamAttempt, PracticeAttempt } from '@/types'

export function courseCompletion(progress: CourseProgress[], totalLessons: number) {
  const completed = progress.filter((p) => p.status === 'completed').length
  const inProgress = progress.filter((p) => p.status === 'in_progress').length
  return {
    completed,
    inProgress,
    notStarted: Math.max(0, totalLessons - completed - inProgress),
    percent: totalLessons > 0 ? completed / totalLessons : 0
  }
}

export function weakestDomains(
  attempts: ExamAttempt[],
  domains: { id: string; title: string }[],
  limit = 3
) {
  const submitted = attempts.filter(
    (a) => (a.status === 'submitted' || a.status === 'timeout') && a.domainStats
  )
  const acc = new Map<string, { total: number; correct: number }>()
  for (const attempt of submitted) {
    for (const stat of attempt.domainStats ?? []) {
      const entry = acc.get(stat.domainId) ?? { total: 0, correct: 0 }
      entry.total += stat.total
      entry.correct += stat.correct
      acc.set(stat.domainId, entry)
    }
  }

  return [...acc.entries()]
    .map(([domainId, value]) => ({
      domainId,
      title: domains.find((d) => d.id === domainId)?.title ?? domainId,
      accuracy: value.total > 0 ? value.correct / value.total : 0,
      total: value.total
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit)
}

export function practiceStats(attempts: PracticeAttempt[]) {
  const total = attempts.reduce((sum, a) => sum + a.total, 0)
  const correct = attempts.reduce((sum, a) => sum + a.correctCount, 0)
  return {
    sessions: attempts.length,
    total,
    correct,
    accuracy: total > 0 ? correct / total : 0
  }
}

export function examTrend(attempts: ExamAttempt[]) {
  return attempts
    .filter((a) => a.status !== 'in_progress' && typeof a.score === 'number')
    .sort((a, b) => (a.submittedAt ?? a.startedAt).localeCompare(b.submittedAt ?? b.startedAt))
    .map((a) => ({
      id: a.id,
      submittedAt: a.submittedAt ?? a.startedAt,
      score: a.score ?? 0,
      durationSeconds: a.durationSeconds
    }))
}
