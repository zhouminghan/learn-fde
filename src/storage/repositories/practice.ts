import type { PracticeAttempt } from '@/types'
import { getDatabase } from '../database'

export async function createPracticeAttempt(attempt: PracticeAttempt): Promise<void> {
  await getDatabase().practiceAttempts.put(attempt)
}

export async function listPracticeAttempts(): Promise<PracticeAttempt[]> {
  return getDatabase().practiceAttempts.orderBy('startedAt').reverse().toArray()
}
