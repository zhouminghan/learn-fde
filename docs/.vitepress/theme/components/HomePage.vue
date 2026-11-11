<template>
  <div class="home">
    <header class="home__hero">
      <div class="home__hero-inner">
        <p class="home__eyebrow">腾讯云 ADP · FDE 学习与实战训练平台</p>
        <h1 class="home__title">Learning FDE</h1>
        <p class="home__subtitle">
          从 Agent 技术体系、ADP 产品能力到企业应用交付，通过结构化课程、可视化讲解、
          交互式实验室和模拟考试，把 FDE 知识转化为可交付的实战能力。
        </p>
        <div class="home__cta">
          <a class="btn btn--primary" :href="withBase('/course/')">开始学习</a>
          <a class="btn btn--accent" :href="withBase('/lab/')">进入 FDE 实验室</a>
          <a class="btn btn--ghost" :href="withBase('/exam/')">参加模拟考试</a>
        </div>
      </div>
    </header>

    <section class="home__section">
      <h2 class="section-title">学习目标</h2>
      <div class="goals">
        <div v-for="g in goals" :key="g.title" class="goal">
          <span class="goal__dot"></span>
          <div>
            <p class="goal__title">{{ g.title }}</p>
            <p class="goal__desc">{{ g.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="home__section">
      <h2 class="section-title">学习入口</h2>
      <div class="entry-grid">
        <a v-for="e in entries" :key="e.title" class="entry" :href="withBase(e.link)">
          <span class="entry__icon"><component :is="e.icon" :size="20" :stroke-width="1.8" /></span>
          <p class="entry__title">{{ e.title }}</p>
          <p class="entry__desc">{{ e.desc }}</p>
        </a>
      </div>
    </section>

    <section class="home__section">
      <h2 class="section-title">学习概览</h2>
      <div class="stat-grid">
        <div class="stat">
          <span class="stat__value">{{ progressPercent }}%</span>
          <span class="stat__label">课程完成率</span>
        </div>
        <div class="stat">
          <span class="stat__value">{{ practiceTotal }}</span>
          <span class="stat__label">累计作答题次</span>
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
          <h2 class="section-title">继续学习</h2>
          <template v-if="continueLesson">
            <p class="panel__lead">{{ continueLesson.title }}</p>
            <p class="panel__desc">{{ continueLesson.summary }}</p>
            <a class="btn btn--primary" :href="withBase(continueLesson.path)">继续阅读</a>
          </template>
          <p v-else class="panel__empty">还没有开始学习的章节。</p>
        </div>
        <div class="panel">
          <h2 class="section-title">考试入口</h2>
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
        <a class="link-chip" href="https://cloud.tencent.com/document/product/658/137832" target="_blank" rel="noopener noreferrer">FDE 官方考试指南</a>
        <a class="link-chip" href="https://cloud.tencent.com/document/product/1759" target="_blank" rel="noopener noreferrer">ADP 产品文档</a>
        <a class="link-chip" href="https://adp.tencent.com/zh/blog/adp-fde-certification-guide" target="_blank" rel="noopener noreferrer">FDE 认证指南</a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { BookOpen, FlaskConical, FileQuestion, GraduationCap } from '@lucide/vue'
import { curriculum } from '@/content'
import type { ExamAttempt, PracticeAttempt, CourseProgress } from '@/types'

const { site } = useData()
void site

const progress = ref<CourseProgress[]>([])
const practice = ref<PracticeAttempt[]>([])
const exams = ref<ExamAttempt[]>([])

const modules = curriculum.modules

const goals = [
  { title: '建立 FDE 技术体系', desc: '理解 AI、Agent、RAG、MCP、Workflow 与评测的核心概念和边界。' },
  { title: '掌握 ADP 产品能力', desc: '熟悉应用搭建、知识库、工具、连接器与 Multi-Agent 编排。' },
  { title: '完成企业应用交付', desc: '通过案例与实验室训练需求分析、方案设计和上线交付。' },
  { title: '定位并补齐薄弱项', desc: '用专项练习和模拟考试识别知识缺口，形成复习闭环。' }
]

const entries = [
  { title: '课程学习', desc: '四大官方模块与补充专题的结构化课程。', link: '/course/', icon: BookOpen },
  { title: 'FDE 实验室', desc: '企业 IT 服务台 Agent 的可交互模拟执行。', link: '/lab/', icon: FlaskConical },
  { title: '模拟考试', desc: '按官方蓝图组卷，倒计时与成绩报告。', link: '/exam/', icon: FileQuestion },
  { title: '题库浏览', desc: '搜索、筛选、收藏与错题强化。', link: '/questions/', icon: GraduationCap }
]

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
  padding: 64px 0 36px;
}

.home__hero-inner {
  max-width: 780px;
}

.home__eyebrow {
  margin: 0 0 12px;
  color: var(--lf-brand-soft-text);
  font-size: 14px;
  font-weight: 700;
}

.home__title {
  margin: 0 0 14px;
  font-size: 54px;
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--lf-navy-text);
}

