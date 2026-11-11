<template>
  <div class="records">
    <header class="page-head">
      <h1>学习记录</h1>
      <p>课程进度、练习与考试记录、错题与收藏，以及本地数据备份。</p>
    </header>

    <section class="block">
      <h2>课程进度</h2>
      <div class="overview">
        <div class="meter"><span :style="{ width: coursePercent + '%' }"></span></div>
        <span class="overview__text">{{ coursePercent }}%</span>
      </div>
      <div class="lesson-progress">
        <div v-for="l in lessons" :key="l.id" class="lesson-row">
          <span class="lesson-row__id">{{ l.id }}</span>
          <span class="lesson-row__title">{{ l.title }}</span>
          <span class="badge" :class="statusOf(l.id)">{{ statusLabel(l.id) }}</span>
        </div>
      </div>
    </section>

    <section class="block">
      <h2>练习与考试</h2>
      <div class="stat-grid">
        <div class="stat"><span class="stat__value">{{ practiceTotal }}</span><span class="stat__label">累计作答题次</span></div>
        <div class="stat"><span class="stat__value">{{ practiceAccuracy }}%</span><span class="stat__label">练习正确率</span></div>
        <div class="stat"><span class="stat__value">{{ examCount }}</span><span class="stat__label">考试次数</span></div>
      </div>
      <h3 v-if="examRows.length">考试记录</h3>
      <div v-for="e in examRows" :key="e.id" class="exam-row">
        <span>{{ formatDate(e.submittedAt ?? '') }}</span>
        <span class="exam-row__score">{{ Math.round(e.score ?? 0) }} / {{ e.maxScore }}</span>
        <span>{{ e.status === 'timeout' ? '超时交卷' : '已交卷' }}</span>
      </div>
    </section>

    <section class="block">
      <h2>错题本（{{ wrongRows.length }}）</h2>
      <div v-for="w in wrongRows" :key="w.question.id" class="wrong-row">
        <div>
          <p class="wrong-row__stem">{{ w.question.stem }}</p>
          <p class="wrong-row__meta">累计错误 {{ w.count }} 次 · {{ domainTitle(w.question.domainId) }}</p>
        </div>
        <button class="icon-btn" title="移除错题" @click="removeWrong(w.question.id)">×</button>
      </div>
      <p v-if="wrongRows.length === 0" class="empty">暂无错题。</p>
    </section>

    <section class="block">
      <h2>收藏</h2>
      <h3>题目</h3>
      <div v-for="q in bookmarkedQuestions" :key="q.id" class="bookmark-row">
        <span>{{ q.stem }}</span>
      </div>
      <p v-if="bookmarkedQuestions.length === 0" class="empty">暂无收藏题目。</p>
      <h3>章节</h3>
      <div v-for="l in bookmarkedLessons" :key="l.id" class="bookmark-row">
        <a :href="withBase(l.path)">{{ l.id }} · {{ l.title }}</a>
      </div>
      <p v-if="bookmarkedLessons.length === 0" class="empty">暂无收藏章节。</p>
    </section>

    <section class="block">
      <h2>数据管理</h2>
      <p class="block__desc">学习数据仅保存在当前浏览器。可导出为 JSON 备份，或从兼容版本导入。</p>
      <div class="data-actions">
        <button class="btn btn--primary" @click="exportData">导出 JSON</button>
        <label class="btn btn--ghost">
          导入 JSON
          <input type="file" accept="application/json" class="hidden-input" @change="importData" />
        </label>
        <button class="btn btn--danger" @click="clearData">清空数据</button>
      </div>
      <p v-if="notice" class="notice">{{ notice }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { curriculum, loadPublishedQuestions } from '@/content'
import type { CourseProgress, ExamAttempt, PracticeAttempt, Question, WrongQuestionRecord } from '@/types'

const progress = ref<CourseProgress[]>([])
const practice = ref<PracticeAttempt[]>([])
const exams = ref<ExamAttempt[]>([])
const wrong = ref<WrongQuestionRecord[]>([])
const bookmarkedQuestionIds = ref<string[]>([])
const bookmarkedLessonIds = ref<string[]>([])
const notice = ref('')

const lessons = curriculum.lessons
const allQuestions = loadPublishedQuestions()

const coursePercent = computed(() => {
  const done = progress.value.filter((p) => p.status === 'completed').length
  return Math.round((done / lessons.length) * 100)
})

const practiceTotal = computed(() => practice.value.reduce((s, a) => s + a.total, 0))
const practiceAccuracy = computed(() => {
  const total = practice.value.reduce((s, a) => s + a.total, 0)
  const correct = practice.value.reduce((s, a) => s + a.correctCount, 0)
  return total > 0 ? Math.round((correct / total) * 100) : 0
})

const examCount = computed(() => exams.value.filter((a) => a.status !== 'in_progress').length)
const examRows = computed(() =>
  exams.value
    .filter((a) => a.status !== 'in_progress')
    .sort((a, b) => (b.submittedAt ?? b.startedAt).localeCompare(a.submittedAt ?? a.startedAt))
)

const wrongRows = computed(() =>
  wrong.value
    .map((w) => ({ count: w.wrongCount, question: allQuestions.find((q) => q.id === w.questionId) }))
    .filter((w): w is { question: Question; count: number } => Boolean(w.question))
)

const bookmarkedQuestions = computed(() =>
  bookmarkedQuestionIds.value
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter(Boolean) as Question[]
)

const bookmarkedLessons = computed(() =>
  bookmarkedLessonIds.value
    .map((id) => lessons.find((l) => l.id === id))
    .filter(Boolean) as typeof lessons
)

function statusOf(id: string) {
  return progress.value.find((p) => p.lessonId === id)?.status ?? 'not_started'
}

function statusLabel(id: string) {
  const s = statusOf(id)
  return s === 'completed' ? '已完成' : s === 'in_progress' ? '学习中' : '未开始'
}

function domainTitle(id: string) {
  return curriculum.domains.find((d) => d.id === id)?.shortTitle ?? id
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('zh-CN', { hour12: false })
}

async function loadAll() {
  try {
    const { courseProgressRepo, practiceRepo, examRepo, wrongQuestionsRepo, bookmarksRepo } =
      await import('@/storage')
    const [p, pr, ex, w, qIds, lIds] = await Promise.all([
      courseProgressRepo.getAllCourseProgress(),
      practiceRepo.listPracticeAttempts(),
      examRepo.listExamAttempts(),
      wrongQuestionsRepo.listWrongQuestions(),
      bookmarksRepo.bookmarkTargetIds('question'),
      bookmarksRepo.bookmarkTargetIds('lesson')
    ])
    progress.value = p
    practice.value = pr
    exams.value = ex
    wrong.value = w
    bookmarkedQuestionIds.value = qIds
    bookmarkedLessonIds.value = lIds
  } catch {
    notice.value = '当前浏览器无法使用本地存储。'
  }
}

async function removeWrong(questionId: string) {
  try {
    const { wrongQuestionsRepo } = await import('@/storage')
    await wrongQuestionsRepo.removeWrongQuestion(questionId)
    wrong.value = wrong.value.filter((w) => w.questionId !== questionId)
  } catch {
    // 忽略。
  }
}

async function exportData() {
  try {
    const { createExportBundle, exportToJson } = await import('@/storage')
    const bundle = await createExportBundle()
    const blob = new Blob([exportToJson(bundle)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `learn-fde-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    notice.value = '已导出学习数据。'
  } catch {
    notice.value = '导出失败。'
  }
}

async function importData(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const text = await file.text()
  const { parseBackup, importBundle } = await import('@/storage')
  const result = parseBackup(text)
  if (!result.ok) {
    notice.value = `导入失败：${result.error}`
    input.value = ''
    return
  }
  await importBundle(result.bundle)
  notice.value = '已导入学习数据。'
  input.value = ''
  await loadAll()
}

async function clearData() {
  if (!window.confirm('确定要清空所有本地学习数据吗？此操作不可撤销。')) return
  if (!window.confirm('再次确认：清空后无法恢复，建议先导出备份。')) return
  try {
    const { clearAllData } = await import('@/storage')
    await clearAllData()
    await loadAll()
    notice.value = '已清空本地数据。'
  } catch {
    notice.value = '清空失败。'
  }
}

onMounted(loadAll)
</script>

<style scoped>
.records {
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

.block {
  margin-top: 28px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.block h2 {
  margin: 0 0 14px;
  font-size: 18px;
}

.block h3 {
  margin: 18px 0 8px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.block__desc {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.overview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
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

.overview__text {
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.lesson-progress {
  display: grid;
  gap: 6px;
}

.lesson-row {
  display: grid;
  grid-template-columns: 48px 1fr 72px;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.lesson-row__id {
  color: var(--vp-c-text-3);
  font-weight: 600;
}

.lesson-row__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  justify-self: end;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge.not_started {
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
}

.badge.in_progress {
  color: var(--lf-blue);
  background: var(--lf-blue-soft);
}

.badge.completed {
  color: var(--lf-green);
  background: var(--lf-green-soft);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat {
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.stat__value {
  display: block;
  font-size: 22px;
  font-weight: 750;
}

.stat__label {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.exam-row {
  display: grid;
  grid-template-columns: 1fr 90px 90px;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.exam-row__score {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.wrong-row,
.bookmark-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.wrong-row__stem {
  margin: 0 0 4px;
  font-weight: 600;
}

.wrong-row__meta {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.bookmark-row a {
  color: var(--vp-c-text-1);
}

.bookmark-row a:hover {
  color: var(--vp-c-brand-1);
}

.icon-btn {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-2);
  cursor: pointer;
  width: 28px;
  height: 28px;
  font-size: 16px;
}

.empty {
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.data-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.hidden-input {
  display: none;
}

.notice {
  margin-top: 12px;
  color: var(--vp-c-brand-1);
  font-size: 13px;
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

.btn--ghost {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
  border-color: var(--vp-c-divider);
}

.btn--danger {
  color: #fff;
  background: var(--lf-red);
}

@media (max-width: 640px) {
  .records {
    padding: 28px 16px 64px;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
