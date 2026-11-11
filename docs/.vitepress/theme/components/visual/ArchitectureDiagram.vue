<template>
  <DiagramFrame :title="title" :caption="caption" :legend="legend">
    <div class="arch">
      <svg class="arch__svg" :viewBox="viewBox" role="img" :aria-label="title || '架构图'">
        <defs>
          <marker id="arch-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto">
            <path d="M0,0 L9,4 L0,8 z" class="arch__arrow" />
          </marker>
        </defs>
        <g v-for="edge in edges" :key="edge.from + edge.to">
          <path :d="edgePath(edge)" class="arch__edge" />
          <text
            v-if="edge.label"
            :x="(positions[edge.from].x + positions[edge.to].x) / 2"
            :y="(positions[edge.from].y + positions[edge.to].y) / 2 - 6"
            class="arch__edge-label"
          >
            {{ edge.label }}
          </text>
        </g>
        <g
          v-for="node in nodes"
          :key="node.id"
          class="arch__node"
          :class="{ 'arch__node--selected': selected?.id === node.id }"
          :transform="`translate(${positions[node.id].x},${positions[node.id].y})`"
          @click="selected = node"
        >
          <rect :width="nodeWidth" :height="nodeHeight" rx="7" :class="nodeClass(node)" />
          <text :x="nodeWidth / 2" :y="20" class="arch__label" text-anchor="middle">{{ node.label }}</text>
          <text v-if="node.desc" :x="nodeWidth / 2" :y="40" class="arch__desc" text-anchor="middle">
            {{ node.desc }}
          </text>
        </g>
      </svg>
      <div v-if="selected" class="arch__detail">
        <p class="arch__detail-title">{{ selected.label }}</p>
        <p class="arch__detail-desc">{{ selected.desc || '点击节点可查看职责说明。' }}</p>
      </div>
      <p v-if="!selected" class="arch__hint">点击节点查看职责说明。</p>
    </div>
  </DiagramFrame>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DiagramFrame from './DiagramFrame.vue'

export interface ArchNode {
  id: string
  label: string
  desc?: string
  kind?: 'core' | 'data' | 'tool' | 'output'
  col: number
}

export interface ArchEdge {
  from: string
  to: string
  label?: string
}

const props = withDefaults(
  defineProps<{
    nodes: ArchNode[]
    edges: ArchEdge[]
    title?: string
    caption?: string
    legend?: { label: string; color: string }[]
  }>(),
  { legend: () => [] }
)

const selected = ref<ArchNode | null>(null)
const nodeWidth = 174
const nodeHeight = 52

const columns = computed(() => Math.max(...props.nodes.map((n) => n.col)) + 1)

const positions = computed(() => {
  const colWidth = 1000 / columns.value
  const map: Record<string, { x: number; y: number }> = {}
  const colCounts = new Map<number, number>()
  for (const node of props.nodes) {
    const row = colCounts.get(node.col) ?? 0
    colCounts.set(node.col, row + 1)
    map[node.id] = {
      x: node.col * colWidth + (colWidth - nodeWidth) / 2,
      y: row * (nodeHeight + 34) + 24
    }
  }
  return map
})

const viewBox = computed(() => {
  const countByCol = new Map<number, number>()
  for (const node of props.nodes) {
    countByCol.set(node.col, (countByCol.get(node.col) ?? 0) + 1)
  }
  const rows = countByCol.size ? Math.max(...countByCol.values()) : 1
  const height = Math.max(rows * (nodeHeight + 34) + 20, 180)
  return `0 0 1000 ${height}`
})

function nodeClass(node: ArchNode) {
  const kind = node.kind ?? 'core'
  return `arch__rect arch__rect--${kind}`
}

function edgePath(edge: ArchEdge) {
  const a = positions.value[edge.from]
  const b = positions.value[edge.to]
  if (!a || !b) return ''
  const x1 = a.x + nodeWidth
  const y1 = a.y + nodeHeight / 2
  const x2 = b.x
  const y2 = b.y + nodeHeight / 2
  const dx = Math.max(24, Math.abs(x2 - x1) / 2)
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`
}
</script>

<style scoped>
.arch {
  position: relative;
}

.arch__svg {
  width: 100%;
  height: auto;
  display: block;
}

.arch__edge {
  fill: none;
  stroke: var(--vp-c-text-3);
  stroke-width: 1.5;
  marker-end: url(#arch-arrow);
}

.arch__arrow {
  fill: var(--vp-c-text-3);
}

.arch__edge-label {
  fill: var(--vp-c-text-2);
  font-size: 12px;
  text-anchor: middle;
}

.arch__node {
  cursor: pointer;
}

.arch__rect {
  stroke-width: 1.5;
}

.arch__rect--core {
  fill: var(--lf-navy-soft);
  stroke: var(--lf-navy);
}

.arch__rect--data {
  fill: var(--lf-blue-soft);
  stroke: var(--lf-blue);
}

.arch__rect--tool {
  fill: var(--lf-teal-soft);
  stroke: var(--lf-teal);
}

.arch__rect--output {
  fill: var(--lf-accent-soft);
  stroke: var(--lf-accent);
}

.arch__node--selected .arch__rect {
  stroke-width: 3;
}

.arch__label {
  fill: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 650;
}

.arch__desc {
  fill: var(--vp-c-text-2);
  font-size: 11px;
}

.arch__detail {
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.arch__detail-title {
  margin: 0 0 4px;
  font-weight: 650;
}

.arch__detail-desc {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.arch__hint {
  margin: 10px 0 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
}
</style>
