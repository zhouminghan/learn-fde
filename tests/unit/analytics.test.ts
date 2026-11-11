import { describe, expect, it } from 'vitest'
import type { CourseProgress, ExamAttempt } from '@/types'
import { courseCompletion, weakestDomains, domainMastery, reviewRecommendations } from '@/domain/analytics/analytics'

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

describe('domainMastery', () => {
  const domains = [
    { id: 'D1', title: 'AI 基础' },
    { id: 'D2', title: 'ADP 定位' }
  ]

  it('样本不足时标记 insufficient，不给出虚假精度', () => {
    const result = domainMastery([], [], domains, 5)
    expect(result.every((m) => m.level === 'insufficient')).toBe(true)
    expect(result.every((m) => m.answered === 0)).toBe(true)
  })

  it('按正确率与样本量给出可解释等级', () => {
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
    const result = domainMastery(attempts, [], domains, 5)
    expect(result.find((m) => m.domainId === 'D1')?.level).toBe('proficient')
    expect(result.find((m) => m.domainId === 'D2')?.level).toBe('weak')
  })
})

describe('reviewRecommendations', () => {
  it('推荐薄弱与样本不足的知识域及其章节', () => {
    const mastery = [
      { domainId: 'D1', title: 'AI 基础', answered: 0, correct: 0, accuracy: 0, level: 'insufficient' as const },
      { domainId: 'D2', title: 'ADP 定位', answered: 10, correct: 5, accuracy: 0.5, level: 'weak' as const }
    ]
    const lessons = [
      { id: '1.1', title: 'AI 基础', domainIds: ['D1'] },
      { id: '2.1', title: 'ADP 是什么', domainIds: ['D2'] }
    ]
    const result = reviewRecommendations(mastery, lessons)
    expect(result).toHaveLength(2)
    expect(result[0].domainId).toBe('D1')
    expect(result[0].lessons).toEqual([{ id: '1.1', title: 'AI 基础' }])
  })
})
