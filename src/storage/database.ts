import Dexie, { type Table } from 'dexie'
import type {
  AppSettings,
  Bookmark,
  CourseProgress,
  ExamAttempt,
  PracticeAttempt,
  UserNote,
  WrongQuestionRecord
} from '@/types'

export const DB_NAME = 'learn-fde'
export const DB_VERSION = 1

export class LearnFDEDatabase extends Dexie {
  courseProgress!: Table<CourseProgress, string>
  practiceAttempts!: Table<PracticeAttempt, string>
  examAttempts!: Table<ExamAttempt, string>
  wrongQuestions!: Table<WrongQuestionRecord, string>
  bookmarks!: Table<Bookmark, string>
  userNotes!: Table<UserNote, string>
  appSettings!: Table<AppSettings, string>

  constructor() {
    super(DB_NAME)
    this.version(DB_VERSION).stores({
      courseProgress: 'lessonId',
      practiceAttempts: 'id, startedAt',
      examAttempts: 'id, status, startedAt, submittedAt',
      wrongQuestions: 'questionId, lastWrongAt',
      bookmarks: 'id, kind, targetId',
      userNotes: 'id, lessonId',
      appSettings: 'key'
    })
  }
}

let instance: LearnFDEDatabase | null = null

export function getDatabase(): LearnFDEDatabase {
  if (!instance) instance = new LearnFDEDatabase()
  return instance
}

export async function isStorageAvailable(): Promise<boolean> {
  try {
    const db = getDatabase()
    await db.open()
    return true
  } catch {
    return false
  }
}
