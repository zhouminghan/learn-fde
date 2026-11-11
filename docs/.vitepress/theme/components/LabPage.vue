<template>
  <div class="lab">
    <template v-if="!caseDef">
      <header class="lab__head">
        <p class="lab__eyebrow">FDE 实战实验室</p>
        <h1>选择案例</h1>
      </header>
      <div class="lab__cases">
        <div v-for="group in caseGroups" :key="group.level" class="lab__case-group">
          <h2 class="lab__case-level">{{ group.label }}</h2>
          <div class="lab__case-grid">
            <button
              v-for="c in group.cases"
              :key="c.id"
              type="button"
              class="lab__case-card"
              @click="selectCase(c.id)"
            >
              <span class="lab__case-title">{{ c.title }}</span>
              <span class="lab__case-subtitle">{{ c.subtitle }}</span>
              <span class="lab__case-tags">{{ (c.tags ?? []).join(' · ') }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <header class="lab__head">
        <p class="lab__eyebrow">FDE 实战实验室</p>
        <h1>{{ caseDef.title }}</h1>
        <p class="lab__subtitle">{{ caseDef.subtitle }}</p>
        <button class="lab__btn" @click="selectCase(null)">返回案例列表</button>
      </header>

      <div class="lab__layout">
        <aside class="lab__pane lab__pane--left">
          <section class="lab__block">
            <h2>案例背景</h2>
            <p>{{ caseDef.scenario }}</p>
          </section>
          <section class="lab__block">
            <h2>学习目标</h2>
            <ul>
              <li v-for="o in caseDef.objectives" :key="o">{{ o }}</li>
            </ul>
          </section>
          <section v-if="caseDef.knowledgeDocs.length" class="lab__block">
            <h2>知识文档</h2>
            <details v-for="doc in caseDef.knowledgeDocs" :key="doc.id" class="lab__doc">
              <summary>{{ doc.title }}</summary>
              <p v-for="c in doc.chunks" :key="c.id">{{ c.text }}</p>
            </details>
          </section>
          <section v-if="caseDef.tools.length" class="lab__block">
            <h2>模拟 MCP 工具</h2>
            <div v-for="t in caseDef.tools" :key="t.id" class="lab__tool">
              <p class="lab__tool-name">{{ t.name }}</p>
              <p class="lab__tool-desc">{{ t.description }}</p>
              <p class="lab__tool-schema">输入：{{ t.inputSchema }}</p>
              <p class="lab__tool-schema">输出：{{ t.outputSchema }}</p>
            </div>
          </section>
        </aside>

        <section class="lab__pane lab__pane--center">
          <div class="lab__controls">
            <button
              v-if="run.status === 'idle' || run.status === 'awaiting_approval' || run.status === 'awaiting_choice'"
              class="lab__btn lab__btn--primary"
              :disabled="run.status === 'awaiting_choice'"
              @click="play"
            >
              <Play :size="15" />{{ run.status === 'idle' ? '开始执行' : '继续' }}
            </button>
            <button v-else class="lab__btn" @click="pause">
              <Pause :size="15" />暂停
            </button>
            <button
              class="lab__btn"
              :disabled="run.status === 'finished' || run.status === 'awaiting_approval' || run.status === 'awaiting_choice'"
              @click="stepOnce"
            >
              <StepForward :size="15" />单步
            </button>
            <button class="lab__btn" @click="reset">
              <RotateCcw :size="15" />重置
            </button>
          </div>

          <div class="lab__progress">
            <span :style="{ width: progressPercent + '%' }"></span>
          </div>
          <p class="lab__progress-label">{{ run.completedStepIds.length }} / {{ caseDef.steps.length }} 步</p>

          <ol class="lab__nodes">
            <li
              v-for="(s, i) in caseDef.steps"
              :key="s.id"
              class="lab__node"
              :class="nodeStateClass(s, i)"
              @click="selected = s"
            >
              <span class="lab__node-dot"></span>
              <div class="lab__node-body">
                <p class="lab__node-title">
                  <span class="lab__node-index">{{ i + 1 }}</span>
                  {{ s.title }}
                  <span class="lab__node-kind">{{ kindLabel(s.kind) }}</span>
                </p>
                <p v-if="isRevealed(s, i)" class="lab__node-summary">{{ s.summary }}</p>
              </div>
            </li>
          </ol>

          <div v-if="selected" class="lab__detail">
            <p class="lab__detail-title">{{ selected.title }}</p>
            <p class="lab__detail-text">{{ selected.summary }}</p>
            <ul v-if="selected.details?.length" class="lab__detail-list">
              <li v-for="d in selected.details" :key="d">{{ d }}</li>
            </ul>
            <div v-if="selected.toolCall" class="lab__detail-call">
              <p><strong>工具：</strong>{{ selected.toolCall.name }}({{ JSON.stringify(selected.toolCall.params) }})</p>
              <p><strong>返回：</strong>{{ selected.toolCall.ok ? JSON.stringify(selected.toolCall.result) : '调用失败' + (selected.toolCall.note ? '（' + selected.toolCall.note + '）' : '') }}</p>
            </div>
          </div>

          <div v-if="run.status === 'awaiting_choice'" class="lab__choice">
            <p class="lab__choice-title">请选择</p>
            <p>{{ currentStep?.summary }}</p>
            <div class="lab__choice-actions">
              <button
                v-for="c in currentStep?.choices ?? []"
                :key="c.id"
                class="lab__btn"
                @click="choose(c.id)"
              >
                {{ c.label }}
              </button>
            </div>
          </div>

          <div v-if="run.status === 'awaiting_approval'" class="lab__approval">
            <p class="lab__approval-title">需要人工审批</p>
            <p>待审批操作：{{ currentApproval?.action }}</p>
            <p>风险说明：{{ currentApproval?.risk }}</p>
            <div class="lab__approval-actions">
              <button class="lab__btn lab__btn--approve" @click="decide('approved')">
                <Check :size="15" />批准
              </button>
              <button class="lab__btn lab__btn--reject" @click="decide('rejected')">
                <X :size="15" />拒绝
              </button>
            </div>
          </div>
        </section>

        <aside class="lab__pane lab__pane--right">
          <section class="lab__block">
            <h2>执行日志</h2>
            <ol class="lab__logs">
              <li v-for="(line, i) in run.logs" :key="i">{{ line }}</li>
            </ol>
          </section>

          <section v-if="run.status === 'finished'" class="lab__block">
            <h2>评测结果</h2>
            <div v-for="e in evaluation" :key="e.id" class="lab__eval" :class="{ 'lab__eval--pass': e.pass }">
              <span class="lab__eval-icon">{{ e.pass ? '✓' : '×' }}</span>
              <div>
                <p class="lab__eval-label">{{ e.label }}</p>
                <p class="lab__eval-reason">{{ e.reason }}</p>
              </div>
            </div>
          </section>

          <section v-if="run.status === 'finished'" class="lab__block">
            <h2>最终报告</h2>
            <p class="lab__final">{{ finalAnswer }}</p>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Pause, Play, RotateCcw, StepForward, X } from 'lucide-vue-next'
