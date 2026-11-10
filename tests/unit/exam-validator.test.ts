import { describe, expect, it } from 'vitest'
import type { ExamBlueprint, Question } from '@/types'
import { validateBlueprint, validateQuestion } from '@/domain/exam/exam-validator'

const base: Question = {
  id: 'q1',
  domainId: 'D1',
  lessonIds: ['1.1'],
  type: 'single',
  difficulty: 'easy',
  stem: '题干',
  options: [
    { id: 'A', text: 'A' },
    { id: 'B', text: 'B' }
  ],
  answerIds: ['A'],
  explanation: '解析',
  tags: [],
  sourceType: 'original',
  sourceUrls: ['https://example.com'],
  status: 'published',
  createdAt: '2026-11-10',
  updatedAt: '2026-11-10'
}

describe('validateQuestion', () => {
  it('合法单选无错误', () => {
    expect(validateQuestion(base)).toEqual([])
  })

  it('单选多个答案报错', () => {
    expect(validateQuestion({ ...base, answerIds: ['A', 'B'] }).join(' ')).toContain('单选题')
  })

  it('多选少于两个答案报错', () => {
    expect(
      validateQuestion({ ...base, type: 'multiple', answerIds: ['A'] }).join(' ')
    ).toContain('多选题')
  })

  it('答案不在选项中报错', () => {
    expect(validateQuestion({ ...base, answerIds: ['X'] }).join(' ')).toContain('不在选项中')
  })
})

describe('validateBlueprint', () => {
  const valid: ExamBlueprint = {
    id: 'b',
    version: '1',
    title: 't',
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

  it('合法蓝图无错误', () => {
    expect(validateBlueprint(valid)).toEqual([])
  })

  it('权重合计不为 100 报错', () => {
    const bad = {
      ...valid,
      domainTargets: valid.domainTargets.map((d) => ({ ...d, weightPercent: 40 }))
    }
    expect(validateBlueprint(bad).join(' ')).toContain('100')
  })
})
