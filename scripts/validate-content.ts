import { loadAllQuestions } from '../src/content'
import {
  validateBlueprint,
  validateQuestionBank
} from '../src/domain/exam/exam-validator'
import { examBlueprint } from '../src/content'

const questions = loadAllQuestions()
const errors = validateQuestionBank(questions)
const blueprintErrors = validateBlueprint(examBlueprint)

const published = questions.filter((q) => q.status === 'published')
const domainCounts = new Map<string, number>()
const typeCounts = { single: 0, multiple: 0 }
for (const q of published) {
  domainCounts.set(q.domainId, (domainCounts.get(q.domainId) ?? 0) + 1)
  typeCounts[q.type] += 1
}

let failed = false

if (errors.length > 0) {
  failed = true
  console.error('题目校验失败：')
  for (const error of errors.slice(0, 100)) console.error(`  - ${error}`)
}

if (blueprintErrors.length > 0) {
  failed = true
  console.error('考试蓝图校验失败：')
  for (const error of blueprintErrors) console.error(`  - ${error}`)
}

console.log(`已发布题目：${published.length} 道（单选 ${typeCounts.single}，多选 ${typeCounts.multiple}）`)
for (const target of examBlueprint.domainTargets) {
  const available = published.filter(
    (q) => q.domainId === target.domainId && q.type === 'single'
  ).length
  const multipleAvailable = published.filter(
    (q) => q.domainId === target.domainId && q.type === 'multiple'
  ).length
  const ok = available >= target.singleCount && multipleAvailable >= target.multipleCount
  if (!ok) failed = true
  console.log(
    `  ${target.domainId}: 需单选 ${target.singleCount}/多选 ${target.multipleCount}，现有 ${available}/${multipleAvailable} ${ok ? 'OK' : '不足'}`
  )
}

if (failed) {
  console.error('内容校验未通过')
  process.exit(1)
}

console.log('内容校验通过')
