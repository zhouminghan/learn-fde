<template>
  <div class="questions">
    <header class="page-head">
      <h1>题库浏览</h1>
      <p>搜索、筛选和浏览全部已发布题目，可收藏或加入错题本。</p>
    </header>

    <div class="toolbar">
      <input
        v-model="keyword"
        class="search"
        type="search"
        placeholder="搜索题干、选项、解析或标签"
        aria-label="搜索题目"
      />
      <select v-model="filterDomain" aria-label="按知识域筛选">
        <option value="">全部知识域</option>
        <option v-for="d in domains" :key="d.id" :value="d.id">{{ d.title }}</option>
      </select>
      <select v-model="filterType" aria-label="按题型筛选">
        <option value="">全部题型</option>
        <option value="single">单选题</option>
        <option value="multiple">多选题</option>
      </select>
      <select v-model="filterDifficulty" aria-label="按难度筛选">
        <option value="">全部难度</option>
        <option value="easy">简单</option>
        <option value="medium">中等</option>
        <option value="hard">困难</option>
      </select>
    </div>

    <p class="questions__count">共 {{ filtered.length }} 道题目</p>

    <div class="questions__list">
      <div v-for="q in paged" :key="q.id" class="question-card">
        <div class="question-card__head">
          <div class="tags">
            <span class="tag">{{ q.type === 'single' ? '单选' : '多选' }}</span>
            <span class="tag tag--domain">{{ domainTitle(q.domainId) }}</span>
            <span class="tag" :class="'tag--' + q.difficulty">{{ difficultyLabel(q.difficulty) }}</span>
          </div>
          <div class="question-card__actions">
            <button type="button" class="icon-btn" :title="bookmarked.includes(q.id) ? '取消收藏' : '收藏'" @click="toggleBookmark(q.id)">
              <Star :size="16" :fill="bookmarked.includes(q.id) ? 'currentColor' : 'none'" />
            </button>
            <button type="button" class="icon-btn" title="加入错题本" @click="addWrong(q.id)">
              <BookPlus :size="16" />
            </button>
          </div>
        </div>
        <p class="question-card__stem">{{ q.stem }}</p>
        <div class="question-card__options">
          <div v-for="opt in q.options" :key="opt.id" class="opt">
            <span class="opt__id" :class="{ correct: q.answerIds.includes(opt.id) }">{{ opt.id }}</span>
            <span>{{ opt.text }}</span>
          </div>
        </div>
        <details class="question-card__explain">
          <summary>查看解析</summary>
          <p>{{ q.explanation }}</p>
          <p class="question-card__source">
            来源：{{ sourceLabel(q.sourceType) }} · {{ q.sourceUrls.join(' ') }}
          </p>
        </details>
      </div>
    </div>

    <div v-if="pageCount > 1" class="pager">
      <button class="btn btn--ghost" :disabled="page <= 1" @click="page -= 1">上一页</button>
      <span>{{ page }} / {{ pageCount }}</span>
      <button class="btn btn--ghost" :disabled="page >= pageCount" @click="page += 1">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { BookPlus, Star } from 'lucide-vue-next'
import { curriculum, loadPublishedQuestions } from '@/content'
import type { Difficulty, Question, QuestionType, SourceType } from '@/types'

const all = loadPublishedQuestions()
const domains = curriculum.domains
const keyword = ref('')
const filterDomain = ref('')
const filterType = ref<'' | QuestionType>('')
const filterDifficulty = ref<'' | Difficulty>('')
const bookmarked = ref<string[]>([])
const page = ref(1)
const pageSize = 10

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return all.filter((q) => {
    if (filterDomain.value && q.domainId !== filterDomain.value) return false
    if (filterType.value && q.type !== filterType.value) return false
    if (filterDifficulty.value && q.difficulty !== filterDifficulty.value) return false
    if (!kw) return true
    const haystack = [
      q.stem,
      ...q.options.map((o) => o.text),
      q.explanation,
      ...q.tags
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(kw)
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function domainTitle(id: string) {
  return curriculum.domains.find((d) => d.id === id)?.shortTitle ?? id
}

function difficultyLabel(d: Difficulty) {
  return d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'
}

function sourceLabel(s: SourceType) {
  return s === 'original' ? '原创练习' : s === 'official_doc' ? '官方文档' : '官方知识'
}

async function toggleBookmark(id: string) {
  try {
    const { bookmarksRepo } = await import('@/storage')
    if (bookmarked.value.includes(id)) {
      await bookmarksRepo.removeBookmark('question', id)
      bookmarked.value = bookmarked.value.filter((b) => b !== id)
    } else {
      await bookmarksRepo.addBookmark('question', id)
      bookmarked.value = [...bookmarked.value, id]
    }
  } catch {
    // 忽略。
  }
}

async function addWrong(id: string) {
  try {
    const { wrongQuestionsRepo } = await import('@/storage')
    await wrongQuestionsRepo.recordWrongAnswer(id, [])
  } catch {
    // 忽略。
  }
}

onMounted(async () => {
  try {
    const { bookmarksRepo } = await import('@/storage')
    bookmarked.value = await bookmarksRepo.bookmarkTargetIds('question')
  } catch {
    // 忽略。
  }
})
</script>

<style scoped>
.questions {
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

.toolbar {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 10px;
  margin: 24px 0 12px;
}

.search,
.toolbar select {
  padding: 9px 11px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.questions__count {
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.questions__list {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.question-card {
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
}

.question-card__head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
}

.tag--domain {
  color: var(--lf-blue);
  background: var(--lf-blue-soft);
}

.tag--hard {
  color: var(--lf-red);
  background: var(--lf-red-soft);
}

.question-card__actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-elv);
  cursor: pointer;
}

.icon-btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.question-card__stem {
  margin: 12px 0 10px;
  font-weight: 600;
  line-height: 1.6;
}

.question-card__options {
  display: grid;
  gap: 4px;
}

.opt {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.opt__id {
  flex: none;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  border: 1px solid var(--vp-c-divider);
  font-size: 12px;
  font-weight: 700;
}

.opt__id.correct {
  color: var(--lf-green);
  border-color: var(--lf-green);
  background: var(--lf-green-soft);
}

.question-card__explain {
  margin-top: 10px;
  font-size: 13px;
}

.question-card__explain summary {
  cursor: pointer;
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.question-card__explain p {
  margin: 6px 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.question-card__source {
  font-size: 12px;
  color: var(--vp-c-text-3);
  word-break: break-all;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
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

@media (max-width: 640px) {
  .questions {
    padding: 28px 16px 64px;
  }

  .toolbar {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
