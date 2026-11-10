<template>
  <div class="exam">
    <div v-if="phase === 'intro'" class="intro">
      <header class="page-head">
        <h1>模拟考试</h1>
        <p>按腾讯云官方公开考试蓝图组卷，用于识别知识薄弱项，不代表官方成绩。</p>
      </header>

      <div class="intro__params">
        <div v-for="p in params" :key="p.label" class="param">
          <span class="param__value">{{ p.value }}</span>
          <span class="param__label">{{ p.label }}</span>
        </div>
      </div>

      <div class="intro__body">
        <h2>考试说明</h2>
        <ul>
          <li>共 60 题：单选 40 题（每题 1.5 分），多选 20 题（每题 2 分），满分 100 分。</li>
          <li>考试时长 90 分钟，70 分为项目设定的合格线。</li>
          <li>多选题按官方指南“错选、漏选不得分”判分：所选答案与标准答案完全一致得 2 分，否则得 0 分。learn-FDE 据此实现为完全匹配计分。</li>
          <li>考试中不显示答案与解析；交卷或倒计时结束后统一计算成绩。</li>
          <li>答题过程中会自动保存草稿，刷新或误关闭后可恢复。</li>
        </ul>
        <p class="intro__disclaimer">
          本模拟考试题目为根据公开知识点设计的原创练习，非腾讯云官方真题；成绩不代表官方认证结果。
        </p>
        <button class="btn btn--primary" @click="startExam">开始考试</button>
      </div>
    </div>

    <div v-else-if="phase === 'confirm'" class="confirm">
      <header class="page-head">
        <h1>发现未完成的考试</h1>
      </header>
      <p class="confirm__text">检测到一场进行中的考试，是否恢复继续作答？</p>
      <div class="confirm__actions">
        <button class="btn btn--primary" @click="resumeExam">恢复考试</button>
        <button class="btn btn--ghost" @click="discardExam">放弃并重新开始</button>
      </div>
    </div>

    <div v-else-if="phase === 'running' && attempt" class="running">
      <div class="running__bar">
        <div class="running__title">FDE 理论模拟考试</div>
        <div class="running__timer" :class="{ urgent: remaining <= 300 }">
          <Clock :size="16" />
          {{ timerLabel }}
        </div>
        <div class="running__progress">{{ answeredCount }} / {{ attempt.questionOrder.length }}</div>
        <button class="btn btn--ghost btn--sheet" @click="sheetOpen = !sheetOpen">答题卡</button>
        <button class="btn btn--danger" @click="confirmSubmit">交卷</button>
      </div>

      <div class="running__layout">
        <div class="running__main">
          <div class="qbar">
            <button class="qbar__mark" :class="{ active: isMarked(current.id) }" @click="toggleMark(current.id)">
              <Flag :size="15" />
              {{ isMarked(current.id) ? '取消标记' : '标记' }}
            </button>
            <span class="qbar__index">第 {{ currentIndex + 1 }} 题</span>
          </div>
          <QuestionView
            :question="current"
            v-model:selected="attempt.answers[current.id]"
            :show-result="false"
            :locked="false"
            :bookmarked="bookmarks.includes(current.id)"
            @bookmark="toggleBookmark"
          />
          <div class="running__nav">
            <button class="btn btn--ghost" :disabled="currentIndex === 0" @click="currentIndex -= 1">上一题</button>
            <button class="btn btn--primary" @click="nextQuestion">
              {{ currentIndex === attempt.questionOrder.length - 1 ? '到最后一题' : '下一题' }}
            </button>
          </div>
        </div>

        <aside class="running__sheet" :class="{ open: sheetOpen }">
          <div class="sheet__head">
            <span>答题卡</span>
            <button class="sheet__close" aria-label="关闭答题卡" @click="sheetOpen = false">×</button>
          </div>
          <div class="sheet__legend">
            <span><i class="dot dot--answered"></i>已答</span>
            <span><i class="dot dot--marked"></i>已标记</span>
            <span><i class="dot dot--current"></i>当前</span>
          </div>
          <div class="sheet__grid">
            <button
              v-for="(qid, i) in attempt.questionOrder"
              :key="qid"
              class="cell"
              :class="cellClass(qid, i)"
              @click="jumpTo(i)"
            >
              {{ i + 1 }}
            </button>
          </div>
        </aside>
      </div>
    </div>

    <div v-else-if="phase === 'report' && attempt" class="report">
      <header class="page-head">
        <h1>考试成绩</h1>
      </header>
      <div class="report__score">
        <div class="score-card" :class="passed ? 'passed' : 'failed'">
          <span class="score-card__value">{{ Math.round(attempt.score ?? 0) }}</span>
          <span class="score-card__max">/ {{ attempt.maxScore }}</span>
          <span class="score-card__state">{{ passed ? '达到合格线' : '未达到合格线' }}</span>
        </div>
        <div class="score-meta">
          <p>正确 {{ attempt.correctCount }} / {{ attempt.questionSnapshots.length }} 题</p>
          <p>用时 {{ usedLabel }}</p>
          <p>状态：{{ attempt.status === 'timeout' ? '超时自动交卷' : '已交卷' }}</p>
        </div>
      </div>

      <div class="report__domains">
        <h2>知识域表现</h2>
        <div v-for="d in attempt.domainStats ?? []" :key="d.domainId" class="domain-row">
          <span class="domain-row__name">{{ domainTitle(d.domainId) }}</span>
          <div class="meter"><span :style="{ width: Math.round(d.accuracy * 100) + '%' }"></span></div>
          <span class="domain-row__acc">{{ d.correct }}/{{ d.total }}</span>
        </div>
      </div>

      <div class="report__wrong">
        <h2>错题回顾</h2>
        <p v-if="wrongList.length === 0" class="report__empty">没有错题，继续保持。</p>
        <div v-for="w in wrongList" :key="w.question.id" class="wrong-card">
          <p class="wrong-card__stem">{{ w.question.stem }}</p>
          <p class="wrong-card__line">你的答案：{{ w.selected.length ? w.selected.join('、') : '未作答' }} · 正确答案：{{ w.question.answerIds.join('、') }}</p>
          <p class="wrong-card__explain">{{ w.question.explanation }}</p>
        </div>
      </div>
      <button class="btn btn--ghost" @click="reset">返回考试说明</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Clock, Flag } from 'lucide-vue-next'