import { labCases } from '@/content/labs'
import {
  choose as engineChoose,
  computeEvaluation,
  createRun,
  decide as engineDecide,
  step as engineStep
} from '@/domain/lab/engine'
import type { LabCase, LabRunState, LabStep } from '@/types/lab'

const selectedCaseId = ref<string | null>(null)
const run = ref<LabRunState>(createRun(labCases[0]!))
const selected = ref<LabStep | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

const caseDef = computed<LabCase | null>(() => {
  if (!selectedCaseId.value) return null
  return labCases.find((c) => c.id === selectedCaseId.value) ?? null
})

const caseGroups = computed(() => {
  const levels = [
    { key: 'beginner', label: '入门' },
    { key: 'intermediate', label: '进阶' },
    { key: 'capstone', label: '综合' }
  ] as const
  return levels.map((l) => ({
    level: l.key,
    label: l.label,
    cases: labCases.filter((c) => (c.level ?? 'beginner') === l.key)
  }))
})

const currentStep = computed(() => {
  if (!run.value || !caseDef.value) return null
  return caseDef.value.steps[run.value.stepIndex] ?? null
})

const progressPercent = computed(() => {
  if (!run.value || !caseDef.value) return 0
  return Math.round((run.value.completedStepIds.length / caseDef.value.steps.length) * 100)
})

