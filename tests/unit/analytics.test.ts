import { describe, expect, it } from 'vitest'
import type { CourseProgress, ExamAttempt } from '@/types'
import { courseCompletion, weakestDomains } from '@/domain/analytics/analytics'

describe('courseCompletion', () => {
  const progress: CourseProgress[] = [
    { lessonId: '1', status: 'completed', lastVisitedAt: '', readSeconds: 1 },
    { lessonId: '2', status: 'in_progress', lastVisitedAt: '', readSeconds: 1 }
  ]

  it('统计完成、进行中与百分比', () => {
    const result = courseCompletion(progress, 5)
    expect(result.completed).toBe(1)
    expect(result.inProgress).toBe(1)
    expect(result.percent).toBe(0.2)
  })
})

describe('weakestDomains', () => {
  it('按正确率升序返回薄弱域', () => {
    const attempts: ExamAttempt[] = [
      {
        id: 'a',
        blueprintId: 'b',
        blueprintVersion: '1',
        randomSeed: 's',
        startedAt: '',
        submittedAt: '2026-11-10',
        durationSeconds: 0,
        questionSnapshots: [],
        questionOrder: [],
        answers: {},
        markedQuestionIds: [],
        score: 0,
        maxScore: 100,
        status: 'submitted',
        domainStats: [
          { domainId: 'D1', total: 10, correct: 9, accuracy: 0.9, score: 0 },
          { domainId: 'D2', total: 10, correct: 5, accuracy: 0.5, score: 0 }
        ]
      }
    ]
    const result = weakestDomains(attempts, [{ id: 'D1', title: '一' }, { id: 'D2', title: '二' }])
    expect(result[0].domainId).toBe('D2')
  })
})