import { curriculum, examBlueprint, loadPublishedQuestions } from '@/content'
import { generateExam } from '@/domain/exam/exam-generator'
import { scoreExam } from '@/domain/exam/exam-scoring'
import type { ExamAttempt } from '@/types'
import QuestionView from './QuestionView.vue'
import { newId, nowIso } from '@/utils/id'

type Phase = 'intro' | 'confirm' | 'running' | 'report'

const phase = ref<Phase>('intro')
const attempt = ref<ExamAttempt | null>(null)
const currentIndex = ref(0)
const remaining = ref(examBlueprint.durationSeconds)
const sheetOpen = ref(false)
const bookmarks = ref<string[]>([])
let pendingAttempt: ExamAttempt | null = null
let timer: ReturnType<typeof setInterval> | null = null
let startedAtMs = 0

const params = computed(() => [
  { label: '题目数量', value: '60 题' },
  { label: '题型', value: '单选 40 / 多选 20' },
  { label: '考试时长', value: '90 分钟' },
  { label: '满分', value: '100 分' },
  { label: '合格线', value: '70 分' }
])

const current = computed(() => {
  const qid = attempt.value?.questionOrder[currentIndex.value]
  return attempt.value?.questionSnapshots.find((q) => q.id === qid)!
})

const answeredCount = computed(
  () =>
    Object.entries(attempt.value?.answers ?? {}).filter(([, v]) => v && v.length > 0).length
)

