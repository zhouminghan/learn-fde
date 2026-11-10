<template>
  <div class="practice">
    <header class="page-head">
      <h1>专项练习</h1>
      <p>按知识域、章节、题型与难度筛选题目，答题后立即查看解析。</p>
    </header>

    <div v-if="!session" class="setup">
      <div class="filters">
        <label class="field">
          <span>知识域</span>
          <select v-model="filters.domainId">
            <option value="">全部知识域</option>
            <option v-for="d in domains" :key="d.id" :value="d.id">{{ d.title }}</option>
          </select>
        </label>
        <label class="field">
          <span>章节</span>
          <select v-model="filters.lessonId">
            <option value="">全部章节</option>
            <option v-for="l in lessons" :key="l.id" :value="l.id">{{ l.id }} · {{ l.title }}</option>
          </select>
        </label>
        <label class="field">
          <span>题型</span>
          <select v-model="filters.type">
            <option value="">全部题型</option>
            <option value="single">单选题</option>
            <option value="multiple">多选题</option>
          </select>
        </label>
        <label class="field">
          <span>难度</span>
          <select v-model="filters.difficulty">
            <option value="">全部难度</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </label>
        <label class="field">
          <span>顺序</span>
          <select v-model="mode">
            <option value="sequential">顺序练习</option>
            <option value="random">随机练习</option>
          </select>
        </label>
      </div>
      <div class="setup__foot">
        <p class="setup__count">匹配 {{ matchedCount }} 道已发布题目</p>
        <button class="btn btn--primary" :disabled="matchedCount === 0" @click="start">
          开始练习
        </button>
      </div>
    </div>

    <div v-else-if="!finished" class="session">
      <div class="session__top">
        <div class="session__progress">
          <span>{{ currentIndex + 1 }} / {{ session.length }}</span>
          <div class="meter"><span :style="{ width: ((currentIndex + 1) / session.length) * 100 + '%' }"></span></div>
        </div>
        <button class="btn btn--ghost" @click="finish">结束练习</button>
      </div>

      <QuestionView
        :question="currentQuestion"
        v-model:selected="answers[currentQuestion.id]"
        :show-result="revealed.has(currentQuestion.id)"
        :locked="revealed.has(currentQuestion.id)"
        :bookmarked="bookmarks.includes(currentQuestion.id)"
        @bookmark="toggleBookmark"
      />

      <div class="session__nav">
        <button class="btn btn--ghost" :disabled="currentIndex === 0" @click="currentIndex -= 1">上一题</button>
        <button
          v-if="!revealed.has(currentQuestion.id)"
          class="btn btn--primary"
          :disabled="(answers[currentQuestion.id]?.length ?? 0) === 0"
          @click="submitCurrent"
        >
          提交
        </button>
        <button v-else class="btn btn--primary" @click="next">下一题</button>
      </div>
    </div>

    <div v-else class="result">
      <header class="page-head">
        <h1>练习结果</h1>
      </header>
      <div class="result__stats">
        <div class="stat"><span class="stat__value">{{ correctCount }}</span><span class="stat__label">答对</span></div>
        <div class="stat"><span class="stat__value">{{ session.length - correctCount }}</span><span class="stat__label">答错</span></div>
        <div class="stat"><span class="stat__value">{{ Math.round((correctCount / session.length) * 100) }}%</span><span class="stat__label">正确率</span></div>
      </div>
      <div class="result__domains">
        <div v-for="d in domainResults" :key="d.domainId" class="domain-row">
          <span class="domain-row__name">{{ d.title }}</span>
          <div class="meter"><span :style="{ width: Math.round(d.accuracy * 100) + '%' }"></span></div>
          <span class="domain-row__acc">{{ Math.round(d.accuracy * 100) }}%</span>
        </div>
      </div>
      <button class="btn btn--ghost" @click="reset">再练一组</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { curriculum, loadPublishedQuestions } from '@/content'
import type { Question, QuestionType, Difficulty } from '@/types'
import QuestionView from './QuestionView.vue'
import { newId, nowIso } from '@/utils/id'

const allQuestions = loadPublishedQuestions()
const domains = curriculum.domains
const lessons = curriculum.lessons

const filters = ref<{
  domainId: string
  lessonId: string
  type: '' | QuestionType
  difficulty: '' | Difficulty
}>({ domainId: '', lessonId: '', type: '', difficulty: '' })
const mode = ref<'sequential' | 'random'>('sequential')

const session = ref<Question[] | null>(null)
const answers = ref<Record<string, string[]>>({})
const revealed = ref<Set<string>>(new Set())
const bookmarks = ref<string[]>([])
const currentIndex = ref(0)
const finished = ref(false)
const correctCount = ref(0)