const currentApproval = computed(() => {
  if (run.value?.status !== 'awaiting_approval') return null
  return currentStep.value?.approval ?? null
})

const evaluation = computed(() => (run.value && caseDef.value ? computeEvaluation(run.value, caseDef.value) : []))

const finalAnswer = computed(() => {
  if (!run.value || !caseDef.value) return ''
  return run.value.approvalDecision === 'rejected' ? caseDef.value.rejectedAnswer : caseDef.value.finalAnswer
})

function selectCase(id: string | null) {
  pause()
  selectedCaseId.value = id
  selected.value = null
  run.value = createRun(id ? labCases.find((c) => c.id === id)! : labCases[0]!)
}

function kindLabel(kind: LabStep['kind']) {
  const map: Record<LabStep['kind'], string> = {
    input: '输入', plan: '规划', retrieval: '检索', decision: '判断',
    tool: '工具', approval: '审批', choice: '选择', evaluation: '评测', output: '输出'
  }
  return map[kind]
}

function isRevealed(step: LabStep, index: number) {
  return run.value?.completedStepIds.includes(step.id) || index === run.value?.stepIndex
}

function nodeStateClass(step: LabStep, index: number) {
  if (run.value?.completedStepIds.includes(step.id)) return 'lab__node--done'
  if (index === run.value?.stepIndex) {
    if (run.value.status === 'awaiting_approval') return 'lab__node--blocked'
    if (run.value.status === 'awaiting_choice') return 'lab__node--active'
    return 'lab__node--active'
  }
  return 'lab__node--pending'
}

function pause() {
  if (timer) clearInterval(timer)
  timer = null
}

function play() {
  pause()
  if (!run.value || !caseDef.value) return
  if (run.value.status === 'finished') run.value = createRun(caseDef.value)
  timer = setInterval(() => {
    const next = engineStep(run.value!, caseDef.value!)
    run.value = next
    if (next.status === 'awaiting_approval' || next.status === 'awaiting_choice' || next.status === 'finished') pause()
  }, 700)
}

function stepOnce() {
  pause()
  if (!run.value || !caseDef.value) return
  run.value = engineStep(run.value, caseDef.value)
}

function reset() {
  pause()
  if (caseDef.value) run.value = createRun(caseDef.value)
  selected.value = null
}

function decide(decision: 'approved' | 'rejected') {
  if (!run.value || !caseDef.value) return
  run.value = engineDecide(run.value, caseDef.value, decision)
  if (decision === 'approved') play()
}

function choose(choiceId: string) {
  if (!run.value || !caseDef.value) return
  run.value = engineChoose(run.value, caseDef.value, choiceId)
}
</script>

<style scoped>
.lab {
  max-width: 1380px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

.lab__head {
  margin-bottom: 24px;
}

.lab__eyebrow {
  margin: 0 0 6px;
  color: var(--lf-accent);
  font-size: 13px;
  font-weight: 700;
}

.lab__head h1 {
  margin: 0 0 8px;
  font-size: 32px;
  letter-spacing: 0;
}

.lab__subtitle {
  margin: 0 0 12px;
  color: var(--vp-c-text-2);
}

.lab__cases {
  display: grid;
  gap: 24px;
}

.lab__case-level {
  margin: 0 0 10px;
  font-size: 15px;
  color: var(--lf-navy-text);
}

.lab__case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.lab__case-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  text-align: left;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.lab__case-card:hover {
  border-color: var(--lf-accent);
}

.lab__case-title {
  font-weight: 650;
}

.lab__case-subtitle {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.lab__case-tags {
  color: var(--lf-blue);
  font-size: 12px;
}

.lab__layout {
  display: grid;
  grid-template-columns: 300px 1fr 320px;
  gap: 16px;
  align-items: start;
}

.lab__pane {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  padding: 16px;
}

.lab__block + .lab__block {
  margin-top: 20px;
}

.lab__block h2 {
  margin: 0 0 10px;
  font-size: 15px;
  color: var(--lf-navy-text);
}

.lab__block p,
.lab__block li {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.7;
}

.lab__block ul {
  margin: 0;
  padding-left: 18px;
}

.lab__doc {
  border-top: 1px solid var(--vp-c-divider);
  padding: 8px 0;
}

.lab__doc summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}

.lab__tool {
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  margin-top: 8px;
  background: var(--vp-c-bg-soft);
}

.lab__tool-name {
  margin: 0 0 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--lf-teal);
}

