<template>
  <div class="qview">
    <div class="qview__head">
      <div class="qview__tags">
        <span class="qview__type">{{ question.type === 'single' ? '单选题' : '多选题' }}</span>
        <span class="qview__difficulty" :class="'diff--' + question.difficulty">{{ difficultyLabel }}</span>
        <span class="qview__domain">{{ domainTitle }}</span>
      </div>
      <button
        type="button"
        class="qview__bookmark"
        :title="bookmarked ? '取消收藏' : '收藏本题'"
        :aria-pressed="bookmarked"
        @click="$emit('bookmark', question.id)"
      >
        <Star :size="16" :fill="bookmarked ? 'currentColor' : 'none'" />
      </button>
    </div>

    <p class="qview__stem">{{ question.stem }}</p>

    <div class="qview__options">
      <button
        v-for="opt in question.options"
        :key="opt.id"
        type="button"
        class="option"
        :class="optionClass(opt.id)"
        :disabled="locked"
        @click="toggle(opt.id)"
      >
        <span class="option__mark">{{ opt.id }}</span>
        <span class="option__text">{{ opt.text }}</span>
        <Check v-if="showResult && isAnswer(opt.id)" class="option__icon" :size="16" />
      </button>
    </div>

    <div v-if="showResult" class="qview__result">
      <p class="qview__verdict" :class="correct ? 'is-correct' : 'is-wrong'">
        {{ correct ? '回答正确' : '回答错误' }}
      </p>
      <p class="qview__answer">正确答案：{{ question.answerIds.join('、') }}</p>
      <div class="qview__explanation">
        <p>{{ question.explanation }}</p>
        <p v-if="question.optionExplanations" class="qview__opt-explain">
          <template v-for="(text, id) in question.optionExplanations" :key="id">
            <span v-if="question.answerIds.includes(id) || selected.includes(id)">
              <strong>{{ id }}</strong>：{{ text }}
            </span>
          </template>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, Star } from 'lucide-vue-next'
import { curriculum } from '@/content'
import type { Question } from '@/types'

const props = withDefaults(defineProps<{
  question: Question
  selected: string[]
  showResult: boolean
  locked: boolean
  bookmarked?: boolean
}>(), {
  selected: () => [],
  bookmarked: false
})

const emit = defineEmits<{
  (e: 'update:selected', ids: string[]): void
  (e: 'bookmark', id: string): void
}>()

const difficultyLabel = computed(() =>
  props.question.difficulty === 'easy'
    ? '简单'
    : props.question.difficulty === 'medium'
      ? '中等'
      : '困难'
)

const domainTitle = computed(
  () => curriculum.domains.find((d) => d.id === props.question.domainId)?.shortTitle ?? props.question.domainId
)

const correct = computed(() => {
  const expected = [...props.question.answerIds].sort()
  const actual = [...new Set(props.selected)].sort()
  return (
    expected.length === actual.length &&
    expected.every((id, i) => id === actual[i])
  )
})

function isAnswer(id: string) {
  return props.question.answerIds.includes(id)
}

function toggle(id: string) {
  if (props.locked) return
  const set = new Set(props.selected)
  if (props.question.type === 'single') {
    set.clear()
    set.add(id)
  } else {
    if (set.has(id)) set.delete(id)
    else set.add(id)
  }
  emit('update:selected', [...set])
}

function optionClass(id: string) {
  const selected = props.selected.includes(id)
  const classes: string[] = []
  if (selected) classes.push('is-selected')
  if (props.showResult && isAnswer(id)) classes.push('is-correct')
  if (props.showResult && selected && !isAnswer(id)) classes.push('is-wrong')
  return classes
}
</script>

<style scoped>
.qview {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  padding: 20px;
}

.qview__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.qview__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.qview__type,
.qview__difficulty,
.qview__domain {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.qview__type {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.qview__difficulty {
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
}

.qview__difficulty.diff--hard {
  color: var(--lf-red);
  background: var(--lf-red-soft);
}

.qview__domain {
  color: var(--lf-blue);
  background: var(--lf-blue-soft);
}

.qview__bookmark {
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

.qview__bookmark[aria-pressed='true'] {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.qview__stem {
  margin: 0 0 16px;
  font-size: 16px;
  line-height: 1.7;
  font-weight: 550;
}

.qview__options {
  display: grid;
  gap: 8px;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 11px 12px;
  text-align: left;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 14px;
  line-height: 1.55;
}

.option:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
}

.option.is-selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.option.is-correct {
  border-color: var(--lf-green);
  background: var(--lf-green-soft);
}

.option.is-wrong {
  border-color: var(--lf-red);
  background: var(--lf-red-soft);
}

.option:disabled {
  cursor: default;
}

.option__mark {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  font-size: 12px;
  font-weight: 700;
}

.option.is-selected .option__mark {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}

.option__icon {
  margin-left: auto;
  color: var(--lf-green);
}

.qview__result {
  margin-top: 16px;
  padding: 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

.qview__verdict {
  margin: 0 0 6px;
  font-weight: 700;
}

.qview__verdict.is-correct {
  color: var(--lf-green);
}

.qview__verdict.is-wrong {
  color: var(--lf-red);
}

.qview__answer {
  margin: 0 0 8px;
  font-weight: 600;
}

.qview__explanation p {
  margin: 0;
  line-height: 1.7;
}

.qview__opt-explain {
  margin-top: 8px;
  display: grid;
  gap: 4px;
  color: var(--vp-c-text-2);
}
</style>