.home__subtitle {
  margin: 0 0 28px;
  max-width: 640px;
  color: var(--vp-c-text-2);
  font-size: 17px;
  line-height: 1.75;
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
  color: var(--lf-navy-text);
}

.goals {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.goal {
  display: flex;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  box-shadow: var(--lf-shadow-card);
}

.goal__dot {
  flex: none;
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--lf-brand);
}

.goal__title {
  margin: 0 0 4px;
  font-weight: 650;
  font-size: 14px;
}

.goal__desc {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.55;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.entry {
  display: block;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  text-decoration: none;
  color: var(--vp-c-text-1);
  box-shadow: var(--lf-shadow-card);
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.entry:hover {
  border-color: var(--lf-brand);
  background: var(--lf-hover-bg);
}

.entry__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-bottom: 12px;
  border-radius: 8px;
  color: var(--lf-brand-soft-text);
  background: var(--lf-brand-soft);
}

.entry__title {
  margin: 0 0 4px;
  font-weight: 650;
}

.entry__desc {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.55;
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
  box-shadow: var(--lf-shadow-card);
}

.stat__value {
  display: block;
  font-size: 28px;
  font-weight: 750;
  color: var(--lf-navy-text);
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
  box-shadow: var(--lf-shadow-card);
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
  box-shadow: var(--lf-shadow-card);
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
  color: var(--lf-brand-soft-text);
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
  background: var(--lf-brand);
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
  box-shadow: var(--lf-shadow-card);
}

.path__index {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--lf-navy-soft);
  color: var(--lf-navy-text);
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
  color: var(--lf-on-brand);
  background: var(--lf-brand);
}

.btn--primary:hover {
  background: var(--lf-brand-hover);
  color: var(--lf-on-brand);
}

.btn--accent {
  color: var(--lf-on-brand);
  background: var(--lf-brand);
}

.btn--accent:hover {
  background: var(--lf-brand-hover);
  color: var(--lf-on-brand);
}

.btn--ghost {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
  border-color: var(--lf-border-control);
}

.btn--ghost:hover {
  border-color: var(--lf-brand);
  background: var(--lf-hover-bg);
}

.link-chip {
  padding: 9px 14px;
  border: 1px solid var(--lf-border-control);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 14px;
}

.link-chip:hover {
  border-color: var(--lf-brand);
  color: var(--lf-brand-soft-text);
  background: var(--lf-hover-bg);
}

@media (max-width: 959px) {
  .stat-grid,
  .weak-grid,
  .entry-grid,
  .goals {
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
    font-size: 40px;
  }

  .stat-grid,
  .weak-grid,
  .entry-grid,
  .goals,
  .path {
    grid-template-columns: 1fr;
  }
}
</style>
