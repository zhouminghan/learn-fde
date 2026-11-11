import { loadPublishedQuestions } from '../src/content'

const questions = loadPublishedQuestions()

function normalize(text: string) {
  return text.replace(/[\s\p{P}]/gu, '').toLowerCase()
}

function tokens(text: string) {
  return new Set(
    text
      .replace(/[A-Za-z0-9]+/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1)
  )
}

function jaccard(a: Set<string>, b: Set<string>) {
  let intersection = 0
  for (const token of a) if (b.has(token)) intersection += 1
  const union = new Set([...a, ...b]).size
  return union > 0 ? intersection / union : 0
}

const exact = new Map<string, string>()
const exactPairs: Array<[string, string]> = []
const nearPairs: Array<[string, string, number]> = []

for (let i = 0; i < questions.length; i += 1) {
  const q = questions[i]
  const key = normalize(q.stem)
  if (exact.has(key)) exactPairs.push([exact.get(key)!, q.id])
  else exact.set(key, q.id)

  for (let j = i + 1; j < questions.length; j += 1) {
    const score = jaccard(tokens(q.stem), tokens(questions[j].stem))
    if (score >= 0.85) nearPairs.push([q.id, questions[j].id, Number(score.toFixed(2))])
  }
}

if (exactPairs.length > 0) {
  console.error('发现完全重复题干：')
  for (const [a, b] of exactPairs) console.error(`  ${a} <-> ${b}`)
}

if (nearPairs.length > 0) {
  console.log('发现高度相似题干（请人工复核）：')
  for (const [a, b, score] of nearPairs) console.log(`  ${a} <-> ${b}（相似度 ${score}）`)
}

console.log(`已检查 ${questions.length} 道已发布题目；完全重复 ${exactPairs.length} 对，高度相似 ${nearPairs.length} 对。`)
process.exit(exactPairs.length > 0 ? 1 : 0)