const timerLabel = computed(() => {
  const h = Math.floor(remaining.value / 3600)
  const m = Math.floor((remaining.value % 3600) / 60)
  const s = remaining.value % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const passed = computed(() => (attempt.value?.score ?? 0) >= examBlueprint.passScore)

const usedLabel = computed(() => {
  const s = attempt.value?.durationSeconds ?? 0
  const m = Math.floor(s / 60)
  return m > 0 ? `${m} 分 ${s % 60} 秒` : `${s} 秒`
})

const wrongList = computed(() => {
  if (!attempt.value) return []
  return attempt.value.questionSnapshots
    .map((q) => {
      const selected = attempt.value!.answers[q.id] ?? []
      const expected = [...q.answerIds].sort()
      const actual = [...new Set(selected)].sort()
      const correct =
        expected.length === actual.length &&
        expected.every((id, i) => id === actual[i])
      return { question: q, selected, correct }
    })
    .filter((w) => !w.correct)
})

function domainTitle(id: string) {
  return curriculum.domains.find((d) => d.id === id)?.title ?? id
}

function isMarked(qid: string) {
  return attempt.value?.markedQuestionIds.includes(qid) ?? false
}

function toggleMark(qid: string) {
  if (!attempt.value) return
  const set = new Set(attempt.value.markedQuestionIds)
  if (set.has(qid)) set.delete(qid)
  else set.add(qid)
  attempt.value.markedQuestionIds = [...set]
  void persist()
}

function cellClass(qid: string, index: number) {
  const classes: string[] = []
  if ((attempt.value?.answers[qid]?.length ?? 0) > 0) classes.push('answered')
  if (attempt.value?.markedQuestionIds.includes(qid)) classes.push('marked')
  if (index === currentIndex.value) classes.push('current')
  return classes
}

function jumpTo(index: number) {
  currentIndex.value = index
  sheetOpen.value = false
}

function nextQuestion() {
  if (currentIndex.value < (attempt.value?.questionOrder.length ?? 0) - 1) currentIndex.value += 1
}

async function startExam() {
  if (pendingAttempt) {
    phase.value = 'confirm'
    return
  }
  await createNewAttempt()
}

async function createNewAttempt() {
  const questions = loadPublishedQuestions()
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const recentIds = await recentQuestionIds()
  const result = generateExam({ seed, blueprint: examBlueprint, questions, recentQuestionIds: recentIds })
  if (!result.ok) {
    window.alert(`题库不足，无法组卷：\n${result.errors.join('\n')}`)
    return
  }
  attempt.value = {
    id: newId('exam'),
    blueprintId: examBlueprint.id,
    blueprintVersion: examBlueprint.version,
    randomSeed: seed,
    startedAt: nowIso(),
    durationSeconds: examBlueprint.durationSeconds,
    questionSnapshots: result.questions,
    questionOrder: result.questionOrder,
    answers: {},
    markedQuestionIds: [],
    maxScore: examBlueprint.totalScore,
    status: 'in_progress'
  }
  currentIndex.value = 0
  remaining.value = examBlueprint.durationSeconds
  startedAtMs = Date.now()
  phase.value = 'running'
  await persist()
  startTimer()
}

async function recentQuestionIds(): Promise<string[]> {
  try {
    const { examRepo } = await import('@/storage')
    const recent = await examRepo.listRecentSubmittedAttempts(2)
    return recent.flatMap((a) => a.questionOrder)
  } catch {
    return []
  }
}

function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startedAtMs) / 1000)
    remaining.value = Math.max(0, examBlueprint.durationSeconds - elapsed)
    if (remaining.value <= 0) {
      void submitExam('timeout')
    }
  }, 1000)
}

function stopTimer() {
  if (timer) clearInterval(timer)
  timer = null
}

async function persist() {
  if (!attempt.value) return
  try {
    const { examRepo } = await import('@/storage')
    await examRepo.updateExamAttempt(JSON.parse(JSON.stringify(attempt.value)))
  } catch {
    // 忽略存储失败。
  }
}

async function resumeExam() {
  if (!pendingAttempt) return
  attempt.value = pendingAttempt
  currentIndex.value = 0
  const elapsed = Math.floor((Date.now() - new Date(pendingAttempt.startedAt).getTime()) / 1000)
  remaining.value = Math.max(0, examBlueprint.durationSeconds - elapsed)
  startedAtMs = Date.now() - Math.min(elapsed, examBlueprint.durationSeconds) * 1000
  phase.value = 'running'
  startTimer()
}

async function discardExam() {
  if (!pendingAttempt) return
  try {
    const { getDatabase } = await import('@/storage')
    await getDatabase().examAttempts.delete(pendingAttempt.id)
    pendingAttempt = null
  } catch {
    // 忽略。
  }
  await createNewAttempt()
}

function confirmSubmit() {
  const unanswered = (attempt.value?.questionOrder.length ?? 0) - answeredCount.value
  const msg = unanswered > 0 ? `还有 ${unanswered} 题未作答，确定交卷吗？` : '确定交卷吗？'
  if (window.confirm(msg)) void submitExam('submitted')
}

async function submitExam(status: 'submitted' | 'timeout') {
  if (!attempt.value || attempt.value.status !== 'in_progress') return
  stopTimer()
  const result = scoreExam(attempt.value, examBlueprint)
  attempt.value.score = result.score
  attempt.value.correctCount = result.correctCount
  attempt.value.domainStats = result.domainStats
  attempt.value.status = status
  attempt.value.submittedAt = nowIso()
  attempt.value.durationSeconds =
    examBlueprint.durationSeconds - Math.max(0, remaining.value)

  try {
    const { examRepo, wrongQuestionsRepo } = await import('@/storage')
    await examRepo.updateExamAttempt(JSON.parse(JSON.stringify(attempt.value)))
    for (const w of wrongList.value) {
      await wrongQuestionsRepo.recordWrongAnswer(w.question.id, [...w.selected])
    }
  } catch {
    // 忽略存储失败。
  }
  phase.value = 'report'
  sheetOpen.value = false
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
    // 忽略。
  }
}

function reset() {
  phase.value = 'intro'
  attempt.value = null
}

onMounted(async () => {
  try {
    const { examRepo, bookmarksRepo } = await import('@/storage')
    const [inProgress, bms] = await Promise.all([
      examRepo.getInProgressExam(),
      bookmarksRepo.bookmarkTargetIds('question')
    ])
    bookmarks.value = bms
    if (inProgress) {
      pendingAttempt = inProgress
      phase.value = 'confirm'
    }
  } catch {
    // 忽略。
  }
})

