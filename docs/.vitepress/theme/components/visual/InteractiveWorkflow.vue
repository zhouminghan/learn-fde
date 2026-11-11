<template>
  <DiagramFrame :title="title" :caption="caption" :legend="legend">
    <div class="iw">
      <div class="iw__controls">
        <button type="button" class="iw__btn" :disabled="index < 0" @click="reset">重置</button>
        <button type="button" class="iw__btn" :disabled="index <= 0" @click="prev">上一步</button>
        <button type="button" class="iw__btn iw__btn--primary" @click="playing ? pause() : play()">
          {{ playing ? '暂停' : index >= steps.length - 1 ? '重播' : '播放' }}
        </button>
        <button type="button" class="iw__btn" :disabled="index >= steps.length - 1" @click="next">下一步</button>
      </div>

      <ol class="iw__timeline">
        <li
          v-for="(step, i) in steps"
          :key="step.id"
          class="iw__step"
          :class="stepClass(i)"
        >
          <button
            type="button"
            class="iw__step-button"
            :aria-current="i === index ? 'step' : undefined"
            @click="goTo(i)"
          >
            <span class="iw__dot"></span>
            <span class="iw__step-title">
              <span class="iw__index">{{ i + 1 }}</span>
              {{ step.title }}
              <span v-if="step.kind" class="iw__kind">{{ step.kind }}</span>
              <span class="iw__state">{{ stepStateLabel(i) }}</span>
            </span>
          </button>
          <div v-if="i <= index" class="iw__step-content">
            <p class="iw__summary">{{ step.summary }}</p>
            <ul v-if="step.details?.length" class="iw__details">
              <li v-for="d in step.details" :key="d">{{ d }}</li>
            </ul>
            <dl v-if="step.evidence?.length" class="iw__evidence">
              <template v-for="e in step.evidence" :key="e.label">
                <dt>{{ e.label }}</dt>
                <dd>{{ e.value }}</dd>
              </template>
            </dl>
          </div>
        </li>
      </ol>
      <p class="sr-only" aria-live="polite">{{ liveStatus }}</p>
    </div>
  </DiagramFrame>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import DiagramFrame from './DiagramFrame.vue'

export interface WorkflowStep {
  id: string
  title: string
  kind?: string
  summary: string
  details?: string[]
  evidence?: { label: string; value: string }[]
}

const props = withDefaults(
  defineProps<{
    steps: WorkflowStep[]
    title?: string
    caption?: string
    legend?: { label: string; color: string }[]
    intervalMs?: number
  }>(),
  { legend: () => [], intervalMs: 1200 }
)

const index = ref(-1)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

function stepClass(i: number) {
  if (i < index.value) return 'iw__step--done'
  if (i === index.value) return 'iw__step--active'
  return 'iw__step--pending'
}

function stepStateLabel(i: number) {
  if (i < index.value) return '已完成'
  if (i === index.value) return '当前步骤'
  return '待执行'
}

const liveStatus = computed(() =>
  index.value < 0
    ? '流程尚未开始'
    : `当前第 ${index.value + 1} 步：${props.steps[index.value]?.title ?? ''}`
)

function play() {
  pause()
  if (index.value >= props.steps.length - 1) index.value = -1
  playing.value = true
  timer = setInterval(() => {
    if (index.value >= props.steps.length - 1) {
      pause()
      return
    }
    index.value += 1
  }, props.intervalMs)
}

function pause() {
  playing.value = false
  if (timer) clearInterval(timer)
  timer = null
}

function next() {
  if (index.value < props.steps.length - 1) index.value += 1
}

function prev() {
  if (index.value > 0) index.value -= 1
}

function reset() {
  pause()
  index.value = -1
}

function goTo(i: number) {
  pause()
  index.value = i
}

onBeforeUnmount(pause)
</script>

<style scoped>
.iw {
  min-height: 220px;
}

.iw__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.iw__btn {
  padding: 7px 12px;
  border: 1px solid var(--lf-border-control);
  border-radius: 7px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
  cursor: pointer;
  font-size: 13px;
}

.iw__btn:disabled {
  color: var(--lf-text-disabled);
  background: var(--lf-disabled-bg);
  border-color: var(--lf-disabled-border);
  opacity: 1;
  cursor: not-allowed;
}

.iw__btn--primary {
  color: var(--lf-on-brand);
  background: var(--lf-brand);
  border-color: var(--lf-brand);
}

.iw__btn--primary:hover:not(:disabled) {
  background: var(--lf-brand-hover);
}

.iw__timeline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.iw__step {
  position: relative;
  border-bottom: 1px solid var(--vp-c-divider);
}

.iw__step:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 24px;
  bottom: -14px;
  width: 2px;
  background: var(--vp-c-divider);
}

.iw__step--done:not(:last-child)::before {
  background: var(--lf-teal);
}

.iw__step:last-child {
  border-bottom: 0;
}

.iw__step-button {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 12px 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.iw__step-button:hover {
  background: var(--lf-hover-bg);
}

.iw__dot {
  flex: none;
  width: 12px;
  height: 12px;
  margin-top: 5px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-text-3);
  background: transparent;
}

.iw__step--done .iw__dot {
  border-color: var(--lf-teal);
  background: var(--lf-teal);
}

.iw__step--active .iw__dot {
  border-color: var(--lf-accent);
  background: var(--lf-accent);
}

.iw__step--active .iw__step-content {
  border-left: 3px solid var(--lf-accent);
  padding-left: 10px;
}

.iw__step--done .iw__step-content {
  border-left: 3px solid var(--lf-teal);
  padding-left: 10px;
}

.iw__step-content {
  margin-left: 24px;
  padding-bottom: 12px;
}

.iw__step-title {
  display: flex;
  min-width: 0;
  flex: 1;
  font-weight: 650;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.iw__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--lf-navy-text);
  background: var(--lf-navy-soft);
  font-size: 12px;
}

.iw__kind {
  padding: 1px 7px;
  border-radius: 999px;
  color: var(--lf-blue);
  background: var(--lf-blue-soft);
  font-size: 11px;
  font-weight: 600;
}

.iw__state {
  padding: 1px 7px;
  border: 1px solid var(--lf-border-control);
  border-radius: 999px;
  color: var(--lf-text-2);
  background: var(--vp-c-bg-elv);
  font-size: 11px;
  font-weight: 600;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.iw__summary {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.6;
}

.iw__details {
  margin: 6px 0 0;
  padding-left: 18px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.iw__evidence {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 4px 12px;
  margin: 8px 0 0;
  padding: 10px 12px;
  border-radius: 7px;
  background: var(--vp-c-bg-soft);
  font-size: 12px;
}

.iw__evidence dt {
  color: var(--vp-c-text-3);
}

.iw__evidence dd {
  margin: 0;
  color: var(--vp-c-text-1);
}

@media (max-width: 640px) {
  .iw__evidence {
    grid-template-columns: 1fr;
  }
}
</style>
