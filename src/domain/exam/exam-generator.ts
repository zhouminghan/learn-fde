import type { ExamBlueprint, Question, QuestionType } from '@/types'

export interface GenerateExamInput {
  seed: string
  blueprint: ExamBlueprint
  questions: Question[]
  recentQuestionIds?: string[]
}

export type GenerateExamResult =
  | { ok: true; questions: Question[]; questionOrder: string[]; seed: string }
  | { ok: false; errors: string[] }

function mulberry32(seedValue: number) {
  let a = seedValue >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashSeed(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function shuffled<T>(items: T[], rng: () => number): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function poolOf(
  questions: Question[],
  domainId: string,
  type: QuestionType
): Question[] {
  return questions.filter(
    (q) => q.domainId === domainId && q.type === type && q.status === 'published'
  )
}

function selectFor(
  pool: Question[],
  count: number,
  rng: () => number,
  recentIds: Set<string>
): { selected: Question[]; missing: number } {
  const fresh = pool.filter((q) => !recentIds.has(q.id))
  const freshSelection = shuffled(fresh, rng).slice(0, count)
  let remaining = count - freshSelection.length
  const selected = [...freshSelection]
  if (remaining > 0) {
    const used = new Set(selected.map((q) => q.id))
    const rest = shuffled(
      pool.filter((q) => !used.has(q.id)),
      rng
    ).slice(0, remaining)
    selected.push(...rest)
    remaining = count - selected.length
  }
  return { selected, missing: Math.max(0, remaining) }
}

/**
 * 按蓝图逐知识域抽题，严格满足题量、题型与知识域目标数。
 * 禁止重复题目；题目不足时返回具体缺口而不是静默拼题。
 */
export function generateExam(input: GenerateExamInput): GenerateExamResult {
  const { blueprint, questions, recentQuestionIds } = input
  const recentIds = new Set(recentQuestionIds ?? [])
  const rng = mulberry32(hashSeed(input.seed))
  const selected: Question[] = []
  const errors: string[] = []
  const picked = new Set<string>()

  for (const target of blueprint.domainTargets) {
    for (const [type, count] of [
      ['single', target.singleCount],
      ['multiple', target.multipleCount]
    ] as const) {
      const pool = poolOf(questions, target.domainId, type).filter(
        (q) => !picked.has(q.id)
      )
      const result = selectFor(pool, count, rng, recentIds)
      for (const q of result.selected) {
        if (!picked.has(q.id)) {
          picked.add(q.id)
          selected.push(q)
        }
      }
      if (result.missing > 0) {
        errors.push(
          `知识域 ${target.domainId} 缺少 ${result.missing} 道已发布的${type === 'single' ? '单选' : '多选'}题`
        )
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  const ordered = shuffled(selected, rng)
  return {
    ok: true,
    questions: ordered,
    questionOrder: ordered.map((q) => q.id),
    seed: input.seed
  }
}
