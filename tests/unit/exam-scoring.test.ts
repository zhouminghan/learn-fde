import { describe, expect, it } from 'vitest'
import type { ExamAttempt, ExamBlueprint, Question } from '@/types'
import { isAnswerCorrect, scoreExam, scoreQuestion } from '@/domain/exam/exam-scoring'

const blueprint: ExamBlueprint = {
  id: 'test',
  version: '1',
  title: '测试',
  durationSeconds: 5400,
  totalQuestions: 2,
  totalScore: 3.5,
  passScore: 2,
  questionTypeTargets: { single: 1, multiple: 1 },
  questionScores: { single: 1.5, multiple: 2 },
  domainTargets: [{ domainId: 'D1', weightPercent: 100, questionCount: 2, singleCount: 1, multipleCount: 1 }],
  multipleScoring: 'exact_match',
  difficultyTargets: { easy: 0.3, medium: 0.5, hard: 0.2 }
}

function singleQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q-single',
    domainId: 'D1',
    lessonIds: ['1.1'],
    type: 'single',
    difficulty: 'easy',
    stem: '单选',
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
    updatedAt: '2026-11-10',
    ...overrides
  }
}

function multipleQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q-multiple',
    domainId: 'D1',
    lessonIds: ['1.1'],
    type: 'multiple',
    difficulty: 'medium',
    stem: '多选',
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' }
    ],
    answerIds: ['A', 'B'],
    explanation: '解析',
    tags: [],
    sourceType: 'original',
    sourceUrls: ['https://example.com'],
    status: 'published',
    createdAt: '2026-11-10',
    updatedAt: '2026-11-10',
    ...overrides
  }
}

describe('scoreQuestion', () => {
  it('单选正确得 1.5 分', () => {
    expect(scoreQuestion(singleQuestion(), ['A'], blueprint)).toBe(1.5)
  })

  it('单选错误得 0 分', () => {
    expect(scoreQuestion(singleQuestion(), ['B'], blueprint)).toBe(0)
  })

  it('多选完全匹配得 2 分', () => {
    expect(scoreQuestion(multipleQuestion(), ['A', 'B'], blueprint)).toBe(2)
  })

  it('多选漏选得 0 分（完全匹配口径）', () => {
    expect(scoreQuestion(multipleQuestion(), ['A'], blueprint)).toBe(0)
  })

  it('多选多选或错选得 0 分', () => {
    expect(scoreQuestion(multipleQuestion(), ['A', 'C'], blueprint)).toBe(0)
  })

  it('重复选项去重后仍正确', () => {
    expect(isAnswerCorrect(singleQuestion(), ['A', 'A'])).toBe(true)
  })
})

describe('scoreExam', () => {
  it('统计总分、正确数与知识域得分', () => {
    const attempt: ExamAttempt = {
      id: 'a1',
      blueprintId: 'test',
      blueprintVersion: '1',
      randomSeed: 's',
      startedAt: '2026-11-10T00:00:00Z',
      durationSeconds: 0,
      questionSnapshots: [singleQuestion(), multipleQuestion()],
      questionOrder: ['q-single', 'q-multiple'],
      answers: { 'q-single': ['A'], 'q-multiple': ['B'] },
      markedQuestionIds: [],
      maxScore: 3.5,
      status: 'submitted'
    }
    const result = scoreExam(attempt, blueprint)
    expect(result.score).toBe(1.5)
    expect(result.correctCount).toBe(1)
    expect(result.domainStats[0]).toMatchObject({ total: 2, correct: 1 })
  })
})
