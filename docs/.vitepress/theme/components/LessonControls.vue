<template>
  <div v-if="lesson" class="lesson-controls">
    <div class="lesson-controls__status">
      <span class="badge" :class="status">{{ statusLabel }}</span>
      <span class="lesson-controls__meta">
        {{ lesson.estimatedMinutes }} 分钟 · 最近核验 {{ lesson.lastVerifiedAt }}
      </span>
    </div>
    <div class="lesson-controls__actions">
      <button
        type="button"
        class="btn btn--primary"
        @click="toggleComplete"
      >
        <CheckCircle2 v-if="status !== 'completed'" :size="16" />
        <RotateCcw v-else :size="16" />
        {{ status === 'completed' ? '取消完成' : '标记完成' }}
      </button>
      <button type="button" class="btn btn--ghost" @click="toggleBookmark">
        <Star :size="16" :fill="bookmarked ? 'currentColor' : 'none'" />
        {{ bookmarked ? '已加入复习' : '加入复习' }}
      </button>
    </div>
    <p v-if="!storageOk" class="lesson-controls__warn">
      当前浏览器无法使用本地存储，学习进度不会被保存。
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import { CheckCircle2, RotateCcw, Star } from '@lucide/vue'
import { curriculum } from '@/content'
import type { LessonMeta } from '@/types'

const { page } = useData()

const status = ref<'not_started' | 'in_progress' | 'completed'>('not_started')
const bookmarked = ref(false)
const storageOk = ref(true)
let startTime = 0

const lesson = computed<LessonMeta | undefined>(() => {
  const path = '/' + (page.value.relativePath ?? '').replace(/\.md$/, '').replace(/^course\//, 'course/')
  return curriculum.lessons.find((l) => l.path === path)
})

const statusLabel = computed(() =>
  status.value === 'completed'
    ? '已完成'
    : status.value === 'in_progress'
      ? '学习中'
      : '未开始'
)

onMounted(async () => {
  if (!lesson.value) return
  startTime = Date.now()
  try {
    const { courseProgressRepo, bookmarksRepo } = await import('@/storage')
    const progress = await courseProgressRepo.getCourseProgress(lesson.value.id)
    status.value = progress?.status ?? 'not_started'
    bookmarked.value = await bookmarksRepo.isBookmarked('lesson', lesson.value.id)
    await courseProgressRepo.visitLesson(lesson.value.id, 0)
  } catch {
    storageOk.value = false
  }
})

async function toggleComplete() {
  if (!lesson.value) return
  const next = status.value === 'completed' ? 'in_progress' : 'completed'
  try {
    const { courseProgressRepo } = await import('@/storage')
    await courseProgressRepo.setLessonStatus(lesson.value.id, next)
    status.value = next
  } catch {
    storageOk.value = false
  }
}

async function toggleBookmark() {
  if (!lesson.value) return
  try {
    const { bookmarksRepo } = await import('@/storage')
    if (bookmarked.value) {
      await bookmarksRepo.removeBookmark('lesson', lesson.value.id)
      bookmarked.value = false
    } else {
      await bookmarksRepo.addBookmark('lesson', lesson.value.id)
      bookmarked.value = true
    }
  } catch {
    storageOk.value = false
  }
}
</script>

<style scoped>
.lesson-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  padding: 14px 16px;
  margin: 28px 0 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

.lesson-controls__status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lesson-controls__meta {
  color: var(--lf-text-3);
  font-size: 13px;
}

.lesson-controls__actions {
  display: flex;
  gap: 8px;
}

.lesson-controls__warn {
  flex-basis: 100%;
  margin: 0;
  color: var(--lf-danger);
  font-size: 13px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
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

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn--primary {
  color: var(--lf-on-brand);
  background: var(--lf-brand);
}

.btn--primary:hover {
  background: var(--lf-brand-hover);
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
</style>
