<template>
  <div class="home">
    <header class="home__hero">
      <div class="home__hero-inner">
        <p class="home__eyebrow">腾讯云 ADP · FDE 学习与能力训练站</p>
        <h1 class="home__title">learn-FDE</h1>
        <p class="home__subtitle">
          围绕 FDE 认证的课程学习、专项练习、模拟考试与学习记录，帮助你建立可交付的企业级 Agent 能力。
        </p>
        <div class="home__cta">
          <a class="btn btn--primary" :href="withBase('/course/')">开始学习</a>
          <a class="btn btn--ghost" :href="withBase('/exam/')">参加模拟考试</a>
        </div>
      </div>
    </header>

    <section class="home__section">
      <h2 class="section-title">学习概览</h2>
      <div class="stat-grid">
        <div class="stat">
          <span class="stat__value">{{ progressPercent }}%</span>
          <span class="stat__label">课程完成率</span>
        </div>
        <div class="stat">
          <span class="stat__value">{{ practiceTotal }}</span>
          <span class="stat__label">累计练习题</span>
        </div>
        <div class="stat">
          <span class="stat__value">{{ examCount }}</span>
          <span class="stat__label">模拟考试次数</span>
        </div>
        <div class="stat">
          <span class="stat__value">{{ lastScore }}</span>
          <span class="stat__label">最近得分</span>
        </div>
      </div>
    </section>

    <section class="home__section">
      <div class="split">
        <div class="panel">
          <div class="panel__head">
            <h2 class="section-title">继续学习</h2>
          </div>
          <template v-if="continueLesson">
            <p class="panel__lead">{{ continueLesson.title }}</p>
            <p class="panel__desc">{{ continueLesson.summary }}</p>
            <a class="btn btn--primary" :href="withBase(continueLesson.path)">继续阅读</a>
          </template>
          <p v-else class="panel__empty">还没有开始学习的章节。</p>
        </div>
        <div class="panel">
          <div class="panel__head">
            <h2 class="section-title">考试入口</h2>
          </div>
          <p class="panel__desc">60 题 · 单选 40 / 多选 20 · 90 分钟 · 满分 100 · 70 分合格</p>
          <div class="panel__actions">
            <a class="btn btn--primary" :href="withBase('/exam/')">官方蓝图模拟考</a>
            <a class="btn btn--ghost" :href="withBase('/practice/')">知识域专项练习</a>
          </div>
        </div>
      </div>
    </section>

    <section v-if="weakDomains.length" class="home__section">
      <h2 class="section-title">薄弱知识域</h2>
      <div class="weak-grid">
        <div v-for="d in weakDomains" :key="d.domainId" class="weak-card">
          <div class="weak-card__top">
            <span class="weak-card__name">{{ d.title }}</span>
            <span class="weak-card__acc">{{ Math.round(d.accuracy * 100) }}%</span>
          </div>
          <div class="meter"><span :style="{ width: Math.round(d.accuracy * 100) + '%' }"></span></div>
        </div>
      </div>
    </section>

    <section class="home__section">
      <h2 class="section-title">学习路径</h2>
      <ol class="path">
        <li v-for="m in modules" :key="m.id" class="path__item">
          <span class="path__index">{{ m.order }}</span>
          <div>
            <p class="path__title">{{ m.title }}</p>
            <p class="path__desc">{{ m.description }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="home__section">
      <h2 class="section-title">官方资料入口</h2>
      <div class="link-row">
        <a class="link-chip" href="https://cloud.tencent.com/edu/training/cert/detail?type=CFD" target="_blank" rel="noopener noreferrer">腾讯云 FDE 认证详情</a>
        <a class="link-chip" href="https://cloud.tencent.com/document/product/1759" target="_blank" rel="noopener noreferrer">ADP 产品文档</a>
        <a class="link-chip" href="https://adp.tencent.com/zh/blog/adp-fde-certification-guide" target="_blank" rel="noopener noreferrer">FDE 认证指南</a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { curriculum } from '@/content'
import type { ExamAttempt, PracticeAttempt, CourseProgress } from '@/types'

const { site } = useData()
void site

const progress = ref<CourseProgress[]>([])
const practice = ref<PracticeAttempt[]>([])
const exams = ref<ExamAttempt[]>([])

const modules = curriculum.modules

const progressPercent = computed(() => {
  const done = progress.value.filter((p) => p.status === 'completed').length
  return Math.round((done / curriculum.lessons.length) * 100)
})

const practiceTotal = computed(() =>
  practice.value.reduce((sum, a) => sum + a.total, 0)
)

const examCount = computed(() => exams.value.filter((a) => a.status !== 'in_progress').length)

const lastScore = computed(() => {
  const done = exams.value.filter((a) => a.status !== 'in_progress' && typeof a.score === 'number')
  return done.length ? Math.round(done[done.length - 1].score ?? 0) : '—'
})

const continueLesson = computed(() => {
  const done = new Set(progress.value.filter((p) => p.status === 'completed').map((p) => p.lessonId))
  const ordered = [...curriculum.lessons].sort((a, b) => a.order - b.order)
  const inProgress = ordered
    .filter((l) => progress.value.find((p) => p.lessonId === l.id)?.status === 'in_progress')
    .sort((a, b) => (lastVisit(b.id) ?? '').localeCompare(lastVisit(a.id) ?? ''))
  return inProgress[0] ?? ordered.find((l) => !done.has(l.id))
})

function lastVisit(id: string) {
  return progress.value.find((p) => p.lessonId === id)?.lastVisitedAt
}

const weakDomains = computed(() => {
  const done = exams.value.filter(
    (a) => a.status !== 'in_progress' && Array.isArray(a.domainStats)
  )
  const acc = new Map<string, { total: number; correct: number }>()
  for (const a of done) {
    for (const s of a.domainStats ?? []) {
      const e = acc.get(s.domainId) ?? { total: 0, correct: 0 }
      e.total += s.total
      e.correct += s.correct
      acc.set(s.domainId, e)
    }
  }
  return [...acc.entries()]
    .map(([domainId, v]) => ({
      domainId,
      title: curriculum.domains.find((d) => d.id === domainId)?.shortTitle ?? domainId,
      accuracy: v.total > 0 ? v.correct / v.total : 0
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
})

onMounted(async () => {
  try {
    const { courseProgressRepo, practiceRepo, examRepo } = await import('@/storage')
    const [p, pr, ex] = await Promise.all([
      courseProgressRepo.getAllCourseProgress(),
      practiceRepo.listPracticeAttempts(),
      examRepo.listExamAttempts()
    ])
    progress.value = p
    practice.value = pr
    exams.value = ex
  } catch {
    // 本地存储不可用时保持空状态。
  }
})
</script>

<style scoped>
.home {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px 72px;
}

.home__hero {
  padding: 72px 0 40px;
}

.home__hero-inner {
  max-width: 760px;
}

.home__eyebrow {
  margin: 0 0 12px;
  color: var(--vp-c-brand-1);
  font-size: 14px;
  font-weight: 650;
}

.home__title {
  margin: 0 0 14px;
  font-size: 52px;
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: 0;
}

.home__subtitle {
  margin: 0 0 28px;
  max-width: 620px;
  color: var(--vp-c-text-2);
  font-size: 17px;
  line-height: 1.7;
}

.home__cta,
.panel__actions,
.link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.home__section {
  margin-top: 40px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat {
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.stat__value {
  display: block;
  font-size: 28px;
  font-weight: 750;
  color: var(--vp-c-text-1);
}

.stat__label {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.panel {
  padding: 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel__lead {
  margin: 10px 0 6px;
  font-size: 17px;
  font-weight: 650;
}

.panel__desc {
  margin: 0 0 18px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.panel__empty {
  color: var(--vp-c-text-3);
}

.weak-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.weak-card {
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.weak-card__top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.weak-card__name {
  font-weight: 600;
}

.weak-card__acc {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.meter {
  height: 6px;
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

.path {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.path__item {
  display: flex;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.path__index {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 700;
}

.path__title {
  margin: 0 0 4px;
  font-weight: 600;
  font-size: 14px;
}

.path__desc {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
  line-height: 1.5;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn--primary {
  color: #fff;
  background: var(--vp-c-brand-1);
}

.btn--primary:hover {
  background: var(--vp-c-brand-2);
  color: #fff;
}

.btn--ghost {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
  border-color: var(--vp-c-divider);
}

.btn--ghost:hover {
  border-color: var(--vp-c-brand-1);
}

.link-chip {
  padding: 9px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 14px;
}

.link-chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

@media (max-width: 959px) {
  .stat-grid,
  .weak-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .split {
    grid-template-columns: 1fr;
  }

  .path {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .home {
    padding: 0 16px 56px;
  }

  .home__hero {
    padding-top: 40px;
  }

  .home__title {
    font-size: 38px;
  }

  .stat-grid,
  .weak-grid,
  .path {
    grid-template-columns: 1fr;
  }
}
</style>
