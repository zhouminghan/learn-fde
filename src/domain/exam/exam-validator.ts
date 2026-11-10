import type { ExamBlueprint, Question } from '@/types'

export function validateQuestion(question: Question): string[] {
  const errors: string[] = []

  if (!question.id) errors.push('题目缺少 id')
  if (!question.domainId) errors.push(`${question.id}: 缺少 domainId`)
  if (!question.stem || !question.stem.trim()) errors.push(`${question.id}: 缺少题干`)
  if (!Array.isArray(question.options) || question.options.length < 2)
    errors.push(`${question.id}: 选项至少需要 2 个`)

  const optionIds = new Set((question.options ?? []).map((o) => o.id))
  if (optionIds.size !== (question.options ?? []).length)
    errors.push(`${question.id}: 选项 id 存在重复`)

  const answerIds = question.answerIds ?? []
  if (question.type === 'single' && answerIds.length !== 1)
    errors.push(`${question.id}: 单选题必须且只能有 1 个正确答案`)
  if (question.type === 'multiple' && answerIds.length < 2)
    errors.push(`${question.id}: 多选题至少需要 2 个正确答案`)

  for (const id of answerIds) {
    if (!optionIds.has(id)) errors.push(`${question.id}: 答案 ${id} 不在选项中`)
  }

  if (!question.explanation || !question.explanation.trim())
    errors.push(`${question.id}: 缺少解析`)
  if (!Array.isArray(question.sourceUrls) || question.sourceUrls.length === 0)
    errors.push(`${question.id}: 缺少来源说明`)
  if (!question.lessonIds || question.lessonIds.length === 0)
    errors.push(`${question.id}: 至少需要关联一个章节`)
  if (!question.createdAt || !question.updatedAt)
    errors.push(`${question.id}: 缺少创建或更新时间`)

  return errors
}

export function validateBlueprint(blueprint: ExamBlueprint): string[] {
  const errors: string[] = []
  const targetTotal = blueprint.domainTargets.reduce(
    (sum, d) => sum + d.questionCount,
    0
  )
  const singleTotal = blueprint.domainTargets.reduce(
    (sum, d) => sum + d.singleCount,
    0
  )
  const multipleTotal = blueprint.domainTargets.reduce(
    (sum, d) => sum + d.multipleCount,
    0
  )
  const weightTotal = blueprint.domainTargets.reduce(
    (sum, d) => sum + d.weightPercent,
    0
  )

  if (targetTotal !== blueprint.totalQuestions)
    errors.push(`知识域题目数合计 ${targetTotal} 不等于 totalQuestions ${blueprint.totalQuestions}`)
  if (singleTotal !== blueprint.questionTypeTargets.single)
    errors.push(`单选合计 ${singleTotal} 不等于题型目标 ${blueprint.questionTypeTargets.single}`)
  if (multipleTotal !== blueprint.questionTypeTargets.multiple)
    errors.push(`多选合计 ${multipleTotal} 不等于题型目标 ${blueprint.questionTypeTargets.multiple}`)
  if (Math.abs(weightTotal - 100) > 0.001)
    errors.push(`知识域权重合计 ${weightTotal} 不等于 100`)
  if (blueprint.passScore <= 0 || blueprint.passScore > blueprint.totalScore)
    errors.push('合格分数不在有效范围内')
  if (blueprint.durationSeconds <= 0) errors.push('考试时长必须大于 0')

  for (const target of blueprint.domainTargets) {
    if (target.singleCount + target.multipleCount !== target.questionCount)
      errors.push(`知识域 ${target.domainId} 单选/多选数量之和与目标题数不符`)
  }

  return errors
}

export function validateQuestionBank(questions: Question[]): string[] {
  const errors: string[] = []
  const seen = new Set<string>()
  for (const q of questions) {
    if (seen.has(q.id)) errors.push(`题目 id 重复: ${q.id}`)
    seen.add(q.id)
    errors.push(...validateQuestion(q))
  }
  return errors
}
