import type { ExamAttempt } from '@/types'
import { getDatabase } from '../database'

export async function createExamAttempt(attempt: ExamAttempt): Promise<void> {
  await getDatabase().examAttempts.put(attempt)
}

export async function getExamAttempt(id: string) {
  return getDatabase().examAttempts.get(id)
}

export async function updateExamAttempt(attempt: ExamAttempt): Promise<void> {
  await getDatabase().examAttempts.put(attempt)
}

export async function getInProgressExam(): Promise<ExamAttempt | undefined> {
  return getDatabase().examAttempts
    .where('status')
    .equals('in_progress')
    .reverse()
    .sortBy('startedAt')
    .then((rows) => rows[0])
}

export async function listExamAttempts(): Promise<ExamAttempt[]> {
  return getDatabase().examAttempts
    .orderBy('startedAt')
    .reverse()
    .toArray()
}

export async function listRecentSubmittedAttempts(limit = 2): Promise<ExamAttempt[]> {
  const all = await getDatabase().examAttempts
    .orderBy('startedAt')
    .reverse()
    .toArray()
  return all
    .filter((a) => a.status !== 'in_progress')
    .slice(0, limit)
}
