import type { CourseProgress, ExamAttempt, PracticeAttempt } from '@/types'

export type MasteryLevel = 'insufficient' | 'weak' | 'developing' | 'proficient'

export interface DomainMastery {
  domainId: string
  title: string
  answered: number
  correct: number
  accuracy: number
  level: MasteryLevel
}

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

export function domainMastery(
  attempts: ExamAttempt[],
  practice: PracticeAttempt[],
  domains: { id: string; title: string }[],
  minSamples = 5
): DomainMastery[] {
  const acc = new Map<string, { total: number; correct: number }>()

  for (const attempt of attempts) {
    if (attempt.status !== 'submitted' && attempt.status !== 'timeout') continue
    for (const stat of attempt.domainStats ?? []) {
      const entry = acc.get(stat.domainId) ?? { total: 0, correct: 0 }
      entry.total += stat.total
      entry.correct += stat.correct
      acc.set(stat.domainId, entry)
    }
  }

  for (const attempt of practice) {
    const domainId = domains.find((d) => attempt.filters.domainIds?.includes(d.id))?.id
    if (domainId && attempt.filters.domainIds?.length === 1) {
      const entry = acc.get(domainId) ?? { total: 0, correct: 0 }
      entry.total += attempt.total
      entry.correct += attempt.correctCount
      acc.set(domainId, entry)
    }
  }

  return domains.map((domain) => {
    const entry = acc.get(domain.id) ?? { total: 0, correct: 0 }
    const accuracy = entry.total > 0 ? entry.correct / entry.total : 0
    const level: MasteryLevel =
      entry.total < minSamples
        ? 'insufficient'
        : accuracy < 0.6
          ? 'weak'
          : accuracy < 0.8
            ? 'developing'
            : 'proficient'
    return {
      domainId: domain.id,
      title: domain.title,
      answered: entry.total,
      correct: entry.correct,
      accuracy,
      level
    }
  })
}

export function reviewRecommendations(mastery: DomainMastery[], lessons: { id: string; title: string; domainIds: string[] }[]) {
  const weak = mastery
    .filter((m) => m.level === 'weak' || m.level === 'insufficient')
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((m) => ({
      ...m,
      lessons: lessons
        .filter((l) => l.domainIds.includes(m.domainId))
        .map((l) => ({ id: l.id, title: l.title }))
    }))
  return weak
}