const matched = computed(() => {
  return allQuestions.filter((q) => {
    if (filters.value.domainId && q.domainId !== filters.value.domainId) return false
    if (filters.value.lessonId && !q.lessonIds.includes(filters.value.lessonId)) return false
    if (filters.value.type && q.type !== filters.value.type) return false
    if (filters.value.difficulty && q.difficulty !== filters.value.difficulty) return false
    return true
  })
})

const matchedCount = computed(() => matched.value.length)
const currentQuestion = computed(() => session.value![currentIndex.value])

const domainResults = computed(() => {
  const acc = new Map<string, { total: number; correct: number }>()
  for (const q of session.value ?? []) {
    const e = acc.get(q.domainId) ?? { total: 0, correct: 0 }
    e.total += 1
    if (isCorrect(q, answers.value[q.id] ?? [])) e.correct += 1
    acc.set(q.domainId, e)
  }
  return [...acc.entries()].map(([domainId, v]) => ({
    domainId,
    title: domains.find((d) => d.id === domainId)?.shortTitle ?? domainId,
    accuracy: v.total > 0 ? v.correct / v.total : 0
  }))
})

function isCorrect(q: Question, selected: string[]) {
  const expected = [...q.answerIds].sort()
  const actual = [...new Set(selected)].sort()
  return (
    expected.length === actual.length &&
    expected.every((id, i) => id === actual[i])
  )
}

function start() {
  let questions = [...matched.value]
  if (mode.value === 'random') questions = shuffle(questions)
  if (questions.length === 0) return
  session.value = questions
  answers.value = {}
  revealed.value = new Set()
  currentIndex.value = 0
  finished.value = false
  correctCount.value = 0
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function submitCurrent() {
  const q = currentQuestion.value
  const selected = answers.value[q.id] ?? []
  revealed.value = new Set([...revealed.value, q.id])
  if (isCorrect(q, selected)) correctCount.value += 1
  else {
    try {
      const { wrongQuestionsRepo } = await import('@/storage')
      await wrongQuestionsRepo.recordWrongAnswer(q.id, selected)
    } catch {
      // 忽略存储失败。
    }
  }
}

function next() {
  if (currentIndex.value < session.value!.length - 1) currentIndex.value += 1
  else finish()
}

async function finish() {
  finished.value = true
  try {
    const { practiceRepo } = await import('@/storage')
    await practiceRepo.createPracticeAttempt({
      id: newId('practice'),
      startedAt: nowIso(),
      finishedAt: nowIso(),
      mode: mode.value,
      filters: {
        domainIds: filters.value.domainId ? [filters.value.domainId] : [],
        lessonIds: filters.value.lessonId ? [filters.value.lessonId] : [],
        types: filters.value.type ? [filters.value.type] : [],
        difficulties: filters.value.difficulty ? [filters.value.difficulty] : []
      },
      questionIds: session.value!.map((q) => q.id),
      answers: answers.value,
      correctCount: correctCount.value,
      total: session.value!.length
    })
  } catch {
    // 忽略存储失败。
  }
}

async function toggleBookmark(id: string) {
  try {
    const { bookmarksRepo } = await import('@/storage')
    if (bookmarks.value.includes(id)) {
      await bookmarksRepo.removeBookmark('question', id)
      bookmarks.value = bookmarks.value.filter((b) => b !== id)
    } else {
      await bookmarksRepo.addBookmark('question', id)
      bookmarks.value = [...bookmarks.value, id]
    }
  } catch {
    // 忽略存储失败。
  }
}

function reset() {
  session.value = null
  finished.value = false
}

onMounted(async () => {
  try {
    const { bookmarksRepo } = await import('@/storage')
    bookmarks.value = await bookmarksRepo.bookmarkTargetIds('question')
  } catch {
    // 忽略。
  }
})
</script>

<style scoped>
.practice {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.page-head h1 {
  margin: 0 0 8px;
  font-size: 34px;
  letter-spacing: 0;
}

.page-head p {
  margin: 0;
  color: var(--vp-c-text-2);
}

.setup {
  margin-top: 24px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.filters {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
  min-width: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.field select {
  width: 100%;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.setup__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
}

.setup__count {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.session__top {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.session__progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.meter {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.meter span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
}

.session__nav {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
}

.result__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 20px 0;
}

.stat {
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.stat__value {
  display: block;
  font-size: 26px;
  font-weight: 750;
}

.stat__label {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.result__domains {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.domain-row {
  display: grid;
  grid-template-columns: 120px 1fr 48px;
  align-items: center;
  gap: 12px;
}

.domain-row__name {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.domain-row__acc {
  text-align: right;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn--primary {
  color: #fff;
  background: var(--vp-c-brand-1);
}

.btn--primary:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--ghost {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
  border-color: var(--vp-c-divider);
}

.btn--ghost:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
}

.btn--ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 959px) {
  .filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .practice {
    padding: 28px 16px 64px;
  }

  .filters {
    grid-template-columns: minmax(0, 1fr);
  }

  .result__stats {
    grid-template-columns: 1fr;
  }
}
</style>