onBeforeUnmount(() => {
  stopTimer()
  if (attempt.value?.status === 'in_progress') void persist()
})
</script>

<style scoped>
.exam {
  max-width: 1080px;
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

.intro__params {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin: 24px 0;
}

.param {
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.param__value {
  display: block;
  font-size: 22px;
  font-weight: 750;
}

.param__label {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.intro__body {
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.intro__body h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.intro__body ul {
  margin: 0 0 14px;
  padding-left: 20px;
  color: var(--vp-c-text-2);
  line-height: 1.8;
}

.intro__disclaimer {
  margin: 0 0 18px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--lf-yellow-soft);
  color: var(--lf-yellow);
  font-size: 13px;
}

.confirm {
  margin-top: 24px;
}

.confirm__text {
  margin: 16px 0;
  color: var(--vp-c-text-2);
}

.confirm__actions {
  display: flex;
  gap: 10px;
}

.running__bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  margin: -20px -24px 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.running__title {
  font-weight: 700;
  font-size: 15px;
}

.running__timer {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.running__timer.urgent {
  background: var(--lf-red-soft);
  color: var(--lf-red);
}

.running__progress {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.btn--sheet {
  margin-left: auto;
}

.running__layout {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 18px;
  align-items: start;
}

.qbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.qbar__mark {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 13px;
}

.qbar__mark.active {
  color: var(--lf-yellow);
  border-color: var(--lf-yellow);
  background: var(--lf-yellow-soft);
}

.qbar__index {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.running__nav {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
}

.running__sheet {
  position: sticky;
  top: 64px;
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.sheet__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 700;
}

.sheet__close {
  display: none;
  border: 0;
  background: transparent;
  font-size: 20px;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.sheet__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.sheet__legend span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.dot--answered {
  background: var(--vp-c-brand-1);
}

.dot--marked {
  background: var(--lf-yellow);
}

.dot--current {
  border: 2px solid var(--vp-c-brand-1);
}

.sheet__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.cell {
  aspect-ratio: 1;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 12px;
}

.cell.answered {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.cell.marked {
  background: var(--lf-yellow-soft);
  color: var(--lf-yellow);
  border-color: var(--lf-yellow);
}

.cell.current {
  box-shadow: 0 0 0 2px var(--vp-c-brand-1);
}

.report__score {
  display: flex;
  align-items: center;
  gap: 28px;
  margin: 24px 0;
}

.score-card {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 20px 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.score-card.passed {
  border-color: var(--lf-green);
}

.score-card.failed {
  border-color: var(--lf-red);
}

.score-card__value {
  font-size: 48px;
  font-weight: 800;
}

.score-card.passed .score-card__value {
  color: var(--lf-green);
}

.score-card.failed .score-card__value {
  color: var(--lf-red);
}

.score-card__max {
  color: var(--vp-c-text-3);
}

.score-card__state {
  margin-left: 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

.score-meta p {
  margin: 4px 0;
  color: var(--vp-c-text-2);
}

.report__domains,
.report__wrong {
  margin-top: 24px;
}

.report__domains h2,
.report__wrong h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.domain-row {
  display: grid;
  grid-template-columns: 180px 1fr 64px;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
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

.meter {
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

.report__empty {
  color: var(--vp-c-text-3);
}

.wrong-card {
  padding: 14px;
  margin-bottom: 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.wrong-card__stem {
  margin: 0 0 8px;
  font-weight: 600;
}

.wrong-card__line {
  margin: 0 0 8px;
  color: var(--lf-red);
  font-size: 13px;
}

.wrong-card__explain {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.7;
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

.btn--danger {
  color: #fff;
  background: var(--lf-red);
}

@media (max-width: 959px) {
  .intro__params {
    grid-template-columns: repeat(2, 1fr);
  }

  .running__layout {
    grid-template-columns: 1fr;
  }

  .running__sheet {
    position: fixed;
    inset: auto 0 0 0;
    top: auto;
    max-height: 70vh;
    overflow: auto;
    border-radius: 12px 12px 0 0;
    transform: translateY(100%);
    transition: transform 0.2s ease;
    z-index: 30;
  }

  .running__sheet.open {
    transform: translateY(0);
  }

  .sheet__close {
    display: block;
  }
}

@media (max-width: 640px) {
  .exam {
    padding: 28px 16px 64px;
  }

  .intro__params {
    grid-template-columns: 1fr 1fr;
  }

  .running__bar {
    flex-wrap: wrap;
    margin: -12px -16px 14px;
  }

  .running__title {
    flex-basis: 100%;
  }

  .report__score {
    flex-direction: column;
    align-items: flex-start;
  }

  .domain-row {
    grid-template-columns: 120px 1fr 48px;
  }
}
</style>
