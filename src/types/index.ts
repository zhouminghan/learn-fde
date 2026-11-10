export type QuestionType = 'single' | 'multiple'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionStatus = 'draft' | 'review' | 'published' | 'retired'
export type SourceType = 'official_knowledge' | 'official_doc' | 'original'

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  domainId: string
  lessonIds: string[]
  type: QuestionType
  difficulty: Difficulty
  stem: string
  options: QuestionOption[]
  answerIds: string[]
  explanation: string
  optionExplanations?: Record<string, string>
  tags: string[]
  sourceType: SourceType
  sourceUrls: string[]
  authorNote?: string
  status: QuestionStatus
  createdAt: string
  updatedAt: string
}

export type LessonSourceType = 'official' | 'supplementary'
export type LessonStatus = 'draft' | 'published'

export interface LessonMeta {
  id: string
  title: string
  moduleId: string
  order: number
  path: string
  domainIds: string[]
  estimatedMinutes: number
  sourceType: LessonSourceType
  sourceUrls: string[]
  lastVerifiedAt: string
  status: LessonStatus
  summary: string
}

export interface ModuleMeta {
  id: string
  title: string
  order: number
  sourceType: LessonSourceType
  description: string
}

export interface DomainInfo {
  id: string
  title: string
  shortTitle: string
  weightPercent: number
  description: string
}

export interface Curriculum {
  version: string
  lastVerifiedAt: string
  modules: ModuleMeta[]
  lessons: LessonMeta[]
  domains: DomainInfo[]
}

export interface DomainTarget {
  domainId: string
  weightPercent: number
  questionCount: number
  singleCount: number
  multipleCount: number
}

export interface QuestionTypeTargets {
  single: number
  multiple: number
}

export interface QuestionScores {
  single: number
  multiple: number
}

export interface ExamBlueprint {
  id: string
  version: string
  title: string
  durationSeconds: number
  totalQuestions: number
  totalScore: number
  passScore: number
  questionTypeTargets: QuestionTypeTargets
  questionScores: QuestionScores
  domainTargets: DomainTarget[]
  multipleScoring: 'exact_match'
  difficultyTargets: Record<Difficulty, number>
}

export interface DomainStat {
  domainId: string
  total: number
  correct: number
  accuracy: number
  score: number
}

export type ExamStatus = 'in_progress' | 'submitted' | 'timeout'

export interface ExamAttempt {
  id: string
  blueprintId: string
  blueprintVersion: string
  randomSeed: string
  startedAt: string
  submittedAt?: string
  durationSeconds: number
  questionSnapshots: Question[]
  questionOrder: string[]
  answers: Record<string, string[]>
  markedQuestionIds: string[]
  score?: number
  maxScore: number
  correctCount?: number
  domainStats?: DomainStat[]
  status: ExamStatus
}

export interface PracticeAttempt {
  id: string
  startedAt: string
  finishedAt: string
  mode: 'sequential' | 'random'
  filters: {
    domainIds: string[]
    lessonIds: string[]
    types: QuestionType[]
    difficulties: Difficulty[]
  }
  questionIds: string[]
  answers: Record<string, string[]>
  correctCount: number
  total: number
}

export type CourseProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface CourseProgress {
  lessonId: string
  status: CourseProgressStatus
  lastVisitedAt: string
  completedAt?: string
  readSeconds: number
}

export interface WrongQuestionRecord {
  questionId: string
  wrongCount: number
  lastWrongAt: string
  lastSelectedIds: string[]
}

export interface Bookmark {
  id: string
  kind: 'question' | 'lesson'
  targetId: string
  createdAt: string
}

export interface UserNote {
  id: string
  lessonId: string
  text: string
  createdAt: string
  updatedAt: string
}

export type ThemePreference = 'light' | 'dark' | 'system'

export interface AppSettings {
  key: string
  value: unknown
}

export interface ExportBundle {
  schema: 'learn-fde-backup'
  version: number
  appVersion: string
  exportedAt: string
  data: {
    courseProgress: CourseProgress[]
    practiceAttempts: PracticeAttempt[]
    examAttempts: ExamAttempt[]
    wrongQuestions: WrongQuestionRecord[]
    bookmarks: Bookmark[]
    userNotes: UserNote[]
    appSettings: AppSettings[]
  }
}
