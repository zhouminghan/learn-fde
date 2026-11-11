import type { ExamAttempt, ExamBlueprint, Question } from '@/types'

export interface QuestionResult {
  questionId: string
  correct: boolean
  score: number
  selectedIds: string[]
  expectedIds: string[]
}

/**
 * 判分口径：
 * - 单选：所选答案与标准答案完全一致得 questionScores.single 分。
 * - 多选：blueprint.multipleScoring === 'exact_match' 时完全匹配得
 *   questionScores.multiple 分，否则 0 分。该口径为 Learning FDE 本地模拟规则，
 *   不代表腾讯云官方判分细则。
 */
export function scoreQuestion(
  question: Question,
  selectedIds: string[],
  blueprint: ExamBlueprint
): number {
  const expected = [...question.answerIds].sort()
  const actual = [...new Set(selectedIds)].sort()
  const isCorrect =
    expected.length === actual.length &&
    expected.every((id, index) => id === actual[index])

  if (!isCorrect) return 0
  return question.type === 'single'
    ? blueprint.questionScores.single
    : blueprint.questionScores.multiple
}

export function isAnswerCorrect(question: Question, selectedIds: string[]): boolean {
  const expected = [...question.answerIds].sort()
  const actual = [...new Set(selectedIds)].sort()
  return (
    expected.length === actual.length &&
    expected.every((id, index) => id === actual[index])
  )
}

export function scoreExam(attempt: ExamAttempt, blueprint: ExamBlueprint) {
  const results: QuestionResult[] = attempt.questionSnapshots.map((question) => {
    const selectedIds = attempt.answers[question.id] ?? []
    return {
      questionId: question.id,
      correct: isAnswerCorrect(question, selectedIds),
      score: scoreQuestion(question, selectedIds, blueprint),
      selectedIds,
      expectedIds: question.answerIds
    }
  })

  const score = results.reduce((sum, r) => sum + r.score, 0)
  const correctCount = results.filter((r) => r.correct).length
  const domainStats = computeDomainStats(attempt, blueprint)

  return { results, score, correctCount, domainStats }
}

export function computeDomainStats(
  attempt: ExamAttempt,
  blueprint: ExamBlueprint
) {
  const byDomain = new Map<string, { total: number; correct: number; score: number }>()

  for (const question of attempt.questionSnapshots) {
    const selectedIds = attempt.answers[question.id] ?? []
    const correct = isAnswerCorrect(question, selectedIds)
    const score = scoreQuestion(question, selectedIds, blueprint)
    const entry = byDomain.get(question.domainId) ?? { total: 0, correct: 0, score: 0 }
    entry.total += 1
    entry.correct += correct ? 1 : 0
    entry.score += score
    byDomain.set(question.domainId, entry)
  }

  return blueprint.domainTargets.map((target) => {
    const entry = byDomain.get(target.domainId) ?? { total: 0, correct: 0, score: 0 }
    return {
      domainId: target.domainId,
      total: entry.total,
      correct: entry.correct,
      accuracy: entry.total > 0 ? entry.correct / entry.total : 0,
      score: entry.score
    }
  })
}

export function roundScore(value: number): number {
  return Math.round(value * 100) / 100
}
