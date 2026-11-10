import type { WrongQuestionRecord } from '@/types'
import { getDatabase } from '../database'

export async function recordWrongAnswer(
  questionId: string,
  selectedIds: string[]
): Promise<void> {
  const db = getDatabase()
  const existing = await db.wrongQuestions.get(questionId)
  const now = new Date().toISOString()
  await db.wrongQuestions.put({
    questionId,
    wrongCount: (existing?.wrongCount ?? 0) + 1,
    lastWrongAt: now,
    lastSelectedIds: selectedIds
  })
}

export async function removeWrongQuestion(questionId: string): Promise<void> {
  await getDatabase().wrongQuestions.delete(questionId)
}

export async function listWrongQuestions(): Promise<WrongQuestionRecord[]> {
  return getDatabase().wrongQuestions.orderBy('lastWrongAt').reverse().toArray()
}
