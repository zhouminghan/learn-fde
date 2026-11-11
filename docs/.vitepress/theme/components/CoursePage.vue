<template>
  <div class="course">
    <header class="page-head">
      <h1>课程学习</h1>
      <p>按腾讯云官方四大模块及补充专题组织章节，点击进入章节阅读并记录学习进度。</p>
    </header>

    <div class="overview">
      <div class="meter"><span :style="{ width: percent + '%' }"></span></div>
      <span class="overview__text">{{ percent }}% 已完成</span>
    </div>

    <section v-for="m in modules" :key="m.id" class="module">
      <div class="module__head">
        <h2 class="module__title">{{ m.title }}</h2>
        <span v-if="m.sourceType === 'supplementary'" class="tag tag--supp">补充学习</span>
        <span v-else class="tag tag--official">官方课程</span>
      </div>
      <p class="module__desc">{{ m.description }}</p>
      <div class="lesson-grid">
        <a
          v-for="l in lessonsOf(m.id)"
          :key="l.id"
          class="lesson-card"
          :href="withBase(l.path)"
        >
          <div class="lesson-card__top">
            <span class="lesson-card__id">{{ l.id }}</span>
            <span class="badge" :class="statusOf(l.id)">{{ statusLabel(l.id) }}</span>
          </div>
          <p class="lesson-card__title">{{ l.title }}</p>
          <p class="lesson-card__summary">{{ l.summary }}</p>
          <div class="lesson-card__meta">
            <span>{{ l.estimatedMinutes }} 分钟</span>
            <span>{{ domainTitles(l.domainIds) }}</span>
          </div>
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { curriculum } from '@/content'
import type { CourseProgress } from '@/types'

const progress = ref<CourseProgress[]>([])
const modules = curriculum.modules

function lessonsOf(moduleId: string) {
  return curriculum.lessons
    .filter((l) => l.moduleId === moduleId && l.status === 'published')
    .sort((a, b) => a.order - b.order)
}

const percent = computed(() => {
  const done = progress.value.filter((p) => p.status === 'completed').length
  return Math.round((done / curriculum.lessons.length) * 100)
})

function statusOf(id: string) {
  return progress.value.find((p) => p.lessonId === id)?.status ?? 'not_started'
}

function statusLabel(id: string) {
  const s = statusOf(id)
  return s === 'completed' ? '已完成' : s === 'in_progress' ? '学习中' : '未开始'
}

function domainTitles(ids: string[]) {
  return ids
    .map((id) => curriculum.domains.find((d) => d.id === id)?.shortTitle)
    .filter(Boolean)
    .join(' · ')
}

onMounted(async () => {
  try {
    const { courseProgressRepo } = await import('@/storage')
    progress.value = await courseProgressRepo.getAllCourseProgress()
  } catch {
    // 无本地存储时显示未开始。
  }
})
</script>

<style scoped>
.course {
  max-width: 1180px;
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
  max-width: 680px;
  line-height: 1.7;
}

.overview {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 24px 0 36px;
}

.overview .meter {
  flex: 1;
  max-width: 480px;
}

.overview__text {
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 600;
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
  background: var(--lf-brand);
}

.module {
  margin-top: 40px;
}

.module__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.module__title {
  margin: 0;
  font-size: 21px;
  letter-spacing: 0;
}

.module__desc {
  margin: 8px 0 16px;
  color: var(--vp-c-text-2);
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.tag--official {
  color: var(--lf-green);
  background: var(--lf-green-soft);
}

.tag--supp {
  color: var(--lf-yellow);
  background: var(--lf-yellow-soft);
}

.lesson-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.lesson-card {
  display: flex;
  flex-direction: column;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  text-decoration: none;
  color: var(--vp-c-text-1);
  box-shadow: var(--lf-shadow-card);
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.lesson-card:hover {
  border-color: var(--lf-brand);
  transform: translateY(-1px);
}

.lesson-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.lesson-card__id {
  color: var(--vp-c-text-3);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.lesson-card__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.4;
}

.lesson-card__summary {
  margin: 0 0 14px;
  flex: 1;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.lesson-card__meta {
  display: flex;
  justify-content: space-between;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
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

@media (max-width: 959px) {
  .lesson-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .course {
    padding: 28px 16px 64px;
  }

  .lesson-grid {
    grid-template-columns: 1fr;
  }
}
</style>
