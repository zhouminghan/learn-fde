<template>
  <DiagramFrame :title="title" :caption="caption" :legend="legend">
    <div class="arch">
      <svg class="arch__svg" :viewBox="viewBox" role="img" :aria-label="title || '架构图'">
        <defs>
          <marker :id="markerId" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto">
            <path d="M0,0 L9,4 L0,8 z" class="arch__arrow" />
          </marker>
        </defs>
        <g v-for="edge in edges" :key="edge.from + edge.to">
          <path :d="edgePath(edge)" class="arch__edge" :marker-end="`url(#${markerId})`" />
          <text
            v-if="edge.label"
            :x="edgeLabel(edge).x"
            :y="edgeLabel(edge).y"
            class="arch__edge-label"
            text-anchor="middle"
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
const markerId = `arch-arrow-${Math.random().toString(36).slice(2, 8)}`

const columns = computed(() => Math.max(...props.nodes.map((n) => n.col)) + 1)

const positions = computed(() => {
  const colWidth = 1000 / columns.value
  const map: Record<string, { x: number; y: number; cx: number; cy: number }> = {}
  const colCounts = new Map<number, number>()
  for (const node of props.nodes) {
    const row = colCounts.get(node.col) ?? 0
    colCounts.set(node.col, row + 1)
    const x = node.col * colWidth + (colWidth - nodeWidth) / 2
    const y = row * (nodeHeight + 30) + 24
    map[node.id] = { x, y, cx: x + nodeWidth / 2, cy: y + nodeHeight / 2 }
  }
  return map
})

const maxBottom = computed(() =>
  Math.max(...props.nodes.map((n) => positions.value[n.id].y + nodeHeight))
)

const hasBackwardEdge = computed(() =>
  props.edges.some((e) => positions.value[e.from].x > positions.value[e.to].x)
)

const viewBox = computed(() => {
  const height = maxBottom.value + (hasBackwardEdge.value ? 56 : 20)
  return `0 0 1000 ${height}`
})

const laneY = computed(() => maxBottom.value + 28)

function anchors(edge: ArchEdge) {
  const a = positions.value[edge.from]
  const b = positions.value[edge.to]
  if (!a || !b) return null

  if (a.x === b.x) {
    const down = a.y < b.y
    return {
      kind: 'vertical' as const,
      start: { x: a.cx, y: down ? a.y + nodeHeight : a.y },
      end: { x: b.cx, y: down ? b.y : b.y + nodeHeight }
    }
  }

  if (a.x < b.x) {
    return {
      kind: 'forward' as const,
      start: { x: a.x + nodeWidth, y: a.cy },
      end: { x: b.x, y: b.cy }
    }
  }

  return {
    kind: 'backward' as const,
    start: { x: a.cx, y: a.y + nodeHeight },
    end: { x: b.cx, y: b.y + nodeHeight }
  }
}

function edgePath(edge: ArchEdge) {
  const anchor = anchors(edge)
  if (!anchor) return ''
  const { start, end, kind } = anchor

  if (kind === 'vertical') {
    const midY = (start.y + end.y) / 2
    return `M${start.x},${start.y} C${start.x},${midY} ${end.x},${midY} ${end.x},${end.y}`
  }

  if (kind === 'backward') {
    return `M${start.x},${start.y} L${start.x},${laneY.value} L${end.x},${laneY.value} L${end.x},${end.y}`
  }

  const dx = Math.max(24, Math.abs(end.x - start.x) / 2)
  return `M${start.x},${start.y} C${start.x + dx},${start.y} ${end.x - dx},${end.y} ${end.x},${end.y}`
}

function edgeLabel(edge: ArchEdge) {
  const anchor = anchors(edge)
  if (!anchor) return { x: 0, y: 0 }
  const { start, end, kind } = anchor
  if (kind === 'backward') return { x: (start.x + end.x) / 2, y: laneY.value - 6 }
  if (kind === 'vertical') return { x: start.x + 12, y: (start.y + end.y) / 2 }
  return { x: (start.x + end.x) / 2, y: start.y - 8 }
}

function nodeClass(node: ArchNode) {
  const kind = node.kind ?? 'core'
  return `arch__rect arch__rect--${kind}`
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