.lab__tool-desc {
  margin: 0 0 4px;
}

.lab__tool-schema {
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.lab__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lab__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 13px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.lab__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.lab__btn--primary {
  color: #fff;
  background: var(--lf-navy);
  border-color: var(--lf-navy);
}

.lab__btn--approve {
  color: #fff;
  background: var(--lf-teal);
  border-color: var(--lf-teal);
}

.lab__btn--reject {
  color: #fff;
  background: var(--lf-red);
  border-color: var(--lf-red);
}

.lab__progress {
  height: 8px;
  margin-top: 16px;
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.lab__progress span {
  display: block;
  height: 100%;
  background: var(--lf-teal);
  transition: width 0.25s ease;
}

.lab__progress-label {
  margin: 6px 0 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.lab__nodes {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
}

.lab__node {
  display: flex;
  gap: 10px;
  padding: 10px 8px;
  border-left: 3px solid transparent;
  cursor: pointer;
}

.lab__node + .lab__node {
  border-top: 1px solid var(--vp-c-divider);
}

.lab__node-dot {
  flex: none;
  width: 11px;
  height: 11px;
  margin-top: 5px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-text-3);
}

.lab__node--done {
  border-left-color: var(--lf-teal);
}

.lab__node--done .lab__node-dot {
  border-color: var(--lf-teal);
  background: var(--lf-teal);
}

.lab__node--active {
  border-left-color: var(--lf-accent);
}

.lab__node--active .lab__node-dot {
  border-color: var(--lf-accent);
  background: var(--lf-accent);
}

.lab__node--blocked {
  border-left-color: var(--lf-yellow);
}

.lab__node--blocked .lab__node-dot {
  border-color: var(--lf-yellow);
  background: var(--lf-yellow);
}

.lab__node-body {
  min-width: 0;
  flex: 1;
}

.lab__node-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
  font-weight: 600;
  font-size: 14px;
}

.lab__node-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  color: var(--lf-navy-text);
  background: var(--lf-navy-soft);
  font-size: 11px;
}

.lab__node-kind {
  padding: 1px 7px;
  border-radius: 999px;
  color: var(--lf-blue);
  background: var(--lf-blue-soft);
  font-size: 11px;
  font-weight: 600;
}

.lab__node-summary {
  margin: 5px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.lab__detail {
  margin-top: 16px;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.lab__detail-title {
  margin: 0 0 4px;
  font-weight: 650;
}

.lab__detail-text {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.lab__detail-list {
  margin: 8px 0 0;
  padding-left: 18px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.lab__detail-call {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.lab__choice {
  margin-top: 16px;
  padding: 14px;
  border: 1px solid var(--lf-blue);
  border-radius: 8px;
  background: var(--lf-blue-soft);
}

.lab__choice-title {
  margin: 0 0 6px;
  font-weight: 700;
  color: var(--lf-blue);
}

.lab__choice-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.lab__approval {
  margin-top: 16px;
  padding: 14px;
  border: 1px solid var(--lf-yellow);
  border-radius: 8px;
  background: var(--lf-yellow-soft);
}

.lab__approval-title {
  margin: 0 0 6px;
  font-weight: 700;
  color: var(--lf-yellow);
}

.lab__approval p {
  margin: 0 0 4px;
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.lab__approval-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.lab__logs {
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  line-height: 1.7;
  max-height: 360px;
  overflow: auto;
}

.lab__logs li {
  padding: 3px 0;
  border-bottom: 1px dashed var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.lab__eval {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.lab__eval-icon {
  flex: none;
  color: var(--lf-red);
  font-weight: 700;
}

.lab__eval--pass .lab__eval-icon {
  color: var(--lf-teal);
}

.lab__eval-label {
  margin: 0;
  font-weight: 600;
  font-size: 13px;
}

.lab__eval-reason {
  margin: 2px 0 0;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.lab__final {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 13px;
  line-height: 1.8;
}

@media (max-width: 1100px) {
  .lab__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .lab {
    padding: 24px 14px 56px;
  }
}
</style>
