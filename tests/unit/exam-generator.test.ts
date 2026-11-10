import { describe, expect, it } from 'vitest'
import type { ExamBlueprint, Question } from '@/types'
import { generateExam } from '@/domain/exam/exam-generator'

const blueprint: ExamBlueprint = {
  id: 'test',
  version: '1',
  title: '测试',
  durationSeconds: 5400,
  totalQuestions: 4,
  totalScore: 100,
  passScore: 70,
  questionTypeTargets: { single: 2, multiple: 2 },
  questionScores: { single: 1.5, multiple: 2 },
  domainTargets: [
    { domainId: 'D1', weightPercent: 50, questionCount: 2, singleCount: 1, multipleCount: 1 },
    { domainId: 'D2', weightPercent: 50, questionCount: 2, singleCount: 1, multipleCount: 1 }
  ],
  multipleScoring: 'exact_match',
  difficultyTargets: { easy: 0.3, medium: 0.5, hard: 0.2 }
}

function makeQuestion(id: string, domainId: string, type: 'single' | 'multiple'): Question {
  return {
    id,
    domainId,
    lessonIds: ['1.1'],
    type,
    difficulty: 'medium',
    stem: `题目 ${id}`,
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' }
    ],
    answerIds: type === 'single' ? ['A'] : ['A', 'B'],
    explanation: '解析',
    tags: [],
    sourceType: 'original',
    sourceUrls: ['https://example.com'],
    status: 'published',
    createdAt: '2026-11-10',
    updatedAt: '2026-11-10'
  }
}

function pool(): Question[] {
  return [
    makeQuestion('d1s1', 'D1', 'single'),
    makeQuestion('d1s2', 'D1', 'single'),
    makeQuestion('d1m1', 'D1', 'multiple'),
    makeQuestion('d1m2', 'D1', 'multiple'),
    makeQuestion('d2s1', 'D2', 'single'),
    makeQuestion('d2s2', 'D2', 'single'),
    makeQuestion('d2m1', 'D2', 'multiple'),
    makeQuestion('d2m2', 'D2', 'multiple')
  ]
}

describe('generateExam', () => {
  it('满足知识域与题型约束且无重复', () => {
    const result = generateExam({ seed: 's1', blueprint, questions: pool() })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.questions).toHaveLength(4)
    expect(result.questions.filter((q) => q.type === 'single')).toHaveLength(2)
    expect(result.questions.filter((q) => q.type === 'multiple')).toHaveLength(2)
    expect(result.questions.filter((q) => q.domainId === 'D1')).toHaveLength(2)
    expect(result.questions.filter((q) => q.domainId === 'D2')).toHaveLength(2)
    expect(new Set(result.questions.map((q) => q.id)).size).toBe(4)
  })

  it('同一种子结果可复现', () => {
    const a = generateExam({ seed: 'same', blueprint, questions: pool() })
    const b = generateExam({ seed: 'same', blueprint, questions: pool() })
    expect(a.ok && b.ok && a.questionOrder.join(',') === b.questionOrder.join(',')).toBe(true)
  })

  it('草稿题目不进入正式组卷', () => {
    const questions = pool().map((q) =>
      q.id === 'd1s1' ? { ...q, status: 'draft' as const } : q
    )
    const result = generateExam({ seed: 's2', blueprint, questions })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.questions.some((q) => q.id === 'd1s1')).toBe(false)
  })

  it('题目不足时返回具体缺口', () => {
    const questions = pool().filter((q) => q.domainId === 'D1')
    const result = generateExam({ seed: 's3', blueprint, questions })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.join(' ')).toContain('D2')
  })
})
